'use client';
import * as React from 'react';
import { F, fonts } from './tokens';
import { Label, Mono, Display, Body } from './type';
import { Rule } from './Rule';

export interface Commission {
  id: string;
  roman: string;
  title: string;
  description: string;
  scope: string;
  lead: string;
  turnaround: string;
}

interface OfferingsProps {
  commissions: Commission[];
  onCommission: (id: string) => void;
}

export function Offerings({ commissions, onCommission }: OfferingsProps) {
  return (
    <section style={{ padding: '88px 96px 0' }}>
      <Rule color="hairline" />
      <div style={{ padding: '32px 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 }}>
          <Label size="l" color={F.ink}>Today's Commissions</Label>
          <Mono size="m" color={F.ink2}>02 · OFFERINGS</Mono>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderTop: `1px solid ${F.ink}`,
          borderBottom: `1px solid ${F.ink}`,
        }}>
          {commissions.map((c, i) => (
            <CommissionCard
              key={c.id}
              c={c}
              index={i}
              total={commissions.length}
              hasRightBorder={i < commissions.length - 1}
              onClick={() => onCommission(c.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CommissionCard({
  c, index, total, hasRightBorder, onClick,
}: {
  c: Commission; index: number; total: number; hasRightBorder: boolean; onClick: () => void;
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '28px 32px 32px',
        borderRight: hasRightBorder ? `1px solid ${F.hairline}` : 'none',
        background: hovered ? F.hover : 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        border: 'none',
        borderBottom: 'none',
        color: 'inherit',
        transition: 'background-color 120ms ease',
        display: 'block',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{
          fontFamily: fonts.display,
          fontStyle: 'italic',
          fontSize: 22,
          fontWeight: 400,
          color: F.accent,
        }}>
          {c.roman}.
        </span>
        <Mono size="s" color={F.inkMute}>{`0${index + 1} / 0${total}`}</Mono>
      </div>

      <Display size="s" as="h3" style={{ marginBottom: 12 }}>{c.title}</Display>

      <Body size="s" as="p" color={F.ink2} style={{ marginBottom: 24, maxWidth: 460 }}>
        {c.description}
      </Body>

      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 28 }}>
        {[
          ['Scope', c.scope],
          ['Lead', c.lead],
          ['Turnaround', c.turnaround],
        ].map(([k, v], j) => (
          <div
            key={k}
            style={{
              display: 'grid',
              gridTemplateColumns: '110px 1fr',
              padding: '10px 0',
              borderTop: j === 0 ? 'none' : `1px solid ${F.hairlineFaint}`,
              alignItems: 'baseline',
            }}
          >
            <Label size="m" color={F.inkMute}>{k}</Label>
            <span style={{
              fontFamily: fonts.ui,
              fontSize: 13,
              color: F.ink,
              letterSpacing: '-0.005em',
            }}>
              {v}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: F.accent }}>
        <Rule color="accent" weight={1.5} length={24} />
        <Label size="l" color={F.accent}>Commission</Label>
        <span style={{ fontSize: 14, marginLeft: 'auto', color: F.accent }}>→</span>
      </div>
    </button>
  );
}
