'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

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

  return {
    balance: data.balance,
    starterCreditGranted: data.starterCreditGranted,
    user: data.user,
    isAuthenticated,
    isLoading,
    refresh,
  };
}
