import * as React from 'react';
import { F } from './tokens';

type RuleColor = 'hairline' | 'hairline-faint' | 'ink' | 'accent';

const COLOR_MAP: Record<RuleColor, string> = {
  hairline:        F.hairline,
  'hairline-faint': F.hairlineFaint,
  ink:             F.ink,
  accent:          F.accent,
};

interface RuleProps {
  color?: RuleColor;
  weight?: number;
  length?: number | string;
  style?: React.CSSProperties;
}

export function Rule({ color = 'hairline', weight = 1, length, style }: RuleProps) {
  return (
    <div
      role="separator"
      style={{
        background: COLOR_MAP[color],
        width: length ?? '100%',
        height: weight,
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

export function VRule({ color = 'hairline', weight = 1, length, style }: RuleProps) {
  return (
    <div
      role="separator"
      style={{
        background: COLOR_MAP[color],
        width: weight,
        height: length ?? '100%',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
