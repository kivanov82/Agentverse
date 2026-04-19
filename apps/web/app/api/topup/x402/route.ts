import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, parseAbi, parseEventLogs, type Hex } from 'viem';
import { base } from 'viem/chains';
import { getSessionUser } from '@/lib/auth-server';
import { getFirestoreStore } from '@shipwithai/core/firestore-store';
import {
  TREASURY_ADDRESS,
  USDC_BASE_ADDRESS,
  isValidTopUpAmount,
  usdcRawToUsd,
} from '@/lib/topup-config';

const ERC20_TRANSFER_ABI = parseAbi([
  'event Transfer(address indexed from, address indexed to, uint256 value)',
]);

const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL || 'https://mainnet.base.org'),
});

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'unauthenticated' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const txHash = body.txHash;
  if (typeof txHash !== 'string' || !/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
    return NextResponse.json({ success: false, error: 'invalid txHash' }, { status: 400 });
  }

  const store = getFirestoreStore();

  // x402 requires a wallet linked to the account — otherwise anyone could
  // claim credit for a stranger's deposit by spotting the txHash on-chain.
  // Google-only users should use the Stripe rail instead.
  const userRecord = await store.getUser(user.id);
  const userWallet = userRecord?.walletAddress?.toLowerCase();
  if (!userWallet) {
    return NextResponse.json(
      { success: false, error: 'Sign in with your wallet to pay in USDC.' },
      { status: 400 },
    );
  }

  // The client waits for confirmation before calling us, so this is a fast
  // lookup rather than a long wait — keeps the serverless handler under its
  // edge timeout. If the client submits too early, return 409 so the client
  // can retry without producing a new tx.
  let receipt;
  try {
    receipt = await publicClient.getTransactionReceipt({ hash: txHash as Hex });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Transaction not yet mined. Try again shortly.' },
      { status: 409 },
    );
  }

  if (receipt.status !== 'success') {
    return NextResponse.json(
      { success: false, error: 'Transaction did not succeed on-chain.' },
      { status: 400 },
    );
  }

  const transfers = parseEventLogs({
    abi: ERC20_TRANSFER_ABI,
    eventName: 'Transfer',
    logs: receipt.logs,
  });
  const match = transfers.find(
    (t) =>
      t.address.toLowerCase() === USDC_BASE_ADDRESS.toLowerCase() &&
      t.args.to.toLowerCase() === TREASURY_ADDRESS.toLowerCase(),
  );
  if (!match) {
    return NextResponse.json(
      { success: false, error: 'No USDC transfer to the ShipWithAI treasury in this transaction.' },
      { status: 400 },
    );
  }

  if (match.args.from.toLowerCase() !== userWallet) {
    return NextResponse.json(
      { success: false, error: 'Transaction sender does not match the wallet on your account.' },
      { status: 403 },
    );
  }

  // Derive amount from the on-chain log — never trust a client-supplied value.
  const amountUsd = usdcRawToUsd(match.args.value);
  if (!isValidTopUpAmount(amountUsd)) {
    return NextResponse.json(
      { success: false, error: `Amount $${amountUsd.toFixed(2)} is outside the allowed range.` },
      { status: 400 },
    );
  }

  const externalRef = `x402_${txHash}`;
  const externalUrl = `https://basescan.org/tx/${txHash}`;
  const result = await store.creditTopUp(user.id, amountUsd, 'x402', externalRef, externalUrl);

  return NextResponse.json({
    success: true,
    balance: result.balance,
    applied: result.applied,
    amountUsd,
  });
}
