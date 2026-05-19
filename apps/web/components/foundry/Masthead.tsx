import * as React from 'react';
import { F } from './tokens';
import { RegMark } from './marks';
import { Mono, Display } from './type';

const ROMAN_MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const ROMAN_DAYS = [
  '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
  'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX', 'XXXI',
];
const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function toRomanYear(year: number): string {
  const map: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'],  [90, 'XC'],  [50, 'L'],  [40, 'XL'],
    [10, 'X'],   [9, 'IX'],   [5, 'V'],   [4, 'IV'],
    [1, 'I'],
  ];
  let out = '';
  let n = year;
  for (const [v, sym] of map) {
    while (n >= v) { out += sym; n -= v; }
  }
  return out;
}

export function dateLine(d = new Date()): string {
  return `${MONTH_NAMES[d.getMonth()]} · ${ROMAN_DAYS[d.getDate()]} · ${toRomanYear(d.getFullYear())}`;
}

export function Wordmark({ size = 21 }: { size?: number }) {
  return (
    <Display size={size === 21 ? 'meta-l' : 'h-s'} as="span" italic color={F.ink} style={{ fontSize: size, letterSpacing: '-0.01em' }}>
      ShipWith<span style={{ color: F.accent }}>.AI</span>
    </Display>
  );
}

interface MastheadProps {
  center?: React.ReactNode;
  right?: React.ReactNode;
  padding?: string;
}

export function Masthead({ center, right, padding = '0 32px' }: MastheadProps) {
  return (
    <header
      style={{
        height: 56,
        padding,
        borderBottom: `1px solid ${F.hairline}`,
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        background: F.surface,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <RegMark size={16} strokeWidth={1.1} />
        <Wordmark />
      </div>
      <div style={{ textAlign: 'center' }}>
        {center ?? <Mono size="m" color={F.ink2}>{dateLine()}</Mono>}
      </div>
      <div style={{ textAlign: 'right' }}>
        {right ?? <Mono size="m" color={F.ink2}>VOL III · ISSUE 14</Mono>}
      </div>
    </header>
  );
}
