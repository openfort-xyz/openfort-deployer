import type { Wallet } from '../wallet'
import { abi_factory } from '../data/abiFactory'
import { hasCode } from '../utils/computeAddressHelpers'
import { SIMPLE_ACCOUNT_FACTORY } from '../data/addresses'
import { FACTORY_V6 } from '../data/addresses'
import { decodeFunctionResult, encodeFunctionData, Hex, padHex } from 'viem'
import { abi_simnple_account_factory } from '../data/abiSimpleAccountFactory'
import 'dotenv/config'

export async function computeAddress(
  client: Wallet,
  factory: Hex = SIMPLE_ACCOUNT_FACTORY,
  saltIn?: Hex,
): Promise<Hex> {

  const isExist = await client.getCode({ address: factory });
  if (!hasCode(isExist)) throw new Error(`Factory Not Exist On This Address: ${factory}`);
  
  const saltEnv = saltIn ?? (process.env.DEPLOYER_MANAGER_SALT as Hex);
  if (!saltEnv) throw new Error('DEPLOYER_MANAGER_SALT required');
  
  
  const SALT: Hex = padHex(saltEnv, { size: 32 }) as Hex;
  
  if (factory === FACTORY_V6) {
    const result = await client.call({
      to: factory,
      data: encodeFunctionData({
        abi: abi_factory,
        functionName: 'getAddressWithNonce',
        args: [client.account.address, SALT],
      }),
    });
  
    const addr = decodeFunctionResult({
      abi: abi_factory,
      functionName: 'getAddressWithNonce',
      data: result.data as Hex,
    }) as Hex;

    return addr;

  } else if (factory === SIMPLE_ACCOUNT_FACTORY){
    const result = await client.call({
      to: factory,
      data: encodeFunctionData({
        abi: abi_simnple_account_factory,
        functionName: 'getAddress',
        args: [client.account.address, 0n],
      }),
    });
  
    const addr = decodeFunctionResult({
      abi: abi_simnple_account_factory,
      functionName: 'getAddress',
      data: result.data as Hex,
    }) as Hex;
  
    return addr;
  }
  
  throw new Error(`Unsupported factory: ${factory}`)
}