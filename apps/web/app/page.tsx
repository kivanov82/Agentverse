'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { SignInModal } from '@/components/SignInModal';
import {
  LandingTopBar,
  Hero,
  Offerings,
  type Commission,
} from '@/components/foundry';
import { USE_CASES, type UseCaseId } from '@/lib/use-cases';
import { useShipWithAIStore } from '@/lib/store';

// SPEC v3 §C.4 — public commissions. Two at launch.
const COMMISSIONS: Commission[] = [
  {
    id: 'solidity-audit',
    href: '/onboard?uc=solidity-audit',
    roman: 'I',
    title: USE_CASES['solidity-audit'].label,
    description: 'Three methodologies; one verdict. Audit your smart contracts before they ship.',
    lead: 'Security Auditor',
    turnaround: '≈ 48h',
    from: '$0.25 USDC',
  },
  {
    id: 'seo',
    href: '/onboard?uc=seo',
    roman: 'II',
    title: USE_CASES['seo'].label,
    description: "Technical sweep, content rewrite, schema. Earn page one — or learn why you can't.",
    lead: 'Growth Analyst',
    turnaround: '≈ 72h',
    from: '$0.40 USDC',
  },
];

interface RecentProject {
  id: string;
  name: string;
  status: string;
  updatedAt: number;
}

export default function LandingPage() {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === 'authenticated';
  const { resumeProject } = useShipWithAIStore();
  const [openFolio, setOpenFolio] = useState<RecentProject | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { setOpenFolio(null); return; }
    fetch('/api/projects?scope=mine&limit=1')
      .then((r) => r.json())
      .then((data) => {
        const p = data?.projects?.[0];
        setOpenFolio(p ? { id: p.id, name: p.name, status: p.status, updatedAt: p.updatedAt } : null);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const goCommission = (id: string) => router.push(`/onboard?uc=${id as UseCaseId}`);

  const scrollToCommissions = () => {
    const el = document.getElementById('commissions');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onResumeFolio = async () => {
    if (!openFolio) return;
    await resumeProject(openFolio.id);
    router.push('/dashboard');
  };

  const handleAuth = () => {
    if (isAuthenticated) router.push('/dashboard');
    else setSignInOpen(true);
  };

  return (
    <div
      style={{
        width: 1440,
        height: '100vh',
        minHeight: 900,
        maxHeight: '100vh',
        margin: '0 auto',
        background: 'var(--surface)',
        color: 'var(--ink)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <a href="#commissions" className="skip-link">Skip to commissions</a>

      <LandingTopBar
        nav={[
          { label: 'How it works', onClick: scrollToCommissions },
          { label: 'Pricing',      onClick: scrollToCommissions },
        ]}
        isAuthenticated={isAuthenticated}
        authLabel={isAuthenticated ? 'Open workspace' : 'Sign in'}
        onAuth={handleAuth}
      />

      <Hero
        onBrief={() => goCommission('solidity-audit')}
        onBrowse={scrollToCommissions}
        resumePrompt={openFolio ? { onClick: onResumeFolio, folioName: openFolio.name } : undefined}
      />

      <Offerings
        commissions={COMMISSIONS}
        onCommission={goCommission}
        aside="Two ready · more next month"
      />

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </div>
  );
}
