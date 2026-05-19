import * as React from 'react';
import { F, fonts } from './tokens';

// ─────────────────────────────────────────────────────────────
// Type primitives — SPEC §1.2
// Wrappers map to the type scale; they emit inline styles so the
// system reads the same in any rendering context.
// ─────────────────────────────────────────────────────────────

type DisplaySize = 'xl' | 'm' | 's' | 'xs' | 'h-l' | 'h-m' | 'h-s' | 'meta-l' | 'meta-m';

const DISPLAY_SCALE: Record<DisplaySize, React.CSSProperties> = {
  xl:       { fontSize: 220, lineHeight: 0.86, letterSpacing: '-0.045em', fontWeight: 300 },
  m:        { fontSize: 56,  lineHeight: 1.0,  letterSpacing: '-0.03em',  fontWeight: 400 },
  s:        { fontSize: 38,  lineHeight: 1.05, letterSpacing: '-0.02em',  fontWeight: 400 },
  xs:       { fontSize: 34,  lineHeight: 1.1,  letterSpacing: '-0.02em',  fontWeight: 400 },
  'h-l':    { fontSize: 24,  lineHeight: 1.35, letterSpacing: '-0.005em', fontWeight: 400 },
  'h-m':    { fontSize: 22,  lineHeight: 1.35, letterSpacing: '-0.005em', fontWeight: 400 },
  'h-s':    { fontSize: 19,  lineHeight: 1.15, letterSpacing: '-0.01em',  fontWeight: 400 },
  'meta-l': { fontSize: 20,  lineHeight: 1.2,  letterSpacing: '-0.01em',  fontWeight: 400 },
  'meta-m': { fontSize: 16,  lineHeight: 1.1,  letterSpacing: 0,          fontWeight: 400 },
};

interface DisplayProps extends React.HTMLAttributes<HTMLElement> {
  size: DisplaySize;
  as?: keyof JSX.IntrinsicElements;
  italic?: boolean;
  color?: string;
}

export function Display({ size, as = 'span', italic, color, style, className, children, ...rest }: DisplayProps) {
  const Tag = as as any;
  return (
    <Tag
      className={['display', className].filter(Boolean).join(' ')}
      style={{
        fontFamily: fonts.display,
        fontStyle: italic ? 'italic' : 'normal',
        color: color ?? F.ink,
        margin: 0,
        ...DISPLAY_SCALE[size],
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ── Body ─────────────────────────────────────────────────────
type BodySize = 'l' | 'm' | 's' | 'xs';

const BODY_SCALE: Record<BodySize, React.CSSProperties & { family: string }> = {
  l:  { fontSize: 17, lineHeight: 1.55, fontWeight: 400, family: fonts.display },
  m:  { fontSize: 15, lineHeight: 1.5,  fontWeight: 400, family: fonts.ui },
  s:  { fontSize: 14, lineHeight: 1.55, fontWeight: 400, family: fonts.ui },
  xs: { fontSize: 13, lineHeight: 1.55, fontWeight: 400, family: fonts.ui },
};

interface BodyProps extends React.HTMLAttributes<HTMLElement> {
  size: BodySize;
  as?: keyof JSX.IntrinsicElements;
  color?: string;
}

export function Body({ size, as = 'p', color, style, children, ...rest }: BodyProps) {
  const Tag = as as any;
  const { family, ...typeStyle } = BODY_SCALE[size];
  return (
    <Tag
      style={{
        fontFamily: family,
        color: color ?? F.ink,
        margin: 0,
        textWrap: 'pretty',
        ...typeStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ── Label ────────────────────────────────────────────────────
type LabelSize = 'l' | 'm' | 'xs';

const LABEL_SCALE: Record<LabelSize, { size: number; tracking: number; weight: number }> = {
  l:  { size: 11, tracking: 0.24, weight: 600 },
  m:  { size: 10, tracking: 0.22, weight: 500 },
  xs: { size: 9,  tracking: 0.20, weight: 500 },
};

interface LabelProps extends React.HTMLAttributes<HTMLElement> {
  size: LabelSize;
  as?: keyof JSX.IntrinsicElements;
  color?: string;
}

export function Label({ size, as = 'span', color, style, children, ...rest }: LabelProps) {
  const Tag = as as any;
  const s = LABEL_SCALE[size];
  return (
    <Tag
      style={{
        fontFamily: fonts.ui,
        fontSize: s.size,
        fontWeight: s.weight,
        letterSpacing: `${s.tracking}em`,
        textTransform: 'uppercase',
        color: color ?? F.ink2,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ── Mono ─────────────────────────────────────────────────────
type MonoSize = 'l' | 'm' | 's';

const MONO_SCALE: Record<MonoSize, { size: number; tracking: number }> = {
  l: { size: 12, tracking: 0.05 },
  m: { size: 11, tracking: 0.18 },
  s: { size: 10, tracking: 0.22 },
};

interface MonoProps extends React.HTMLAttributes<HTMLElement> {
  size: MonoSize;
  as?: keyof JSX.IntrinsicElements;
  color?: string;
  uppercase?: boolean;
}

export function Mono({ size, as = 'span', color, uppercase, style, children, ...rest }: MonoProps) {
  const Tag = as as any;
  const s = MONO_SCALE[size];
  return (
    <Tag
      style={{
        fontFamily: fonts.mono,
        fontSize: s.size,
        letterSpacing: `${s.tracking}em`,
        textTransform: uppercase ? 'uppercase' : undefined,
        color: color ?? F.ink2,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ── Headline ────────────────────────────────────────────────
// Renders Newsreader with an italic-word + accent-period pattern.
// Usage: <Headline italic="it">Ship it.</Headline>
//   → "Ship " (roman) + "it" (italic) + "." (accent)

interface HeadlineProps {
  size?: DisplaySize;
  italic: string;
  children: string;
  as?: keyof JSX.IntrinsicElements;
  color?: string;
  style?: React.CSSProperties;
}

export function Headline({ size = 'xl', italic, children, as = 'h1', color, style }: HeadlineProps) {
  // Split children into segments around the italic word and a trailing period.
  const stripped = children.replace(/\.$/, '');
  const hasPeriod = children.endsWith('.');
  const idx = stripped.toLowerCase().lastIndexOf(italic.toLowerCase());
  const before = idx >= 0 ? stripped.slice(0, idx) : stripped + ' ';
  const word = idx >= 0 ? stripped.slice(idx, idx + italic.length) : italic;
  const after = idx >= 0 ? stripped.slice(idx + italic.length) : '';

  return (
    <Display size={size} as={as} color={color} style={style}>
      {before}
      <span style={{ fontStyle: 'italic', fontWeight: 300 }}>{word}</span>
      {after}
      {hasPeriod && <span style={{ color: F.accent }}>.</span>}
    </Display>
  );
}
