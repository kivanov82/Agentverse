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
}

interface InProgressProps {
  folios: Folio[];
  onOpen: (id: string) => void;
}

export function InProgress({ folios, onOpen }: InProgressProps) {
  if (!folios.length) return null;

  return (
    <section style={{ padding: '56px 96px 0' }}>
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
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '24px 1fr 1fr 140px 80px',
        alignItems: 'center',
        padding: '18px 0',
        borderBottom: `1px solid ${F.hairlineFaint}`,
        gap: 16,
        background: hovered ? F.hover : 'transparent',
        cursor: 'pointer',
        border: 'none',
        borderBottomColor: F.hairlineFaint,
        borderBottomStyle: 'solid',
        borderBottomWidth: 1,
        width: '100%',
        textAlign: 'left',
        fontFamily: 'inherit',
        color: 'inherit',
        transition: 'background-color 120ms ease',
      }}
    >
      <Mono size="m" color={F.inkMute}>{String(index).padStart(2, '0')}</Mono>
      <Display size="meta-l" as="span">{folio.name}</Display>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: folio.signal === 'live' ? F.signal : F.inkMute,
        }} />
        <Label size="m" color={F.ink2}>{folio.status}</Label>
      </div>
      <Mono size="m" color={F.inkMute} style={{ letterSpacing: '0.12em' }}>{folio.opened}</Mono>
      <Mono size="l" color={F.ink} style={{ textAlign: 'right' }}>{folio.amount}</Mono>
    </button>
  );
}
