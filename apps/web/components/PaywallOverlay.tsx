'use client';

import { useState } from 'react';
import { Wallet, MessageSquare } from 'lucide-react';
import { formatUsdcAmount } from '@/lib/pricing';
import { SignInModal } from './SignInModal';

interface Props {
  state: 'signed_out' | 'out_of_credit' | 'ok';
  balance?: number;
}

/**
 * Credit paywall. Shown as an absolute overlay on the chat panel when the
 * user either isn't signed in, or their credit balance has dropped below the
 * minimum needed to kick off another agent run. Stripe top-up lands in Phase 3
 * — for now the button is disabled with a note.
 */
export function PaywallOverlay({ state, balance }: Props) {
  const [signInOpen, setSignInOpen] = useState(false);
  if (state === 'ok') return null;

  const signedOut = state === 'signed_out';

  return (
    <div className="absolute inset-0 bg-zinc-900/95 flex flex-col items-center justify-center rounded-b-xl z-10 p-6">
      <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mb-3">
        {signedOut ? (
          <Wallet className="w-5 h-5 text-yellow-500" />
        ) : (
          <MessageSquare className="w-5 h-5 text-yellow-500" />
        )}
      </div>

      <p className="text-sm font-medium text-white mb-1 text-center">
        {signedOut ? 'Sign in to continue' : 'Out of credits'}
      </p>

      <p className="text-xs text-zinc-400 mb-4 text-center max-w-[240px]">
        {signedOut
          ? 'Create an account and get $5 of free credits to run an audit.'
          : `You've used up your credits${balance !== undefined ? ` (balance: ${formatUsdcAmount(balance)})` : ''}. Top up to continue.`}
      </p>

      {signedOut ? (
        <button
          onClick={() => setSignInOpen(true)}
          className="px-4 py-2 rounded-xl bg-white text-zinc-900 text-xs font-semibold hover:bg-zinc-100 transition-colors"
        >
          Sign in
        </button>
      ) : (
        <button
          disabled
          className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-500 text-xs font-semibold cursor-not-allowed"
        >
          Top up (coming soon)
        </button>
      )}

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </div>
  );
}
