import * as React from 'react';
import { F } from './tokens';

// Inline SVG marks — SPEC §5. No icon library.

interface SVGProps { size?: number; color?: string }

export function RegMark({ size = 18, color = F.ink, strokeWidth = 1.1 }: SVGProps & { strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true" style={{ display: 'inline-block' }}>
      <circle cx="9" cy="9" r="5.5" fill="none" stroke={color} strokeWidth={strokeWidth} />
      <line x1="9" y1="0" x2="9" y2="18" stroke={color} strokeWidth={strokeWidth} />
      <line x1="0" y1="9" x2="18" y2="9" stroke={color} strokeWidth={strokeWidth} />
    </svg>
  );
}

export function Asterism({ size = 14, color = F.accent }: SVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <circle cx="7" cy="3.5" r="1" fill={color} />
      <circle cx="3.5" cy="10" r="1" fill={color} />
      <circle cx="10.5" cy="10" r="1" fill={color} />
    </svg>
  );
}

export function Eye({ size = 14, color = F.ink }: SVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true" style={{ display: 'inline-block' }}>
      <circle cx="7" cy="7" r="3" fill="none" stroke={color} strokeWidth="1.2" />
      <circle cx="7" cy="7" r="1" fill={color} />
    </svg>
  );
}

export function Check({ size = 9, color = F.surface }: SVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 9 9" aria-hidden="true">
      <path d="M1 4.5L3.5 7L8 1.5" stroke={color} strokeWidth="1.5" fill="none" />
    </svg>
  );
}

export function SendArrow({ size = 14, color = F.surface }: SVGProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 7h10M8 3l4 4-4 4" stroke={color} strokeWidth="1.4" strokeLinecap="square" />
    </svg>
  );
}
