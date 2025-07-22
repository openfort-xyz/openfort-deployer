#!/usr/bin/env ts-node
/* -------------------------------------------------------------------------- *
 *  Deterministic (CREATE2) deployment – MinimalAccount                       *
 *  Uses 0x4e59b44847b379578588920cA78FbF26c0B4956C proxy                     *
 * -------------------------------------------------------------------------- */

import { readFileSync } from 'fs';
import { createInterface } from 'readline';
import {
  createWalletClient,
  publicActions,
  encodeAbiParameters,
  getContractAddress,
  concatHex,
  padHex,
  formatEther,
  type Hex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { http } from 'viem';
import { sepolia } from 'viem/chains';
import { decrypt, type IKeystore } from '@chainsafe/bls-keystore';
import { MinimalAccountByteCode } from './ContractsByteCode'; // **creation** code only
import 'dotenv/config';

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const CREATE2_PROXY =
  '0x4e59b44847b379578588920cA78FbF26c0B4956C' as const;

const ENTRYPOINT_V08 =
  '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108' as const; // <-- replace

const INITIAL_GUARDIAN =
  '0xbebCD8Cba50c84f999d6A8C807f261FF278161fb' as const;

/* -------------------------------------------------------------------------- */
/* Prompt (hidden input)                                                      */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Wallet client                                                              */
/* -------------------------------------------------------------------------- */

async function decryptKey() {
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

/* -------------------------------------------------------------------------- */
/* Build initCode WITHOUT the ABI file                                        */
/* -------------------------------------------------------------------------- */

function buildMinimalAccountInitCode(
  owner: Hex,
  entrypoint: Hex,
  implementation: Hex,
  recoveryPeriod: bigint,
  securityPeriod: bigint,
  securityWindow: bigint,
  lockPeriod: bigint,
  initialGuardian: Hex,
): Hex {
  const encodedArgs = encodeAbiParameters(
    [
      { type: 'address' },
      { type: 'address' },
      { type: 'address' },
      { type: 'uint256' },
      { type: 'uint256' },
      { type: 'uint256' },
      { type: 'uint256' },
      { type: 'address' },
    ],
    [
      owner,
      entrypoint,
      implementation,
      recoveryPeriod,
      securityPeriod,
      securityWindow,
      lockPeriod,
      initialGuardian,
    ],
  ) as Hex;

  return concatHex([MinimalAccountByteCode, encodedArgs]) as Hex;
}

/* -------------------------------------------------------------------------- */
/* CREATE2 helpers                                                            */
/* -------------------------------------------------------------------------- */

function computeAddress(
  initCode: Hex,
  salt: Hex,
  factory: Hex = CREATE2_PROXY,
): Hex {
  return getContractAddress({
    opcode: 'CREATE2',
    from: factory,
    bytecode: initCode,
    salt,
  });
}

async function deployThroughProxy(
  client: Awaited<ReturnType<typeof decryptKey>>,
  initCode: Hex,
  salt: Hex,
  value: bigint = 0n,
): Promise<Hex> {
  const predicted = computeAddress(initCode, salt);

  const txHash = await client.sendTransaction({
    account: client.account,
    to: CREATE2_PROXY,
    data: concatHex([salt, initCode]),
    value,
  });

  const receipt = await client.waitForTransactionReceipt({ hash: txHash });
  if (receipt.status !== 'success')
    throw new Error(`Proxy reverted (tx ${txHash})`);

  const code = await client.getBytecode({ address: predicted });
  if (code === '0x')
    throw new Error(`No bytecode at ${predicted} – deployment failed`);

  return predicted;
}

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

async function main() {
  const client = await decryptKey();
  console.log('\n📇  Signer  :', client.account.address);

  const bal = await client.getBalance({ address: client.account.address });
  console.log('💰 Balance :', formatEther(bal), 'ETH');

  /* ---------------- constructor params & initCode ----------------------- */

  const recoveryPeriod  = 2n * 24n * 60n * 60n;   // 2 days
  const securityPeriod  = 1n * 24n * 60n * 60n;   // 1 day
  const securityWindow  = 12n * 60n * 60n;        // 12 h
  const lockPeriod      = 6n  * 60n * 60n;        // 6 h

  const implementation = '0x2222222222222222222222222222222222222222'; // replace

  const initCode = buildMinimalAccountInitCode(
    client.account.address,
    ENTRYPOINT_V08,
    implementation,
    recoveryPeriod,
    securityPeriod,
    securityWindow,
    lockPeriod,
    INITIAL_GUARDIAN,
  );

  /* ----------------------------- salt ----------------------------------- */

  const salt = padHex(
    '0xea69432e1e6530adc820b44390f94f4d323b45a86f59bddee59773d7ec27dba0',
    { size: 32 },
  ) as Hex;

  console.log('🔮 Predicted:', computeAddress(initCode, salt));

  /* --------------------------- deploy ----------------------------------- */

  const deployed = await deployThroughProxy(client, initCode, salt);
  console.log('🚀 Deployed :', deployed);
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}