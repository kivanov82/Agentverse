'use client';

import { useEffect, useState } from 'react';

export function MobileOverlay() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!mounted || !isMobile) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a] px-8 text-center">
      <div className="mb-6 text-5xl">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-zinc-500">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8" />
          <path d="M12 17v4" />
        </svg>
      </div>
      <h1 className="mb-3 text-xl font-semibold text-zinc-100">
        Designed for Desktop
      </h1>
      <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
        ShipWith.AI works best on a desktop browser. Please switch to a larger screen for the full experience.
      </p>
      <div className="mt-8 text-xs text-zinc-600">
        shipwithai.nl
      </div>
    </div>
  );
}
