import type { Wallet } from './wallet';
import { concatHex, type Hex } from 'viem';
import { computeCreate2Address } from './create2';
import { CREATE2_PROXY } from './data/addresses';

export async function deployThroughProxy(
  client: Wallet,
  initCode: Hex,
  salt: Hex,
  value: bigint = 0n,
): Promise<Hex> {
  const predicted = computeCreate2Address(initCode, salt);

  await client.sendTransaction({
    account: client.account,
    to: CREATE2_PROXY,
    data: concatHex([salt, initCode]),
    value,
  });

  /* wait until byte-code appears */
  for (let i = 0; i < 12; i++) {
    const code = await client.getBytecode({ address: predicted });
    if (code !== '0x') return predicted;
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error('deployment produced empty byte-code');
}