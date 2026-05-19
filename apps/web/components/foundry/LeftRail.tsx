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
        <Label size="m" color={F.inkMute}>Account · {accountInitial}</Label>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <Display size="m" as="span" style={{ fontSize: 30, letterSpacing: '-0.02em' }}>{balance}</Display>
          <Mono size="s" color={F.inkMute}>USDC</Mono>
        </div>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <button
            type="button"
            onClick={onTopUp}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: onTopUp ? 'pointer' : 'default',
              fontFamily: fonts.mono,
              fontSize: 10,
              letterSpacing: '0.14em',
              color: F.accent,
              textTransform: 'uppercase',
            }}
          >
            + Top Up
          </button>
          <Mono size="s" color={F.inkMute}>{walletShort ?? '—'}</Mono>
        </div>
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
        display: 'flex',
        justifyContent: 'space-between',
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
        style={{ fontSize: 15, color: F.ink }}
      >
        {folio.name}
      </Display>
      <Mono size="s" color={F.inkMute}>{folio.ago}</Mono>
    </button>
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
