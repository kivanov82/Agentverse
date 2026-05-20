'use client';
import * as React from 'react';
import { F, fonts } from './tokens';
import { Check } from './marks';

export interface Phase {
  name: string;
  /** Sub-label retained in the type for back-compat but no longer rendered in v3. */
  sub?: string;
  state: 'done' | 'active' | 'pending';
}

interface PhaseBarProps {
  phases: Phase[];
}

export function PhaseBar({ phases }: PhaseBarProps) {
  return (
    <div
      style={{
        borderTop: `1px solid ${F.hairline}`,
        padding: '12px 32px',
        background: F.surface2,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {phases.map((p, i) => {
          const prev = phases[i - 1];
          const ruleAccent = prev?.state === 'done';
          return (
            <React.Fragment key={p.name}>
              {i > 0 && (
                <div
                  aria-hidden="true"
                  style={{
                    flex: 1,
                    height: 1,
                    background: ruleAccent ? F.accent : F.hairline,
                    opacity: ruleAccent ? 1 : 0.5,
                  }}
                />
              )}
              <PhaseChip phase={p} />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function PhaseChip({ phase }: { phase: Phase }) {
  const done = phase.state === 'done';
  const active = phase.state === 'active';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <PhaseDot done={done} active={active} />
      <span
        style={{
          fontFamily: fonts.ui,
          fontSize: 13,
          fontWeight: active ? 600 : 500,
          color: active ? F.accent : (done ? F.ink : F.inkMute),
          letterSpacing: '-0.005em',
          whiteSpace: 'nowrap',
        }}
      >
        {phase.name}
      </span>
    </div>
  );
}

function PhaseDot({ done, active }: { done: boolean; active: boolean }) {
  return (
    <div
      style={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        border: `1px solid ${done || active ? F.accent : F.hairline}`,
        background: done ? F.accent : (active ? F.surface : 'transparent'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      {done && <Check size={8} color={F.surface} />}
      {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: F.accent }} />}
    </div>
  );
}
