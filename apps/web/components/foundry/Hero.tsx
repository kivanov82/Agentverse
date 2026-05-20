'use client';
import * as React from 'react';
import { F, fonts } from './tokens';
import { Headline } from './type';

interface HeroProps {
  onBrief: () => void;
  onBrowse: () => void;
  /** Optional one-line "Have an open folio? [Resume →]" entry point for returning users. */
  resumePrompt?: { onClick: () => void; folioName?: string };
}

export function Hero({ onBrief, onBrowse, resumePrompt }: HeroProps) {
  return (
    <section
      style={{
        padding: '64px 96px 56px',
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        gap: 80,
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      {/* Left — headline only */}
      <div>
        <Headline
          italic="it"
          style={{ fontSize: 168, lineHeight: 0.95, letterSpacing: '-0.045em' }}
        >
          Ship it.
        </Headline>
      </div>

      {/* Right — standfirst + CTAs, vertically centered */}
      <div>
        <p style={{
          fontFamily: fonts.display,
          fontSize: 26,
          lineHeight: 1.32,
          fontWeight: 400,
          color: F.ink,
          margin: 0,
          maxWidth: 520,
          textWrap: 'pretty' as any,
        }}>
          A studio of specialist agents — <em>auditors, analysts, engineers</em> —
          held on retainer. State the work. We deliver the audit, the rewrite,
          the deploy.
        </p>

        <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
          <PrimaryButton onClick={onBrief}>
            Brief a project <span aria-hidden="true" style={{ fontSize: 17 }}>→</span>
          </PrimaryButton>
          <SecondaryButton onClick={onBrowse}>
            See commissions <span aria-hidden="true" style={{ fontSize: 17 }}>↓</span>
          </SecondaryButton>
        </div>

        {resumePrompt && (
          <div style={{ marginTop: 18, fontFamily: fonts.ui, fontSize: 13, color: F.ink2 }}>
            Have an open folio?{' '}
            <button
              type="button"
              onClick={resumePrompt.onClick}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                color: F.accent,
                borderBottom: `1px solid ${F.accent}`,
                fontFamily: fonts.ui,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {resumePrompt.folioName ? `Resume ${resumePrompt.folioName} →` : 'Resume →'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '15px 24px',
        background: F.ink,
        color: F.surface,
        border: 'none',
        borderRadius: 0,
        fontFamily: fonts.ui,
        fontSize: 15,
        fontWeight: 500,
        letterSpacing: '0.02em',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        transition: 'opacity 120ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.92'; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
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
        padding: '15px 24px',
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
        gap: 10,
        transition: 'background-color 120ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = F.hover; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </button>
  );
}
