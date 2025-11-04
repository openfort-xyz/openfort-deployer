#!/usr/bin/env ts-node
import chalk from 'chalk'
import type { Hex } from 'viem';
import { argv, exit } from 'node:process';
import { formatEther, concatHex } from 'viem';
import { deployThroughProxy } from './utils/deploy';
import { computeCreate2Address } from './utils/create2';
import { ContractsToDeploy, ContractToDeploy } from './utils/ContractsByteCode';
import { unlockAccount, getWalletClientForChain } from './wallet';
import { CHAINS_BY_FLAG, type ChainConfig } from './utils/chains';


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
      initCode = concatHex([ContractsToDeploy.OPFPaymasterV3.creationByteCode, ContractsToDeploy.OPFPaymasterV3.constructor_args!]) as Hex;

      predicted = computeCreate2Address(initCode, contract.salt as Hex);
      contract.address = predicted;

    } else {
      initCode = contract.creationByteCode;
      predicted = contract.address;
    }

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