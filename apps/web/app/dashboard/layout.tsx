'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useShipWithAIStore } from '@/lib/store';
import { USE_CASES, type UseCaseId } from '@/lib/use-cases';
import { TopUpToast } from '@/components/TopUpToast';
import { SignInModal } from '@/components/SignInModal';
import { TopUpModal } from '@/components/TopUpModal';
import { useCredits } from '@/lib/use-credits';
import {
  TopBar,
  LeftRail,
  RightRail,
  PhaseBar,
  type Phase,
  type FolioEntry,
  type ResidentAgent,
  type SessionRow,
  type WorkspaceTab,
} from '@/components/foundry';

const DEFAULT_PHASE_NAMES = ['Discovery', 'Design', 'Build',       'Review', 'Deliver'];
const AUDIT_PHASE_NAMES   = ['Discovery', 'Audit',  'Report',      'Review', 'Deliver'];

type ProjectStatus = 'planning' | 'active' | 'review' | 'completed' | string;

function derivePhases(useCase: string | null, status: ProjectStatus | undefined): Phase[] {
  const names = useCase === 'solidity-audit' ? AUDIT_PHASE_NAMES : DEFAULT_PHASE_NAMES;
  let activeIdx = -1;
  switch (status) {
    case 'planning':  activeIdx = 0; break;
    case 'active':    activeIdx = 1; break;
    case 'review':    activeIdx = 3; break;
    case 'completed': activeIdx = names.length; break;
    default:          activeIdx = status ? 0 : -1;
  }
  return names.map((name, i) => ({
    name,
    state: i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'pending',
  }));
}

function ago(ts: number): string {
  const d = Math.floor((Date.now() - ts) / 86400000);
  if (d < 1) return `${Math.max(1, Math.floor((Date.now() - ts) / 3600000))}h`;
  return `${d}d`;
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === 'authenticated';
  const { balance, refresh: refreshBalance } = useCredits();
  const [signInOpen, setSignInOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);

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
  const folioName = useCaseConfig?.label;

  const folioEntries: FolioEntry[] = useMemo(
    () => projects.map((p) => ({
      id: p.id,
      name: p.name,
      ago: ago(p.createdAt),
      active: p.id === activeProjectId,
      awaitingReply: (p.status === 'planning' || p.status === 'active') && p.id !== activeProjectId,
    })),
    [projects, activeProjectId]
  );

  // Workspace top-tab nav (Observatory / Project / Files / Ledger).
  // Ledger + Files don't have routes yet — they're disabled placeholders
  // wired to scroll to a hash on the project page until those surfaces ship.
  const tabs: WorkspaceTab[] = [
    { id: 'observatory', label: 'Observatory', active: pathname === '/dashboard',         onClick: () => router.push('/dashboard') },
    { id: 'project',     label: 'Project',     active: pathname === '/dashboard/project', onClick: () => router.push('/dashboard/project') },
    { id: 'files',       label: 'Files',       active: false,                              onClick: () => router.push('/dashboard/project#deliverables') },
    { id: 'ledger',      label: 'Ledger',      active: false,                              onClick: () => router.push('/dashboard/project#ledger') },
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
    if (projectPhases.length) {
      return projectPhases.map((p) => ({ name: p.name, state: p.status }));
    }
    return derivePhases(activeUseCase, activeProject?.status);
  }, [projectPhases, activeUseCase, activeProject?.status]);

  const accountInitial = (session?.user?.email?.[0] ?? '?').toUpperCase();
  const accountLabel = !isAuthenticated ? 'Sign in →' : `Account · ${accountInitial}`;
  const onAccount = !isAuthenticated
    ? () => setSignInOpen(true)
    : () => { if (window.confirm('Sign out?')) signOut(); };

  const onAsk = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;
    window.dispatchEvent(new CustomEvent('shipwithai:ask', { detail: { agentId, agentName: agent.name } }));
  };

  return (
    <div style={{
      width: 1440,
      height: '100vh',
      maxHeight: '100vh',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface)',
      color: 'var(--ink)',
      overflow: 'hidden',
    }}>
      <a href="#workspace" className="skip-link">Skip to workspace</a>

      <TopBar
        folioName={folioName}
        onFoliosClick={() => router.push('/')}
        tabs={tabs}
        live={residents.some((r) => r.online)}
      />

      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '240px 1fr 280px',
        minHeight: 0,
      }}>
        <LeftRail
          accountInitial={accountInitial}
          accountLabel={accountLabel}
          balanceUSDC={balance ?? 0}
          onTopUp={isAuthenticated ? () => setTopUpOpen(true) : () => setSignInOpen(true)}
          onAccount={onAccount}
          folios={folioEntries}
          onSelectFolio={(id) => resumeProject(id)}
          onNewFolio={() => router.push('/')}
          onSettings={() => router.push('/dashboard/project')}
        />
        <div id="workspace" style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
        <RightRail
          agents={residents}
          session={sessionRows}
          onAsk={onAsk}
          onViewReport={() => router.push('/dashboard/project')}
        />
      </div>

      <PhaseBar phases={phases} />

      <TopUpToast />
      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
      <TopUpModal open={topUpOpen} onClose={() => setTopUpOpen(false)} onSuccess={refreshBalance} />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
