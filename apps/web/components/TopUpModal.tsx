'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { useUsdcTransfer } from '@/lib/use-wallet';
import {
  TOPUP_TIERS,
  TREASURY_ADDRESS,
  MIN_TOPUP_USD,
  MAX_TOPUP_USD,
  isValidTopUpAmount,
} from '@/lib/topup-config';
import { F, fonts, Display, Label, Mono } from './foundry';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Tab = 'card' | 'usdc';

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

  const handleClose = () => {
    if (busy) return;
    setError(null);
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
      if (!res.ok || !json.url) throw new Error(json.error || 'Could not start checkout');
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
      await basePublicClient.waitForTransactionReceipt({ hash: txHash, timeout: 120_000, confirmations: 1 });
      setBusyLabel('Crediting your balance…');
      const res = await fetch('/api/topup/x402', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Verification failed');
      setBusy(false);
      setBusyLabel(null);
      onSuccess?.();
      onClose();
    } catch (err) {
      const baseMsg = err instanceof Error ? err.message : 'Payment failed';
      setError(txHash ? `${baseMsg} (tx: ${txHash.slice(0, 10)}…)` : baseMsg);
      setBusy(false);
      setBusyLabel(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(26, 22, 18, 0.40)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 440,
          background: F.surface,
          border: `1px solid ${F.hairline}`,
          padding: 28,
          position: 'relative',
        }}
      >
        <button
          onClick={handleClose}
          disabled={busy}
          aria-label="Close"
          style={{
            position: 'absolute', top: 14, right: 14,
            background: 'transparent', border: 'none', padding: 4,
            fontFamily: fonts.mono, fontSize: 14, color: F.inkMute,
            cursor: busy ? 'not-allowed' : 'pointer',
            opacity: busy ? 0.4 : 1,
          }}
        >×</button>

        <Mono size="s" color={F.accent} uppercase>The Ledger</Mono>
        <div style={{ marginTop: 8 }}>
          <Display size="xs" as="h2" style={{ fontSize: 28 }}>Top up.</Display>
        </div>
        <p style={{ marginTop: 8, fontFamily: fonts.ui, fontSize: 13, color: F.ink2 }}>
          Credits power every agent run. No subscription, pay as you go.
        </p>

        {/* Tabs — flat hairline */}
        <div style={{ marginTop: 18, display: 'flex', borderTop: `1px solid ${F.hairline}`, borderBottom: `1px solid ${F.hairline}` }}>
          {(['card', 'usdc'] as const).map((t, i) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); }}
              disabled={busy}
              style={{
                flex: 1, padding: '10px 0',
                background: tab === t ? F.hover : 'transparent',
                color: tab === t ? F.ink : F.ink2,
                fontFamily: fonts.ui, fontSize: 13, fontWeight: tab === t ? 500 : 400,
                border: 'none',
                borderRight: i === 0 ? `1px solid ${F.hairlineFaint}` : 'none',
                cursor: busy ? 'not-allowed' : 'pointer',
                transition: 'background-color 120ms ease',
              }}
            >
              {t === 'card' ? 'Card' : 'USDC'}
            </button>
          ))}
        </div>

        {/* Amount picker */}
        <div style={{ marginTop: 18 }}>
          <Label size="m" color={F.inkMute}>Amount</Label>
          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
            {TOPUP_TIERS.map((t) => {
              const selected = !custom && amount === t.usd;
              return (
                <button
                  key={t.usd}
                  onClick={() => { setAmount(t.usd); setCustom(''); }}
                  disabled={busy}
                  style={{
                    padding: '10px 0',
                    background: selected ? F.ink : F.surface,
                    color: selected ? F.surface : F.ink,
                    border: `1px solid ${selected ? F.ink : F.hairline}`,
                    fontFamily: fonts.ui, fontSize: 13, fontWeight: 500,
                    cursor: busy ? 'not-allowed' : 'pointer',
                    transition: 'background-color 120ms ease',
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 8, position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              fontFamily: fonts.mono, fontSize: 12, color: F.inkMute,
            }}>$</span>
            <input
              type="number"
              min={MIN_TOPUP_USD}
              max={MAX_TOPUP_USD}
              step="1"
              placeholder={`Custom (${MIN_TOPUP_USD}–${MAX_TOPUP_USD})`}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              disabled={busy}
              style={{
                width: '100%', padding: '10px 12px 10px 22px',
                background: F.surface, color: F.ink,
                border: `1px solid ${F.hairline}`, borderRadius: 0,
                fontFamily: fonts.ui, fontSize: 13, outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          {tab === 'card' ? (
            <PrimaryButton onClick={payWithCard} disabled={busy || !amountValid}>
              {busy ? (busyLabel ?? 'Processing…') : `Pay $${amountValid ? activeAmount.toFixed(2) : '—'} with card`}
            </PrimaryButton>
          ) : !isConnected ? (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <SecondaryButton onClick={openConnectModal}>Connect wallet to pay with USDC</SecondaryButton>
              )}
            </ConnectButton.Custom>
          ) : (
            <PrimaryButton onClick={payWithUsdc} disabled={busy || !amountValid}>
              {busy ? (busyLabel ?? 'Processing…') : `Pay $${amountValid ? activeAmount.toFixed(2) : '—'} in USDC`}
            </PrimaryButton>
          )}
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: 10, borderLeft: `2px solid ${F.accent}`, background: F.accentSoft }}>
            <Mono size="s" color={F.accent}>Error</Mono>
            <p style={{ marginTop: 4, fontFamily: fonts.ui, fontSize: 12, color: F.ink, lineHeight: 1.5 }}>{error}</p>
          </div>
        )}

        {tab === 'usdc' && !busy && !error && (
          <p style={{ marginTop: 12, fontFamily: fonts.ui, fontSize: 11, color: F.inkMute, lineHeight: 1.6 }}>
            USDC on Base. Sent to{' '}
            <a
              href={`https://basescan.org/address/${TREASURY_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: F.accent, borderBottom: `1px solid ${F.accent}`, textDecoration: 'none' }}
            >
              ShipWithAI treasury
            </a>
            . Credits apply automatically once the transaction confirms.
          </p>
        )}
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '12px 16px',
        background: F.ink, color: F.surface,
        fontFamily: fonts.ui, fontSize: 14, fontWeight: 500, letterSpacing: '0.02em',
        border: 'none', borderRadius: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'opacity 120ms ease',
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%', padding: '12px 16px',
        background: F.surface, color: F.ink,
        fontFamily: fonts.ui, fontSize: 14, fontWeight: 500, letterSpacing: '0.02em',
        border: `1px solid ${F.ink}`, borderRadius: 0, cursor: 'pointer',
        transition: 'background-color 120ms ease',
      }}
    >
      {children}
    </button>
  );
}
