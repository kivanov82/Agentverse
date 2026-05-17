'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useShipWithAIStore } from '@/lib/store';
import { runDemoSimulation } from '@/lib/demo';
import { Logo } from '@/components/Logo';
import { UserMenu } from '@/components/UserMenu';
import { OnboardingOverlay } from '@/components/OnboardingOverlay';
import { TopUpToast } from '@/components/TopUpToast';
import { ObservatoryModal } from '@/components/ObservatoryModal';
import { ConstellationBackground } from '@/components/ConstellationBackground';
import { CursorTrail } from '@/components/CursorTrail';
import {
  Play,
  FolderOpen,
  Plus,
  CheckCircle2,
  Clock,
  CircleDot,
  CircuitBoard,
  FileText,
  Eye,
} from 'lucide-react';
import Link from 'next/link';

function DashboardShell({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const mode = searchParams.get('mode');

  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [observatoryOpen, setObservatoryOpen] = useState(false);
  const {
    projects,
    activeProjectId,
    activeUseCase,
    resumeProject,
    loadProjectsFromApi,
  } = useShipWithAIStore();

  const isUseCaseMode = !!activeUseCase;

  // Hydrate projects from Firestore on mount, and resume the latest one
  useEffect(() => {
    async function hydrate() {
      await loadProjectsFromApi();
      const state = useShipWithAIStore.getState();
      // If no active session (e.g. page refresh), resume the most recent project
      if (!state.activeSession && state.projects.length > 0) {
        await resumeProject(state.projects[0].id);
      }
    }
    hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-run demo if mode=demo
  useEffect(() => {
    if (mode === 'demo' && !isRunningDemo) {
      handleRunDemo();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleRunDemo = async () => {
    setIsRunningDemo(true);
    try {
      await runDemoSimulation();
    } finally {
      setIsRunningDemo(false);
    }
  };

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-3 h-3 text-brand-500" />;
      case 'active':
        return <CircleDot className="w-3 h-3 text-white" />;
      case 'review':
        return <Clock className="w-3 h-3 text-brand-400" />;
      default:
        return <Clock className="w-3 h-3 text-zinc-600" />;
    }
  };

  const isAgentsPage = pathname === '/dashboard';
  const isProjectPage = pathname === '/dashboard/project';

  return (
    <div className="h-screen flex flex-col bg-[#07070a] relative overflow-hidden">
      {/* Observatory: animated constellation behind everything */}
      <ConstellationBackground density="high" className="opacity-80 z-0" />

      {/* Ambient mesh wash (sits above constellation, gives color depth) */}
      <div className="absolute inset-0 pointer-events-none z-[1] bg-observatory opacity-70" />

      {/* Film grain */}
      <div className="absolute inset-0 bg-noise pointer-events-none z-[2]" />

      {/* Subtle scanlines */}
      <div className="absolute inset-0 scanlines pointer-events-none z-[2] opacity-60" />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none z-[2]" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)' }} />

      {/* Global Top Bar */}
      <header className="border-b border-white/[0.06] bg-[#07070a]/80 backdrop-blur-md grid grid-cols-[1fr_auto_1fr] items-center px-5 relative z-20 shrink-0" style={{ height: '52px' }}>
        <Link href="/" className="flex items-center justify-self-start">
          <Logo variant="full" size={28} />
        </Link>
        <nav className="flex items-center gap-6 justify-self-center">
          <button
            onClick={() => setObservatoryOpen(true)}
            className={`group relative flex items-center gap-1.5 py-1.5 text-[12px] font-medium transition-colors ${
              observatoryOpen
                ? 'text-brand-400'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Observatory</span>
            <span className={`absolute -bottom-1 left-0 right-0 h-px bg-brand-500 transition-opacity ${observatoryOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`} />
          </button>
        </nav>
        <div className="justify-self-end flex items-center gap-2">
          <span className="hidden md:flex items-center gap-1.5 text-[11px] text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            Live
          </span>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 relative">

      {/* Left Sidebar */}
      <aside className="w-52 border-r border-white/[0.05] flex flex-col hidden md:flex relative z-30 bg-[#08080b]/80 backdrop-blur-md">
        {/* Account */}
        <div className="p-3 border-b border-zinc-800/60 wallet-button">
          <UserMenu compact />
        </div>

        {/* Projects */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-medium">
                Projects
              </span>
              <button className="p-1 hover:bg-zinc-800/60 rounded-md transition-colors">
                <Plus className="w-3 h-3 text-zinc-600" />
              </button>
            </div>
            <div className="space-y-0.5">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => resumeProject(project.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-left ${
                    activeProjectId === project.id
                      ? 'bg-zinc-800/80 text-zinc-100'
                      : 'hover:bg-zinc-800/40 text-zinc-400'
                  }`}
                >
                  <FolderOpen className={`w-3 h-3 shrink-0 ${
                    activeProjectId === project.id ? 'text-zinc-300' : 'text-zinc-600'
                  }`} />
                  <span className="flex-1 text-[11px] font-medium truncate">
                    {project.name}
                  </span>
                  {getStatusIcon(project.status)}
                </button>
              ))}
            </div>
          </div>

          {/* Workspace */}
          <div className="p-2 border-t border-zinc-800/60">
            <div className="px-2 py-1.5 mb-1">
              <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-medium">
                Workspace
              </span>
            </div>
            <Link
              href="/dashboard"
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left ${
                isAgentsPage
                  ? 'bg-zinc-800/80 text-zinc-100'
                  : 'hover:bg-zinc-800/40 text-zinc-500'
              }`}
            >
              <CircuitBoard className={`w-3.5 h-3.5 ${isAgentsPage ? 'text-brand-500' : 'text-zinc-600'}`} />
              <span className="text-[11px] font-medium">Agents</span>
            </Link>
            <Link
              href="/dashboard/project"
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left ${
                isProjectPage
                  ? 'bg-zinc-800/80 text-zinc-100'
                  : 'hover:bg-zinc-800/40 text-zinc-500'
              }`}
            >
              <FileText className={`w-3.5 h-3.5 ${isProjectPage ? 'text-brand-500' : 'text-zinc-600'}`} />
              <span className="text-[11px] font-medium">Project</span>
            </Link>
          </div>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Mobile Header */}
        <header className="md:hidden border-b border-zinc-800/60 p-3 flex items-center justify-between bg-[#0a0a0d]/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            {/* Mobile nav tabs */}
            <Link
              href="/dashboard"
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                isAgentsPage ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500'
              }`}
            >
              Agents
            </Link>
            <Link
              href="/dashboard/project"
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                isProjectPage ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500'
              }`}
            >
              Project
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <UserMenu />
            <button
              onClick={handleRunDemo}
              disabled={isRunningDemo}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-400 disabled:bg-zinc-700 text-zinc-950 rounded-sm text-xs font-semibold shadow-lg shadow-brand-900/20"
            >
              {isRunningDemo ? (
                <div className="w-3.5 h-3.5 border-2 border-zinc-700 border-t-zinc-950 rounded-full animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              {isRunningDemo ? 'Running' : 'Demo'}
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 min-h-0">
          {children}
        </div>
      </main>

      </div>

      {/* Onboarding overlay */}
      <OnboardingOverlay />

      {/* Top-up redirect feedback */}
      <TopUpToast />

      {/* Observatory modal — global overlay from top bar */}
      <ObservatoryModal open={observatoryOpen} onClose={() => setObservatoryOpen(false)} />

      {/* Ambient cursor trail — signature wow detail */}
      <CursorTrail />
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
