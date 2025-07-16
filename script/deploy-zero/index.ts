#!/usr/bin/env ts-node
import type { Hex } from 'viem';
import { getWalletClient } from './wallet';
import { padHex, formatEther } from 'viem';
import { envBigInt } from './utils/envBigInt'
import { deployThroughProxy } from './deploy';
import { computeCreate2Address } from './create2';
import { buildMinimalAccountInitCode } from './initCode';
import { ENTRYPOINT_V8, IMPLEMENTATION, INITIAL_GUARDIAN } from './data/addresses'
import 'dotenv/config';


const RECOVERY = envBigInt('RECOVERY');
const SECURITY = envBigInt('SECURITY');
const WINDOW   = envBigInt('WINDOW');
const LOCK     = envBigInt('LOCK');

const SALT = padHex(
  process.env.FACTORY_V6_SALT as Hex,
  { size: 32 },
) as Hex;

/* ── orchestrator ───────────────────────────────────────────────────────── */

async function main() {
  const client = await getWalletClient();

  console.log('\n📇 signer  ', client.account.address);
  console.log('💰 balance ', formatEther(await client.getBalance({ address: client.account.address })));

  const initCode = buildMinimalAccountInitCode(
    client.account.address,
    ENTRYPOINT_V8,
    IMPLEMENTATION,
    RECOVERY,
    SECURITY,
    WINDOW,
    LOCK,
    INITIAL_GUARDIAN,
  );

  console.log('🔮 predicted', computeCreate2Address(initCode, SALT));

  const deployed = await deployThroughProxy(client, initCode, SALT);
  console.log('🚀 deployed ', deployed);
}

if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });