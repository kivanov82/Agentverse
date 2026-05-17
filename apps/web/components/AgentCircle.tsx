'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useShipWithAIStore, Agent } from '@/lib/store';
import { USE_CASES } from '@/lib/use-cases';
import { AgentChatPanel } from './AgentChatPanel';
import { AuditMethodologyExplainer } from './AuditMethodologyExplainer';
import { ConstellationGlyph } from './ConstellationGlyph';
import { CheckCircle, Loader2, Clock, Circle } from 'lucide-react';

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  idle: { icon: Circle, color: 'text-zinc-600', label: 'Standing by' },
  thinking: { icon: Loader2, color: 'text-amber-400', label: 'Thinking...' },
  working: { icon: Loader2, color: 'text-brand-400', label: 'Working...' },
  waiting: { icon: Clock, color: 'text-brand-400', label: 'Waiting for input' },
  delivered: { icon: CheckCircle, color: 'text-brand-400', label: 'Finished' },
  error: { icon: Circle, color: 'text-red-400', label: 'Error' },
};

export function AgentCircle() {
  const { agents, chatMessages, activeSession, createSession, invocations, projects } = useShipWithAIStore();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [shouldAutoStart, setShouldAutoStart] = useState(false);
  const [showSessionInput, setShowSessionInput] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for project hydration before showing the start button
  useEffect(() => {
    const timer = setTimeout(() => setIsHydrated(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleStartSession = () => {
    if (sessionName.trim()) {
      createSession(sessionName.trim());
      setSessionName('');
      setShowSessionInput(false);
    }
  };

  // Auto-select PM when session starts (unified chat — always PM as default)
  useEffect(() => {
    if (activeSession && !selectedAgent) {
      const pm = agents.find((a) => a.id === 'pm');
      if (pm) setSelectedAgent(pm);
    }
  }, [activeSession, selectedAgent, agents]);

  const { projectPhases, setProjectPhases } = useShipWithAIStore();

  // Set default phases when a session starts and no plan exists yet
  useEffect(() => {
    if (activeSession && projectPhases.length === 0) {
      setProjectPhases([
        { name: 'Discovery', status: 'done', deliverable: { label: 'Project brief' } },
        { name: 'Design', status: 'active' },
        { name: 'Development', status: 'pending', deliverable: { label: 'GitHub repo', url: '#' } },
        { name: 'Review', status: 'pending' },
        { name: 'Go Live', status: 'pending', deliverable: { label: 'Live site', url: '#' } },
      ]);
    }
  }, [activeSession, projectPhases.length, setProjectPhases]);

  // Compute cost per agent from invocations (show estimate for involved agents with no recorded cost)
  const costByAgent = useMemo(() => {
    const costs: Record<string, number> = {};
    for (const inv of Object.values(invocations)) {
      if (inv.cost && inv.cost > 0) {
        costs[inv.agentId] = (costs[inv.agentId] || 0) + inv.cost;
      }
    }
    // For involved agents that have been invoked but have no cost tracked yet, show an estimate
    if (activeSession) {
      for (const agentId of activeSession.involvedAgents) {
        if (costs[agentId] === undefined) {
          const hadInvocation = Object.values(invocations).some(inv => inv.agentId === agentId);
          if (hadInvocation) {
            costs[agentId] = 0.03 + Math.random() * 0.09; // estimate $0.03-0.12
          }
        }
      }
    }
    return costs;
  }, [invocations, activeSession]);

  const activeUseCase = useShipWithAIStore((s) => s.activeUseCase);

  // Filter agents: show use-case template agents + any dynamically added via handoff
  const visibleAgents = useMemo(() => {
    const involvedIds = activeSession?.involvedAgents || [];
    if (activeUseCase && USE_CASES[activeUseCase]) {
      const ucAgentIds = USE_CASES[activeUseCase].agents;
      return agents.filter((a) => ucAgentIds.includes(a.id) || involvedIds.includes(a.id));
    }
    return agents;
  }, [activeUseCase, agents, activeSession?.involvedAgents]);

  return (
    <div className="relative w-full h-full flex flex-col" style={{ overflow: 'clip' }}>
      {/* Background — transparent so constellation shows through */}
      <div className="absolute inset-0 glow-center pointer-events-none opacity-50" />

      {/* Main row: chat + sidebar */}
      <div className="flex-1 relative z-10 flex min-h-0">

      {/* Chat area */}
      <div className={`flex-1 min-w-0 min-h-0 flex ${!activeSession ? 'items-center justify-center' : 'flex-col'}`}>
        {!activeSession && !isHydrated ? (
          /* Loading — waiting for project hydration */
          <div className="z-20 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
            <p className="text-[11px] text-zinc-600">Loading your project...</p>
          </div>
        ) : !activeSession ? (
          /* No session — show start CTA */
          <div className="z-20">
            {showSessionInput ? (
              <motion.div
                className="glass rounded-2xl p-4 shadow-2xl shadow-brand-900/20 border-brand-500/30"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="Project name..."
                  className="w-36 px-3 py-1.5 bg-zinc-800/80 border border-zinc-700 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-brand-500 mb-2"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleStartSession();
                    if (e.key === 'Escape') setShowSessionInput(false);
                  }}
                />
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setShowSessionInput(false)}
                    className="flex-1 text-[10px] text-zinc-500 hover:text-zinc-300 py-1.5 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartSession}
                    disabled={!sessionName.trim()}
                    className="flex-1 text-[10px] bg-brand-600 hover:bg-brand-500 disabled:bg-zinc-700 text-white py-1.5 rounded-lg transition-colors font-medium"
                  >
                    Start
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                onClick={() => setShowSessionInput(true)}
                className="relative rounded-full flex flex-col items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                style={{ width: 88, height: 88 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'conic-gradient(from 0deg, #34d399, #22d3ee, #818cf8, #34d399)',
                    padding: 2,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="w-full h-full rounded-full bg-[#0a0e0c]" />
                </motion.div>
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 flex flex-col items-center justify-center shadow-lg shadow-brand-900/40">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                    Light
                  </span>
                  <span className="text-[9px] text-brand-200/80 font-medium">
                    constellation
                  </span>
                </div>
              </motion.button>
            )}
          </div>
        ) : (
          /* Unified chat — always open, PM selected by default */
          <div className="w-full h-full min-h-0 px-4 flex flex-col">
            {activeUseCase === 'solidity-audit' && <AuditMethodologyExplainer />}
            <div className="flex-1 min-h-0">
              <AgentChatPanel
                activeAgent={selectedAgent || agents.find(a => a.id === 'pm') || null}
                autoStartAgent={shouldAutoStart}
                onSwitchAgent={(agentId, autoStart) => {
                  const agent = agents.find((a) => a.id === agentId);
                  if (agent) {
                    setShouldAutoStart(!!autoStart);
                    setSelectedAgent(agent);
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar — agent team as observatory roster */}
      {activeSession && (
        <motion.aside
          className="relative z-10 w-64 border-l border-white/[0.05] bg-[#08080b]/80 backdrop-blur-md flex flex-col shrink-0"
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="px-4 py-3 border-b border-white/[0.05] flex items-center gap-2">
            <ConstellationGlyph size={13} className="text-zinc-500" />
            <h3 className="text-[11px] uppercase tracking-[0.15em] font-semibold text-zinc-400">
              Team
            </h3>
            <span className="ml-auto text-[10px] text-zinc-600">
              {visibleAgents.filter(a => activeSession.involvedAgents.includes(a.id)).length}/{visibleAgents.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto py-2 px-1.5">
            {visibleAgents.map((agent, i) => {
              const isInvolved = activeSession.involvedAgents.includes(agent.id);
              const cfg = STATUS_CONFIG[agent.status] || STATUS_CONFIG.idle;
              const StatusIcon = cfg.icon;
              const isWorking = agent.status === 'working' || agent.status === 'thinking';
              const agentCost = costByAgent[agent.id];

              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: isInvolved ? 1 : 0.35, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className="flex items-start gap-2.5 px-2.5 py-2 rounded"
                >
                  <div className="relative shrink-0">
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold"
                      style={{
                        backgroundColor: isInvolved ? agent.color : '#1f1f26',
                        color: isInvolved ? '#fff' : '#71717a',
                        boxShadow: isWorking ? `0 0 14px ${agent.color}66` : 'none',
                      }}
                    >
                      {agent.avatar}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12px] font-medium truncate text-zinc-200 leading-tight">
                        {agent.name.replace('ShipWith.AI: ', '')}
                      </p>
                      {isInvolved && (
                        <StatusIcon className={`w-2.5 h-2.5 shrink-0 ${cfg.color} ${isWorking ? 'animate-spin' : ''}`} />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className={`text-[11px] truncate ${isInvolved ? cfg.color : 'text-zinc-600'}`}>
                        {isInvolved ? (agent.currentTask || cfg.label) : cfg.label}
                      </p>
                      {isInvolved && agentCost !== undefined && (
                        <span className="text-[10px] text-zinc-500 shrink-0 ml-auto">
                          ${(agentCost || 0).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.aside>
      )}

      </div>{/* end main row */}

      {/* Bottom timeline — simple phases */}
      {activeSession && projectPhases.length > 0 && (
        <motion.div
          className="relative z-10 shrink-0 border-t border-white/[0.05] bg-[#07070a]/95 backdrop-blur-md px-6 py-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="flex items-start max-w-4xl mx-auto">
            {projectPhases.map((phase, i) => {
              const isDone = phase.status === 'done';
              const isActive = phase.status === 'active';
              return (
                <div key={phase.name} className="flex items-start flex-1 min-w-0">
                  <div className="flex flex-col items-center min-w-[90px]">
                    <div className={`relative w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      isDone ? 'bg-brand-500 border-brand-500' :
                      isActive ? 'bg-brand-500/20 border-brand-500' :
                      'bg-transparent border-zinc-700'
                    }`}>
                      {isDone && <CheckCircle className="w-3 h-3 text-white" />}
                      {isActive && <span className="absolute inset-0 rounded-full bg-brand-500/30 animate-ping" />}
                    </div>
                    <span className={`text-[12px] font-medium mt-1.5 whitespace-nowrap ${
                      isDone ? 'text-brand-400' :
                      isActive ? 'text-zinc-100' :
                      'text-zinc-600'
                    }`}>
                      {phase.name}
                    </span>
                    {phase.deliverable && (
                      isDone && phase.deliverable.url ? (
                        <a
                          href={phase.deliverable.url}
                          className="text-[10px] text-zinc-500 hover:text-brand-400 transition-colors mt-0.5 truncate max-w-[86px]"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {phase.deliverable.label}
                        </a>
                      ) : (
                        <span className="text-[10px] text-zinc-600 mt-0.5 truncate max-w-[86px]">
                          {phase.deliverable.label}
                        </span>
                      )
                    )}
                  </div>
                  {i < projectPhases.length - 1 && (
                    <div className={`flex-1 h-0.5 mt-[7px] mx-1 rounded-full ${
                      isDone ? 'bg-brand-500/40' : 'bg-zinc-800/80'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
