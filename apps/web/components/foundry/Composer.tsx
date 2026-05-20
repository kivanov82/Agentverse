'use client';
import * as React from 'react';
import { F, fonts } from './tokens';
import { Label, Mono } from './type';

interface ComposerProps {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onAttach?: () => void;
  disabled?: boolean;
}

export function Composer({
  placeholder = 'Type a direction, ask a question, or attach a file…',
  value,
  onChange,
  onSend,
  onAttach,
  disabled,
}: ComposerProps) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea up to ~4 lines.
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 96) + 'px';
  }, [value]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!disabled && value.trim()) onSend();
    }
  };

  const sendDisabled = disabled || !value.trim();

  return (
    <div
      style={{
        borderTop: `1px solid ${F.hairline}`,
        padding: '14px 56px 20px',
        background: F.surface,
        flexShrink: 0,
      }}
    >
      {/* Label row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <Label size="l" color={F.ink}>Your reply</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {onAttach && (
            <button
              type="button"
              onClick={onAttach}
              style={{
                background: 'transparent', border: 'none', padding: 0,
                fontFamily: fonts.ui, fontSize: 11, color: F.inkMute,
                cursor: 'pointer',
              }}
            >
              ¶ Attach
            </button>
          )}
          <Mono size="s" color={F.inkMute}>⌘ ↵ to send</Mono>
        </div>
      </div>

      {/* Input + send */}
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          border: `1px solid ${F.ink}`,
          background: F.card,
        }}
      >
        <textarea
          ref={ref}
          id="composer-reply"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          rows={1}
          aria-label="Reply"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: fonts.display,
            fontSize: 17,
            fontStyle: value ? 'normal' : 'italic',
            color: value ? F.ink : F.inkMute,
            lineHeight: 1.45,
            padding: '14px 16px',
          }}
        />
        <button
          type="button"
          onClick={onSend}
          disabled={sendDisabled}
          aria-label="Send"
          style={{
            border: 'none',
            borderLeft: `1px solid ${F.ink}`,
            background: F.ink,
            color: F.surface,
            cursor: sendDisabled ? 'not-allowed' : 'pointer',
            opacity: sendDisabled ? 0.55 : 1,
            padding: '0 20px',
            fontFamily: fonts.ui,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            transition: 'opacity 120ms ease',
          }}
        >
          Send
          <span aria-hidden="true" style={{ fontSize: 14 }}>→</span>
        </button>
      </div>
    </div>
  );
}
