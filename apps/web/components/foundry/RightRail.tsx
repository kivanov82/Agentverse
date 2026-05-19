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
}

export function RightRail({ agents, session }: RightRailProps) {
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
        <AgentBlock key={a.id} a={a} />
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

function AgentBlock({ a }: { a: ResidentAgent }) {
  return (
    <div style={{ paddingBottom: 16, borderBottom: `1px solid ${F.hairlineFaint}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <AvatarTile size={32} initials={a.initials} />
        <div style={{ flex: 1 }}>
          <Display size="meta-m" as="div">{a.name}</Display>
          <Label size="xs" color={F.inkMute}>{a.role}</Label>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 42 }}>
        <span
          className={a.online ? 'live-pulse' : ''}
          style={{ width: 5, height: 5, borderRadius: '50%', background: a.online ? F.signal : F.inkMute }}
        />
        <Mono size="s" color={F.ink2} style={{ letterSpacing: '0.12em' }}>{a.state}</Mono>
      </div>
    </div>
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
