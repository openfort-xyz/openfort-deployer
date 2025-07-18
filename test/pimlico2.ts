/**
 * buildUserOperation.ts
 *
 * Builds & signs a complete ERC-4337 UserOperation for:
 * – EntryPoint v0.6 on Sepolia
 * – Pimlico Bundler (gas/estimation only)
 * – Your verifying paymaster + signature
 */

import 'dotenv/config'
import {
  Address,
  Hex,
  concat,
  concatHex,
  encodeAbiParameters,
  http,
  parseEther,
  zeroAddress,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'
import { PublicClient, createPublicClient } from 'viem'
import {
  entryPoint06Address,
  getUserOperationHash,
  UserOperation,
} from 'viem/account-abstraction'
import { createPimlicoClient } from 'permissionless/clients/pimlico'
import { toSimpleSmartAccount } from 'permissionless/accounts'
import {
  createSmartAccountClient,
  deepHexlify,
} from 'permissionless'
import { EstimateUserOperationGasReturnType } from 'viem/account-abstraction'

import { CREATE2_PROXY, INITIAL_GUARDIAN, ENTRYPOINT_V8, IMPLEMENTATION } from '../script/deploy-free-gas/data/addresses'
import { abi_paymasterV2 } from '../script/deploy-free-gas/data/abiPaymasterV2'
import { buildMinimalAccountInitCode } from '../script/deploy-zero/initCode'
import { envBigInt } from '../script/deploy-zero/utils/envBigInt'
/* ---------- env ---------- */

const { OWNER_PK, PAYMASTER_PK, PIMLICO_API } = process.env as Record<
  string,
  string
>
if (!OWNER_PK || !PAYMASTER_PK || !PIMLICO_API)
  throw new Error('Missing env vars: OWNER_PK / PAYMASTER_PK / PIMLICO_API')

/* ---------- constants ---------- */

const ENTRYPOINT = entryPoint06Address satisfies Address
const PAYMASTER_ADDRESS =
  '0xcec8020cff71e565DA2b9F3506533d163326A7AD' as Address

const FACTORY_ADDRESS =
  '0xcb71e008b9062bb7abd558816f8135ef2cab576f' as Address
const IMPLEMENTATION_ADDRESS =
  '0x9E7cF1b75f5a66913505D1473cC44F2578372F20' as Address
const CREATE2_SALT =
  '0xea69432e1e6530adc820b44390f94f4d323b45a86f59bddee59773d7ec27dba5' as Hex

/* ---------- helpers ---------- */
const RECOVERY = envBigInt('RECOVERY');
const SECURITY = envBigInt('SECURITY');
const WINDOW = envBigInt('WINDOW');
const LOCK = envBigInt('LOCK');

async function buildInitCode(
  owner: Address,
  _pc: PublicClient,
): Promise<Hex> {
  return  buildMinimalAccountInitCode(
      owner,
      ENTRYPOINT_V8,
      IMPLEMENTATION,
      RECOVERY,
      SECURITY,
      WINDOW,
      LOCK,
      INITIAL_GUARDIAN,
    );
}

function encodePaymasterBlob(
  validUntil: number,
  validAfter: number,
  strategy: {
    paymasterMode: number
    depositor: Address
    erc20Token: Address
    exchangeRate: bigint
  },
): Hex {
  return encodeAbiParameters(
    [
      { name: 'validUntil', type: 'uint48' },
      { name: 'validAfter', type: 'uint48' },
      {
        name: 'strategy',
        type: 'tuple',
        components: [
          { name: 'paymasterMode', type: 'uint8' },
          { name: 'depositor',     type: 'address' },
          { name: 'erc20Token',    type: 'address' },
          { name: 'exchangeRate',  type: 'uint256' },
        ],
      },
    ],
    [validUntil, validAfter, strategy],
  )
}

const DUMMY_SIG: Hex =
  '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c' as Hex;

  const dummyStrategy = {
    paymasterMode: 0,               // Mode.PayForUser
    depositor:     zeroAddress,     // just zeros for simulation
    erc20Token:    zeroAddress,
    exchangeRate:  0n,
  }
  
  const dummyStrategyEncoded = encodeAbiParameters(
    [
      { type: 'uint8',   name: 'paymasterMode' },
      { type: 'address', name: 'depositor' },
      { type: 'address', name: 'erc20Token' },
      { type: 'uint256', name: 'exchangeRate' },
    ],
    [
      dummyStrategy.paymasterMode,
      dummyStrategy.depositor,
      dummyStrategy.erc20Token,
      dummyStrategy.exchangeRate,
    ],
  )

/* ---------- main ---------- */

async function main() {
  const pimlicoUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${PIMLICO_API}`

  const owner           = privateKeyToAccount(OWNER_PK as Hex)
  const paymasterSigner = privateKeyToAccount(PAYMASTER_PK as Hex)

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http('https://sepolia.rpc.thirdweb.com'),
  })

  const pimlico = createPimlicoClient({
    transport: http(pimlicoUrl),
    entryPoint: { address: ENTRYPOINT, version: '0.6' },
  })

  /* ---- SimpleAccount wrapper ---- */
  const simpleAccount = await toSimpleSmartAccount({
    owner,
    client: publicClient,
    entryPoint: { address: ENTRYPOINT, version: '0.6' },
  })
  const smartAccountAddress = await simpleAccount.getAddress()

  const smartAccountClient = createSmartAccountClient({
    account: simpleAccount,
    chain: sepolia,
    bundlerTransport: http(pimlicoUrl),
  })

  /* ---- build callData ---- */
  const nonce     = await simpleAccount.getNonce()
  const initCode  = await buildInitCode(owner.address, publicClient)
  const callData  = await simpleAccount.encodeCalls([
    {
      to: CREATE2_PROXY,
      value: parseEther('0'),
      data: concatHex([CREATE2_SALT, initCode]),
    },
  ])

  console.log(callData);

  const strategy1 = {
    paymasterMode: 0,
    depositor:     paymasterSigner.address,
    erc20Token:    zeroAddress as Hex,
    exchangeRate:  0n,
  }
  /* ---- base UserOp (paymaster address already set) ---- */
  const userOp: UserOperation<'0.6'> = {
    sender: smartAccountAddress,
    nonce,
    initCode: '0x',
    callData,
    callGasLimit: 0n,
    verificationGasLimit: 0n,
    preVerificationGas: 0n,
    maxFeePerGas: 0n,
    maxPriorityFeePerGas: 0n,
    paymasterAndData: '0x',
    signature: DUMMY_SIG,
  }
  const blobStage1 = encodePaymasterBlob(0, 0, strategy1)
  userOp.paymasterAndData = concat([PAYMASTER_ADDRESS, blobStage1, DUMMY_SIG]);
  /* ---- gas price ---- */
  const gasPriceTiers = await pimlico.getUserOperationGasPrice()
  const gasPrice      = gasPriceTiers.standard      // pick ‘standard’, not ‘fast’
  userOp.maxFeePerGas         = gasPrice.maxFeePerGas
  userOp.maxPriorityFeePerGas = gasPrice.maxPriorityFeePerGas

  /* ---- gas limits ---- */
  const gasEst = await smartAccountClient.request({
    method: 'eth_estimateUserOperationGas',
    params: [deepHexlify(userOp), ENTRYPOINT],
  }) as EstimateUserOperationGasReturnType

  userOp.callGasLimit         = gasEst.callGasLimit
  userOp.verificationGasLimit = gasEst.verificationGasLimit
  userOp.preVerificationGas   = gasEst.preVerificationGas

  /* ---- build real paymaster data ---- */
  const VALID_UNTIL = Number(
    Math.floor(Date.now() / 1000) + 3600 * 24 * 30,
  ) // 30 days
  const VALID_AFTER = 0

  const strategy = {
    paymasterMode: 0,
    depositor:     paymasterSigner.address,
    erc20Token:    zeroAddress as Hex,
    exchangeRate:  0n,
  }

  const strategyEncoded = encodePaymasterBlob(VALID_UNTIL, 0, strategy1)

  /* temporary struct for getHash */
  const strictUserOp = {
    sender:               userOp.sender,
    nonce:                userOp.nonce,
    initCode:             userOp.initCode,
    callData:             userOp.callData,
    callGasLimit:         userOp.callGasLimit,
    verificationGasLimit: userOp.verificationGasLimit,
    preVerificationGas:   userOp.preVerificationGas,
    maxFeePerGas:         userOp.maxFeePerGas,
    maxPriorityFeePerGas: userOp.maxPriorityFeePerGas,
    paymasterAndData:     concat([PAYMASTER_ADDRESS, strategyEncoded, DUMMY_SIG]),
    signature:            userOp.signature,
  } as const

  const paymasterHash = await publicClient.readContract({
    address: PAYMASTER_ADDRESS,
    abi:     abi_paymasterV2,
    functionName: 'getHash',
    args: [strictUserOp as any, VALID_UNTIL, VALID_AFTER, strategy],
  }) as Hex

  const paymasterSig = await paymasterSigner.signMessage({ message: { raw: paymasterHash } })

  userOp.paymasterAndData = concat([
    PAYMASTER_ADDRESS,
    strategyEncoded,
    paymasterSig,
  ])

  /* ---- final wallet-owner signature ---- */
  const userOpHash = getUserOperationHash({
    chainId: sepolia.id,
    entryPointAddress: ENTRYPOINT,
    entryPointVersion: '0.6',
    userOperation: userOp,
  })
  userOp.signature = await owner.signMessage({ message: { raw: userOpHash } })

  /* ---- output ---- */
  console.dir({ userOp }, { depth: null })

  const userOperationHash = (await smartAccountClient.request({
    method: "eth_sendUserOperation",
    params: [
      deepHexlify({ ...userOp }),
      entryPoint06Address,
    ],
  })) as Hex;
  console.log("User operation hash:", userOperationHash);

  const { receipt } = await smartAccountClient.waitForUserOperationReceipt({
    hash: userOperationHash,
  });

  console.log("User operation receipt:", receipt);

}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
