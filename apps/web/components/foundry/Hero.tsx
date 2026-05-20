'use client';
import * as React from 'react';
import { F, fonts } from './tokens';
import { Asterism } from './marks';
import { Label, Headline, Body } from './type';
import { Rule } from './Rule';
import { HowItWorks } from './HowItWorks';

interface HeroProps {
  onBrief: () => void;
  onBrowse: () => void;
}

export function Hero({ onBrief, onBrowse }: HeroProps) {
  return (
    <section style={{ padding: '48px 96px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
      {/* Left — headline + standfirst */}
      <div>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Asterism size={10} color={F.accent} />
          <Label size="l" color={F.ink2}>The Commission · 01</Label>
        </div>
        <Headline italic="it" style={{ fontSize: 144, lineHeight: 0.94, letterSpacing: '-0.045em' }}>
          Ship it.
        </Headline>

        <div style={{ marginTop: 32 }}>
          <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Rule color="ink" weight={1.5} length={32} />
            <Label size="l" color={F.ink}>Standfirst</Label>
          </div>
          <Body size="l" as="p" style={{ maxWidth: 520 }}>
            A studio of specialist agents — auditors, analysts,
            engineers — held on retainer. <em>State the work.</em> We deliver
            the audit, the rewrite, the deploy.
          </Body>
        </div>
      </div>

      {/* Right — action panel */}
      <div style={{ paddingTop: 24 }}>
        <HowItWorks onPrimary={onBrief} onBrowse={onBrowse} />
      </div>
    </section>
  );
}
