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
  creationCode: Hex
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

  return concatHex([creationCode, args]) as Hex;
}

export function buildFactoryV6InitCode(
  owner: Hex,
  entrypoint: Hex,
  implementation: Hex,
  recoveryPeriod: bigint,
  securityPeriod: bigint,
  securityWindow: bigint,
  lockPeriod: bigint,
  guardian: Hex,
  creationCode: Hex
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

  return concatHex([creationCode, args]) as Hex;
}
export function buildPaymasterV2InitCode(
  entrypoint: Hex,
  owner: Hex,
  creationCode: Hex
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
  return concatHex([creationCode, args]) as Hex;
}

export function buildPaymasterV3InitCode(
  owner: Hex,
  manager: Hex,
  signers: Hex[],
  creationCode: Hex
): Hex {
  const args = encodeAbiParameters(
    [
      { type: 'address' },
      { type: 'address' },
      { type: 'address[]' },
    ],
    [
      owner,
      manager,
      signers,
    ],
  ) as Hex;
  return concatHex([creationCode, args]) as Hex;
}