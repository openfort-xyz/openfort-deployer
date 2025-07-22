import chalk from 'chalk'
import type { Wallet } from '../wallet';
import { concatHex, type Hex } from 'viem';
import { CREATE2_PROXY } from '../data/addresses';
import { computeCreate2Address } from './create2';
import { getExplorerUrl } from '../data/explorerUrl';

export interface DeployResult {
  deployed: Hex;
  flag: 0 | 1;
}

function hasCode(code: Hex | undefined): boolean {
  if (!code) return false;
  const c = code.toLowerCase();
  return c !== '0x' && c !== '0x0';
}

export async function deployThroughProxy(
  client: Wallet,
  initCode: Hex,
  salt: Hex,
  value: bigint = 0n,
): Promise<DeployResult> {
  const predicted = computeCreate2Address(initCode, salt);

  const before = await client.getCode({ address: predicted });
  if (hasCode(before)) return { deployed: predicted, flag: 0 };

  const txHash = await client.sendTransaction({
    account: client.account,
    to: CREATE2_PROXY,
    data: concatHex([salt, initCode]),
    value,
  });

  try {
    const receipt  = await client.waitForTransactionReceipt({ hash: txHash });
    console.log(chalk.green(`Transaction Receipt: ${getExplorerUrl(client.chain.name, receipt.transactionHash)}`))
  } catch {}

  for (let i = 0; i < 12; i++) {
    const code = await client.getCode({ address: predicted });
    if (hasCode(code)) return { deployed: predicted, flag: 1 };
    await new Promise((r) => setTimeout(r, 5000));
  }

  throw new Error(`deployment produced empty byte-code at ${predicted} (tx ${txHash})`);
}