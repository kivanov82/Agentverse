'use client';
import * as React from 'react';
import { F, fonts } from './tokens';
import { Label, Mono, Display } from './type';

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
}

export function RightRail({ agents, session, onAsk }: RightRailProps) {
  return (
    <aside style={{
      borderLeft: `1px solid ${F.hairline}`,
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      background: F.surface,
      overflow: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Label size="m" color={F.inkMute}>In Residence</Label>
        <Mono size="s" color={F.inkMute}>{agents.length}/{agents.length}</Mono>
      </div>

      {agents.map((a) => (
        <AgentBlock key={a.id} a={a} onAsk={onAsk ? () => onAsk(a.id) : undefined} />
      ))}

      <div style={{ marginTop: 'auto' }}>
        <Label size="m" color={F.inkMute}>Session</Label>
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 6, columnGap: 12 }}>
          {session.map((row) => (
            <React.Fragment key={row.label}>
              <Label size="m" color={F.ink2}>{row.label}</Label>
              <Mono size="m" color={F.ink}>{row.value}</Mono>
            </React.Fragment>
          ))}
        </div>
      </div>
    </aside>
  );
}

function AgentBlock({ a, onAsk }: { a: ResidentAgent; onAsk?: () => void }) {
  return (
    <div style={{ paddingBottom: 16, borderBottom: `1px solid ${F.hairlineFaint}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <AvatarTile size={32} initials={a.initials} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Display size="meta-m" as="div">{a.name}</Display>
          <Label size="xs" color={F.inkMute}>{a.role}</Label>
        </div>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 42,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            className={a.online ? 'live-pulse' : ''}
            style={{ width: 5, height: 5, borderRadius: '50%', background: a.online ? F.signal : F.inkMute }}
          />
          <Mono size="s" color={F.ink2} style={{ letterSpacing: '0.12em' }}>{a.state}</Mono>
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

export function AvatarTile({ size = 28, initials }: { size?: number; initials: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        background: F.ink,
        color: F.surface,
        fontFamily: fonts.mono,
        fontSize: size <= 28 ? 10 : 11,
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
