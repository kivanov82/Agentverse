'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { X, CreditCard, Wallet, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { useUsdcTransfer } from '@/lib/use-wallet';
import {
  TOPUP_TIERS,
  TREASURY_ADDRESS,
  MIN_TOPUP_USD,
  MAX_TOPUP_USD,
  isValidTopUpAmount,
} from '@/lib/topup-config';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Tab = 'card' | 'usdc';

// Client-side Base mainnet client — used to wait for tx confirmation before
// asking the server to verify. Keeps the server-side handler fast.
const basePublicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});

export function TopUpModal({ open, onClose, onSuccess }: Props) {
  const [tab, setTab] = useState<Tab>('card');
  const [amount, setAmount] = useState<number>(25);
  const [custom, setCustom] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isConnected } = useAccount();
  const { transfer } = useUsdcTransfer();

  if (!open) return null;

  const activeAmount = custom ? Number(custom) : amount;
  const amountValid = isValidTopUpAmount(activeAmount);

  const reset = () => {
    setBusy(false);
    setBusyLabel(null);
    setError(null);
  };

  const handleClose = () => {
    if (busy) return;
    reset();
    onClose();
  };

  const payWithCard = async () => {
    if (!amountValid) return;
    setBusy(true);
    setError(null);
    setBusyLabel('Redirecting to Stripe…');
    try {
      const res = await fetch('/api/topup/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountUsd: activeAmount }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        throw new Error(json.error || 'Could not start checkout');
      }
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setBusy(false);
      setBusyLabel(null);
    }
  };

  const payWithUsdc = async () => {
    if (!amountValid) return;
    setBusy(true);
    setError(null);
    setBusyLabel('Confirm in your wallet…');
    let txHash: `0x${string}` | undefined;
    try {
      txHash = await transfer(TREASURY_ADDRESS, String(activeAmount));

      setBusyLabel('Confirming on Base…');
      await basePublicClient.waitForTransactionReceipt({
        hash: txHash,
        timeout: 120_000,
        confirmations: 1,
      });

      setBusyLabel('Crediting your balance…');
      const res = await fetch('/api/topup/x402', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Verification failed');
      }

      setBusy(false);
      setBusyLabel(null);
      onSuccess?.();
      onClose();
    } catch (err) {
      const base = err instanceof Error ? err.message : 'Payment failed';
      const withTx = txHash ? `${base} (tx: ${txHash.slice(0, 10)}…)` : base;
      setError(withTx);
      setBusy(false);
      setBusyLabel(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#0c0c0f] p-6 shadow-xl">
        <button
          onClick={handleClose}
          disabled={busy}
          className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-300 disabled:opacity-40"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-base font-semibold text-white">Top up credits</h2>
        <p className="mt-1 text-xs text-zinc-400">
          Credits power every agent run. No subscription, pay as you go.
        </p>

        {/* Tabs */}
        <div className="mt-4 flex rounded-lg bg-zinc-900 p-1 text-xs">
          <button
            onClick={() => { setTab('card'); setError(null); }}
            disabled={busy}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-colors ${
              tab === 'card' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" /> Card
          </button>
          <button
            onClick={() => { setTab('usdc'); setError(null); }}
            disabled={busy}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-colors ${
              tab === 'usdc' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" /> USDC
          </button>
        </div>

        {/* Amount picker (shared) */}
        <div className="mt-4">
          <div className="grid grid-cols-4 gap-1.5">
            {TOPUP_TIERS.map((t) => (
              <button
                key={t.usd}
                onClick={() => { setAmount(t.usd); setCustom(''); }}
                disabled={busy}
                className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                  !custom && amount === t.usd
                    ? 'border-brand-500/60 bg-brand-500/10 text-brand-300'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="mt-2 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">$</span>
            <input
              type="number"
              min={MIN_TOPUP_USD}
              max={MAX_TOPUP_USD}
              step="1"
              placeholder={`Custom (${MIN_TOPUP_USD}–${MAX_TOPUP_USD})`}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              disabled={busy}
              className="w-full pl-6 pr-3 py-2 text-xs rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
            />
          </div>
        </div>

        {/* Tab bodies */}
        <div className="mt-4">
          {tab === 'card' ? (
            <button
              onClick={payWithCard}
              disabled={busy || !amountValid}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-zinc-900 text-sm font-semibold py-2.5 hover:bg-zinc-100 transition-colors disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              {busy ? (busyLabel ?? 'Processing…') : `Pay $${amountValid ? activeAmount.toFixed(2) : '—'} with card`}
            </button>
          ) : !isConnected ? (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 text-sm font-medium py-2.5 hover:border-zinc-600 transition-colors"
                >
                  <Wallet className="w-4 h-4" />
                  Connect wallet to pay with USDC
                </button>
              )}
            </ConnectButton.Custom>
          ) : (
            <button
              onClick={payWithUsdc}
              disabled={busy || !amountValid}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-semibold py-2.5 hover:bg-brand-500/15 transition-colors disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wallet className="w-4 h-4" />
              )}
              {busy ? (busyLabel ?? 'Processing…') : `Pay $${amountValid ? activeAmount.toFixed(2) : '—'} in USDC`}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 p-2.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-300 leading-relaxed">{error}</p>
          </div>
        )}

        {tab === 'usdc' && !busy && !error && (
          <p className="mt-3 text-[10px] text-zinc-500 leading-relaxed">
            USDC on Base. Sent to{' '}
            <a
              href={`https://basescan.org/address/${TREASURY_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-zinc-200 underline-offset-2 hover:underline inline-flex items-center gap-0.5"
            >
              ShipWithAI treasury <ExternalLink className="w-2.5 h-2.5" />
            </a>
            . Credits apply automatically once the transaction confirms.
          </p>
        )}
      </div>
    </div>
  );
}
