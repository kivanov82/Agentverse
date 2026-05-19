'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useShipWithAIStore } from '@/lib/store';
import { USE_CASES, type UseCaseId } from '@/lib/use-cases';
import { OnboardingOverlay } from '@/components/OnboardingOverlay';
import { TopUpToast } from '@/components/TopUpToast';
import { useCredits } from '@/lib/use-credits';
import { useSession } from 'next-auth/react';
import {
  TopBar,
  LeftRail,
  RightRail,
  PhaseBar,
  type Phase,
  type FolioEntry,
  type WorkshopItem,
  type ResidentAgent,
  type SessionRow,
} from '@/components/foundry';

const DEFAULT_PHASES: Phase[] = [
  { name: 'Discovery',   sub: 'Project brief', state: 'pending' },
  { name: 'Design',      sub: 'Direction',     state: 'pending' },
  { name: 'Development', sub: 'GitHub repo',   state: 'pending' },
  { name: 'Review',      sub: 'Sign-off',      state: 'pending' },
  { name: 'Go Live',     sub: 'Live site',     state: 'pending' },
];

const AUDIT_PHASES: Phase[] = [
  { name: 'Discovery',   sub: 'Project brief',  state: 'pending' },
  { name: 'Methodology', sub: 'Auditor passes', state: 'pending' },
  { name: 'Report',      sub: 'Findings',       state: 'pending' },
  { name: 'Review',      sub: 'Sign-off',       state: 'pending' },
  { name: 'Delivered',   sub: 'PDF & repo',     state: 'pending' },
];

function ago(ts: number): string {
  const d = Math.floor((Date.now() - ts) / 86400000);
  if (d < 1) return `${Math.max(1, Math.floor((Date.now() - ts) / 3600000))}h`;
  return `${d}d`;
}

function initialsFromEmail(email: string | null | undefined): string {
  if (!email) return '?';
  return (email[0] ?? '?').toUpperCase();
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { balance } = useCredits();

  const {
    projects,
    activeProjectId,
    activeUseCase,
    resumeProject,
    loadProjectsFromApi,
    agents,
    activeSession,
    projectPhases,
    sessionCost,
  } = useShipWithAIStore();

  // Hydrate projects from Firestore on mount; resume the most recent one
  // if no session is active (page refresh case).
  useEffect(() => {
    async function hydrate() {
      await loadProjectsFromApi();
      const state = useShipWithAIStore.getState();
      if (!state.activeSession && state.projects.length > 0) {
        await resumeProject(state.projects[0].id);
      }
    }
    hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const useCaseConfig = activeUseCase ? USE_CASES[activeUseCase as UseCaseId] : null;
  const folioLabel = useCaseConfig ? `Folio · ${useCaseConfig.label}` : undefined;

  const folioEntries: FolioEntry[] = useMemo(
    () => projects.map((p) => ({
      id: p.id,
      name: p.name,
      ago: ago(p.createdAt),
      active: p.id === activeProjectId,
    })),
    [projects, activeProjectId]
  );

  const workshop: WorkshopItem[] = [
    { id: 'agents',  label: 'Agents',  active: pathname === '/dashboard',         onClick: () => router.push('/dashboard') },
    { id: 'project', label: 'Project', active: pathname === '/dashboard/project', onClick: () => router.push('/dashboard/project') },
    { id: 'ledger',  label: 'Ledger',  active: false,                              onClick: () => router.push('/dashboard/project#ledger') },
  ];

  const residents: ResidentAgent[] = useMemo(() => {
    const ids = activeSession?.involvedAgents ?? [];
    return ids
      .map((id) => agents.find((a) => a.id === id))
      .filter((a): a is NonNullable<typeof a> => Boolean(a))
      .map((a) => ({
        id: a.id,
        initials: a.avatar,
        name: a.name,
        role: a.role,
        state: a.status === 'idle' ? 'standing by' : a.status,
        online: a.status === 'thinking' || a.status === 'working',
      }));
  }, [activeSession, agents]);

  const sessionRows: SessionRow[] = [
    { label: 'Spend',   value: sessionCost > 0 ? `$${sessionCost.toFixed(2)}` : '$0.00' },
    { label: 'Tokens',  value: '—' },
    { label: 'Started', value: activeSession ? new Date(activeSession.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—' },
  ];

  const phases: Phase[] = useMemo(() => {
    if (!projectPhases.length) {
      return activeUseCase === 'solidity-audit' ? AUDIT_PHASES : DEFAULT_PHASES;
    }
    return projectPhases.map((p) => ({
      name: p.name,
      sub: p.deliverable?.label ?? '',
      state: p.status,
    }));
  }, [projectPhases, activeUseCase]);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface)',
      color: 'var(--ink)',
      overflow: 'hidden',
    }}>
      <a href="#workspace" className="skip-link">Skip to workspace</a>

      <TopBar folioLabel={folioLabel} live={residents.some((r) => r.online)} />

      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '240px 1fr 280px',
        minHeight: 0,
      }}>
        <LeftRail
          accountInitial={initialsFromEmail(session?.user?.email)}
          balanceUSDC={balance ?? 0}
          walletShort={session?.user?.email ? truncateWallet(session.user.email) : undefined}
          onTopUp={() => router.push('/dashboard/project#topup')}
          folios={folioEntries}
          onSelectFolio={(id) => resumeProject(id)}
          onNewFolio={() => router.push('/')}
          workshop={workshop}
        />
        <div id="workspace" style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
        <RightRail agents={residents} session={sessionRows} />
      </div>

      <PhaseBar phases={phases} />

      <OnboardingOverlay />
      <TopUpToast />
    </div>
  );
}

function truncateWallet(s: string): string {
  if (s.length <= 10) return s;
  return `${s.slice(0, 4)}…${s.slice(-4)}`;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
