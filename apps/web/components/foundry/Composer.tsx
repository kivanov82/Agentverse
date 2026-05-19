'use client';
import * as React from 'react';
import { F, fonts } from './tokens';
import { Label, Mono } from './type';
import { SendArrow } from './marks';

interface ComposerProps {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export function Composer({
  placeholder = 'Type a direction, ask a question, or attach a file…',
  value,
  onChange,
  onSend,
  disabled,
}: ComposerProps) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea up to ~3 lines.
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 72) + 'px';
  }, [value]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!disabled && value.trim()) onSend();
    }
  };

  return (
    <div style={{ borderTop: `1px solid ${F.hairline}`, padding: '16px 56px 20px', background: F.surface, flexShrink: 0 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 4px',
        borderBottom: `1px solid ${F.ink}`,
        paddingBottom: 10,
      }}>
        <Label size="m" color={F.inkMute}>Reply —</Label>
        <textarea
          ref={ref}
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
            lineHeight: 1.4,
            padding: 0,
          }}
        />
        <Mono size="s" color={F.inkMute}>⌘ ↵</Mono>
        <button
          type="button"
          onClick={onSend}
          disabled={disabled || !value.trim()}
          aria-label="Send"
          style={{
            width: 32,
            height: 32,
            border: 'none',
            background: F.ink,
            color: F.surface,
            cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer',
            opacity: disabled || !value.trim() ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            transition: 'opacity 120ms ease',
          }}
        >
          <SendArrow size={14} color={F.surface} />
        </button>
      </div>
    </div>
  );
}
