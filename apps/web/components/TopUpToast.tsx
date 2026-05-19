'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCredits } from '@/lib/use-credits';
import { F, fonts, Mono } from './foundry';

const MESSAGES: Record<string, { title: string; tone: 'success' | 'error' | 'info' }> = {
  success: { title: 'Credits added — balance updated.', tone: 'success' },
  cancel:  { title: 'Top-up cancelled.',                tone: 'info' },
  pending: { title: 'Payment pending — credits will appear shortly.', tone: 'info' },
  error:   { title: 'Top-up could not be completed. Try again?', tone: 'error' },
};

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
    if (topup === 'success') refresh();
    const next = new URLSearchParams(params.toString());
    next.delete('topup');
    const suffix = next.toString();
    router.replace(`${pathname}${suffix ? `?${suffix}` : ''}`, { scroll: false });
    const timer = setTimeout(() => setVisible(false), 4500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topup]);

  if (!visible || !topup) return null;
  const msg = MESSAGES[topup];
  if (!msg) return null;

  const accent = msg.tone === 'error' ? F.accent : msg.tone === 'success' ? F.signal : F.ink2;

  return (
    <div
      role="status"
      style={{
        position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px',
        background: F.surface,
        border: `1px solid ${F.ink}`,
        borderLeftWidth: 2, borderLeftColor: accent,
      }}
    >
      <Mono size="s" color={accent} uppercase>{msg.tone}</Mono>
      <span style={{ fontFamily: fonts.ui, fontSize: 13, color: F.ink }}>{msg.title}</span>
      <button
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        style={{
          marginLeft: 4, background: 'transparent', border: 'none', padding: 0,
          fontFamily: fonts.mono, fontSize: 14, color: F.inkMute, cursor: 'pointer',
        }}
      >×</button>
    </div>
  );
}
