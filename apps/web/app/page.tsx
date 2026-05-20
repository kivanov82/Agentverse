'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { SignInModal } from '@/components/SignInModal';
import {
  Masthead,
  Hero,
  Offerings,
  InProgress,
  Colophon,
  type Commission,
  type Folio,
} from '@/components/foundry';
import { USE_CASES, type UseCaseId } from '@/lib/use-cases';
import { useShipWithAIStore } from '@/lib/store';

// SPEC §4.3 — the public commissions. Two for launch: Solidity Audit, SEO.
const COMMISSIONS: Commission[] = [
  {
    id: 'solidity-audit',
    href: '/onboard?uc=solidity-audit',
    roman: 'I',
    title: USE_CASES['solidity-audit'].label,
    description: 'Three methodologies; one verdict. Audit your smart contracts before they ship.',
    scope: 'Feynman · Nemesis · State',
    lead: 'Security Auditor',
    turnaround: '≈ 48h · 0.25 USDC',
  },
  {
    id: 'seo',
    href: '/onboard?uc=seo',
    roman: 'II',
    title: USE_CASES['seo'].label,
    description: "Technical sweep, content rewrite, schema. Earn page one — or learn why you can't.",
    scope: 'Technical · Content · Schema',
    lead: 'Growth Analyst',
    turnaround: '≈ 72h · 0.40 USDC',
  },
];

interface RecentProject {
  id: string;
  name: string;
  description?: string;
  status: string;
  metadata?: { useCaseId?: string; agents?: string[]; totalSpentUSD?: number };
  createdAt: number;
  updatedAt: number;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'opened just now';
  if (mins < 60) return `opened ${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `opened ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `opened ${days}d ago`;
}

function statusLabel(status: string): string {
  switch (status) {
    case 'planning':  return 'discovery phase';
    case 'active':    return 'design phase';
    case 'review':    return 'review phase';
    case 'completed': return 'delivered';
    default:          return status;
  }
}

function statusSignal(status: string): 'live' | 'mute' {
  return status === 'active' || status === 'planning' ? 'live' : 'mute';
}

export default function LandingPage() {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === 'authenticated';
  const { resumeProject } = useShipWithAIStore();
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { setRecentProjects([]); return; }
    fetch('/api/projects?scope=mine&limit=5')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.projects?.length) setRecentProjects(data.projects);
        else setRecentProjects([]);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const goCommission = (id: string) => router.push(`/onboard?uc=${id as UseCaseId}`);

  const onResume = async (id: string) => {
    await resumeProject(id);
    router.push('/dashboard');
  };

  const folios: Folio[] = recentProjects.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status === 'planning' || p.status === 'active' ? 'awaiting your reply' : statusLabel(p.status),
    opened: timeAgo(p.updatedAt),
    amount: typeof p.metadata?.totalSpentUSD === 'number'
      ? `$${p.metadata.totalSpentUSD.toFixed(2)}`
      : '—',
    signal: statusSignal(p.status),
    awaitingReply: p.status === 'planning' || p.status === 'active',
  }));

  const scrollToCommissions = () => {
    const el = document.getElementById('commissions');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{
      width: 1440,
      margin: '0 auto',
      background: 'var(--surface)',
      color: 'var(--ink)',
      minHeight: '100vh',
    }}>
      <a href="#commissions" className="skip-link">Skip to commissions</a>

      <Masthead />
      <Hero
        onBrief={() => goCommission('solidity-audit')}
        onBrowse={scrollToCommissions}
      />
      <Offerings commissions={COMMISSIONS} onCommission={goCommission} />

      {isAuthenticated && folios.length > 0 && (
        <InProgress folios={folios} onOpen={onResume} />
      )}

      {!isAuthenticated && (
        <section style={{ padding: '56px 96px 0' }}>
          <button
            type="button"
            onClick={() => setSignInOpen(true)}
            style={{
              width: '100%',
              textAlign: 'left',
              background: 'transparent',
              border: 'none',
              borderTop: '1px solid var(--hairline-faint)',
              padding: '18px 0',
              cursor: 'pointer',
              fontFamily: 'inherit',
              color: 'var(--ink-2)',
              fontSize: 13,
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
              Sign in
            </span>
            <span style={{ marginLeft: 14 }}>to resume an open folio</span>
            <span style={{ marginLeft: 8, color: 'var(--accent)' }}>→</span>
          </button>
        </section>
      )}

      <Colophon />
      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </div>
  );
}
