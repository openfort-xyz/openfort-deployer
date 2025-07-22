import type { Hex } from 'viem'
export function hasCode(code: Hex | undefined): boolean {
  if (!code) return false
  const c = code.toLowerCase()
  return c !== '0x' && c !== '0x0'
}