import * as React from 'react';
import { F, fonts } from './tokens';

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
            padding: '14px 18px 16px',
            borderRight: i < entries.length - 1 ? `1px solid ${F.hairlineFaint}` : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
            <span style={{ fontFamily: fonts.display, fontStyle: 'italic', fontSize: 14, color: F.accent }}>
              {m.roman}.
            </span>
            <span style={{ fontFamily: fonts.display, fontSize: 17, color: F.ink, letterSpacing: '-0.01em', lineHeight: 1.15 }}>
              {m.name}
            </span>
          </div>
          <p style={{
            fontFamily: fonts.ui,
            fontSize: 12,
            lineHeight: 1.5,
            color: F.ink2,
            margin: 0,
            textWrap: 'pretty' as any,
          }}>
            {m.body}
          </p>
        </div>
      ))}
    </div>
  );
}
