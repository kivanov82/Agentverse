'use client';
import * as React from 'react';
import { F, fonts } from './tokens';
import { Label, Mono, Display } from './type';
import { Rule } from './Rule';

export interface FolioEntry {
  id: string;
  name: string;
  ago: string;
  active: boolean;
  /** Surface a vermilion urgency dot when this folio is awaiting user input. */
  awaitingReply?: boolean;
}

export interface WorkshopItem {
  id: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

interface LeftRailProps {
  accountInitial: string;
  balanceUSDC: number | string;
  walletShort?: string;
  onTopUp?: () => void;
  onAccount?: () => void;
  accountLabel?: string;
  folios: FolioEntry[];
  onSelectFolio: (id: string) => void;
  onNewFolio?: () => void;
  workshop: WorkshopItem[];
}

export function LeftRail({
  accountInitial,
  balanceUSDC,
  walletShort,
  onTopUp,
  onAccount,
  accountLabel,
  folios,
  onSelectFolio,
  onNewFolio,
  workshop,
}: LeftRailProps) {
  const balance = typeof balanceUSDC === 'number' ? `$${balanceUSDC.toFixed(2)}` : balanceUSDC;
  return (
    <aside style={{
      borderRight: `1px solid ${F.hairline}`,
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 28,
      background: F.surface,
      overflow: 'auto',
    }}>
      {/* Account */}
      <div>
        <button
          type="button"
          onClick={onAccount}
          disabled={!onAccount}
          style={{
            background: 'transparent', border: 'none', padding: 0,
            cursor: onAccount ? 'pointer' : 'default',
            fontFamily: fonts.ui, fontSize: 10, fontWeight: 500,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: F.inkMute, display: 'inline-flex', alignItems: 'baseline', gap: 6,
          }}
        >
          {accountLabel ?? `Account · ${accountInitial}`}
        </button>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <Display size="m" as="span" style={{ fontSize: 30, letterSpacing: '-0.02em' }}>{balance}</Display>
          <Mono size="s" color={F.inkMute}>USDC</Mono>
        </div>
        <AccountActions
          onTopUp={onTopUp}
          walletShort={walletShort}
        />
      </div>

      <Rule color="hairline-faint" />

      {/* Folios */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <Label size="m" color={F.inkMute}>Folios</Label>
          <button
            type="button"
            onClick={onNewFolio}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: onNewFolio ? 'pointer' : 'default',
              fontFamily: fonts.ui,
              fontSize: 15,
              lineHeight: 1,
              color: F.inkMute,
            }}
            aria-label="New folio"
          >+</button>
        </div>
        {folios.length === 0 && (
          <Mono size="s" color={F.inkMute}>No folios yet</Mono>
        )}
        {folios.map((p) => (
          <FolioListRow key={p.id} folio={p} onClick={() => onSelectFolio(p.id)} />
        ))}
      </div>

      <Rule color="hairline-faint" />

      {/* Workshop */}
      <div>
        <Label size="m" color={F.inkMute}>Workshop</Label>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {workshop.map((it) => (
            <WorkshopRow key={it.id} item={it} />
          ))}
        </div>
      </div>
    </aside>
  );
}

function FolioListRow({ folio, onClick }: { folio: FolioEntry; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '10px 12px',
        margin: '0 -12px',
        background: folio.active ? F.hover : 'transparent',
        borderLeft: folio.active ? `2px solid ${F.accent}` : '2px solid transparent',
        borderTop: 'none', borderRight: 'none', borderBottom: 'none', borderRadius: 0,
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        gap: 8,
        alignItems: 'baseline',
        cursor: 'pointer',
        width: 'calc(100% + 24px)',
        textAlign: 'left',
        fontFamily: 'inherit',
        color: 'inherit',
        transition: 'background-color 120ms ease',
      }}
    >
      <Display
        size="meta-m"
        as="span"
        italic={!folio.active}
        style={{ fontSize: 15, color: F.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {folio.name}
      </Display>
      {folio.awaitingReply ? (
        <span
          aria-label="awaiting your reply"
          className="live-pulse"
          style={{
            width: 6, height: 6, borderRadius: '50%',
            background: F.accent, alignSelf: 'center',
          }}
        />
      ) : (
        <span />
      )}
      <Mono size="s" color={F.inkMute}>{folio.ago}</Mono>
    </button>
  );
}

function AccountActions({
  onTopUp,
  walletShort,
}: {
  onTopUp?: () => void;
  walletShort?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const onCopyWallet = async () => {
    if (!walletShort) return;
    try {
      await navigator.clipboard?.writeText?.(walletShort);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch { /* ignore */ }
  };

  return (
    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
      <button
        type="button"
        onClick={onTopUp}
        disabled={!onTopUp}
        style={{
          flex: 1,
          padding: '8px 10px',
          background: F.ink,
          color: F.surface,
          border: `1px solid ${F.ink}`,
          borderRadius: 0,
          fontFamily: fonts.ui,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          cursor: onTopUp ? 'pointer' : 'not-allowed',
          opacity: onTopUp ? 1 : 0.5,
          transition: 'opacity 120ms ease',
        }}
      >
        + Top up
      </button>
      <button
        type="button"
        onClick={onCopyWallet}
        disabled={!walletShort}
        title={walletShort ? (copied ? 'Copied' : 'Copy address') : undefined}
        style={{
          padding: '8px 10px',
          background: 'transparent',
          color: F.ink2,
          border: `1px solid ${F.hairline}`,
          borderRadius: 0,
          fontFamily: fonts.mono,
          fontSize: 10,
          letterSpacing: '0.08em',
          cursor: walletShort ? 'pointer' : 'default',
          transition: 'background-color 120ms ease, border-color 120ms ease',
        }}
        onMouseEnter={(e) => { if (walletShort) e.currentTarget.style.background = F.hover; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        {copied ? 'COPIED' : (walletShort ?? '—')}
      </button>
    </div>
  );
}

function WorkshopRow({ item }: { item: WorkshopItem }) {
  return (
    <button
      type="button"
      onClick={item.onClick}
      style={{
        padding: '8px 12px',
        margin: '0 -12px',
        background: item.active ? F.hover : 'transparent',
        borderLeft: item.active ? `2px solid ${F.accent}` : '2px solid transparent',
        borderTop: 'none', borderRight: 'none', borderBottom: 'none', borderRadius: 0,
        fontFamily: fonts.ui,
        fontSize: 13,
        color: item.active ? F.ink : F.ink2,
        fontWeight: item.active ? 500 : 400,
        cursor: 'pointer',
        textAlign: 'left',
        width: 'calc(100% + 24px)',
        transition: 'background-color 120ms ease',
      }}
    >
      {item.label}
    </button>
  );
}
