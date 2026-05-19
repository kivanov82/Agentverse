'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useAccount, useSignMessage, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { SiweMessage } from 'siwe';
import { Label, Mono, Display, F, fonts } from './foundry';

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
      if (result?.error) setError('Sign-in failed — please try again.');
      else onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in cancelled.');
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-title"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(26, 22, 18, 0.40)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 420,
          background: F.surface,
          border: `1px solid ${F.hairline}`,
          padding: 28,
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 14, right: 14,
            background: 'transparent', border: 'none', padding: 4,
            fontFamily: fonts.mono, fontSize: 14, color: F.inkMute,
            cursor: 'pointer',
          }}
        >×</button>

        <Mono size="s" color={F.accent} uppercase>The Door</Mono>
        <div id="signin-title" style={{ marginTop: 8 }}>
          <Display size="xs" as="h2" style={{ fontSize: 28 }}>Sign in.</Display>
        </div>
        <p style={{ marginTop: 8, fontFamily: fonts.ui, fontSize: 13, color: F.ink2 }}>
          New accounts receive a $5 starter credit.
        </p>

        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ButtonPrimary onClick={() => signIn('google')}>Continue with Google</ButtonPrimary>

          <Divider />

          {isConnected ? (
            <ButtonSecondary onClick={handleSiwe} disabled={isSigning}>
              {isSigning ? 'Waiting for signature…' : 'Sign in with Ethereum'}
            </ButtonSecondary>
          ) : (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <ButtonSecondary onClick={openConnectModal}>
                  Connect wallet to sign in
                </ButtonSecondary>
              )}
            </ConnectButton.Custom>
          )}
        </div>

        {error && (
          <p style={{ marginTop: 12, fontFamily: fonts.ui, fontSize: 12, color: F.accent }}>{error}</p>
        )}
      </div>
    </div>
  );
}

function ButtonPrimary({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '12px 16px',
        background: F.ink, color: F.surface,
        fontFamily: fonts.ui, fontSize: 14, fontWeight: 500, letterSpacing: '0.02em',
        border: 'none', borderRadius: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'opacity 120ms ease',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}

function ButtonSecondary({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '12px 16px',
        background: F.surface, color: F.ink,
        fontFamily: fonts.ui, fontSize: 14, fontWeight: 500, letterSpacing: '0.02em',
        border: `1px solid ${F.ink}`, borderRadius: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 120ms ease',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
      <span style={{ flex: 1, height: 1, background: F.hairlineFaint }} />
      <Label size="m" color={F.inkMute}>OR</Label>
      <span style={{ flex: 1, height: 1, background: F.hairlineFaint }} />
    </div>
  );
}
