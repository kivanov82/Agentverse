'use client';
import * as React from 'react';
import { F, fonts } from './tokens';
import { Label, Mono, Display, Body } from './type';
import { Rule } from './Rule';

export interface Commission {
  id: string;
  href?: string;
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
    <section id="commissions" style={{ padding: '64px 96px 0' }}>
      <Rule color="hairline" />
      <div style={{ padding: '28px 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
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
              primary={i === 0}
              onClick={() => onCommission(c.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CommissionCard({
  c, index, total, hasRightBorder, primary, onClick,
}: {
  c: Commission;
  index: number;
  total: number;
  hasRightBorder: boolean;
  primary: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = React.useState(false);
  const showAccent = primary || hovered;
  const usePrimaryButton = primary || hovered;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Allow modifier-click to open in new tab; otherwise intercept and route.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onClick();
  };

  return (
    <a
      href={c.href ?? '#'}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        padding: '28px 32px 28px',
        borderRight: hasRightBorder ? `1px solid ${F.hairline}` : 'none',
        background: hovered || primary ? F.hover : 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        color: 'inherit',
        textDecoration: 'none',
        transition: 'background-color 120ms ease',
        display: 'block',
        boxSizing: 'border-box',
      }}
    >
      {/* Accent top strip — pre-applied on primary card, on hover otherwise */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: F.accent,
          opacity: showAccent ? 1 : 0,
          transition: 'opacity 120ms ease',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
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

      <Display size="s" as="h3" style={{ marginBottom: 10 }}>{c.title}</Display>

      <Body size="s" as="p" color={F.ink2} style={{ marginBottom: 20, maxWidth: 460 }}>
        {c.description}
      </Body>

      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 22 }}>
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
              padding: '8px 0',
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

      <CommissionButton primary={usePrimaryButton} />
    </a>
  );
}

function CommissionButton({ primary }: { primary: boolean }) {
  const filled = primary;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        border: `1px solid ${filled ? F.accent : F.ink}`,
        background: filled ? F.accent : 'transparent',
        color: filled ? F.surface : F.ink,
        fontFamily: fonts.ui,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        transition: 'background-color 120ms ease, color 120ms ease, border-color 120ms ease',
      }}
    >
      <span>Commission this</span>
      <span aria-hidden="true">→</span>
    </div>
  );
}
