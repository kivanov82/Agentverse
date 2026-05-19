// Shared editorial design tokens for ShipWith.AI redesign
// Two surfaces (Foundry = cream, Press = ink), one type system.
(function () {
const foundryTokens = {
  name: 'Foundry',
  surface: '#F1ECE2',
  surface2: '#E9E2D4',
  card: '#F6F2EA',
  ink: '#1A1612',
  ink2: '#4D453B',
  inkMute: '#857C6E',
  hairline: 'rgba(26, 22, 18, 0.16)',
  hairlineFaint: 'rgba(26, 22, 18, 0.08)',
  hover: 'rgba(26, 22, 18, 0.04)',
  accent: '#A8311C',
  accentSoft: 'rgba(168, 49, 28, 0.10)',
  signal: '#3E6F4A', // for "live" / status — desaturated bottle green
};

const pressTokens = {
  name: 'Press',
  surface: '#0E0D0B',
  surface2: '#161410',
  card: '#1A1814',
  ink: '#ECE5D6',
  ink2: '#A89E8B',
  inkMute: '#6A6356',
  hairline: 'rgba(236, 229, 214, 0.18)',
  hairlineFaint: 'rgba(236, 229, 214, 0.08)',
  hover: 'rgba(236, 229, 214, 0.04)',
  accent: '#E0B341',
  accentSoft: 'rgba(224, 179, 65, 0.12)',
  signal: '#7FB58E',
};

const fonts = {
  display: '"Newsreader", "Source Serif 4", Georgia, serif',
  ui: '"Geist", ui-sans-serif, -apple-system, BlinkMacSystemFont, sans-serif',
  mono: '"JetBrains Mono", "Geist Mono", ui-monospace, monospace',
};

// Editorial ornament — registration mark / asterism
const Asterism = ({ size = 14, color }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <circle cx="7" cy="3.5" r="1" fill={color} />
    <circle cx="3.5" cy="10" r="1" fill={color} />
    <circle cx="10.5" cy="10" r="1" fill={color} />
  </svg>
);

// Registration mark (printer's mark)
const RegMark = ({ size = 18, color, strokeWidth = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" style={{ display: 'inline-block' }}>
    <circle cx="9" cy="9" r="5.5" fill="none" stroke={color} strokeWidth={strokeWidth} />
    <line x1="9" y1="0" x2="9" y2="18" stroke={color} strokeWidth={strokeWidth} />
    <line x1="0" y1="9" x2="18" y2="9" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

// Small caps label
const SmallCaps = ({ children, color, size = 11, tracking = 0.18, weight = 500, style = {} }) => (
  <span style={{
    fontFamily: fonts.ui,
    fontSize: size,
    fontWeight: weight,
    letterSpacing: `${tracking}em`,
    textTransform: 'uppercase',
    color,
    ...style,
  }}>{children}</span>
);

// Mono label
const Mono = ({ children, color, size = 11, tracking = 0.08, style = {} }) => (
  <span style={{
    fontFamily: fonts.mono,
    fontSize: size,
    letterSpacing: `${tracking}em`,
    color,
    ...style,
  }}>{children}</span>
);

// Hairline rule
const Rule = ({ color, vertical = false, length, weight = 1, style = {} }) => (
  <div style={{
    background: color,
    width: vertical ? weight : (length || '100%'),
    height: vertical ? (length || '100%') : weight,
    flexShrink: 0,
    ...style,
  }} />
);

Object.assign(window, { foundryTokens, pressTokens, fonts, Asterism, RegMark, SmallCaps, Mono, Rule });
})();
