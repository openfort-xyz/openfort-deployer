import { readFileSync } from 'fs';
import { createInterface } from 'readline';
import {
  createWalletClient,
  publicActions,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { http } from 'viem';
import { sepolia } from 'viem/chains';
import { decrypt, type IKeystore } from '@chainsafe/bls-keystore';
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

export async function getWalletClient() {
  const keystore = JSON.parse(
    readFileSync('script/data/keystore.json', 'utf8'),
  ) as IKeystore;

  const pwd = await hiddenPrompt('Enter password to decrypt keystore:');

  const priv = (`0x${Buffer.from(await decrypt(keystore, pwd)).toString(
    'hex',
  )}`) as `0x${string}`;

  const account = privateKeyToAccount(priv);

  return createWalletClient({
    account,
    chain: sepolia,
    transport: http(process.env.RPC_URL),
  }).extend(publicActions);
}

export type Wallet = Awaited<ReturnType<typeof getWalletClient>>;