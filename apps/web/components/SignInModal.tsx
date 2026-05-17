'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useAccount, useSignMessage, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { SiweMessage } from 'siwe';
import { X, Wallet } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SignInModal({ open, onClose }: Props) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSiwe = async () => {
    if (!address) return;
    setError(null);
    setIsSigning(true);
    try {
      const nonceRes = await fetch('/api/auth/csrf');
      const { csrfToken } = await nonceRes.json();
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to ShipWithAI',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce: csrfToken,
      });
      const preparedMessage = message.prepareMessage();
      const signature = await signMessageAsync({ message: preparedMessage });
      const result = await signIn('siwe', {
        message: JSON.stringify(message),
        signature,
        redirect: false,
      });
      if (result?.error) {
        setError('Sign-in failed — please try again.');
      } else {
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in cancelled.');
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#0c0c0f] p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-300"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-base font-semibold text-white">Sign in to ShipWithAI</h2>
        <p className="mt-1 text-xs text-zinc-400">
          New accounts get $5 of free credits.
        </p>

        <div className="mt-5 space-y-2">
          <button
            onClick={() => signIn('google')}
            className="w-full rounded-xl border border-zinc-700 bg-white text-zinc-900 text-sm font-medium py-2.5 hover:bg-zinc-100 transition-colors"
          >
            Continue with Google
          </button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800" /></div>
            <div className="relative flex justify-center"><span className="bg-[#0c0c0f] px-2 text-[10px] uppercase tracking-widest text-zinc-600">or</span></div>
          </div>

          {isConnected ? (
            <button
              onClick={handleSiwe}
              disabled={isSigning}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium py-2.5 hover:bg-brand-500/15 transition-colors disabled:opacity-60"
            >
              <Wallet className="w-4 h-4" />
              {isSigning ? 'Waiting for signature…' : 'Sign in with Ethereum'}
            </button>
          ) : (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 text-sm font-medium py-2.5 hover:border-zinc-600 transition-colors"
                >
                  <Wallet className="w-4 h-4" />
                  Connect wallet to sign in
                </button>
              )}
            </ConnectButton.Custom>
          )}
        </div>

        {error && <p className="mt-3 text-[11px] text-red-400">{error}</p>}
      </div>
    </div>
  );
}
