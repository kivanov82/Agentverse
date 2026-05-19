// Foundry tokens — the canonical reference for inline-style components.
// CSS variables in globals.css are the runtime source; these strings
// mirror them for components that build inline `style` props.

export const F = {
  surface:       'var(--surface)',
  surface2:      'var(--surface-2)',
  card:          'var(--card)',
  ink:           'var(--ink)',
  ink2:          'var(--ink-2)',
  inkMute:       'var(--ink-mute)',
  hairline:      'var(--hairline)',
  hairlineFaint: 'var(--hairline-faint)',
  hover:         'var(--hover)',
  accent:        'var(--accent)',
  accentSoft:    'var(--accent-soft)',
  signal:        'var(--signal)',
} as const;

export const fonts = {
  display: 'var(--font-display)',
  ui:      'var(--font-ui)',
  mono:    'var(--font-mono)',
} as const;
