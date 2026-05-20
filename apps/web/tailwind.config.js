/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Newsreader', 'Source Serif 4', 'Georgia', 'serif'],
        sans:    ['Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        surface:   'var(--surface)',
        surface2:  'var(--surface-2)',
        ink:       'var(--ink)',
        ink2:      'var(--ink-2)',
        inkMute:   'var(--ink-mute)',
        hairline:  'var(--hairline)',
        accent:    'var(--accent)',
        signal:    'var(--signal)',
      },
      borderRadius: {
        none: '0',
      },
    },
  },
  // SPEC §2.2 — no shadows, no gradients, no blur, no filters. Disable the
  // core plugins so Tailwind doesn't even emit the unused utility scaffolding
  // into the compiled CSS bundle.
  corePlugins: {
    boxShadow: false,
    dropShadow: false,
    backdropBlur: false,
    backdropBrightness: false,
    backdropContrast: false,
    backdropGrayscale: false,
    backdropHueRotate: false,
    backdropInvert: false,
    backdropOpacity: false,
    backdropSaturate: false,
    backdropSepia: false,
    blur: false,
    brightness: false,
    contrast: false,
    grayscale: false,
    hueRotate: false,
    invert: false,
    saturate: false,
    sepia: false,
    filter: false,
    backdropFilter: false,
    gradientColorStops: false,
    backgroundImage: false,
    // Components author transitions inline (`transition: 'background-color
    // 120ms ease'`); disabling this plugin removes the Tailwind utility
    // declarations that list box-shadow/filter as transition properties.
    transitionProperty: false,
  },
  plugins: [],
};
