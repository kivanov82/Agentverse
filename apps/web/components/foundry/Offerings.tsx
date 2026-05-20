'use client';
import * as React from 'react';
import { F, fonts } from './tokens';

export interface Commission {
  id: string;
  href?: string;
  roman: string;
  title: string;
  description: string;
  lead: string;
  turnaround: string;
  from: string;
}

interface OfferingsProps {
  commissions: Commission[];
  onCommission: (id: string) => void;
  /** Optional aside text shown right of the section title ("Two ready · more next month"). */
  aside?: string;
}

export function Offerings({ commissions, onCommission, aside }: OfferingsProps) {
  return (
    <section
      id="commissions"
      style={{
        padding: '0 96px 32px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
      }}
    >
      <SectionTitle aside={aside} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          flex: 1,
          minHeight: 0,
          marginTop: 16,
        }}
      >
        {commissions.map((c, i) => (
          <CommissionCard
            key={c.id}
            c={c}
            primary={i === 0}
            onClick={() => onCommission(c.id)}
          />
        ))}
      </div>
    </section>
  );
}

function SectionTitle({ aside }: { aside?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        paddingBottom: 12,
        borderBottom: `1px solid ${F.ink}`,
      }}
    >
      <h2
        style={{
          fontFamily: fonts.display,
          fontSize: 22,
          fontWeight: 400,
          letterSpacing: '-0.01em',
          color: F.ink,
          margin: 0,
        }}
      >
        Choose a commission
      </h2>
      {aside && (
        <span
          style={{
            fontFamily: fonts.ui,
            fontSize: 13,
            color: F.ink2,
          }}
        >
          {aside}
        </span>
      )}
    </div>
  );
}

function CommissionCard({
  c,
  primary,
  onClick,
}: {
  c: Commission;
  primary: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = React.useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
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
        display: 'flex',
        flexDirection: 'column',
        padding: '22px 26px 24px',
        background: primary || hovered ? F.hover : 'transparent',
        border: `1px solid ${primary ? F.ink : F.hairline}`,
        textDecoration: 'none',
        color: 'inherit',
        cursor: 'pointer',
        transition: 'background-color 120ms ease, border-color 120ms ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span
          style={{
            fontFamily: fonts.display,
            fontStyle: 'italic',
            fontSize: 20,
            color: F.accent,
          }}
        >
          {c.roman}.
        </span>
        <h3
          style={{
            fontFamily: fonts.display,
            fontSize: 34,
            fontWeight: 400,
            letterSpacing: '-0.02em',
            color: F.ink,
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          {c.title}
        </h3>
      </div>

      <p
        style={{
          fontFamily: fonts.ui,
          fontSize: 14,
          lineHeight: 1.5,
          color: F.ink2,
          margin: '14px 0 18px',
          textWrap: 'pretty' as any,
          maxWidth: 460,
        }}
      >
        {c.description}
      </p>

      <MetadataRow lead={c.lead} turnaround={c.turnaround} from={c.from} />

      <div style={{ marginTop: 'auto', paddingTop: 18 }}>
        <CommissionButton primary={primary || hovered} />
      </div>
    </a>
  );
}

function MetadataRow({
  lead,
  turnaround,
  from,
}: {
  lead: string;
  turnaround: string;
  from: string;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        borderTop: `1px solid ${F.hairlineFaint}`,
        borderBottom: `1px solid ${F.hairlineFaint}`,
      }}
    >
      <MetadataCell label="Lead" value={lead} divider />
      <MetadataCell label="Turnaround" value={turnaround} divider />
      <MetadataCell label="From" value={from} />
    </div>
  );
}

function MetadataCell({
  label,
  value,
  divider,
}: {
  label: string;
  value: string;
  divider?: boolean;
}) {
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRight: divider ? `1px solid ${F.hairlineFaint}` : 'none',
      }}
    >
      <div
        style={{
          fontFamily: fonts.ui,
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: F.inkMute,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: fonts.ui,
          fontSize: 13,
          color: F.ink,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function CommissionButton({ primary }: { primary: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        border: `1px solid ${primary ? F.accent : F.ink}`,
        background: primary ? F.accent : 'transparent',
        color: primary ? F.surface : F.ink,
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
