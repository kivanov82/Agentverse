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
  awaitingReply?: boolean;
}

interface LeftRailProps {
  accountInitial: string;
  balanceUSDC: number | string;
  onTopUp?: () => void;
  onAccount?: () => void;
  accountLabel?: string;
  folios: FolioEntry[];
  onSelectFolio: (id: string) => void;
  onNewFolio?: () => void;
  onSettings?: () => void;
}

export function LeftRail({
  accountInitial,
  balanceUSDC,
  onTopUp,
  onAccount,
  accountLabel,
  folios,
  onSelectFolio,
  onNewFolio,
  onSettings,
}: LeftRailProps) {
  const balance = typeof balanceUSDC === 'number' ? `$${balanceUSDC.toFixed(2)}` : balanceUSDC;
  return (
    <aside
      style={{
        borderRight: `1px solid ${F.hairline}`,
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
        background: F.surface,
        overflow: 'auto',
        minHeight: 0,
      }}
    >
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
            color: F.inkMute,
          }}
        >
          {accountLabel ?? `Account · ${accountInitial}`}
        </button>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <Display size="m" as="span" style={{ fontSize: 28, letterSpacing: '-0.02em' }}>{balance}</Display>
          <Mono size="s" color={F.inkMute}>USDC</Mono>
        </div>
        <button
          type="button"
          onClick={onTopUp}
          disabled={!onTopUp}
          style={{
            marginTop: 10,
            width: '100%',
            padding: '9px 12px',
            background: F.ink,
            color: F.surface,
            border: `1px solid ${F.ink}`,
            borderRadius: 0,
            fontFamily: fonts.ui,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            cursor: onTopUp ? 'pointer' : 'not-allowed',
            opacity: onTopUp ? 1 : 0.5,
            transition: 'opacity 120ms ease',
          }}
        >
          + Top up
        </button>
      </div>

      <Rule color="hairline-faint" />

      {/* Folios */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
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

      {/* Bottom — Settings link */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: 16,
          borderTop: `1px solid ${F.hairlineFaint}`,
        }}
      >
        <button
          type="button"
          onClick={onSettings}
          disabled={!onSettings}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '8px 12px',
            margin: '0 -12px',
            background: 'transparent',
            border: 'none',
            borderRadius: 0,
            fontFamily: fonts.ui,
            fontSize: 13,
            color: F.ink2,
            cursor: onSettings ? 'pointer' : 'default',
            transition: 'background-color 120ms ease',
          }}
          onMouseEnter={(e) => { if (onSettings) e.currentTarget.style.background = F.hover; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span>Settings</span>
          <span aria-hidden="true" style={{ fontSize: 14, color: F.inkMute }}>→</span>
        </button>
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
        padding: '8px 12px',
        margin: '0 -12px',
        background: folio.active ? F.hover : 'transparent',
        borderLeft: folio.active ? `2px solid ${F.accent}` : '2px solid transparent',
        borderTop: 'none', borderRight: 'none', borderBottom: 'none', borderRadius: 0,
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        gap: 8,
        alignItems: 'center',
        cursor: 'pointer',
        width: 'calc(100% + 24px)',
        textAlign: 'left',
        fontFamily: fonts.ui,
        fontSize: 13,
        fontWeight: folio.active ? 500 : 400,
        color: folio.active ? F.ink : F.ink2,
        transition: 'background-color 120ms ease',
      }}
    >
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {folio.name}
      </span>
      {folio.awaitingReply ? (
        <span
          aria-label="awaiting your reply"
          className="live-pulse"
          style={{
            width: 6, height: 6, borderRadius: '50%',
            background: F.accent,
          }}
        />
      ) : (
        <span />
      )}
      <Mono size="s" color={F.inkMute}>{folio.ago}</Mono>
    </button>
  );
}
