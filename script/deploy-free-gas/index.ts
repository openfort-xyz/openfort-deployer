#!/usr/bin/env ts-node
import chalk from 'chalk'
import type { Hex } from 'viem'
import { argv, exit } from 'node:process'
import { padHex, formatEther } from 'viem'
import { deployWithPaymaster } from './pimlico'
import { computeAddress } from './utils/computeAddress'
import { CHAINS_BY_FLAG, type ChainConfig } from './utils/chains'
import { ContractToDeploy } from '../deploy-free-gas/utils/ContractsByteCode';
import { unlockAccount, getWalletClientForChain, getPublicClientForChain } from './wallet'

import 'dotenv/config'

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
  const nets = parseNetworks();
  const eoa = await unlockAccount({ isAccount: true });
  const saltEnv = process.env.DEPLOYER_MANAGER_SALT as Hex;
  const SALT = padHex(saltEnv, { size: 32 }) as Hex;

  const PAYMASTER = await unlockAccount({ isAccount: false });

  for (const chainConf of nets) {
    const client = getWalletClientForChain(eoa, chainConf);
    const bal = await client.getBalance({ address: client.account.address });
    console.log(`\n${chainConf.name} (${chainConf.id})`);
    console.log(chalk.green(`signer  ${client.account.address}`));
    console.log(chalk.green(`balance ${formatEther(bal)} ETH`));
    
    const sender = await computeAddress(client, undefined, SALT);
    console.log(chalk.blueBright(`sender  ${sender}`));
    
    console.log(chalk.green(`===================================================================\n`));
    const paymasterClient = getWalletClientForChain(PAYMASTER, chainConf);
    const balOfPaymaster = await paymasterClient.getBalance({ address: paymasterClient.account.address });
    console.log(chalk.bgCyan(`paymaster  ${paymasterClient.account.address}`));
    console.log(chalk.bgCyan(`balance of paymaster ${formatEther(balOfPaymaster)} ETH`));
    console.log(chalk.green(`===================================================================\n`));

    const publicClient = getPublicClientForChain(chainConf);
    const CONTRACTS: ContractToDeploy[] = await deployWithPaymaster(client, paymasterClient, publicClient);
    for (const contract of CONTRACTS){
     if (!contract.isExist){
      console.log(chalk.bgGreen(`Contract ${contract.name} Deployed With Address: ${contract.address}`))
     }
    }
    console.log(chalk.gray(`\n*******************************************************************`));
    console.log(chalk.gray(`*******************************************************************\n`));
  }
}
main().catch((e) => {
  console.error(e)
  exit(1)
})