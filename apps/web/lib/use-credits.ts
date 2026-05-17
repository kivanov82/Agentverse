'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { MIN_BALANCE_USD } from './pricing';
import { BALANCE_CHANGED_EVENT } from './agent-client';

export type GateState = 'signed_out' | 'out_of_credit' | 'ok';

export interface CreditsUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

export interface CreditsState {
  balance: number;
  starterCreditGranted: boolean;
  user: CreditsUser | null;
}

const INITIAL: CreditsState = {
  balance: 0,
  starterCreditGranted: false,
  user: null,
};

function shallowEqual(a: CreditsState, b: CreditsState): boolean {
  if (a.balance !== b.balance) return false;
  if (a.starterCreditGranted !== b.starterCreditGranted) return false;
  if (a.user === b.user) return true;
  if (!a.user || !b.user) return false;
  return (
    a.user.id === b.user.id &&
    a.user.email === b.user.email &&
    a.user.name === b.user.name &&
    a.user.image === b.user.image
  );
}

export function useCredits() {
  const { status } = useSession();
  const [data, setData] = useState<CreditsState>(INITIAL);
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading' || (isAuthenticated && !data.user);

  const refresh = useCallback(async () => {
    if (status === 'loading') return;
    if (status !== 'authenticated') {
      setData((prev) => (prev === INITIAL ? prev : INITIAL));
      return;
    }
    try {
      const res = await fetch('/api/credits', { cache: 'no-store' });
      if (!res.ok) {
        setData((prev) => (prev === INITIAL ? prev : INITIAL));
        return;
      }
      const json = await res.json();
      const next: CreditsState = {
        balance: json.balance ?? 0,
        starterCreditGranted: json.starterCreditGranted ?? false,
        user: json.user ?? null,
      };
      setData((prev) => (shallowEqual(prev, next) ? prev : next));
    } catch {
      setData((prev) => (prev === INITIAL ? prev : INITIAL));
    }
  }, [status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Optimistic update whenever an agent invocation reports a new balance.
  // Avoids polling /api/credits after every message — the server already
  // knows the debited amount and pushes it back in the SSE `done` event.
  useEffect(() => {
    if (!isAuthenticated) return;
    function onBalanceChange(e: Event) {
      const detail = (e as CustomEvent<{ balance?: number }>).detail;
      const next = detail?.balance;
      if (typeof next !== 'number' || !Number.isFinite(next)) return;
      setData((prev) => (prev.balance === next ? prev : { ...prev, balance: next }));
    }
    window.addEventListener(BALANCE_CHANGED_EVENT, onBalanceChange);
    return () => window.removeEventListener(BALANCE_CHANGED_EVENT, onBalanceChange);
  }, [isAuthenticated]);

  const gateState: GateState = isLoading
    ? 'ok'
    : !isAuthenticated
      ? 'signed_out'
      : data.balance < MIN_BALANCE_USD
        ? 'out_of_credit'
        : 'ok';

  return {
    balance: data.balance,
    starterCreditGranted: data.starterCreditGranted,
    user: data.user,
    isAuthenticated,
    isLoading,
    gateState,
    refresh,
  };
}
