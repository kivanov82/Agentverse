'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { SignInModal } from '@/components/SignInModal';
import { ConstellationBackground } from '@/components/ConstellationBackground';
import { CursorTrail } from '@/components/CursorTrail';
import {
  Search,
  Globe,
  Smartphone,
  ShoppingCart,
  ShieldCheck,
  ArrowRight,
  FolderOpen,
  Clock,
  LogIn,
} from 'lucide-react';
import { USE_CASE_LIST } from '@/lib/use-cases';
import { useShipWithAIStore } from '@/lib/store';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Search,
  Globe,
  Smartphone,
  ShoppingCart,
  ShieldCheck,
};

const CARD_STYLE = {
  bg: 'bg-zinc-900/40',
  iconBg: 'bg-zinc-900/80',
  iconColor: 'text-zinc-400 group-hover:text-brand-500',
  border: 'border-zinc-800/70',
  hoverBorder: 'hover:border-brand-500/50',
  shadow: 'group-hover:shadow-brand-500/10',
};

interface RecentProject {
  id: string;
  name: string;
  description?: string;
  status: string;
  metadata?: { useCaseId?: string; agents?: string[] };
  createdAt: number;
  updatedAt: number;
}

export default function WelcomePage() {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === 'authenticated';
  const { resumeProject } = useShipWithAIStore();
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setRecentProjects([]);
      return;
    }
    fetch('/api/projects?scope=mine&limit=5')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.projects?.length) {
          setRecentProjects(data.projects);
        } else {
          setRecentProjects([]);
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const handleResumeProject = async (project: RecentProject) => {
    await resumeProject(project.id);
    router.push('/dashboard');
  };

  const formatTimeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="h-screen bg-mesh bg-noise flex flex-col relative overflow-hidden">
      {/* Observatory: constellation BG behind everything */}
      <ConstellationBackground density="high" className="opacity-60 z-0" />

      {/* Floating ambient orbs — teal top-left, orange bottom-right */}
      <div className="absolute top-[-10%] left-[12%] w-[520px] h-[380px] bg-teal-500/[0.07] rounded-full blur-3xl pointer-events-none aurora-drift" />
      <div className="absolute bottom-[-5%] right-[10%] w-[560px] h-[400px] bg-brand-500/[0.10] rounded-full blur-3xl pointer-events-none aurora-drift" style={{ animationDelay: '-7s' }} />

      {/* Scan lines overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none z-[2]" />

      {/* Header — editorial with mono tagline */}
      <motion.header
        className="flex items-center justify-between px-8 pt-5 pb-3 relative z-10 shrink-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Logo variant="full" size={30} />
      </motion.header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-3 relative z-10 min-h-0">
        <div className="max-w-4xl mx-auto text-center mb-6 shrink-0 relative">
          <motion.h1
            className="font-editorial text-white mb-3 leading-[0.92] tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="block text-5xl md:text-6xl lg:text-7xl font-normal">
              What do you want
            </span>
            <span className="block text-5xl md:text-6xl lg:text-7xl italic text-brand-500 mt-1 relative">
              to build
              <span className="text-white not-italic font-editorial">?</span>
              <span className="absolute -right-3 top-1 w-2 h-2 rounded-full bg-brand-500 blur-[2px] twinkle" />
            </span>
          </motion.h1>

          <motion.p
            className="text-sm md:text-base text-zinc-400 max-w-lg mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            Describe your vision. <span className="text-brand-400 font-medium">A constellation of AI specialists</span> designs, builds, and ships it.
          </motion.p>
        </div>

        {/* Use Case Cards — 3-col grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-4xl w-full px-4 shrink-0">
          {USE_CASE_LIST.map((uc, index) => {
            const Icon = ICONS[uc.icon] || Search;
            const num = String(index + 1).padStart(2, '0');
            return (
              <motion.button
                key={uc.id}
                onClick={() => router.push(`/onboard?uc=${uc.id}`)}
                className="group relative flex flex-col p-4 border border-white/[0.06] bg-[#0a0a10]/60 backdrop-blur-md hover:bg-[#0f0f16]/80 hover:border-brand-500/40 transition-all text-left overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.4 + index * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {/* hover gradient wash */}
                <span className="absolute inset-0 bg-gradient-to-br from-brand-500/0 via-transparent to-teal-500/0 group-hover:from-brand-500/[0.04] group-hover:to-teal-500/[0.04] transition-all" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-8 h-8 bg-[#14141a]/80 flex items-center justify-center border border-white/[0.06] group-hover:border-brand-500/50 transition-colors">
                      <Icon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-brand-400 transition-colors" />
                    </div>
                    <span className="font-editorial italic text-lg text-zinc-700 group-hover:text-brand-500 transition-colors leading-none">
                      {num}
                    </span>
                  </div>
                  <h2 className="text-lg font-editorial text-white leading-[1.05] mb-1.5">
                    {uc.label}
                  </h2>
                  <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">
                    {uc.tagline}
                  </p>
                  <div className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-600 group-hover:text-brand-400 transition-colors">
                    <span className="h-px w-4 bg-current" />
                    <span>Commission</span>
                    <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </motion.button>
            );
          })}

        </div>

        {/* Continue your project — always visible, CTA varies by auth state */}
        <motion.div
          className="max-w-3xl w-full px-4 mt-3 shrink-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Clock className="w-2.5 h-2.5 text-zinc-600" />
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-[0.2em]">
              Continue your project
            </span>
            <span className="h-px flex-1 bg-zinc-800/60" />
          </div>
          {!isAuthenticated ? (
            <button
              onClick={() => setSignInOpen(true)}
              className="group w-full flex items-center gap-2 px-2.5 py-1.5 border border-zinc-800/40 bg-zinc-900/20 hover:bg-zinc-900/50 hover:border-brand-500/30 transition-all text-left"
            >
              <LogIn className="w-3 h-3 text-zinc-600 group-hover:text-brand-500 transition-colors shrink-0" />
              <span className="text-xs text-zinc-300 group-hover:text-white transition-colors truncate flex-1">
                Sign in to resume your projects
              </span>
              <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ) : recentProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
              {recentProjects.slice(0, 3).map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleResumeProject(project)}
                  className="group w-full flex items-center gap-2 px-2.5 py-1.5 border border-zinc-800/40 bg-zinc-900/20 hover:bg-zinc-900/50 hover:border-brand-500/30 transition-all text-left"
                >
                  <FolderOpen className="w-3 h-3 text-zinc-600 group-hover:text-brand-500 transition-colors shrink-0" />
                  <span className="text-xs text-zinc-300 group-hover:text-white transition-colors truncate flex-1">
                    {project.name}
                  </span>
                  <span className="font-mono text-[9px] text-zinc-600 shrink-0 tracking-wider">
                    {formatTimeAgo(project.updatedAt)}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="w-full px-2.5 py-1.5 border border-dashed border-zinc-800/40 bg-zinc-900/10">
              <span className="text-[11px] text-zinc-500">
                No projects yet — pick a use case above to start your first one.
              </span>
            </div>
          )}
        </motion.div>
      </main>

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />

      {/* Footer */}
      <motion.div
        className="pb-3 pt-2 text-center shrink-0 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <p className="font-mono text-[9px] text-zinc-600 tracking-[0.22em] uppercase">
          <span className="text-teal-400">◆</span>&nbsp;&nbsp;AI agents&nbsp;&nbsp;<span className="text-zinc-700">/</span>&nbsp;&nbsp;your project, your code, your repo&nbsp;&nbsp;<span className="text-zinc-700">/</span>&nbsp;&nbsp;
          <span className="text-brand-500 font-medium">shipwithai.nl</span>
        </p>
      </motion.div>

      <CursorTrail />
    </div>
  );
}
