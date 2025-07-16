#!/usr/bin/env ts-node
import 'dotenv/config';
import { argv, exit } from 'node:process';
import type { Address, Hex } from 'viem';
import { encodeAbiParameters } from 'viem';
import { envBigInt } from './utils/envBigInt'
import { sepoliaChain } from './utils/chains';
import { verifyContracts } from './verifier-lib';
import { ENTRYPOINT_V8, IMPLEMENTATION, INITIAL_GUARDIAN } from './data/addresses';
import 'dotenv/config'

function getArg(flag: string): string | undefined {
  const i = argv.indexOf(flag);
  if (i === -1) return undefined;
  const v = argv[i + 1];
  if (!v || v.startsWith('--')) return undefined;
  return v;
}

const addressArg = getArg('--address');
if (!addressArg) {
  console.error('usage: verify-sepolia.ts --address <0x...> [--path src/AccountV2.sol:MinimalAccountV2]');
  exit(1);
}

const pathArg = getArg('--path') ?? 'src/AccountV2.sol:MinimalAccountV2';

const OWNER   = '0xA84E4F9D72cb37A8276090D3FC50895BD8E5Aaf1';
const ENTRY   = ENTRYPOINT_V8;
const IMPL    = IMPLEMENTATION;
const REC     = envBigInt('RECOVERY');
const SEC     = envBigInt('SECURITY');
const WIN     = envBigInt('WINDOW');
const LOCK    = envBigInt('LOCK');
const GUARD   = INITIAL_GUARDIAN;

const ctorArgsHex = encodeAbiParameters(
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
  [OWNER, ENTRY, IMPL, REC, SEC, WIN, LOCK, GUARD],
) as Hex;

async function main() {
  await verifyContracts(pathArg, addressArg as Address, [sepoliaChain], ctorArgsHex);
}

main().catch((e) => {
  console.error(e);
  exit(1);
});