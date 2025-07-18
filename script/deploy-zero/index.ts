#!/usr/bin/env ts-node
import 'dotenv/config';
import { argv, exit } from 'node:process';
import type { Hex } from 'viem';
import { padHex, formatEther } from 'viem';
import { unlockAccount, getWalletClientForChain } from './wallet';
import { CHAINS_BY_FLAG, type ChainConfig } from './utils/chains';
import { ENTRYPOINT_V6, ENTRYPOINT_V8, IMPLEMENTATION, INITIAL_GUARDIAN } from './data/addresses';
import { envBigInt } from './utils/envBigInt';
import { buildMinimalAccountInitCode } from './initCode';
import { computeCreate2Address } from './create2';
import { deployThroughProxy } from './deploy';
import { buildPaymasterV6InitCode } from './initCodePaymasterV6';

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
    console.log(`signer  ${client.account.address}`);
    console.log(`balance ${formatEther(bal)} ETH`);

    // const initCode = buildMinimalAccountInitCode(
    //   client.account.address,
    //   ENTRYPOINT_V8,
    //   IMPLEMENTATION,
    //   RECOVERY,
    //   SECURITY,
    //   WINDOW,
    //   LOCK,
    //   INITIAL_GUARDIAN,
    // );
    const initCode = buildPaymasterV6InitCode(
      ENTRYPOINT_V6,
      client.account.address,
    );

    const predicted = computeCreate2Address(initCode, SALT);
    console.log(`predicted ${predicted}`);

    const { deployed, flag } = await deployThroughProxy(client, initCode, SALT);
    if (flag) {
      console.log(`deployed  ${deployed}`);
    } else {
      console.log("Contract Already Deployed:", deployed);
    }
  }
}
main().catch((e) => {
  console.error(e);
  exit(1);
});