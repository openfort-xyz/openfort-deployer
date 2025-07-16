import { CREATE2_PROXY } from './data/addresses'
import { getContractAddress, type Hex } from 'viem';

export function computeCreate2Address(
  initCode: Hex,
  salt: Hex,
  factory: Hex = CREATE2_PROXY,
): Hex {
  return getContractAddress({
    opcode: 'CREATE2',
    from: factory,
    bytecode: initCode,
    salt,
  });
}