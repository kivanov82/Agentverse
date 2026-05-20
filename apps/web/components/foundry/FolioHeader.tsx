import * as React from 'react';
import { F } from './tokens';
import { Asterism } from './marks';
import { Label, Display } from './type';

interface FolioHeaderProps {
  eyebrow: string;
  title: string;
  /** When present, set as `title` on the heading so users can hover for context. */
  lede?: string;
}

export function FolioHeader({ eyebrow, title, lede }: FolioHeaderProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <Asterism size={9} color={F.accent} />
        <Label size="m" color={F.ink2}>{eyebrow}</Label>
      </div>
      <Display size="xs" as="h2" style={{ fontSize: 26, lineHeight: 1.15 }} title={lede}>
        {title}
      </Display>
    </div>
  );
}
