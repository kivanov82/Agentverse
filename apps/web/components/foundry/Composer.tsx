'use client';
import * as React from 'react';
import { F, fonts } from './tokens';
import { SendArrow } from './marks';

interface ComposerProps {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onAttach?: () => void;
  disabled?: boolean;
  /** Right-aligned utility text (e.g. "Auto-saved"). */
  utility?: string;
}

export function Composer({
  placeholder = 'Type a direction, ask a question, or attach a file…',
  value,
  onChange,
  onSend,
  onAttach,
  disabled,
  utility = 'Auto-saved',
}: ComposerProps) {
  const [focused, setFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!disabled && value.trim()) onSend();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSend();
    }
  };

  const sendDisabled = disabled || !value.trim();
  const placeholderItalic = !value && !focused;

  return (
    <div
      style={{
        padding: '16px 48px 18px',
        background: F.surface,
        borderTop: `1px solid ${F.hairline}`,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          border: `1px solid ${F.ink}`,
          background: F.card,
        }}
      >
        <input
          ref={inputRef}
          id="composer-reply"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          aria-label="Reply"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: fonts.display,
            fontSize: 16,
            fontStyle: placeholderItalic ? 'italic' : 'normal',
            color: F.ink,
            padding: '12px 16px',
          }}
        />
        {onAttach && (
          <button
            type="button"
            onClick={onAttach}
            aria-label="Attach"
            style={{
              border: 'none',
              borderLeft: `1px solid ${F.hairline}`,
              background: 'transparent',
              color: F.ink2,
              padding: '0 14px',
              fontFamily: fonts.display,
              fontSize: 18,
              cursor: 'pointer',
              transition: 'background-color 120ms ease, color 120ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = F.hover; e.currentTarget.style.color = F.ink; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = F.ink2; }}
          >
            ¶
          </button>
        )}
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
            padding: '0 18px',
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
          <SendArrow size={12} color={F.surface} />
        </button>
      </div>

      <div
        style={{
          marginTop: 6,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: fonts.mono,
          fontSize: 10,
          letterSpacing: '0.16em',
          color: F.inkMute,
        }}
      >
        <span>⌘↵ to send · ⌘K for commands</span>
        <span>{utility}</span>
      </div>
    </div>
  );
}
