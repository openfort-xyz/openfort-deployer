#!/usr/bin/env ts-node
import 'dotenv/config'
import { argv, exit } from 'node:process'
import type { Hex } from 'viem'
import { padHex, formatEther } from 'viem'
import { unlockAccount, getWalletClientForChain } from './wallet'
import { CHAINS_BY_FLAG, type ChainConfig } from './utils/chains'
import { computeAddress } from './utils/computeAddress'
import { getPimlicoClient, buildUserOp, estimateAndPriceUserOp } from './utils/userOP'

function parseNetworks(): ChainConfig[] {
  const out: ChainConfig[] = []
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    const key = a.slice(2).toLowerCase()
    const conf = CHAINS_BY_FLAG[key]
    if (conf) out.push(conf)
  }
  if (out.length === 0) out.push(CHAINS_BY_FLAG.sepolia)
  return out
}

async function main() {
  const nets = parseNetworks()
  const eoa = await unlockAccount()
  const saltEnv = process.env.DEPLOYER_MANAGER_SALT as Hex
  const SALT = padHex(saltEnv, { size: 32 }) as Hex

  for (const chainConf of nets) {
    const client = getWalletClientForChain(eoa, chainConf)
    const bal = await client.getBalance({ address: client.account.address })
    console.log(`\n${chainConf.name} (${chainConf.id})`)
    console.log(`signer  ${client.account.address}`)
    console.log(`balance ${formatEther(bal)} ETH`)

    const sender = await computeAddress(client, undefined, SALT)
    console.log(`sender  ${sender}`)

    const pimlicoClient = getPimlicoClient(client)
    const uo = await buildUserOp(client, sender as Hex, SALT, false, '0x')
    const priced = await estimateAndPriceUserOp(pimlicoClient, uo)
    console.log('userOp', priced)
  }
}
main().catch((e) => {
  console.error(e)
  exit(1)
})