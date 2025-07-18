import { PaymasterV6ByteCode } from './ContractsByteCode';
import { encodeAbiParameters, concatHex, type Hex } from 'viem';

export function buildPaymasterV6InitCode(
  entrypoint: Hex,
  owner: Hex,
): Hex {
  const args = encodeAbiParameters(
    [
      { type: 'address' },
      { type: 'address' }
    ],
    [
      entrypoint,
      owner,
    ],
  ) as Hex;
  return concatHex([PaymasterV6ByteCode, args]) as Hex;
}