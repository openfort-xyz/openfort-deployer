import ora from 'ora';
import chalk from 'chalk';
import util from 'node:util';
import type { Address } from 'viem';
import { exec } from 'node:child_process';
import type { ChainConfig } from './utils/chains';

const execPromise = util.promisify(exec);
const DELAY_MS = Number(process.env.VERIFY_DELAY_MS ?? '20000');

async function checkForgeAvailability() {
  try {
    await execPromise('forge --version');
  } catch {
    throw new Error('forge command is not available. Install Foundry: https://book.getfoundry.sh/getting-started/installation');
  }
}

function classify(stdout: string, stderr: string, contractName: string, contractAddress: Address, chainName: string): string {
  const out = `${stdout}\n${stderr}`;
  const lower = out.toLowerCase();
  if (lower.includes('already verified')) {
    return `Contract ${contractName} at ${contractAddress} on ${chalk.yellowBright(chainName)} is already verified. Skipping verification.`;
  }
  if (lower.includes('successfully verified') || lower.includes('contract successfully verified')) {
    return `Successfully verified contract ${contractName} at ${contractAddress} on ${chalk.yellowBright(chainName)}.`;
  }
  const errLines = stderr
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.toLowerCase().startsWith('warning:'));
  if (errLines.length > 0) {
    return `Error verifying contract ${contractName} at ${contractAddress} on ${chalk.yellowBright(chainName)}: ${errLines.join(' ')}`;
  }
  return `Successfully verified contract ${contractName} at ${contractAddress} on ${chalk.yellowBright(chainName)}.`;
}

async function verifyContract(
  contractName: string,
  contractAddress: Address,
  chain: ChainConfig,
  ctorArgsHex?: string,
): Promise<string> {
  if (!chain.explorerAPI) {
    throw new Error(`Explorer API key is not provided for ${chalk.yellowBright(chain.name)}.`);
  }
  const ctorFlag = ctorArgsHex && ctorArgsHex !== '0x' ? ` --constructor-args ${ctorArgsHex}` : '';
  const command =
    `forge verify-contract --watch --chain ${chain.id} --verifier etherscan` +
    ctorFlag + ' ' +
    `${contractAddress} ${contractName} -e ${chain.explorerAPI} -a v2`;
  try {
    const { stdout, stderr } = await execPromise(command, { maxBuffer: 10_000_000 });
    return classify(stdout, stderr, contractName, contractAddress, chain.name);
  } catch (error: any) {
    const stdout = error?.stdout ?? '';
    const stderr = error?.stderr ?? '';
    return classify(stdout, stderr, contractName, contractAddress, chain.name);
  }
}

export const verifyContracts = async (
  contractName: string,
  contractAddress: Address,
  chains: ChainConfig[],
  ctorArgsHex?: string,
) => {
  await checkForgeAvailability();
  const spinner = ora().start('Verifying contracts...');
  let anyError = false;
  for (let i = 0; i < chains.length; i++) {
    const chain = chains[i];
    let message: string;
    try {
      message = await verifyContract(contractName, contractAddress, chain, ctorArgsHex);
    } catch (error: any) {
      message = `Error verifying contract ${contractName} at ${contractAddress} on ${chain.name}: ${error?.message ?? error}`;
    }
    if (message.includes('is already verified')) {
      ora().warn(message).start().stop();
    } else if (message.startsWith('Error verifying')) {
      ora().fail(message).start().stop();
      anyError = true;
    } else {
      ora().succeed(message).start().stop();
    }
    if (i < chains.length - 1 && DELAY_MS > 0) {
      spinner.text = `Waiting ${Math.round(DELAY_MS / 1000)}s...`;
      await new Promise((r) => setTimeout(r, DELAY_MS));
      spinner.text = 'Verifying contracts...';
    }
  }
  spinner.stop();
  if (anyError) {
    console.log('❌ Some verifications failed!');
    process.exit(1);
  } else {
    console.log('✅ All verification processes finished successfully!');
  }
};