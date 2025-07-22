import chalk from 'chalk'
import { http } from 'viem';
import { readFileSync } from 'fs';
import { createInterface } from 'readline';
import type { ChainConfig } from './utils/chains';
import { decrypt, type IKeystore } from '@chainsafe/bls-keystore';
import { createWalletClient, publicActions, type Chain } from 'viem';
import { privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts';
import 'dotenv/config';

export async function hiddenPrompt(label: string): Promise<string> {
  console.log(label);
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  (rl as any)._writeToOutput = () => {};
  return new Promise((res) =>
    rl.question('', (ans) => {
      rl.close();
      console.log();
      res(ans.trim());
    }),
  );
}

let cachedAccount: PrivateKeyAccount | undefined;

export async function unlockAccount() {
  if (cachedAccount) return cachedAccount;
  console.log(chalk.bgYellow(`Unlock EOA Account`))
  const keystore = JSON.parse(readFileSync('./script/keystore/paymaster.json', 'utf8')) as IKeystore;
  const pwd = await hiddenPrompt('Enter password to decrypt keystore:');
  const priv = (`0x${Buffer.from(await decrypt(keystore, pwd)).toString('hex')}`) as `0x${string}`;
  cachedAccount = privateKeyToAccount(priv);
  return cachedAccount;
}

function toViemChain(c: ChainConfig): Chain {
  return {
    id: c.id,
    name: c.name,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: [c.rpc] }, public: { http: [c.rpc] } },
  } as Chain;
}

export function getWalletClientForChain(account: PrivateKeyAccount, chainConf: ChainConfig) {
  const chain = toViemChain(chainConf);
  return createWalletClient({
    account,
    chain,
    transport: http(chainConf.rpc),
  }).extend(publicActions);
}

export type Wallet = ReturnType<typeof getWalletClientForChain>;