#!/usr/bin/env ts-node
import chalk from 'chalk'
import { readFileSync } from 'fs'
import { createInterface } from 'readline'
import { decrypt, type IKeystore } from '@chainsafe/bls-keystore'
import { PrivateKeyAccount, privateKeyToAccount } from 'viem/accounts'

let cachedFreeGasAccount: PrivateKeyAccount | undefined;
let cachedPaymasterAccount: PrivateKeyAccount | undefined;

async function hiddenPrompt(label: string): Promise<string> {
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

async function main() {
  const keystores: IKeystore[] = [
    JSON.parse(readFileSync('./script/keystore/freegas.json', 'utf8')) as IKeystore,
    JSON.parse(readFileSync('./script/keystore/paymaster.json', 'utf8')) as IKeystore
  ]; 

  let i: number = 0;

  for (const keystore of keystores) {
    if (i === 0) {
        console.log(chalk.bgYellow(`Unlock EOA Account`));
    } else {
        console.log(chalk.bgYellow(`Unlock Paymaster Account`));
    }
    const pwd = await hiddenPrompt('Enter password to decrypt keystore:');
    const priv = (`0x${Buffer.from(await decrypt(keystore, pwd)).toString('hex')}`) as `0x${string}`;
    const account = privateKeyToAccount(priv);

    if (i === 0) {
        console.log(chalk.green(`EOA       : ${account.address}\n`));
    } else {
        console.log(chalk.green(`Paymaster : ${account.address}`));
    }

    i++;
  }
}

main().catch(console.error)