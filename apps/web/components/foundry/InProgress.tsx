'use client';
import * as React from 'react';
import { F, fonts } from './tokens';
import { Label, Mono, Display } from './type';
import { Rule } from './Rule';

export interface Folio {
  id: string;
  name: string;
  status: string;
  opened: string;
  amount: string;
  signal?: 'live' | 'mute';
  /** True when this folio is awaiting the user's reply — surfaces an
   *  accent dot in the status column, and primes the row visually. */
  awaitingReply?: boolean;
}

interface InProgressProps {
  folios: Folio[];
  onOpen: (id: string) => void;
}

export function InProgress({ folios, onOpen }: InProgressProps) {
  if (!folios.length) return null;

  return (
    <section style={{ padding: '40px 96px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <Label size="l" color={F.ink}>In Progress · Your Folios</Label>
        <Mono size="m" color={F.ink2}>
          {String(folios.length).padStart(2, '0')} · OPEN
        </Mono>
      </div>
      <Rule color="hairline" />
      {folios.map((p, i) => (
        <FolioRow key={p.id} folio={p} index={i + 1} onClick={() => onOpen(p.id)} />
      ))}
    </section>
  );
}

function FolioRow({ folio, index, onClick }: { folio: Folio; index: number; onClick: () => void }) {
  const [hovered, setHovered] = React.useState(false);
  const accent = folio.awaitingReply;
  const dotColor = accent ? F.accent : (folio.signal === 'live' ? F.signal : F.inkMute);
  const statusColor = accent ? F.accent : F.ink2;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '24px 1fr 1fr 140px 1fr auto',
        alignItems: 'center',
        padding: '16px 0',
        borderBottom: `1px solid ${F.hairlineFaint}`,
        gap: 16,
        background: hovered ? F.hover : 'transparent',
        transition: 'background-color 120ms ease',
      }}
    >
      <Mono size="m" color={F.inkMute}>{String(index).padStart(2, '0')}</Mono>
      <button
        type="button"
        onClick={onClick}
        style={{
          background: 'transparent', border: 'none', padding: 0,
          textAlign: 'left', cursor: 'pointer',
          fontFamily: fonts.display, fontSize: 20, color: F.ink, letterSpacing: '-0.01em',
        }}
      >
        {folio.name}
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          className={accent ? 'live-pulse' : ''}
          style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor }}
        />
        <Label size="m" color={statusColor}>{folio.status}</Label>
      </div>
      <Mono size="m" color={F.inkMute} style={{ letterSpacing: '0.12em' }}>{folio.opened}</Mono>
      <Mono size="l" color={F.ink}>{folio.amount}</Mono>
      <ResumeButton onClick={onClick} primary={accent} />
    </div>
  );
}

function ResumeButton({ onClick, primary }: { onClick: () => void; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 14px',
        background: primary ? F.accent : 'transparent',
        color: primary ? F.surface : F.ink,
        border: `1px solid ${primary ? F.accent : F.ink}`,
        borderRadius: 0,
        fontFamily: fonts.ui,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        transition: 'background-color 120ms ease',
      }}
    >
      Resume
      <span aria-hidden="true" style={{ fontSize: 14 }}>→</span>
    </button>
  );
}
