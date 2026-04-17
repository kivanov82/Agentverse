'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useCredits } from '@/lib/use-credits';
import { formatUsdcAmount } from '@/lib/pricing';
import { SignInModal } from './SignInModal';
import { User as UserIcon, LogOut } from 'lucide-react';

export function UserMenu({ compact = false }: { compact?: boolean }) {
  const { balance, isAuthenticated, isLoading, user } = useCredits();
  const [signInOpen, setSignInOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside — the menu is absolutely positioned,
  // so the sidebar itself has no hit area to capture the click.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  if (isLoading) {
    return (
      <div className={compact ? 'w-full h-8 rounded-lg bg-zinc-800/50 animate-pulse' : 'h-6 w-24 bg-zinc-800/50 animate-pulse rounded'} />
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <>
        <button
          onClick={() => setSignInOpen(true)}
          className={
            compact
              ? 'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-zinc-800/50 border border-zinc-700 text-zinc-300 hover:border-zinc-600 transition-colors'
              : 'px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-800 text-zinc-200'
          }
        >
          <UserIcon className={compact ? 'w-3.5 h-3.5' : 'hidden'} />
          Sign in
        </button>
        <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
      </>
    );
  }

  const displayName = user.name ?? user.email ?? 'Account';
  const initials = (user.name || user.email || '?').slice(0, 1).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className={
          compact
            ? 'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900/60 hover:border-zinc-600 transition-colors'
            : 'flex items-center gap-1.5 px-2 py-1 rounded-lg border border-zinc-700 bg-zinc-900/60'
        }
      >
        {user.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={user.image} alt="" className="w-5 h-5 rounded-full" />
        ) : (
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-semibold">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[11px] text-zinc-300 truncate">{displayName}</div>
          {compact && <div className="text-[9px] text-emerald-400">{formatUsdcAmount(balance)}</div>}
        </div>
      </button>

      {menuOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-48 rounded-xl border border-zinc-800 bg-[#0c0c0f] shadow-lg z-20 overflow-hidden">
          <div className="px-3 py-2 border-b border-zinc-800">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">Credit balance</div>
            <div className="text-sm font-semibold text-emerald-400">{formatUsdcAmount(balance)}</div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800/60 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
