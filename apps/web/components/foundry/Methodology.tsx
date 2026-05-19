import * as React from 'react';
import { F, fonts } from './tokens';
import { Body } from './type';

export interface MethodEntry {
  roman: string;
  name: string;
  body: string;
}

export function Methodology({ entries }: { entries: MethodEntry[] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${entries.length}, 1fr)`,
      borderTop: `1px solid ${F.ink}`,
      borderBottom: `1px solid ${F.hairline}`,
    }}>
      {entries.map((m, i) => (
        <div
          key={m.roman}
          style={{
            padding: '20px 22px 22px',
            borderRight: i < entries.length - 1 ? `1px solid ${F.hairlineFaint}` : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
            <span style={{ fontFamily: fonts.display, fontStyle: 'italic', fontSize: 15, color: F.accent }}>
              {m.roman}.
            </span>
            <span style={{ fontFamily: fonts.display, fontSize: 19, color: F.ink, letterSpacing: '-0.01em', lineHeight: 1.15 }}>
              {m.name}
            </span>
          </div>
          <Body size="xs" as="p" color={F.ink2}>{m.body}</Body>
        </div>
      ))}
    </div>
  );
}
