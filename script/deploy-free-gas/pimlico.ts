import 'dotenv/config'
import chalk from 'chalk'
import {
  Address,
  concat,
  concatHex,
  encodeAbiParameters,
  encodeFunctionData,
  http,
  parseEther,
  type Call,
  type Hex,
  type PublicClient,
  zeroAddress,
} from 'viem'
import { toSimpleSmartAccount } from 'permissionless/accounts'
import { createPimlicoClient } from 'permissionless/clients/pimlico'
import { createSmartAccountClient, deepHexlify } from 'permissionless'
import {
  EstimateUserOperationGasReturnType,
  getUserOperationHash,
  type UserOperation,
} from 'viem/account-abstraction'
import type { Wallet } from './wallet'
import { getPimlicoUrl } from './data/pimicoUrl'
import { getExplorerUrl } from './data/explorerUrl'
import { abi_paymasterV2 } from './data/abiPaymasterV2'
import { abi_simnple_account_factory } from './data/abiSimpleAccountFactory'
import { ContractsToDeploy, ContractToDeploy } from './utils/ContractsByteCode'
import { computeCreate2Address } from './utils/create2'
import { hasCode } from './utils/hasCode'
import { envBigInt } from './utils/envBigInt'
import {
  ENTRYPOINT_V6,
  PAYMASTER_TEST_TEST,
  SIMPLE_ACCOUNT_FACTORY,
  CREATE2_PROXY,
} from './data/addresses'

const rec = envBigInt('RECOVERY')
const sec = envBigInt('SECURITY')
const win = envBigInt('WINDOW')
const lock = envBigInt('LOCK')

const DUMMY_SIG =
  '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c' as Hex

function encodePaymasterBlob(
  validUntil: number,
  validAfter: number,
  strategy: { paymasterMode: number; depositor: Address; erc20Token: Address; exchangeRate: bigint },
): Hex {
  return encodeAbiParameters(
    [
      { type: 'uint48', name: 'validUntil' },
      { type: 'uint48', name: 'validAfter' },
      {
        type: 'tuple',
        name: 'strategy',
        components: [
          { type: 'uint8', name: 'paymasterMode' },
          { type: 'address', name: 'depositor' },
          { type: 'address', name: 'erc20Token' },
          { type: 'uint256', name: 'exchangeRate' },
        ],
      },
    ],
    [validUntil, validAfter, strategy],
  )
}

async function getUserOp(sender: Address, nonce: bigint, initCode: Hex, callData: Hex): Promise<UserOperation<'0.6'>> {
  return {
    sender,
    nonce,
    initCode,
    callData,
    callGasLimit: 0n,
    verificationGasLimit: 0n,
    preVerificationGas: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    paymasterAndData: '0x',
    signature: DUMMY_SIG,
  }
}

async function ensureFactory(pc: PublicClient) {
  const code = await pc.getCode({ address: SIMPLE_ACCOUNT_FACTORY })
  if (!hasCode(code)) throw new Error('factory missing on chain')
  const pay = await pc.getCode({ address: PAYMASTER_TEST_TEST })
  if (!hasCode(pay)) throw new Error('paymaster missing on chain')
}

async function smartAccountInit(computed: Hex, eoa: Wallet, pc: PublicClient) {
  const code = await pc.getCode({ address: computed })
  if (hasCode(code)) return '0x'
  return concat([
    SIMPLE_ACCOUNT_FACTORY,
    encodeFunctionData({
      abi: abi_simnple_account_factory,
      functionName: 'createAccount',
      args: [eoa.account.address, 0n],
    }),
  ])
}

export async function deployWithPaymaster(eoa: Wallet, paymaster: Wallet, pc: PublicClient): Promise<ContractToDeploy[]> {
  const pimlicoUrl = `${await getPimlicoUrl(eoa.chain.name)}${process.env.PIMLICO_API}`
  const pimlico = createPimlicoClient({ transport: http(pimlicoUrl), entryPoint: { address: ENTRYPOINT_V6, version: '0.6' } })
  const simple = await toSimpleSmartAccount({ owner: eoa.account, client: pc, entryPoint: { address: ENTRYPOINT_V6, version: '0.6' } })
  const addr = await simple.getAddress()
  console.log(chalk.yellow('simpleAccount.getAddress()', addr))

  const sac = createSmartAccountClient({ account: simple, chain: pc.chain, bundlerTransport: http(pimlicoUrl) })
  await ensureFactory(pc)

  const contracts = ContractsToDeploy.getAllContracts()
  const calls: Call[] = []

  for (const c of contracts) {
    const init = ContractsToDeploy.computeInitCode(c, eoa.account.address);
    const target = computeCreate2Address(init, c.salt as Hex)
    c.address = target
    if (hasCode(await pc.getCode({ address: target }))) {
      c.isExist = true
      console.log(chalk.yellow(`✓ ${c.name} at ${target}`))
    } else {
      console.log(chalk.bgGray(`→ ${c.name} scheduled @ ${target}`))
      calls.push({ to: CREATE2_PROXY, value: parseEther('0'), data: concatHex([c.salt as Hex, init]) })
    }
  }

  if (!calls.length) return contracts

  const callData = await simple.encodeCalls(calls)
  const nonce = await simple.getNonce()
  const initSmart = await smartAccountInit(addr, eoa, pc)
  const uo = await getUserOp(addr, nonce, initSmart, callData)

  const strat = { paymasterMode: 0, depositor: paymaster.account.address, erc20Token: zeroAddress, exchangeRate: 0n }
  uo.paymasterAndData = concat([PAYMASTER_TEST_TEST, encodePaymasterBlob(0, 0, strat), DUMMY_SIG])

  const price = (await pimlico.getUserOperationGasPrice()).standard
  uo.maxFeePerGas = price.maxFeePerGas
  uo.maxPriorityFeePerGas = price.maxPriorityFeePerGas

  const est = (await sac.request({
    method: 'eth_estimateUserOperationGas',
    params: [deepHexlify(uo), ENTRYPOINT_V6],
  })) as EstimateUserOperationGasReturnType
  uo.callGasLimit = est.callGasLimit
  uo.verificationGasLimit = est.verificationGasLimit
  uo.preVerificationGas = est.preVerificationGas

  const validUntil = Math.floor(Date.now() / 1000) + 3600 * 24 * 30
  const blob = encodePaymasterBlob(validUntil, 0, strat)
  const hash = (await pc.readContract({
    address: PAYMASTER_TEST_TEST,
    abi: abi_paymasterV2,
    functionName: 'getHash',
    args: [uo as any, validUntil, 0, strat],
  })) as Hex
  const sig = await paymaster.signMessage({ message: { raw: hash } })
  uo.paymasterAndData = concat([PAYMASTER_TEST_TEST, blob, sig])

  const uoHash = getUserOperationHash({ chainId: eoa.chain.id, entryPointAddress: ENTRYPOINT_V6, entryPointVersion: '0.6', userOperation: uo })
  uo.signature = await eoa.signMessage({ message: { raw: uoHash } })

  const sentHash = (await sac.request({ method: 'eth_sendUserOperation', params: [deepHexlify(uo), ENTRYPOINT_V6] })) as Hex
  const { receipt } = await sac.waitForUserOperationReceipt({ hash: sentHash })

  console.log(chalk.green(`User operation receipt: ${getExplorerUrl(eoa.chain.name, receipt.transactionHash)}`))
  return contracts
}