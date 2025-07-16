import { MinimalAccountV6ByteCode } from './ContractsByteCode';
import { encodeAbiParameters, concatHex, type Hex } from 'viem';

export function buildMinimalAccountInitCode(
  owner: Hex,
  entrypoint: Hex,
  implementation: Hex,
  recoveryPeriod: bigint,
  securityPeriod: bigint,
  securityWindow: bigint,
  lockPeriod: bigint,
  guardian: Hex,
): Hex {
  const args = encodeAbiParameters(
    [
      { type: 'address' },
      { type: 'address' },
      { type: 'address' },
      { type: 'uint256' },
      { type: 'uint256' },
      { type: 'uint256' },
      { type: 'uint256' },
      { type: 'address' },
    ],
    [
      owner,
      entrypoint,
      implementation,
      recoveryPeriod,
      securityPeriod,
      securityWindow,
      lockPeriod,
      guardian,
    ],
  ) as Hex;

  return concatHex([MinimalAccountV6ByteCode, args]) as Hex;
}