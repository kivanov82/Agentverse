'use client';
import * as React from 'react';
import { F, fonts } from './tokens';

interface NextActionBannerProps {
  /** Eyebrow line — small caps, accent. */
  eyebrow?: string;
  /** Plain-English instruction. */
  description: string;
  /** Button label (omit to hide the CTA). */
  ctaLabel?: string;
  onCta?: () => void;
}

export function NextActionBanner({
  eyebrow = 'Next — awaiting your reply',
  description,
  ctaLabel = 'Jump to reply',
  onCta,
}: NextActionBannerProps) {
  return (
    <div
      role="status"
      style={{
        padding: '12px 56px',
        background: F.accentSoft,
        borderBottom: `1px solid ${F.accent}`,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
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
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: fonts.ui, fontSize: 10, fontWeight: 600,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: F.accent,
        }}>
          {eyebrow}
        </div>
        <div style={{
          fontFamily: fonts.display, fontSize: 15,
          color: F.ink, lineHeight: 1.4, marginTop: 2,
        }}>
          {description}
        </div>
      </div>
      {ctaLabel && onCta && (
        <button
          type="button"
          onClick={onCta}
          style={{
            padding: '10px 16px',
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
            gap: 10,
            flexShrink: 0,
            transition: 'opacity 120ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.92'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
        >
          {ctaLabel}
          <span aria-hidden="true" style={{ fontSize: 14 }}>↓</span>
        </button>
      )}
    </div>
  );
}
