'use client';
import * as React from 'react';
import { F } from './tokens';
import { Display, Mono } from './type';
import { Check } from './marks';

export interface Phase {
  name: string;
  sub: string;
  state: 'done' | 'active' | 'pending';
}

export function PhaseBar({ phases }: { phases: Phase[] }) {
  return (
    <div style={{
      borderTop: `1px solid ${F.hairline}`,
      padding: '14px 32px',
      background: F.surface2,
      height: 52,
      flexShrink: 0,
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${phases.length}, 1fr)`, alignItems: 'center', height: '100%' }}>
        {phases.map((p, i) => {
          const done = p.state === 'done';
          const active = p.state === 'active';
          return (
            <div
              key={p.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                paddingRight: 12,
                borderRight: i < phases.length - 1 ? `1px solid ${F.hairlineFaint}` : 'none',
              }}
            >
              <PhaseDot done={done} active={active} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Display
                  size="meta-m"
                  as="span"
                  italic={active}
                  color={active || done ? F.ink : F.ink2}
                  style={{ fontSize: 15 }}
                >
                  {p.name}
                </Display>
                <Mono size="s" color={F.inkMute} style={{ letterSpacing: '0.16em', fontSize: 9 }}>{p.sub}</Mono>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PhaseDot({ done, active }: { done: boolean; active: boolean }) {
  return (
    <div style={{
      width: 20,
      height: 20,
      borderRadius: '50%',
      border: `1px solid ${done || active ? F.accent : F.hairline}`,
      background: done ? F.accent : (active ? F.surface : 'transparent'),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxSizing: 'border-box',
    }}>
      {done && <Check size={9} color={F.surface} />}
      {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: F.accent }} />}
    </div>
  );
}
