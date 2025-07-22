#!/usr/bin/env ts-node
import chalk from 'chalk'
import type { Hex } from 'viem';
import { argv, exit } from 'node:process';
import { padHex, formatEther } from 'viem';
import { envBigInt } from './utils/envBigInt';
import { deployThroughProxy } from './utils/deploy';
import { computeCreate2Address } from './utils/create2';
import { ContractsToDeploy, ContractToDeploy } from './utils/ContractsByteCode';
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

const contractKey =
  argv.slice(2).find(a => !a.startsWith('--')) ?? 'MinimalAccountV2'

const RECOVERY = envBigInt('RECOVERY');
const SECURITY = envBigInt('SECURITY');
const WINDOW = envBigInt('WINDOW');
const LOCK = envBigInt('LOCK');

async function main(contract_name: string) {

  const nets = parseNetworks();
  const account = await unlockAccount();

  for (const chainConf of nets) {
    const client = getWalletClientForChain(account, chainConf);
    const bal = await client.getBalance({ address: client.account.address });
    console.log(`\n${chainConf.name} (${chainConf.id})`);
    console.log(chalk.green(`signer  ${client.account.address}`));
    console.log(chalk.green(`balance ${formatEther(bal)} ETH`));
    console.log(chalk.green(`===================================================================\n`));

    const contract: ContractToDeploy = ContractsToDeploy.getByName(contract_name);

    let predicted: Hex;
    let initCode: Hex;

    if (!contract.isExist) {
        initCode = buildMinimalAccountInitCode(
        client.account.address,
        ENTRYPOINT_V8,
        IMPLEMENTATION,
        RECOVERY,
        SECURITY,
        WINDOW,
        LOCK,
        INITIAL_GUARDIAN,
        contract.creationByteCode
      );

      predicted = computeCreate2Address(initCode, contract.salt as Hex);
      contract.address = predicted;

    } else {
      initCode = contract.creationByteCode;
      predicted = contract.address;
    }
    
    // const initCode = buildPaymasterV6InitCode( 
    //   ENTRYPOINT_V6,
    //   client.account.address,a
    // );

    console.log(chalk.yellow(`Predicted Address of  ${contract.name} Contract: ${predicted}`));
    console.log(chalk.green(`===================================================================\n`));

    const { deployed, flag } = await deployThroughProxy(client, contract, initCode);
    if (flag) {
      console.log(chalk.bgGreen(`Contract ${contract.name} Deployed: ${deployed}`));
    } else {
      console.log(chalk.bgGreen(`Contract ${contract.name} Already Deployed: ${deployed}`));
    }
    console.log(chalk.gray(`\n*******************************************************************`));
    console.log(chalk.gray(`*******************************************************************\n`));
  }
}

main(contractKey).catch((e) => {
  console.error(e);
  exit(1);
});