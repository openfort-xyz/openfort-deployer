import 'dotenv/config';
import { http, createClient } from 'viem';
import type { ChainConfig } from '../utils/chains';

export function pimlicoSlugFromChain(c: ChainConfig): string {
  return c.name.toLowerCase().replace(/\s+/g, '-');
}

export function pimlicoBundlerUrl(c: ChainConfig): string {
  const apiKey = process.env.PIMLICO_API;
  const slug = pimlicoSlugFromChain(c);
  return apiKey
    ? `https://api.pimlico.io/v2/${slug}/rpc?apikey=${apiKey}`
    : `https://api.pimlico.io/v2/${slug}/rpc`;
}

export function getPimlicoBundlerClient(c: ChainConfig) {
  return createClient({
    transport: http(pimlicoBundlerUrl(c)),
  });
}