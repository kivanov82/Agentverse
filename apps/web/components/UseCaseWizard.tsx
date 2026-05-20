'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { type UseCaseConfig, type QuestionStep, GITHUB_STEP } from '@/lib/use-cases';
import { useShipWithAIStore } from '@/lib/store';
import { AuditDepthStep } from './AuditDepthStep';
import { SignInModal } from './SignInModal';
import { TopUpModal } from './TopUpModal';
import { useCredits } from '@/lib/use-credits';
import {
  Display,
  Label,
  Body,
  Mono,
  Rule,
  Asterism,
  RegMark,
  Wordmark,
  F,
  fonts,
} from './foundry';

interface Props {
  config: UseCaseConfig;
}

export function UseCaseWizard({ config }: Props) {
  const router = useRouter();
  const initializeFromUseCase = useShipWithAIStore((s) => s.initializeFromUseCase);
  const { balance, isAuthenticated, refresh: refreshCredits } = useCredits();

  const steps: QuestionStep[] = config.skipGithubStep
    ? [...config.questions]
    : [...config.questions, GITHUB_STEP];
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | null>>({});
  const [fixedPriceTotal, setFixedPriceTotal] = useState(0);
  const [signInOpen, setSignInOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;
  const isMultiSelectValue = step.type === 'checkbox-group' || step.type === 'audit-depth';
  const value = answers[step.id] ?? (isMultiSelectValue ? [] : '');
  const canContinue = !step.required || (
    isMultiSelectValue
      ? (value as string[]).length > 0
      : typeof value === 'string' && value.trim().length > 0
  );

  const setAnswer = useCallback((val: string | string[] | null) => {
    setAnswers((prev) => ({ ...prev, [step.id]: val }));
  }, [step.id]);

  const next = () => {
    if (isLast) {
      if (fixedPriceTotal > 0) {
        if (!isAuthenticated) { setSignInOpen(true); return; }
        if (balance < fixedPriceTotal) { setTopUpOpen(true); return; }
      }
      initializeFromUseCase(config.id, answers);
      router.push('/dashboard');
      return;
    }
    setCurrentStep((s) => s + 1);
  };

  const back = () => {
    if (isFirst) { router.push('/'); return; }
    setCurrentStep((s) => s - 1);
  };

  const toggleCheckbox = (val: string) => {
    const current = (value as string[]) || [];
    if (current.includes(val)) setAnswer(current.filter((v) => v !== val));
    else setAnswer([...current, val]);
  };

  const stepLabel = `${String(currentStep + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}`;

  return (
    <div style={{
      width: 1440,
      margin: '0 auto',
      minHeight: '100vh',
      background: F.surface,
      color: F.ink,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <header
        style={{
          height: 56,
          padding: '0 40px',
          borderBottom: `1px solid ${F.hairline}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: F.surface,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <RegMark size={16} strokeWidth={1.1} />
          <Wordmark size={19} />
          <span style={{
            width: 1, height: 18, background: F.hairline, margin: '0 12px',
          }} />
          <span style={{
            fontFamily: fonts.ui, fontSize: 13, color: F.ink2,
          }}>{config.label}</span>
        </div>
        <Mono size="m" color={F.inkMute}>{stepLabel}</Mono>
      </header>

      <div style={{ padding: '64px 96px 0' }}>
        {/* Eyebrow + back */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Asterism size={10} color={F.accent} />
            <Label size="l" color={F.ink2}>The Brief · {String(currentStep + 1).padStart(2, '0')}</Label>
          </div>
          <button
            type="button"
            onClick={back}
            style={{
              background: 'transparent', border: 'none', padding: 0,
              fontFamily: fonts.ui, fontSize: 13, color: F.ink2, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{ fontSize: 16 }}>←</span> {isFirst ? 'Home' : 'Back'}
          </button>
        </div>

        {/* Question */}
        <div style={{ maxWidth: 720 }}>
          <Display size="xs" as="h2" style={{ fontSize: 34, marginBottom: 28 }}>
            {step.question}
          </Display>

          {step.type === 'text' || step.type === 'url' ? (
            <input
              type={step.type === 'url' ? 'url' : 'text'}
              value={(value as string) || ''}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={step.placeholder}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && canContinue && next()}
              style={{
                width: '100%', padding: '14px 16px',
                background: F.surface, color: F.ink,
                border: `1px solid ${F.hairline}`, borderRadius: 0,
                fontFamily: fonts.ui, fontSize: 17, outline: 'none',
              }}
            />
          ) : step.type === 'textarea' ? (
            <textarea
              value={(value as string) || ''}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={step.placeholder}
              autoFocus
              rows={5}
              style={{
                width: '100%', padding: '14px 16px',
                background: F.surface, color: F.ink,
                border: `1px solid ${F.hairline}`, borderRadius: 0,
                fontFamily: fonts.ui, fontSize: 17, outline: 'none',
                resize: 'none',
              }}
            />
          ) : step.type === 'file-upload' ? (
            <FileUpload value={value as string | null} onChange={setAnswer} step={step} onSkip={next} />
          ) : step.type === 'checkbox-group' ? (
            <CheckboxGroup options={step.options ?? []} value={(value as string[]) || []} onToggle={toggleCheckbox} />
          ) : step.type === 'audit-depth' ? (
            <AuditDepthStep
              skillsAgentId={step.skillsAgentId ?? 'solidity-auditor'}
              bundles={step.bundles ?? []}
              value={(value as string[]) || null}
              onChange={(skills, total) => {
                setAnswer(skills);
                setFixedPriceTotal(total);
              }}
            />
          ) : step.type === 'radio' ? (
            <RadioGroup options={step.options ?? []} value={value as string} onPick={setAnswer} />
          ) : null}
        </div>
      </div>

      {/* Bottom action */}
      <div style={{ marginTop: 'auto', padding: '64px 96px 64px' }}>
        <Rule color="hairline" />
        <div style={{ paddingTop: 24, display: 'flex', alignItems: 'center', gap: 16, maxWidth: 720 }}>
          <button
            type="button"
            onClick={next}
            disabled={!canContinue}
            style={{
              padding: '14px 22px',
              background: F.ink, color: F.surface,
              fontFamily: fonts.ui, fontSize: 14, fontWeight: 500, letterSpacing: '0.02em',
              border: 'none', borderRadius: 0,
              cursor: canContinue ? 'pointer' : 'not-allowed',
              opacity: canContinue ? 1 : 0.5,
              display: 'inline-flex', alignItems: 'center', gap: 12,
              transition: 'opacity 120ms ease',
            }}
          >
            {isLast ? "Let's go" : 'Continue'}
            <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
          </button>
          {step.type === 'checkbox-group' && !step.required && (
            <button
              type="button"
              onClick={next}
              style={{
                background: 'transparent', border: 'none', padding: 0,
                fontFamily: fonts.ui, fontSize: 13, color: F.ink2, cursor: 'pointer',
              }}
            >
              Skip for now
            </button>
          )}
        </div>
      </div>

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
      <TopUpModal
        open={topUpOpen}
        onClose={() => setTopUpOpen(false)}
        onSuccess={() => { refreshCredits(); }}
      />
    </div>
  );
}

function CheckboxGroup({ options, value, onToggle }: { options: { label: string; value: string }[]; value: string[]; onToggle: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', borderTop: `1px solid ${F.ink}`, borderBottom: `1px solid ${F.ink}` }}>
      {options.map((opt, i) => {
        const selected = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            style={{
              padding: '14px 4px',
              display: 'grid',
              gridTemplateColumns: '24px 1fr auto',
              alignItems: 'center',
              gap: 12,
              background: 'transparent',
              border: 'none',
              borderTop: i === 0 ? 'none' : `1px solid ${F.hairlineFaint}`,
              textAlign: 'left',
              fontFamily: 'inherit',
              color: 'inherit',
              cursor: 'pointer',
              transition: 'background-color 120ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = F.hover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{
              width: 16, height: 16,
              border: `1px solid ${selected ? F.ink : F.hairline}`,
              background: selected ? F.ink : 'transparent',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {selected && <span style={{ width: 6, height: 6, background: F.surface }} />}
            </span>
            <span style={{ fontFamily: fonts.display, fontSize: 17, color: F.ink }}>{opt.label}</span>
            <span />
          </button>
        );
      })}
    </div>
  );
}

function RadioGroup({ options, value, onPick }: { options: { label: string; value: string }[]; value: string; onPick: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', borderTop: `1px solid ${F.ink}`, borderBottom: `1px solid ${F.ink}` }}>
      {options.map((opt, i) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onPick(opt.value)}
            style={{
              padding: '14px 4px',
              display: 'grid',
              gridTemplateColumns: '24px 1fr auto',
              alignItems: 'center',
              gap: 12,
              background: 'transparent',
              border: 'none',
              borderTop: i === 0 ? 'none' : `1px solid ${F.hairlineFaint}`,
              textAlign: 'left',
              fontFamily: 'inherit',
              color: 'inherit',
              cursor: 'pointer',
              transition: 'background-color 120ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = F.hover; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{
              width: 16, height: 16, borderRadius: '50%',
              border: `1px solid ${selected ? F.accent : F.hairline}`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {selected && <span style={{ width: 8, height: 8, borderRadius: '50%', background: F.accent }} />}
            </span>
            <span style={{ fontFamily: fonts.display, fontSize: 17, color: F.ink }}>{opt.label}</span>
            <span />
          </button>
        );
      })}
    </div>
  );
}

function FileUpload({ value, onChange, step, onSkip }: { value: string | null; onChange: (v: string | null) => void; step: QuestionStep; onSkip: () => void }) {
  return (
    <div>
      <label style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8, height: 140,
        background: F.surface,
        border: `1px dashed ${F.hairline}`,
        cursor: 'pointer',
        transition: 'background-color 120ms ease',
      }}>
        <span style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: '0.22em', color: F.inkMute, textTransform: 'uppercase' }}>
          {value ? 'File selected' : 'Drop or click to upload'}
        </span>
        {value && <Body size="s" color={F.ink2}>{value}</Body>}
        <input
          type="file"
          accept="image/*,.fig,.pdf"
          style={{ display: 'none' }}
          onChange={(e) => onChange(e.target.files?.[0]?.name ?? null)}
        />
      </label>
      {!step.required && !value && (
        <button
          type="button"
          onClick={onSkip}
          style={{
            marginTop: 12,
            background: 'transparent', border: 'none', padding: 0,
            fontFamily: fonts.ui, fontSize: 13, color: F.ink2, cursor: 'pointer',
          }}
        >
          Skip — design from scratch
        </button>
      )}
    </div>
  );
}
