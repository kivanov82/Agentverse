'use client';
import * as React from 'react';
import { F, fonts } from './tokens';
import { RegMark } from './marks';
import { Wordmark } from './Wordmark';

export interface LandingTopBarNavItem {
  label: string;
  onClick: () => void;
}

interface LandingTopBarProps {
  nav?: LandingTopBarNavItem[];
  isAuthenticated?: boolean;
  authLabel?: string;
  onAuth?: () => void;
}

export function LandingTopBar({
  nav = [],
  isAuthenticated = false,
  authLabel,
  onAuth,
}: LandingTopBarProps) {
  return (
    <header
      style={{
        height: 56,
        padding: '0 40px',
        borderBottom: `1px solid ${F.hairline}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: F.surface,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <RegMark size={16} strokeWidth={1.1} />
        <Wordmark />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {nav.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              fontFamily: fonts.ui,
              fontSize: 14,
              color: F.ink2,
              cursor: 'pointer',
              transition: 'color 120ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = F.ink; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = F.ink2; }}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onAuth}
          style={{
            padding: '9px 18px',
            background: F.ink,
            color: F.surface,
            border: 'none',
            borderRadius: 0,
            fontFamily: fonts.ui,
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.02em',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            transition: 'opacity 120ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.92'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          {authLabel ?? (isAuthenticated ? 'Open workspace' : 'Sign in')}
          <span aria-hidden="true" style={{ fontSize: 14 }}>→</span>
        </button>
      </div>
    </header>
  );
}
