import { decodeFunctionResult, encodeFunctionData, Hex, padHex } from 'viem'
import type { Wallet } from '../wallet'
import { FACTORY_V6_SEPOLIA } from '../data/addresses'
import { abi_factory } from '../data/abiFactory'
import { hasCode } from '../utils/computeAddressHelpers'
import 'dotenv/config'

export async function computeAddress(
  client: Wallet,
  factory: Hex = FACTORY_V6_SEPOLIA,
  saltIn?: Hex,
): Promise<Hex> {
  const isExist = await client.getCode({ address: factory })
  if (!hasCode(isExist)) throw new Error(`Factory Not Exist On This Address: ${factory}`)
  const saltEnv = saltIn ?? (process.env.DEPLOYER_MANAGER_SALT as Hex)
  if (!saltEnv) throw new Error('DEPLOYER_MANAGER_SALT required')
  const SALT: Hex = padHex(saltEnv, { size: 32 }) as Hex
  const result = await client.call({
    to: factory,
    data: encodeFunctionData({
      abi: abi_factory,
      functionName: 'getAddressWithNonce',
      args: [client.account.address, SALT],
    }),
  })
  const addr = decodeFunctionResult({
    abi: abi_factory,
    functionName: 'getAddressWithNonce',
    data: result.data as Hex,
  }) as Hex
  return addr
}