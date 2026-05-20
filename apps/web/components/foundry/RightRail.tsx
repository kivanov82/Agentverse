'use client';
import * as React from 'react';
import { F, fonts } from './tokens';
import { Label, Display } from './type';

export interface ResidentAgent {
  id: string;
  initials: string;
  name: string;
  role: string;
  state: string;
  online: boolean;
}

export interface SessionRow { label: string; value: string }

interface RightRailProps {
  agents: ResidentAgent[];
  session: SessionRow[];
  onAsk?: (agentId: string) => void;
  onViewReport?: () => void;
}

export function RightRail({ agents, session, onAsk, onViewReport }: RightRailProps) {
  return (
    <aside
      style={{
        borderLeft: `1px solid ${F.hairline}`,
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        background: F.surface,
        overflow: 'auto',
        minHeight: 0,
      }}
    >
      <Label size="m" color={F.inkMute}>Agents on this folio</Label>

      {agents.map((a) => (
        <AgentBlock
          key={a.id}
          a={a}
          onAsk={onAsk ? () => onAsk(a.id) : undefined}
        />
      ))}

      <div style={{ marginTop: 8 }}>
        <Label size="m" color={F.inkMute}>This session</Label>
        <div
          style={{
            marginTop: 10,
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            rowGap: 8,
            columnGap: 12,
          }}
        >
          {session.map((row) => (
            <React.Fragment key={row.label}>
              <span style={{ fontFamily: fonts.ui, fontSize: 13, color: F.ink2 }}>
                {row.label}
              </span>
              <span style={{
                fontFamily: fonts.ui, fontSize: 13, color: F.ink,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {row.value}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onViewReport}
        disabled={!onViewReport}
        style={{
          marginTop: 'auto',
          width: '100%',
          padding: '11px 14px',
          background: 'transparent',
          color: F.ink,
          border: `1px solid ${F.ink}`,
          borderRadius: 0,
          fontFamily: fonts.ui,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          cursor: onViewReport ? 'pointer' : 'not-allowed',
          opacity: onViewReport ? 1 : 0.5,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          transition: 'background-color 120ms ease',
        }}
        onMouseEnter={(e) => { if (onViewReport) e.currentTarget.style.background = F.hover; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        View full report
        <span aria-hidden="true" style={{ fontSize: 13 }}>→</span>
      </button>
    </aside>
  );
}

function AgentBlock({ a, onAsk }: { a: ResidentAgent; onAsk?: () => void }) {
  return (
    <div style={{ paddingBottom: 14, borderBottom: `1px solid ${F.hairlineFaint}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <AvatarTile size={30} initials={a.initials} variant="agent" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Display size="meta-m" as="div" style={{ fontSize: 15 }}>{a.name}</Display>
          <div style={{ fontFamily: fonts.ui, fontSize: 11, color: F.inkMute }}>{a.role}</div>
        </div>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            aria-hidden="true"
            className={a.online ? 'live-pulse' : ''}
            style={{
              width: 5, height: 5, borderRadius: '50%',
              background: a.online ? F.signal : F.inkMute,
            }}
          />
          <span style={{ fontFamily: fonts.ui, fontSize: 11, color: F.ink2 }}>{a.state}</span>
        </div>
        {onAsk && <AskButton onClick={onAsk} />}
      </div>
    </div>
  );
}

function AskButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '4px 10px',
        background: 'transparent',
        color: F.ink,
        border: `1px solid ${F.hairline}`,
        borderRadius: 0,
        fontFamily: fonts.ui,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'background-color 120ms ease, border-color 120ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = F.hover;
        e.currentTarget.style.borderColor = F.ink;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderColor = F.hairline;
      }}
    >
      Ask
    </button>
  );
}

/** Avatar tile — SPEC v3 §D.3 — `agent` is ink-filled, `you` is outlined transparent. */
export function AvatarTile({
  size = 28,
  initials,
  variant = 'agent',
}: {
  size?: number;
  initials: string;
  variant?: 'agent' | 'you';
}) {
  const isYou = variant === 'you';
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        background: isYou ? 'transparent' : F.ink,
        color: isYou ? F.ink : F.surface,
        border: isYou ? `1px solid ${F.ink}` : 'none',
        fontFamily: fonts.mono,
        fontSize: size <= 28 ? 9 : 10,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        letterSpacing: '0.05em',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
