import chalk from 'chalk'
import type { Wallet } from '../wallet';
import { concatHex, type Hex } from 'viem';
import { CREATE2_PROXY } from '../data/addresses';
import { getExplorerUrl } from '../data/explorerUrl';
import { ContractToDeploy } from '../utils/ContractsByteCode';

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
  contract: ContractToDeploy,
  initCode: Hex,
  value: bigint = 0n,
): Promise<DeployResult> {

  const before = await client.getCode({ address: contract.address as Hex });
  if (hasCode(before)) return { deployed: contract.address as Hex, flag: 0 };
  
  let data: Hex;
  if (!contract.isExist) {
    data = concatHex([contract.salt as Hex, initCode]);
  } else {
    data = initCode;
  }

  const txHash = await client.sendTransaction({
    account: client.account,
    to: CREATE2_PROXY,
    data: data,
    value,
  });

  try {
    const receipt  = await client.waitForTransactionReceipt({ hash: txHash });
    console.log(chalk.green(`Transaction Receipt: ${getExplorerUrl(client.chain.name, receipt.transactionHash)}`))
  } catch {}

  for (let i = 0; i < 12; i++) {
    const code = await client.getCode({ address: contract.address as Hex });
    if (hasCode(code)) return { deployed: contract.address as Hex, flag: 1 };
    await new Promise((r) => setTimeout(r, 5000));
  }

  throw new Error(`deployment produced empty byte-code at ${contract.address} (tx ${txHash})`);
}