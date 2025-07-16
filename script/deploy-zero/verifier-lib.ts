import { exec } from 'node:child_process';
import util from 'node:util';
import chalk from 'chalk';
import ora from 'ora';
import type { Address } from 'viem';
import type { ChainConfig } from './utils/chains';

const execPromise = util.promisify(exec);

async function checkForgeAvailability() {
  try {
    await execPromise('forge --version');
  } catch {
    throw new Error('forge command is not available. Install Foundry: https://book.getfoundry.sh/getting-started/installation');
  }
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
    `forge verify-contract --chain ${chain.id} --verifier etherscan` +
    ctorFlag + ' ' +
    `${contractAddress} ${contractName} -e ${chain.explorerAPI} -a v2`;

  try {
    const { stdout, stderr } = await execPromise(command);

    if (stderr && stderr.trim() !== '') {
      return `Error verifying contract ${contractName} at ${contractAddress} on ${chalk.yellowBright(chain.name)}: ${stderr}`;
    }

    if (stdout.includes('is already verified')) {
      return `Contract ${contractName} at ${contractAddress} on ${chalk.yellowBright(chain.name)} is already verified. Skipping verification.`;
    }

    return `Successfully verified contract ${contractName} at ${contractAddress} on ${chalk.yellowBright(chain.name)}.`;
  } catch (error: any) {
    throw new Error(`Error executing ${command}: ${error?.message ?? error}`);
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

  const verificationPromises = chains.map((chain) =>
    verifyContract(contractName, contractAddress, chain, ctorArgsHex)
      .then((message) => {
        if (message.includes('is already verified')) {
          ora().warn(message).start().stop();
        } else if (message.startsWith('Error verifying')) {
          ora().fail(message).start().stop();
          anyError = true;
        } else {
          ora().succeed(message).start().stop();
        }
      })
      .catch((error: any) => {
        anyError = true;
        ora().fail(`Verification failed on ${chain.name}: ${error?.message ?? error}`).start().stop();
      }),
  );

  await Promise.all(verificationPromises);
  spinner.stop();

  if (anyError) {
    console.log('❌ Some verifications failed!');
    process.exit(1);
  } else {
    console.log('✅ All verification processes finished successfully!');
  }
};