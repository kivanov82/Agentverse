'use client';
import * as React from 'react';
import Link from 'next/link';
import { F, fonts } from './tokens';
import { RegMark, Eye } from './marks';
import { Label } from './type';
import { Wordmark } from './Masthead';

interface TopBarProps {
  folioLabel?: string;
  centerLabel?: string;
  live?: boolean;
  onObservatory?: () => void;
}

export function TopBar({ folioLabel, centerLabel = 'Observatory', live = true, onObservatory }: TopBarProps) {
  return (
    <header
      style={{
        height: 56,
        padding: '0 24px',
        borderBottom: `1px solid ${F.hairline}`,
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        background: F.surface,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
          <RegMark size={16} strokeWidth={1.1} />
          <Wordmark size={19} />
        </Link>
        {folioLabel && (
          <>
            <div style={{ width: 1, height: 18, background: F.hairline, margin: '0 12px' }} />
            <Label size="m" color={F.ink2}>{folioLabel}</Label>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onObservatory}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'transparent',
          border: 'none',
          padding: 0,
          fontFamily: 'inherit',
          color: 'inherit',
          cursor: onObservatory ? 'pointer' : 'default',
        }}
      >
        <Eye size={14} color={F.ink2} />
        <Label size="l" color={F.ink}>{centerLabel}</Label>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
        <span
          className={live ? 'live-pulse' : ''}
          style={{ width: 7, height: 7, borderRadius: '50%', background: live ? F.signal : F.inkMute }}
        />
        <Label size="m" color={F.ink}>{live ? 'Live' : 'Idle'}</Label>
      </div>
    </header>
  );
}
