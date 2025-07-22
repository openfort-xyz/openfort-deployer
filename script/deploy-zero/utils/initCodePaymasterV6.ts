import { ContractsToDeploy } from '../utils/ContractsByteCode';
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
  return concatHex([ContractsToDeploy.PaymasterV6.creationByteCode, args]) as Hex;
}