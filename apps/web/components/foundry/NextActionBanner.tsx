'use client';
import * as React from 'react';
import { F, fonts } from './tokens';

interface NextActionBannerProps {
  description: string;
  ctaLabel?: string;
  onCta?: () => void;
}

/** SPEC v3 §D.3 — one short sentence + small CTA. Hidden when no pending action. */
export function NextActionBanner({
  description,
  ctaLabel = 'Reply',
  onCta,
}: NextActionBannerProps) {
  return (
    <div
      role="status"
      style={{
        height: 56,
        padding: '0 48px',
        background: F.accentSoft,
        borderBottom: `1px solid ${F.accent}`,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flexShrink: 0,
      }}
    >
      <span
        aria-hidden="true"
        className="live-pulse"
        style={{
          width: 8, height: 8, borderRadius: '50%',
          background: F.accent, flexShrink: 0,
        }}
      />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          fontFamily: fonts.display,
          fontSize: 15,
          color: F.ink,
          lineHeight: 1.3,
          textWrap: 'pretty' as any,
        }}
      >
        {description}
      </div>
      {ctaLabel && onCta && (
        <button
          type="button"
          onClick={onCta}
          style={{
            padding: '7px 14px',
            background: F.accent,
            color: F.surface,
            border: `1px solid ${F.accent}`,
            borderRadius: 0,
            fontFamily: fonts.ui,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
            transition: 'opacity 120ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.92'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          {ctaLabel}
          <span aria-hidden="true" style={{ fontSize: 13 }}>↓</span>
        </button>
      )}
    </div>
  );
}
