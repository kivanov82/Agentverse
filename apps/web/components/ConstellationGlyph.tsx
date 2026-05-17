interface ConstellationGlyphProps {
  size?: number;
  className?: string;
  accent?: string;
}

/**
 * A tiny 3-node star-cluster used as a thematic anchor next to
 * "Constellation" labels throughout the app. Three dots linked by
 * hairline paths, with a single orange accent node.
 */
export function ConstellationGlyph({
  size = 14,
  className = '',
  accent = '#f97316',
}: ConstellationGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={`shrink-0 ${className}`}
      aria-hidden
    >
      <path
        d="M4 4 L12 6 L6 12 L4 4"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
      <circle cx="4" cy="4" r="1.4" fill={accent} />
      <circle cx="12" cy="6" r="1" fill="currentColor" />
      <circle cx="6" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}
