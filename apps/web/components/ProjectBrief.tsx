'use client';

import { useShipWithAIStore } from '@/lib/store';
import { USE_CASES } from '@/lib/use-cases';
import { F, fonts, Label, Mono } from './foundry';

export function ProjectBrief() {
  const activeUseCase = useShipWithAIStore((s) => s.activeUseCase);
  const useCaseAnswers = useShipWithAIStore((s) => s.useCaseAnswers);
  const githubMode = useShipWithAIStore((s) => s.githubMode);

  if (!activeUseCase) return null;
  const config = USE_CASES[activeUseCase];
  if (!config) return null;

  const briefItems = config.questions
    .map((q) => {
      const val = useCaseAnswers[q.id];
      if (!val) return null;
      const display = Array.isArray(val) ? val.join(' · ') : val;
      return { label: q.question.replace(/\?$/, '').replace(/\(optional\)/i, '').trim(), value: display };
    })
    .filter(Boolean) as { label: string; value: string }[];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {briefItems.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '180px 1fr',
            padding: '12px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${F.hairlineFaint}`,
            alignItems: 'baseline',
          }}
        >
          <Label size="m" color={F.inkMute}>{item.label}</Label>
          <span style={{ fontFamily: fonts.ui, fontSize: 14, color: F.ink, lineHeight: 1.5 }}>
            {item.value}
          </span>
        </div>
      ))}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '180px 1fr',
        padding: '12px 0',
        borderTop: `1px solid ${F.hairlineFaint}`,
        alignItems: 'baseline',
      }}>
        <Label size="m" color={F.inkMute}>Repository</Label>
        <Mono size="s" color={F.ink}>
          {githubMode === 'own' ? 'Hosted on your GitHub' : 'Hosted by ShipWith.AI'}
        </Mono>
      </div>
    </div>
  );
}
