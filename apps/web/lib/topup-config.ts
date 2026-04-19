import type { Address } from 'viem';

// ShipWithAI treasury — receives all x402 USDC top-ups on Base mainnet.
export const TREASURY_ADDRESS: Address = '0x9c9550871C8d714e90eE03E610B21F156381bDF1';

// USDC ERC-20 address on Base mainnet.
export const USDC_BASE_ADDRESS: Address = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

export const TOPUP_TIERS: ReadonlyArray<{ usd: number; label: string }> = [
  { usd: 10, label: '$10' },
  { usd: 25, label: '$25' },
  { usd: 50, label: '$50' },
  { usd: 100, label: '$100' },
] as const;

export const MIN_TOPUP_USD = 5;
export const MAX_TOPUP_USD = 500;

export function isValidTopUpAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount >= MIN_TOPUP_USD && amount <= MAX_TOPUP_USD;
}

// USDC has 6 decimals. Convert a raw on-chain bigint value to USD rounded to
// cents, since our ledger is denominated in dollars-and-cents.
export function usdcRawToUsd(rawValue: bigint): number {
  // Divide first as bigint to avoid the 2^53 ceiling on huge inputs, then
  // convert. For legal USDC amounts (≤ $10k) the Number() cast is precise.
  const cents = Number(rawValue / BigInt(10_000));
  return cents / 100;
}

// Cents-denominated USD, e.g. Stripe `amount_total` (integer cents) → 12.99.
export function centsToUsd(cents: number): number {
  return Math.round(cents) / 100;
}
