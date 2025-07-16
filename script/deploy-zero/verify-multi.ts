#!/usr/bin/env ts-node
import 'dotenv/config';
import { argv, exit } from 'node:process';
import type { Address, Hex } from 'viem';
import { encodeAbiParameters } from 'viem';
import { verifyContracts } from './verifier-lib';
import { CHAINS_BY_FLAG, type ChainConfig } from './utils/chains';
import { envBigInt } from './utils/envBigInt';
import { ENTRYPOINT_V8, IMPLEMENTATION, INITIAL_GUARDIAN } from './data/addresses';

function getArg(flag: string): string | undefined {
  const i = argv.indexOf(flag);
  if (i === -1) return undefined;
  const v = argv[i + 1];
  if (!v || v.startsWith('--')) return undefined;
  return v;
}

function parseNetworks(): ChainConfig[] {
  const out: ChainConfig[] = [];
  const seen = new Set<number>();
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    if (a === '--address' || a === '--path') {
      i++;
      continue;
    }
    const key = a.slice(2).toLowerCase();
    const conf = CHAINS_BY_FLAG[key];
    if (!conf) continue;
    if (seen.has(conf.id)) continue;
    seen.add(conf.id);
    out.push(conf);
  }
  if (out.length === 0) out.push(CHAINS_BY_FLAG.sepolia);
  return out;
}

const addressArg = getArg('--address');
if (!addressArg) {
  console.error('usage: verify.ts --address <0x...> [--path src/AccountV2.sol:MinimalAccountV2] [--sepolia] [--base_sepolia] ...');
  exit(1);
}

const pathArg = getArg('--path') ?? 'src/AccountV2.sol:MinimalAccountV2';

const OWNER = (process.env.DEPLOYER_ADDRESS ?? '').trim() as Hex;
if (!OWNER) {
  console.error('DEPLOYER_ADDRESS missing in env');
  exit(1);
}

const REC = envBigInt('RECOVERY');
const SEC = envBigInt('SECURITY');
const WIN = envBigInt('WINDOW');
const LOCK = envBigInt('LOCK');

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
  [OWNER, ENTRYPOINT_V8, IMPLEMENTATION, REC, SEC, WIN, LOCK, INITIAL_GUARDIAN],
) as Hex;

async function main() {
  const chains = parseNetworks();
  await verifyContracts(pathArg, addressArg as Address, chains, ctorArgsHex);
}
main().catch((e) => {
  console.error(e);
  exit(1);
});