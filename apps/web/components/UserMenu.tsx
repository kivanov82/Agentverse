'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useCredits } from '@/lib/use-credits';
import { formatUsdcAmount } from '@/lib/pricing';
import { SignInModal } from './SignInModal';
import { TopUpModal } from './TopUpModal';
import { User as UserIcon, LogOut, Plus } from 'lucide-react';

export function UserMenu({ compact = false }: { compact?: boolean }) {
  const { balance, isAuthenticated, isLoading, user, refresh } = useCredits();
  const [signInOpen, setSignInOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
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
          <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-[10px] font-semibold">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[11px] text-zinc-300 truncate">{displayName}</div>
          {compact && <div className="text-[9px] font-mono text-brand-500">{formatUsdcAmount(balance)}</div>}
        </div>
      </button>

      {menuOpen && (
        <div className={`absolute w-56 border border-zinc-700 bg-[#1a1a20] shadow-2xl shadow-black/70 ring-1 ring-brand-500/10 z-50 overflow-hidden ${
          compact ? 'left-full top-0 ml-3' : 'top-full right-0 mt-2'
        }`}>
          <div className="px-3 py-2.5 border-b border-zinc-700 bg-zinc-900/60">
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">Credit balance</div>
            <div className="text-sm font-semibold text-brand-500 font-mono mt-0.5">{formatUsdcAmount(balance)}</div>
          </div>
          <button
            onClick={() => { setMenuOpen(false); setTopUpOpen(true); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors border-b border-zinc-700"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-400" />
            Top up credits
          </button>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-zinc-400" />
            Sign out
          </button>
        </div>
      )}
      <TopUpModal
        open={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        onSuccess={refresh}
      />
    </div>
  );
}
