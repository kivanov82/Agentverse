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
  plugins: [],
};
