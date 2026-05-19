'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCredits } from '@/lib/use-credits';
import { formatUsdcAmount } from '@/lib/pricing';
import { F, fonts, Label, Mono } from './foundry';

interface Bundle {
  id: string;
  label: string;
  description: string;
  skills: string[];
}

interface SkillInfo {
  id: string;
  name: string;
  description?: string;
  priceUsd?: number;
}

interface Props {
  skillsAgentId: string;
  bundles: Bundle[];
  value: string[] | null;
  onChange: (skills: string[], totalUsd: number) => void;
}

export function AuditDepthStep({ skillsAgentId, bundles, value, onChange }: Props) {
  const { balance, isAuthenticated, isLoading: creditsLoading } = useCredits();
  const [skills, setSkills] = useState<SkillInfo[] | null>(null);
  const [skillsErr, setSkillsErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/agents/${skillsAgentId}/skills`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success && Array.isArray(data.skills)) setSkills(data.skills);
        else setSkillsErr('Could not load pricing.');
      })
      .catch(() => !cancelled && setSkillsErr('Could not load pricing.'));
    return () => { cancelled = true; };
  }, [skillsAgentId]);

  const priceById = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of skills ?? []) {
      if (typeof s.priceUsd === 'number') m.set(s.id, s.priceUsd);
    }
    return m;
  }, [skills]);

  const bundlePrices = useMemo(
    () => bundles.map((b) => ({
      ...b,
      total: b.skills.reduce((sum, id) => sum + (priceById.get(id) ?? 0), 0),
    })),
    [bundles, priceById]
  );

  const selectedKey = useMemo(() => {
    if (!value) return null;
    const sorted = [...value].sort().join(',');
    const match = bundles.find((b) => [...b.skills].sort().join(',') === sorted);
    return match?.id ?? null;
  }, [value, bundles]);

  function pick(bundleId: string) {
    const bundle = bundlePrices.find((b) => b.id === bundleId);
    if (!bundle) return;
    onChange(bundle.skills, bundle.total);
  }

  return (
    <div>
      {skillsErr && (
        <div style={{ marginBottom: 12, padding: 10, borderLeft: `2px solid ${F.accent}`, background: F.accentSoft }}>
          <Mono size="s" color={F.accent}>Error</Mono>
          <p style={{ marginTop: 4, fontFamily: fonts.ui, fontSize: 12, color: F.ink }}>{skillsErr}</p>
        </div>
      )}
      {!skills && !skillsErr && (
        <Mono size="s" color={F.inkMute}>Loading pricing…</Mono>
      )}

      {skills && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <Label size="m" color={F.inkMute}>Choose your depth</Label>
            <Mono size="s" color={F.inkMute}>
              {creditsLoading ? '…' : isAuthenticated ? `Balance ${formatUsdcAmount(balance)}` : 'Sign in at checkout'}
            </Mono>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', borderTop: `1px solid ${F.ink}`, borderBottom: `1px solid ${F.ink}` }}>
            {bundlePrices.map((b, i) => {
              const selected = selectedKey === b.id;
              const affordable = !isAuthenticated || balance >= b.total;
              const skillNames = b.skills
                .map((id) => skills.find((s) => s.id === id)?.name ?? id)
                .join(' · ');
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => pick(b.id)}
                  style={{
                    padding: '18px 4px',
                    display: 'grid',
                    gridTemplateColumns: '24px 1fr auto',
                    alignItems: 'baseline',
                    gap: 12,
                    background: selected ? F.hover : 'transparent',
                    border: 'none',
                    borderTop: i === 0 ? 'none' : `1px solid ${F.hairlineFaint}`,
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    color: 'inherit',
                    cursor: 'pointer',
                    transition: 'background-color 120ms ease',
                  }}
                >
                  <span style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: `1px solid ${selected ? F.accent : F.hairline}`,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: 4,
                  }}>
                    {selected && <span style={{ width: 8, height: 8, borderRadius: '50%', background: F.accent }} />}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: fonts.display, fontSize: 19, color: F.ink, letterSpacing: '-0.01em' }}>{b.label}</div>
                    <div style={{ fontFamily: fonts.ui, fontSize: 13, color: F.ink2, marginTop: 4 }}>{b.description}</div>
                    <div style={{ marginTop: 6 }}>
                      <Mono size="s" color={F.inkMute}>{skillNames}</Mono>
                    </div>
                    {isAuthenticated && !affordable && (
                      <div style={{ marginTop: 6 }}>
                        <Mono size="s" color={F.accent}>
                          Needs ${(b.total - balance).toFixed(2)} more — top up at checkout
                        </Mono>
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontFamily: fonts.mono, fontSize: 14,
                    color: affordable ? F.ink : F.accent,
                    letterSpacing: '0.05em',
                  }}>
                    ${b.total}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
