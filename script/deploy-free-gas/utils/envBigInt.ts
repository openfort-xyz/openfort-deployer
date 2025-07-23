import { toHex, Hex } from "viem";

export function envBigInt(key: string): bigint {
    const v = process.env[key];
    if (!v) throw new Error(`Missing ${key} in .env`);
    return BigInt(v);
  }

export function envHex(key: string): Hex {
  const v = process.env[key];
  if (!v) throw new Error(`Missing ${key} in .env`);
  return v as Hex;
}