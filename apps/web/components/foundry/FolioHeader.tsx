import * as React from 'react';
import { F } from './tokens';
import { Asterism } from './marks';
import { Label, Display, Body } from './type';

interface FolioHeaderProps {
  eyebrow: string;
  title: string;
  lede?: string;
}

export function FolioHeader({ eyebrow, title, lede }: FolioHeaderProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Asterism size={9} color={F.accent} />
        <Label size="m" color={F.ink2}>{eyebrow}</Label>
      </div>
      <Display size="xs" as="h2" style={{ lineHeight: 1.1 }}>{title}</Display>
      {lede && (
        <Body size="l" as="p" color={F.ink2} style={{ marginTop: 12, maxWidth: 640 }}>
          {lede}
        </Body>
      )}
    </div>
  );
}
