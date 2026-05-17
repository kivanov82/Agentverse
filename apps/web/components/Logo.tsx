interface LogoProps {
  variant?: 'icon' | 'full';
  size?: number;
  className?: string;
}

export function Logo({ variant = 'icon', size = 32, className = '' }: LogoProps) {
  const iconSize = size;
  const textSize = size * 0.72;

  const Icon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <defs>
        <radialGradient id="logo-bg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#1a1a24" />
          <stop offset="100%" stopColor="#08080c" />
        </radialGradient>
        <linearGradient id="logo-orange" x1="8" y1="4" x2="24" y2="12">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="logo-teal" x1="0" y1="16" x2="32" y2="24">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>

      <rect width="32" height="32" rx="7" fill="url(#logo-bg)" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="6.5" stroke="#2a2a32" strokeOpacity="0.7" />

      {/* Constellation connection lines */}
      <path
        d="M16 7 L9 22 M16 7 L23 22 M9 22 L23 22 M16 7 L16 16 M9 22 L16 16 M23 22 L16 16"
        stroke="#3f3f46"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />

      {/* Faint orbit ring */}
      <circle cx="16" cy="16" r="11" stroke="#27272a" strokeWidth="0.6" strokeDasharray="1 3" opacity="0.6" />

      {/* Nodes */}
      <circle cx="16" cy="7" r="2.5" fill="url(#logo-orange)" />
      <circle cx="16" cy="7" r="4" fill="#f97316" opacity="0.15" />
      <circle cx="9" cy="22" r="2.2" fill="#e4e4e7" />
      <circle cx="23" cy="22" r="2.2" fill="url(#logo-teal)" />
      <circle cx="23" cy="22" r="3.5" fill="#14b8a6" opacity="0.18" />
      <circle cx="16" cy="16" r="1.3" fill="#a1a1aa" />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={className}>
        <Icon />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Icon />
      <span
        className="font-display tracking-tight text-zinc-100 leading-none"
        style={{ fontSize: `${textSize}px` }}
      >
        ShipWith<span className="italic text-brand-500">.AI</span>
      </span>
    </div>
  );
}
