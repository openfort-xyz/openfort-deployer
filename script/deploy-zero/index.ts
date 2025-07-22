#!/usr/bin/env ts-node
import chalk from 'chalk'
import type { Hex } from 'viem';
import { argv, exit } from 'node:process';
import { padHex, formatEther } from 'viem';
import { envBigInt } from './utils/envBigInt';
import { deployThroughProxy } from './utils/deploy';
import { computeCreate2Address } from './utils/create2';
import { ContractsToDeploy } from './data/ContractsByteCode';
import { buildMinimalAccountInitCode } from './utils/initCode';
import { unlockAccount, getWalletClientForChain } from './wallet';
import { CHAINS_BY_FLAG, type ChainConfig } from './utils/chains';
import { buildPaymasterV6InitCode } from './utils/initCodePaymasterV6';
import { ENTRYPOINT_V6, ENTRYPOINT_V8, IMPLEMENTATION, INITIAL_GUARDIAN } from './data/addresses';

import 'dotenv/config';

function parseNetworks(): ChainConfig[] {
  const out: ChainConfig[] = [];
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2).toLowerCase();
    const conf = CHAINS_BY_FLAG[key];
    if (conf) out.push(conf);
  }
  if (out.length === 0) out.push(CHAINS_BY_FLAG.sepolia);
  return out;
}

const RECOVERY = envBigInt('RECOVERY');
const SECURITY = envBigInt('SECURITY');
const WINDOW = envBigInt('WINDOW');
const LOCK = envBigInt('LOCK');
const SALT = padHex(process.env.FACTORY_V6_SALT as Hex, { size: 32 }) as Hex;

async function main() {
  const nets = parseNetworks();
  const account = await unlockAccount();

  for (const chainConf of nets) {
    const client = getWalletClientForChain(account, chainConf);
    const bal = await client.getBalance({ address: client.account.address });
    console.log(`\n${chainConf.name} (${chainConf.id})`);
    console.log(chalk.green(`signer  ${client.account.address}`));
    console.log(chalk.green(`balance ${formatEther(bal)} ETH`));
    console.log(chalk.green(`===================================================================\n`));

    const initCode = buildMinimalAccountInitCode(
      client.account.address,
      ENTRYPOINT_V8,
      IMPLEMENTATION,
      RECOVERY,
      SECURITY,
      WINDOW,
      LOCK,
      INITIAL_GUARDIAN,
      ContractsToDeploy.MinimalAccountV2.creationByteCode
    );
    
    // const initCode = buildPaymasterV6InitCode( 
    //   ENTRYPOINT_V6,
    //   client.account.address,
    // );

    const predicted = computeCreate2Address(initCode, ContractsToDeploy.MinimalAccountV2.salt as Hex);
    console.log(chalk.yellow(`Predicted Address of Contract: ${predicted}`));
    console.log(chalk.green(`===================================================================\n`));

    const { deployed, flag } = await deployThroughProxy(client, initCode, ContractsToDeploy.MinimalAccountV2.salt as Hex);
    if (flag) {
      console.log(chalk.bgGreen(`Contract Deployed: ${deployed}`));
    } else {
      console.log(chalk.bgGreen(`Contract Already Deployed: ${deployed}`));
    }
    console.log(chalk.gray(`\n*******************************************************************`));
    console.log(chalk.gray(`*******************************************************************\n`));
  }
}
main().catch((e) => {
  console.error(e);
  exit(1);
});