'use client';

import { useAccount, useBalance, useReadContract, useWriteContract } from 'wagmi';
import { parseUnits, type Address } from 'viem';
import { USDC_BASE_ADDRESS } from './topup-config';

export const USDC_ADDRESS: Record<number, Address> = {
  8453: USDC_BASE_ADDRESS,
};

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;

export function useWallet() {
  const { address, isConnected, chain } = useAccount();
  const { data: ethBalance } = useBalance({ address });

  const usdcAddress = chain?.id ? USDC_ADDRESS[chain.id] : undefined;

  const { data: usdcRaw } = useReadContract({
    address: usdcAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!usdcAddress },
  });

  const usdcBalance = usdcRaw !== undefined
    ? Number(usdcRaw) / 1e6
    : undefined;

  return {
    address,
    isConnected,
    chain,
    ethBalance: ethBalance?.formatted,
    usdcBalance,
    usdcAddress,
  };
}

/**
 * Submits a USDC transfer on the user's connected chain. Returns the tx hash
 * as soon as the wallet accepts the signed transaction — the caller is
 * expected to wait for confirmation separately (e.g. via a publicClient).
 */
export function useUsdcTransfer() {
  const { chain } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const transfer = async (to: Address, amount: string): Promise<`0x${string}`> => {
    const usdcAddress = chain?.id ? USDC_ADDRESS[chain.id] : undefined;
    if (!usdcAddress) throw new Error('USDC not available on this chain');

    const amountInUnits = parseUnits(amount, 6); // USDC has 6 decimals

    return writeContractAsync({
      address: usdcAddress,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [to, amountInUnits],
    });
  };

  return { transfer };
}
