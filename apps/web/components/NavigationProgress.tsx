'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Constellation-themed navigation indicator.
 * - Thin gradient line across the top of the viewport
 * - A small glowing "star" traveling along it while a navigation is pending
 * - Triggered on internal link clicks; resolves on pathname change or timeout
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPathRef = useRef(pathname);

  // Detect internal link clicks
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (anchor.getAttribute('target') === '_blank') return;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname) return;
      } catch {
        return;
      }
      setActive(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setActive(false), 10_000);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  // Clear when pathname actually changed
  useEffect(() => {
    if (pathname !== lastPathRef.current) {
      // Give a beat so the bar animates out rather than snapping
      const t = setTimeout(() => setActive(false), 200);
      lastPathRef.current = pathname;
      return () => clearTimeout(t);
    }
  }, [pathname]);

  if (!active) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none" aria-hidden>
      {/* Track */}
      <div className="relative h-[2px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent overflow-hidden">
        {/* Traveling gradient */}
        <div className="nav-progress-bar absolute inset-y-0 left-0 w-[35%] bg-gradient-to-r from-transparent via-brand-500 to-transparent" />
        {/* Traveling star */}
        <div className="nav-progress-star absolute top-1/2 w-1.5 h-1.5 rounded-full bg-brand-300" />
      </div>
    </div>
  );
}
