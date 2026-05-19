'use client';
import * as React from 'react';
import { F, fonts } from './tokens';
import { Asterism } from './marks';
import { Label, Headline, Body } from './type';
import { Rule } from './Rule';

interface HeroProps {
  onBrief: () => void;
}

export function Hero({ onBrief }: HeroProps) {
  return (
    <section style={{ padding: '88px 96px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
      {/* Left — headline */}
      <div>
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Asterism size={10} color={F.accent} />
          <Label size="l" color={F.ink2}>The Commission · 01</Label>
        </div>
        <Headline italic="it">Ship it.</Headline>
      </div>

      {/* Right — standfirst */}
      <div style={{ paddingTop: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Rule color="ink" weight={1.5} length={32} />
            <Label size="l" color={F.ink}>Standfirst</Label>
          </div>
          <Body size="l" as="p" style={{ maxWidth: 460 }}>
            A studio of specialist agents — auditors, analysts,
            engineers — held on retainer. <em>State the work.</em> We deliver
            the audit, the rewrite, the deploy.
          </Body>
        </div>

        <div style={{ marginTop: 48, display: 'flex', alignItems: 'baseline', gap: 24 }}>
          <button
            type="button"
            onClick={onBrief}
            style={{
              fontFamily: fonts.ui,
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '0.02em',
              padding: '14px 22px',
              background: F.ink,
              color: F.surface,
              border: 'none',
              borderRadius: 0,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              transition: 'background-color 120ms ease, opacity 120ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.92'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            Brief a project
            <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
          </button>
          <span style={{ fontFamily: fonts.ui, fontSize: 13, color: F.ink2 }}>
            or pick a ready commission below
          </span>
        </div>
      </div>
    </section>
  );
}
