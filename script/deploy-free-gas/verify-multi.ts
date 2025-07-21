#!/usr/bin/env ts-node
import 'dotenv/config'
import { argv, exit } from 'node:process'
import type { Address, Hex } from 'viem'
import { encodeAbiParameters } from 'viem'
import { verifyContracts } from './verifier-lib'
import { CHAINS_BY_FLAG, type ChainConfig } from './utils/chains'
import { envBigInt } from './utils/envBigInt'
import { ENTRYPOINT_V8, IMPLEMENTATION, INITIAL_GUARDIAN } from './data/addresses'

function getArg(flag: string) {
  const i = argv.indexOf(flag)
  if (i === -1) return undefined
  const v = argv[i + 1]
  return v && !v.startsWith('--') ? v : undefined
}

function parseNetworks() {
  const out: ChainConfig[] = []
  const seen = new Set<number>()
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    if (a === '--address' || a === '--path' || a === '--constructor') {
      i++
      continue
    }
    const key = a.slice(2).toLowerCase()
    const conf = CHAINS_BY_FLAG[key]
    if (conf && !seen.has(conf.id)) {
      seen.add(conf.id)
      out.push(conf)
    }
  }
  return out.length ? out : [CHAINS_BY_FLAG.sepolia]
}

const addressArg = getArg('--address')
if (!addressArg) {
  console.error('usage: verify-multi.ts --address 0x... [--path src/Account.sol:Contract] [--constructor 0x...] [--sepolia] [...]')
  exit(1)
}

const pathArg = getArg('--path') ?? 'src/Account.sol:MinimalAccount'
const ctorFromCli = getArg('--constructor')

let ctorArgsHex: Hex
if (ctorFromCli) {
  ctorArgsHex = ctorFromCli as Hex
} else {
  const OWNER = (process.env.DEPLOYER_ADDRESS ?? '').trim() as Hex
  if (!OWNER) {
    console.error('DEPLOYER_ADDRESS missing and --constructor not provided')
    exit(1)
  }
  const REC = envBigInt('RECOVERY')
  const SEC = envBigInt('SECURITY')
  const WIN = envBigInt('WINDOW')
  const LOCK = envBigInt('LOCK')
  ctorArgsHex = encodeAbiParameters(
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
  ) as Hex
}

async function main() {
  await verifyContracts(pathArg, addressArg as Address, parseNetworks(), ctorArgsHex)
}
main().catch((e) => {
  console.error(e)
  exit(1)
})