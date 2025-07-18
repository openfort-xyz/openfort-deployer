import { http, encodeFunctionData, concatHex, type Address, type Hex } from 'viem'
import type { Wallet } from '../wallet'
import { computeAddress } from './computeAddress'
import { hasCode } from './computeAddressHelpers'
import { ENTRYPOINT_V6, FACTORY_V6_SEPOLIA, PAYMASTER_TESTNET } from '../data/addresses'
import { abi_entrypoint } from '../data/abiEntryPoint'
import { abi_factory } from '../data/abiFactory'
import { createPimlicoClient } from 'permissionless/clients/pimlico'
import 'dotenv/config'

export interface UserOperationV6 {
  sender: Address
  nonce: Hex | string | bigint
  initCode: Hex
  callData: Hex
  callGasLimit: Hex | string | bigint
  verificationGasLimit: Hex | string | bigint
  preVerificationGas: Hex | string | bigint
  maxFeePerGas: Hex | string | bigint
  maxPriorityFeePerGas: Hex | string | bigint
  paymasterAndData: Hex
  signature: Hex
}

function zeroSig(): Hex {
  return `0x${'00'.repeat(65)}` as Hex
}

async function getEntryPointNonce(client: Wallet, sender: Address): Promise<bigint> {
  const result = await client.call({
    to: ENTRYPOINT_V6,
    data: encodeFunctionData({
      abi: abi_entrypoint,
      functionName: 'getNonce',
      args: [sender, 0n],
    }),
  })
  const hex = (result.data ?? '0x') as Hex
  // decodeFunctionResult would require ABI output; cheaper manual parse:
  // last 32 bytes are nonce
  const stripped = hex.slice(-64)
  return BigInt('0x' + stripped)
}

function toHexQuantity(n: bigint): Hex {
  return `0x${n.toString(16)}` as Hex
}

export function makeFactoryCalldata(
  admin: Address,
  salt: Hex,
  initializeGuardian = false,
): Hex {
  return encodeFunctionData({
    abi: abi_factory,
    functionName: 'createAccountWithNonce',
    args: [admin, salt, initializeGuardian],
  }) as Hex
}

/* Builds a raw v0.6 UserOperation (no paymaster filled). */
export async function buildUserOp(
  client: Wallet,
  sender: Address,
  {
    salt,
    initializeGuardian = false,
    target = sender,
    targetData = '0x',
    targetValue = 0n,
  }: {
    salt: Hex
    initializeGuardian?: boolean
    target?: Address
    targetData?: Hex
    targetValue?: bigint
  },
): Promise<UserOperationV6> {
  const code = await client.getCode({ address: sender })
  const deployed = hasCode(code)

  let initCode: Hex
  if (deployed) {
    initCode = '0x'
  } else {
    const factoryData = makeFactoryCalldata(sender, salt, initializeGuardian)
    initCode = concatHex([FACTORY_V6_SEPOLIA, factoryData])
  }

  // encode callData for MinimalAccount execute(address,uint256,bytes)
  // if targetData omitted we send empty
  const callData = targetData

  // gas price hints from chain
  const feeData = await client.estimateFeesPerGas()
  const maxFeePerGas = feeData.maxFeePerGas ?? feeData.gasPrice ?? 0n
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? 0n

  const nonce = deployed ? await getEntryPointNonce(client, sender) : 0n

  const userOp: UserOperationV6 = {
    sender,
    nonce: toHexQuantity(nonce),
    initCode,
    callData,
    callGasLimit: '0x0',
    verificationGasLimit: '0x0',
    preVerificationGas: '0x0',
    maxFeePerGas: toHexQuantity(maxFeePerGas),
    maxPriorityFeePerGas: toHexQuantity(maxPriorityFeePerGas),
    paymasterAndData: '0x',
    signature: zeroSig(),
  }
  return userOp
}

/* Low-level Bundler request: eth_estimateUserOperationGas */
export async function estimateUserOpGasRaw(
  chainId: number,
  userOp: UserOperationV6,
): Promise<{
  preVerificationGas: bigint
  verificationGasLimit: bigint
  callGasLimit: bigint
  paymasterVerificationGasLimit?: bigint
  paymasterPostOpGasLimit?: bigint
}> {
  const api = process.env.PIMLICO_API
  if (!api) throw new Error('PIMLICO_API env var required')
  const url = `https://api.pimlico.io/v2/${chainId}/rpc?apikey=${api}`

  const pimlicoClient = createPimlicoClient({
    chain: { id: chainId } as any,
    transport: http(url),
    entryPoint: { address: ENTRYPOINT_V6, version: '0.6' },
  })

  const gasEst: any = await pimlicoClient.request({
    method: 'eth_estimateUserOperationGas',
    params: [userOp, ENTRYPOINT_V6],
  })

  const pv = gasEst?.preVerificationGas ? BigInt(gasEst.preVerificationGas) : 0n
  const vg = gasEst?.verificationGasLimit ? BigInt(gasEst.verificationGasLimit) : 0n
  const cg = gasEst?.callGasLimit ? BigInt(gasEst.callGasLimit) : 0n
  const pvg = gasEst?.paymasterVerificationGasLimit
    ? BigInt(gasEst.paymasterVerificationGasLimit)
    : undefined
  const pog = gasEst?.paymasterPostOpGasLimit
    ? BigInt(gasEst.paymasterPostOpGasLimit)
    : undefined

  return {
    preVerificationGas: pv,
    verificationGasLimit: vg,
    callGasLimit: cg,
    paymasterVerificationGasLimit: pvg,
    paymasterPostOpGasLimit: pog,
  }
}

/* Fills gas fields into an existing UserOperationV6 */
export function applyGasEstimates(
  userOp: UserOperationV6,
  gas: {
    preVerificationGas: bigint
    verificationGasLimit: bigint
    callGasLimit: bigint
    paymasterVerificationGasLimit?: bigint
  },
): UserOperationV6 {
  return {
    ...userOp,
    preVerificationGas: toHexQuantity(gas.preVerificationGas),
    verificationGasLimit: toHexQuantity(gas.verificationGasLimit),
    callGasLimit: toHexQuantity(gas.callGasLimit),
    // v0.6 lumps paymasterVGL into paymasterAndData context; ignore optional
  }
}

/* Optionally fetch sponsorship from Pimlico Paymaster (ERC-7677). */
export async function fetchPaymasterAndData(
  chainId: number,
  userOp: UserOperationV6,
): Promise<Hex> {
  const api = process.env.PIMLICO_API
  if (!api) throw new Error('PIMLICO_API env var required')
  const url = `https://api.pimlico.io/v2/${chainId}/rpc?apikey=${api}`

  const pimlicoClient = createPimlicoClient({
    chain: { id: chainId } as any,
    transport: http(url),
    entryPoint: { address: ENTRYPOINT_V6, version: '0.6' },
  })

  // v0.6 paymaster RPC returns { paymasterAndData }
  const resp: any = await pimlicoClient.request({
    method: 'pm_getPaymasterData',
    params: [userOp, ENTRYPOINT_V6, chainId],
  })
  return (resp?.paymasterAndData ?? '0x') as Hex
}

/* Stub local paymaster fallback: just use static address if code exists. */
export async function fallbackStaticPaymaster(client: Wallet): Promise<Hex> {
  const c = await client.getCode({ address: PAYMASTER_TESTNET })
  if (!hasCode(c)) return '0x'
  return PAYMASTER_TESTNET
}