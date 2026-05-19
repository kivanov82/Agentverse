'use client';
import * as React from 'react';
import { F, fonts } from './tokens';
import { Label, Mono, Display } from './type';
import { AvatarTile } from './RightRail';

export interface MessageEntry {
  id: string;
  senderName: string;
  senderRole?: string;
  senderInitials: string;
  timestamp: string;
  body: React.ReactNode;
  options?: MessageOption[];
}

export interface MessageOption {
  key: string;
  name: string;
  description?: string;
  onPick: () => void;
}

interface CorrespondenceProps {
  messages: MessageEntry[];
  entryCount?: number;
}

export function Correspondence({ messages, entryCount }: CorrespondenceProps) {
  return (
    <section style={{ marginTop: 36 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
        <Label size="l" color={F.ink}>Correspondence</Label>
        <Mono size="s" color={F.inkMute}>{entryCount ?? messages.length} entries</Mono>
      </div>
      <div style={{ borderTop: `1px solid ${F.hairline}` }}>
        {messages.map((m, i) => (
          <Message key={m.id} message={m} first={i === 0} />
        ))}
      </div>
    </section>
  );
}

function Message({ message, first }: { message: MessageEntry; first: boolean }) {
  return (
    <article style={{ paddingTop: first ? 18 : 24, paddingBottom: 4 }}>
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
        <AvatarTile size={28} initials={message.senderInitials} />
        <Display size="meta-m" as="span" style={{ fontSize: 17 }}>{message.senderName}</Display>
        {message.senderRole && (
          <span style={{ fontFamily: fonts.ui, fontSize: 12, color: F.inkMute }}>— {message.senderRole}</span>
        )}
        <Mono size="s" color={F.inkMute} style={{ marginLeft: 'auto' }}>{message.timestamp}</Mono>
      </header>
      <div style={{ paddingLeft: 40, paddingBottom: 4 }}>
        <div style={{
          fontFamily: fonts.display,
          fontSize: 17,
          lineHeight: 1.55,
          color: F.ink,
          textWrap: 'pretty' as any,
        }}>
          {message.body}
        </div>
        {message.options && message.options.length > 0 && (
          <Options options={message.options} />
        )}
      </div>
    </article>
  );
}

function Options({ options }: { options: MessageOption[] }) {
  return (
    <div style={{ marginTop: 18 }}>
      <Label size="m" color={F.inkMute}>Pick a direction —</Label>
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column' }}>
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={o.onPick}
            style={{
              background: 'transparent',
              border: 'none',
              borderTop: `1px solid ${F.hairlineFaint}`,
              padding: '14px 4px',
              textAlign: 'left',
              fontFamily: 'inherit',
              cursor: 'pointer',
              display: 'grid',
              gridTemplateColumns: '22px 1fr auto',
              alignItems: 'baseline',
              gap: 12,
              color: 'inherit',
              transition: 'background-color 120ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = F.hover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Mono size="m" color={F.inkMute}>{o.key.toUpperCase()}</Mono>
            <span>
              <Display size="meta-m" as="span" style={{ fontSize: 17 }}>{o.name}</Display>
              {o.description && (
                <span style={{ fontFamily: fonts.ui, fontSize: 13, color: F.ink2, marginLeft: 10 }}>
                  — {o.description}
                </span>
              )}
            </span>
            <span style={{ color: F.inkMute, fontSize: 14 }}>→</span>
          </button>
        ))}
        <div style={{ borderTop: `1px solid ${F.hairlineFaint}` }} />
      </div>
    </div>
  );
}

/** Inline mono fragment — for amounts, hashes, units inside prose. */
export function InlineMono({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: fonts.mono, fontSize: 14 }}>{children}</span>
  );
}

/** Inline accent link — vermilion underline, no full underline-decoration. */
export function InlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        color: F.accent,
        borderBottom: `1px solid ${F.accent}`,
        textDecoration: 'none',
      }}
    >
      {children}
    </a>
  );
}
