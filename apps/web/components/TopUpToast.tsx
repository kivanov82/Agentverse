'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { CheckCircle2, AlertCircle, XCircle, Clock, X } from 'lucide-react';
import { useCredits } from '@/lib/use-credits';

const MESSAGES: Record<string, { title: string; tone: 'success' | 'error' | 'info' }> = {
  success: { title: 'Credits added — balance updated.', tone: 'success' },
  cancel: { title: 'Top-up cancelled.', tone: 'info' },
  pending: { title: 'Payment pending — credits will appear shortly.', tone: 'info' },
  error: { title: 'Top-up could not be completed. Try again?', tone: 'error' },
};

/**
 * Reads the `?topup=...` query param that Stripe redirects to, refreshes the
 * credit balance on success, renders a brief banner, then strips the param.
 */
export function TopUpToast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { refresh } = useCredits();
  const topup = params.get('topup');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!topup) return;
    setVisible(true);
    if (topup === 'success') {
      refresh();
    }

    // Strip the query param from the URL without adding history entries.
    const next = new URLSearchParams(params.toString());
    next.delete('topup');
    const suffix = next.toString();
    router.replace(`${pathname}${suffix ? `?${suffix}` : ''}`, { scroll: false });

    const timer = setTimeout(() => setVisible(false), 4500);
    return () => clearTimeout(timer);
  // refresh is stable from useCredits; others come from Next router and don't need to be in deps.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topup]);

  if (!visible || !topup) return null;
  const msg = MESSAGES[topup];
  if (!msg) return null;

  const Icon =
    msg.tone === 'success'
      ? CheckCircle2
      : msg.tone === 'error'
        ? XCircle
        : topup === 'pending'
          ? Clock
          : AlertCircle;
  const ring =
    msg.tone === 'success'
      ? 'border-brand-500/30 bg-brand-500/10 text-brand-200'
      : msg.tone === 'error'
        ? 'border-red-500/30 bg-red-500/10 text-red-200'
        : 'border-zinc-700 bg-zinc-900 text-zinc-200';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-lg ${ring}`}>
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium">{msg.title}</span>
        <button
          onClick={() => setVisible(false)}
          className="ml-1 text-zinc-500 hover:text-zinc-300"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
