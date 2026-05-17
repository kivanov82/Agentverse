'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Coins, AlertTriangle, Loader2 } from 'lucide-react';
import { useCredits } from '@/lib/use-credits';
import { formatUsdcAmount } from '@/lib/pricing';

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

// Step for picking which audit methodologies to run. Selection is never
// gated — users can pick anything freely. The wizard checks balance + opens
// SignIn/TopUp modals only when they hit the final "Let's go" button, so
// exploring bundles doesn't interrupt them with modals.
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
    return () => {
      cancelled = true;
    };
  }, [skillsAgentId]);

  const priceById = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of skills ?? []) {
      if (typeof s.priceUsd === 'number') m.set(s.id, s.priceUsd);
    }
    return m;
  }, [skills]);

  const bundlePrices = useMemo(
    () =>
      bundles.map((b) => ({
        ...b,
        total: b.skills.reduce((sum, id) => sum + (priceById.get(id) ?? 0), 0),
      })),
    [bundles, priceById],
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
    <div className="space-y-2">
      {skillsErr && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-red-900/40 bg-red-950/20 text-xs text-red-300">
          <AlertTriangle className="w-3.5 h-3.5" />
          {skillsErr}
        </div>
      )}
      {!skills && !skillsErr && (
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Loading pricing…
        </div>
      )}

      {skills && (
        <>
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-1">
            <span>Choose your depth</span>
            <span className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-brand-500" />
              {creditsLoading ? '…' : isAuthenticated ? `Balance ${formatUsdcAmount(balance)}` : 'Sign in at checkout'}
            </span>
          </div>

          {bundlePrices.map((b) => {
            const selected = selectedKey === b.id;
            const affordable = !isAuthenticated || balance >= b.total;
            const skillNames = b.skills
              .map((id) => skills.find((s) => s.id === id)?.name ?? id)
              .join(', ');
            return (
              <button
                key={b.id}
                onClick={() => pick(b.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                  selected
                    ? 'border-brand-500/50 bg-brand-500/5'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                }`}
              >
                <div
                  className={`w-4 h-4 mt-0.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                    selected ? 'border-brand-400 bg-brand-500' : 'border-zinc-700'
                  }`}
                >
                  {selected && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className={`text-sm font-semibold ${selected ? 'text-white' : 'text-zinc-200'}`}>
                      {b.label}
                    </span>
                    <span className={`text-sm font-mono font-semibold ${affordable ? 'text-brand-400' : 'text-amber-400'}`}>
                      ${b.total}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{b.description}</p>
                  <p className="text-[10px] text-zinc-600 mt-1 truncate">Skills: {skillNames}</p>
                  {isAuthenticated && !affordable && (
                    <p className="text-[10px] text-amber-400/80 mt-1">
                      Needs ${(b.total - balance).toFixed(2)} more — you&apos;ll top up after you continue
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </>
      )}
    </div>
  );
}
