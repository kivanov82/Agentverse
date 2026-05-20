'use client';
import * as React from 'react';
import { F, fonts } from './tokens';
import { Label } from './type';

export interface HowItWorksStep {
  numeral: string;
  name: string;
  body: string;
}

export const DEFAULT_STEPS: HowItWorksStep[] = [
  { numeral: 'I',   name: 'Brief',      body: 'Tell the studio what you need, in plain language.' },
  { numeral: 'II',  name: 'Commission', body: 'Top up your account. Agents go to work.' },
  { numeral: 'III', name: 'Receive',    body: 'Audit, rewrite, or deploy — delivered to your inbox.' },
];

interface HowItWorksProps {
  steps?: HowItWorksStep[];
  onPrimary: () => void;
  onBrowse: () => void;
  primaryLabel?: string;
  secondaryLabel?: string;
}

export function HowItWorks({
  steps = DEFAULT_STEPS,
  onPrimary,
  onBrowse,
  primaryLabel = 'Brief a new project',
  secondaryLabel = 'Browse commissions',
}: HowItWorksProps) {
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <Label size="l" color={F.ink}>How a commission works</Label>
      </div>

      <div style={{ border: `1px solid ${F.hairline}` }}>
        {steps.map((s, i) => (
          <div
            key={s.numeral}
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr',
              padding: '12px 16px',
              borderTop: i === 0 ? 'none' : `1px solid ${F.hairlineFaint}`,
              alignItems: 'baseline',
              gap: 12,
            }}
          >
            <span style={{
              fontFamily: fonts.display,
              fontStyle: 'italic',
              fontSize: 16,
              fontWeight: 400,
              color: F.accent,
            }}>
              {s.numeral}.
            </span>
            <div>
              <div style={{
                fontFamily: fonts.display,
                fontSize: 17,
                color: F.ink,
                letterSpacing: '-0.005em',
                marginBottom: 2,
              }}>
                {s.name}
              </div>
              <div style={{
                fontFamily: fonts.ui,
                fontSize: 13,
                lineHeight: 1.5,
                color: F.ink2,
                textWrap: 'pretty' as any,
              }}>
                {s.body}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <ButtonPrimary onClick={onPrimary}>
          {primaryLabel} <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
        </ButtonPrimary>
        <ButtonSecondary onClick={onBrowse}>
          {secondaryLabel} <span style={{ fontSize: 18, lineHeight: 1 }}>↓</span>
        </ButtonSecondary>
      </div>
    </div>
  );
}

function ButtonPrimary({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: '16px 24px',
        background: F.ink,
        color: F.surface,
        border: `1px solid ${F.ink}`,
        borderRadius: 0,
        fontFamily: fonts.ui,
        fontSize: 15,
        fontWeight: 500,
        letterSpacing: '0.02em',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        transition: 'opacity 120ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.92'; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
    >
      {children}
    </button>
  );
}

function ButtonSecondary({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: '16px 24px',
        background: 'transparent',
        color: F.ink,
        border: `1px solid ${F.ink}`,
        borderRadius: 0,
        fontFamily: fonts.ui,
        fontSize: 15,
        fontWeight: 500,
        letterSpacing: '0.02em',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        transition: 'background-color 120ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = F.hover; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </button>
  );
}
