'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { useShipWithAIStore, Agent } from '@/lib/store';
import { invokeAgent, PaywallError } from '@/lib/agent-client';
import { useCredits } from '@/lib/use-credits';
import { PaywallOverlay } from './PaywallOverlay';

/** Render basic markdown: **bold**, *italic*, `code`, and newlines */
function renderMarkdown(text: string) {
  // Split by newlines first, then process inline formatting per line
  return text.split('\n').map((line, lineIdx, arr) => {
    // Process inline markdown: **bold**, *italic*, `code`
    const parts: React.ReactNode[] = [];
    // Regex matches: **bold**, *italic*, `code`, or plain text
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      // Push text before this match
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index));
      }

      if (match[2]) {
        // **bold**
        parts.push(<strong key={`${lineIdx}-${match.index}`} className="font-semibold text-zinc-100">{match[2]}</strong>);
      } else if (match[3]) {
        // *italic*
        parts.push(<em key={`${lineIdx}-${match.index}`}>{match[3]}</em>);
      } else if (match[4]) {
        // `code`
        parts.push(<code key={`${lineIdx}-${match.index}`} className="px-1 py-0.5 rounded bg-zinc-700/60 text-brand-300 text-[12px] font-mono">{match[4]}</code>);
      }

      lastIndex = match.index + match[0].length;
    }

    // Remaining text after last match
    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }

    // If the line is empty, just return a line break
    if (parts.length === 0 && line === '') {
      return lineIdx < arr.length - 1 ? <br key={lineIdx} /> : null;
    }

    return (
      <span key={lineIdx}>
        {parts}
        {lineIdx < arr.length - 1 && <br />}
      </span>
    );
  });
}

interface AgentChatPanelProps {
  activeAgent: Agent | null;
  autoStartAgent?: boolean;
  onSwitchAgent?: (agentId: string, autoStart?: boolean) => void;
}

// Map of agent display names to IDs for detecting handoff suggestions
const AGENT_NAME_TO_ID: Record<string, string> = {
  'ui designer': 'ui-designer',
  'ux analyst': 'ux-analyst',
  'fe developer': 'ui-developer',
  'frontend developer': 'ui-developer',
  'integration dev': 'backend-developer',
  'backend developer': 'backend-developer',
  'seo specialist': 'seo-specialist',
  'marketing': 'marketing',
  'payment integration': 'payment-integration',
  'e-commerce specialist': 'e-commerce-specialist',
  'mobile developer': 'mobile-developer',
  'infrastructure': 'infrastructure',
  'qa tester': 'qa-tester',
  'unit tester': 'unit-tester',
  'tech writer': 'tech-writer',
  'solidity dev': 'solidity-developer',
  'security auditor': 'solidity-auditor',
  'project manager': 'pm',
};

function detectSuggestedAgent(text: string, involvedAgents: string[]): string | null {
  const lower = text.toLowerCase();
  // Look for patterns like "talk to the UI Designer" or "move on to the E-commerce Specialist"
  const patterns = [
    /(?:talk to|move (?:on )?to|hand (?:you )?off to|suggest (?:chatting|speaking|talking) (?:with|to)|let'?s? (?:bring in|involve|move to)|next.*?(?:would be|should be|is)) (?:the |our )?(.+?)(?:\.|,|!|\?|$)/gi,
    /(?:recommend|suggest) (?:the |our )?(.+?) (?:next|as the next|for this)/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(lower)) !== null) {
      const name = match[1].trim();
      // Check against known agent names
      for (const [agentName, agentId] of Object.entries(AGENT_NAME_TO_ID)) {
        if (name.includes(agentName) && involvedAgents.includes(agentId)) {
          return agentId;
        }
      }
    }
  }
  return null;
}

export function AgentChatPanel({ activeAgent, autoStartAgent, onSwitchAgent }: AgentChatPanelProps) {
  const {
    chatMessages,
    addChatMessage,
    agents,
    startInvocation,
    updateInvocationOutput,
    completeInvocation,
    failInvocation,
    updateAgentStatus,
    activeSession,
    activeProjectId,
    addAgentToSession,
    updateSessionContext,
    setProjectPhases,
  } = useShipWithAIStore();

  const {
    agentStreams,
    startAgentStream,
    endAgentStream,
    updateAgentStream,
    addAgentStreamToolCall,
    updateAgentStreamToolResult,
  } = useShipWithAIStore();

  const [input, setInput] = useState('');
  const [isInvoking, setIsInvoking] = useState(false);
  const [paywallFromApi, setPaywallFromApi] = useState<{ code: 'unauthenticated' | 'insufficient_credit'; balance?: number } | null>(null);
  const [suggestedHandoffs, setSuggestedHandoffs] = useState<Record<string, string>>({});
  // Ref mirror so async callbacks (onComplete) always see latest handoff state
  const handoffsRef = useRef(suggestedHandoffs);
  handoffsRef.current = suggestedHandoffs;
  // Store handoff task descriptions so the target agent knows what to do
  const handoffTaskRef = useRef<Record<string, { context: string; task: string }>>({});

  const streamingAgentId = useMemo(
    () => Object.keys(agentStreams).find(id => agentStreams[id]?.isActive),
    [agentStreams]
  );
  const streamingAgent = streamingAgentId ? agents.find(a => a.id === streamingAgentId) : undefined;
  const currentStream = streamingAgentId ? agentStreams[streamingAgentId] : undefined;
  const streamEvents = currentStream?.events || [];
  const hasStreamContent = streamEvents.length > 0;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pendingAgentRef = useRef<string | null>(null);

  const allMessages = useMemo(() => chatMessages.slice(-50), [chatMessages]);

  const credits = useCredits();
  // Local API-driven paywall (from a runtime 402) overrides the credit-derived
  // gate so a stale balance read can't hide a fresh "out of credit" response.
  const apiOverride = paywallFromApi?.code === 'unauthenticated'
    ? 'signed_out'
    : paywallFromApi?.code === 'insufficient_credit'
      ? 'out_of_credit'
      : null;
  const gateState = apiOverride ?? credits.gateState;
  const paywallActive = gateState !== 'ok';
  const paywallBalance = paywallFromApi?.balance ?? credits.balance;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, streamEvents]);

  // When user switches away from an agent, summarize that agent's conversation
  useEffect(() => {
    const pendingId = pendingAgentRef.current;
    if (pendingId && activeAgent?.id !== pendingId) {
      const agent = agents.find((a) => a.id === pendingId);
      if (agent) {
        summarizeContext(agent);
      }
      pendingAgentRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAgent?.id]);

  // Auto-start: PM on fresh session, or any agent after handoff
  const autoStartedRef = useRef<Set<string>>(new Set());

  // Auto-start agent after handoff
  useEffect(() => {
    if (autoStartAgent && activeAgent && activeSession) {
      const guardKey = `${activeSession.id}-${activeAgent.id}`;
      if (!autoStartedRef.current.has(guardKey)) {
        autoStartedRef.current.add(guardKey);
        addAgentToSession(activeSession.id, activeAgent.id);

        // Use the specific task from the handoff if available
        const handoffInfo = handoffTaskRef.current[activeAgent.id];
        const prompt = handoffInfo?.task
          ? `The PM has assigned you this task:\n\n**Task**: ${handoffInfo.task}\n\n**Context**: ${handoffInfo.context}\n\nStart working on this immediately. Do NOT ask questions — act now.`
          : `You've been brought in by the Project Manager. Review the context and start working immediately.`;
        const chatMsg = handoffInfo?.task
          ? `Task: ${handoffInfo.task.substring(0, 150)}${handoffInfo.task.length > 150 ? '...' : ''}`
          : `PM has handed off to you.`;
        addChatMessage({ role: 'user', content: chatMsg, agentId: activeAgent.id });
        handleRealInvocation(activeAgent, prompt);
        // Clean up
        delete handoffTaskRef.current[activeAgent.id];
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAgent?.id]);

  // PM auto-start on fresh session
  useEffect(() => {
    if (
      activeAgent?.id === 'pm' &&
      activeSession &&
      chatMessages.length === 0 &&
      !isInvoking &&
      !autoStartedRef.current.has(`${activeSession.id}-pm`)
    ) {
      autoStartedRef.current.add(`${activeSession.id}-pm`);
      const brief = activeSession.description || '';
      if (brief) {
        addChatMessage({ role: 'user', content: `Here's my project brief:\n\n${brief}`, agentId: 'pm' });
        addAgentToSession(activeSession.id, 'pm');
        handleRealInvocation(activeAgent, `The user just completed the project wizard. Here is their project brief:\n\n${brief}\n\nIntroduce yourself briefly, summarize what you understood from their brief, then ask the USER 1-2 specific clarifying questions about their project. Do NOT delegate to other agents yet — your job right now is to understand the user's vision by talking to THEM directly.`);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAgent?.id, activeSession?.id, chatMessages.length]);

  const getAgent = (agentId?: string) => {
    if (!agentId) return null;
    return agents.find((a) => a.id === agentId) || null;
  };

  // Summarize conversation context after an agent reply
  const summarizeContext = (agent: Agent) => {
    if (!activeSession) return;
    fetch(`/api/sessions/${activeSession.id}/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: agent.id,
        agentName: agent.name,
        agentRole: agent.role,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.context) {
          // Update local session context with all agent summaries
          Object.entries(data.context).forEach(([aid, summary]) => {
            updateSessionContext(activeSession.id, aid, summary as string);
          });
        }
      })
      .catch(() => {}); // Fire-and-forget
  };

  const handleRealInvocation = async (agent: Agent, prompt: string, otherAgentContext?: Record<string, string>) => {
    setIsInvoking(true);
    startAgentStream(agent.id);
    updateAgentStatus(agent.id, 'thinking', 'Thinking...');
    const invocationStartTime = Date.now();

    const invocationId = startInvocation(agent.id, prompt, 'chat');

    // Build context object including other agents' summaries and available team
    const teamAgents = activeSession?.involvedAgents
      .filter((id) => id !== agent.id)
      .map((id) => {
        const a = agents.find((x) => x.id === id);
        return a ? `${a.name} (${a.role})` : id;
      }) ?? [];

    const context: Record<string, unknown> = {};
    if (otherAgentContext && Object.keys(otherAgentContext).length > 0) {
      context.otherAgents = otherAgentContext;
    }
    if (teamAgents.length > 0) {
      context.availableTeam = teamAgents;
    }
    // Include persistent project facts if available
    if (activeSession?.projectFacts) {
      context.projectFacts = activeSession.projectFacts;
    }

    // Build conversation history — this agent's messages + recent system messages for context
    // Cross-agent context comes from the session context system (project facts + agent summaries)
    const agentMessages = chatMessages
      .filter((m) => m.agentId === agent.id && (m.role === 'user' || m.role === 'agent'))
      .slice(-6)
      .map((m) => ({ role: m.role as 'user' | 'agent', content: m.content }));

    // For PM, include recent system messages so it knows what happened between handoffs
    const history = agent.id === 'pm'
      ? chatMessages
          .filter((m) => (m.agentId === 'pm' && (m.role === 'user' || m.role === 'agent')) || m.role === 'system')
          .slice(-8)
          .map((m) => m.role === 'system'
            ? { role: 'user' as const, content: `[System]: ${m.content}` }
            : { role: m.role as 'user' | 'agent', content: m.content }
          )
      : agentMessages;

    try {
      await invokeAgent({
        agentId: agent.id,
        prompt,
        projectId: activeProjectId || undefined,
        sessionId: activeSession?.id,
        context,
        history,
        stream: true,
        onStream: (chunk) => {
          updateAgentStream(agent.id, chunk);
          updateInvocationOutput(invocationId, chunk);
          const elapsed = Math.round((Date.now() - invocationStartTime) / 1000);
          updateAgentStatus(agent.id, 'working', `Generating... ${elapsed}s`);
        },
        onToolCall: (event) => {
          // Auto-trigger handoff when PM uses request_handoff tool
          if (event.toolName === 'request_handoff' && event.input?.targetAgent) {
            // Apply same aliases as the server-side tool
            const AGENT_ALIASES: Record<string, string> = {
              'frontend-developer': 'ui-developer',
              'fe-developer': 'ui-developer',
              'backend': 'backend-developer',
              'designer': 'ui-designer',
              'seo': 'seo-specialist',
              'ecommerce': 'e-commerce-specialist',
              'payments': 'payment-integration',
              'mobile': 'mobile-developer',
              'security': 'solidity-auditor',
              'deploy': 'deployer',
            };
            const rawTarget = event.input.targetAgent as string;
            const targetId = AGENT_ALIASES[rawTarget] || rawTarget;
            if (activeSession && !activeSession.involvedAgents.includes(targetId)) {
              addAgentToSession(activeSession.id, targetId);
            }
            // Queue the handoff — update both state AND ref immediately so onComplete sees it
            setSuggestedHandoffs((prev) => ({ ...prev, [agent.id]: targetId }));
            handoffsRef.current = { ...handoffsRef.current, [agent.id]: targetId };
            handoffTaskRef.current[targetId] = {
              context: (event.input.contextSummary as string) || '',
              task: (event.input.taskDescription as string) || '',
            };
          }
          // Capture project plan phases when PM submits a plan
          if (event.toolName === 'submit_plan' && event.input?.phases) {
            const phases = (event.input.phases as Array<{ name: string }>).map((p, i) => ({
              name: p.name,
              status: (i === 0 ? 'active' : 'pending') as 'active' | 'pending' | 'done',
            }));
            setProjectPhases(phases);
          }
          const friendlyNames: Record<string, string> = {
            github_write_files: 'Committing to repository',
            github_read_files: 'Reading from repository',
            github_create_pr: 'Opening pull request',
            github_create_branch: 'Creating branch',
            create_task: 'Creating task',
            create_workflow: 'Building workflow',
            get_project_status: 'Checking project status',
            get_workflow_status: 'Checking workflow',
            request_handoff: 'Handing off to specialist',
            list_deliverables: 'Reviewing deliverables',
            read_deliverables: 'Reading deliverables',
            write_document: 'Writing document',
            web_search: 'Searching the web',
            run_command: 'Running command',
            submit_deliverable: 'Submitting work',
            submit_plan: 'Submitting plan',
            vercel_deploy_preview: 'Deploying preview',
            vercel_deploy: 'Deploying to production',
          };
          const friendly = friendlyNames[event.toolName] || event.toolName;
          addAgentStreamToolCall(agent.id, `⚡ ${friendly}`);
          const elapsed = Math.round((Date.now() - invocationStartTime) / 1000);
          updateAgentStatus(agent.id, 'working', `${friendly} · ${elapsed}s`);
        },
        onToolResult: (event) => {
          updateAgentStreamToolResult(agent.id, event.isError);
        },
        onIteration: (iteration, stopReason) => {
          const elapsed = Math.round((Date.now() - invocationStartTime) / 1000);
          if (stopReason === 'tool_use') {
            updateAgentStatus(agent.id, 'working', `Processing tools · ${elapsed}s`);
          } else if (stopReason === 'starting' && iteration > 1) {
            updateAgentStatus(agent.id, 'working', `Continuing · ${elapsed}s`);
          }
        },
        onComplete: (response) => {
          // Refresh balance after the post-run debit and drop any stale paywall.
          credits.refresh();
          setPaywallFromApi(null);

          const output = response.output || (response.stopReason === 'max_tokens'
            ? 'I ran out of space generating the response. Let me try with a simpler approach — could you ask me to focus on one specific deliverable at a time?'
            : '');
          completeInvocation(invocationId, output);
          if (output) {
            addChatMessage({
              role: 'agent',
              agentId: agent.id,
              content: output,
            });
          }
          // Surface the audit report download as a system message whenever the
          // solidity-auditor produced a persisted deliverable this turn.
          if (response.deliverable && agent.id === 'solidity-auditor') {
            const { pdfUrl, downloadUrl } = response.deliverable;
            addChatMessage({
              role: 'system',
              agentId: agent.id,
              content: `**📄 Audit report ready**\n\n- [Download PDF](${pdfUrl})\n- [Download Markdown](${downloadUrl})`,
            });
          }
          endAgentStream(agent.id);

          // Set status based on what the agent did: delivered if it submitted work, idle otherwise
          const hasDelivered = response.toolCalls?.some(
            (tc) => ['submit_deliverable', 'submit_audit_report', 'submit_test_report', 'submit_plan', 'github_create_pr'].includes(tc.toolName) && !tc.isError
          );
          updateAgentStatus(agent.id, hasDelivered ? 'delivered' : 'idle');

          // Mark that this agent has unsummarized messages
          pendingAgentRef.current = agent.id;

          // Fallback: detect handoff from text if tools didn't trigger it
          if (activeSession && !suggestedHandoffs[agent.id]) {
            const suggested = detectSuggestedAgent(response.output, activeSession.involvedAgents);
            if (suggested && suggested !== agent.id) {
              setSuggestedHandoffs((prev) => ({ ...prev, [agent.id]: suggested }));
            }
          }

          // Auto-execute pending handoff (read from ref to avoid stale closure)
          const pendingHandoff = handoffsRef.current[agent.id];
          if (pendingHandoff && onSwitchAgent) {
            const nextAgent = agents.find((a) => a.id === pendingHandoff);
            if (nextAgent) {
              // Add the "joining" message AFTER the PM's response is in the chat
              addChatMessage({
                role: 'system',
                agentId: pendingHandoff,
                content: `${nextAgent.name} is joining...`,
              });
              summarizeContext(agent);
              setSuggestedHandoffs((prev) => { const { [agent.id]: _, ...rest } = prev; return rest; });
              // Clear auto-start guard so re-handoffs to the same agent work
              autoStartedRef.current.delete(`${activeSession?.id}-${pendingHandoff}`);
              setTimeout(() => {
                updateAgentStatus(pendingHandoff, 'idle');
                onSwitchAgent(pendingHandoff, true);
              }, 1000);
              setIsInvoking(false);
              return;
            }
          }

          // Auto-invoke PM after a non-PM specialist completes their work
          // (submitted a deliverable or finished without creating a PR)
          const isSpecialist = agent.id !== 'pm' && agent.id !== 'code-reviewer';
          const usedOutputTool = response.toolCalls?.some(
            (tc) => ['submit_deliverable', 'submit_audit_report', 'submit_test_report'].includes(tc.toolName) && !tc.isError
          );
          const createdPR = response.toolCalls?.some(
            (tc) => tc.toolName === 'github_create_pr' && !tc.isError
          );

          // Only auto-invoke PM if specialist submitted a deliverable but didn't create a PR
          // (PR flow has its own PM auto-invocation via code review → merge → autoInvokePM)
          if (isSpecialist && usedOutputTool && !createdPR && activeSession) {
            // First summarize the specialist's context, then invoke PM
            const pmAgent = agents.find((a) => a.id === 'pm');
            if (pmAgent) {
              // Summarize the specialist's work before invoking PM
              summarizeContext(agent);

              // Give a brief delay for the summary to persist, then invoke PM
              setTimeout(() => {
                const deliverable = response.toolCalls?.find(
                  (tc) => ['submit_deliverable', 'submit_audit_report', 'submit_test_report'].includes(tc.toolName) && !tc.isError
                );
                const deliverableInput = deliverable?.input as Record<string, unknown> | undefined;
                const deliverableSummary = (deliverableInput?.summary as string) || response.output?.substring(0, 300) || 'Work completed';
                const deliverableStatus = (deliverableInput?.status as string) || 'completed';
                const blockers = (deliverableInput?.blockers as string[]) || [];
                const nextSteps = (deliverableInput?.nextSteps as string[]) || [];

                const isFailed = deliverableStatus === 'failed' || deliverableStatus === 'blocked';
                const blockersText = blockers.length > 0 ? `\n\n**Blockers:**\n${blockers.map(b => `- ${b}`).join('\n')}` : '';
                const nextStepsText = nextSteps.length > 0 ? `\n\n**Suggested next steps:**\n${nextSteps.map(s => `- ${s}`).join('\n')}` : '';

                const pmPrompt = isFailed
                  ? `The **${agent.name}** (${agent.id}) has **FAILED** their task:

**Summary**: ${deliverableSummary}${blockersText}${nextStepsText}

Route this to the right agent to fix the issue. Use \`request_handoff\` with a clear description of what needs to be fixed.
Keep your response brief — 2-3 sentences max, then the handoff.`
                  : `The **${agent.name}** (${agent.id}) has just completed their work and submitted a deliverable:

**Summary**: ${deliverableSummary}${nextStepsText}

Based on the project plan and what has been delivered so far, what should happen next?
Use \`request_handoff\` to assign the next specialist, or let the user know if more input is needed.
Keep your response brief — 2-3 sentences max, then the handoff.`;

                // Switch to PM and invoke
                addChatMessage({
                  role: 'system',
                  agentId: 'pm',
                  content: isFailed
                    ? `${agent.name} failed: ${deliverableSummary.substring(0, 150)}. PM is routing the fix...`
                    : `${agent.name} completed their work. PM is deciding next steps...`,
                });
                if (onSwitchAgent) {
                  onSwitchAgent('pm');
                }
                handleRealInvocation(pmAgent, pmPrompt);
              }, 2000);
            }
          }
        },
        onError: (error) => {
          failInvocation(invocationId, error.message);
          endAgentStream(agent.id);
          if (error instanceof PaywallError) {
            setPaywallFromApi({ code: error.code, balance: error.balance });
            updateAgentStatus(agent.id, 'idle');
            credits.refresh();
            return;
          }
          addChatMessage({
            role: 'agent',
            agentId: agent.id,
            content: `Error: ${error.message}`,
          });
          updateAgentStatus(agent.id, 'error');
        },
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      failInvocation(invocationId, errorMsg);
      updateAgentStatus(agent.id, 'error');
    } finally {
      setIsInvoking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isInvoking || !activeAgent || paywallActive) return;

    const prompt = input.trim();
    addChatMessage({ role: 'user', content: prompt, agentId: activeAgent.id });
    setInput('');

    if (activeSession) {
      addAgentToSession(activeSession.id, activeAgent.id);
    }

    // Build context from other agents to pass along
    const sessionContext = activeSession?.context ?? {};
    const otherContext = Object.entries(sessionContext)
      .filter(([id]) => id !== activeAgent.id)
      .reduce((acc, [id, summary]) => ({ ...acc, [id]: summary }), {} as Record<string, string>);

    await handleRealInvocation(activeAgent, prompt, otherContext);
  };

  const handleOptionClick = async (option: string) => {
    if (!activeAgent || paywallActive) return;
    addChatMessage({ role: 'user', content: option, agentId: activeAgent.id });

    const sessionContext = activeSession?.context ?? {};
    const otherContext = Object.entries(sessionContext)
      .filter(([id]) => id !== activeAgent.id)
      .reduce((acc, [id, summary]) => ({ ...acc, [id]: summary }), {} as Record<string, string>);

    await handleRealInvocation(activeAgent, option, otherContext);
  };

  // Latest unanswered question from active agent
  const latestQuestion = (() => {
    if (!activeAgent) return null;
    const agentMsgs = chatMessages.filter((m) => m.agentId === activeAgent.id);
    const lastQuestion = agentMsgs.filter((m) => m.isQuestion).slice(-1)[0];
    if (!lastQuestion) return null;
    // Check if user replied after this question
    const userRepliedAfter = agentMsgs.some(
      (m) => m.role === 'user' && m.timestamp > lastQuestion.timestamp
    );
    return userRepliedAfter ? null : lastQuestion;
  })();

  return (
    <div className="w-full h-full min-h-0 flex flex-col relative">
      {gateState !== 'ok' && (
        <PaywallOverlay
          state={gateState}
          balance={gateState === 'out_of_credit' ? paywallBalance : undefined}
          onTopUpSuccess={() => {
            credits.refresh();
            setPaywallFromApi(null);
          }}
        />
      )}
      <div className="overflow-hidden flex flex-col max-h-full">
        {/* Header */}
        <div className="px-6 py-3.5 flex items-center gap-3 shrink-0 border-b border-white/[0.04]">
          {activeAgent ? (
            <>
              <div
                className="w-8 h-8 flex items-center justify-center text-[12px] font-bold border"
                style={{
                  backgroundColor: `${activeAgent.color}22`,
                  color: activeAgent.color,
                  borderColor: `${activeAgent.color}44`,
                }}
              >
                {activeAgent.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-zinc-100 leading-tight truncate">
                  {activeAgent.name.replace(/^ShipWith\.AI:\s*/, '')}
                </div>
                <div className="text-[11px] text-zinc-500 truncate leading-tight mt-0.5">
                  {activeAgent.role}
                </div>
              </div>
              <span className="hidden md:flex items-center gap-1.5 text-[11px] text-zinc-500 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                Online
              </span>
            </>
          ) : (
            <>
              <MessageSquare className="w-5 h-5 text-zinc-600" />
              <span className="text-sm text-zinc-400 font-medium">Select an agent to begin</span>
            </>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6">
          {allMessages.length === 0 && !hasStreamContent ? (
            <div className="text-center py-8">
              <MessageSquare className="w-7 h-7 mx-auto mb-3 text-zinc-700" />
              <p className="text-sm text-zinc-500">
                {activeAgent
                  ? `Start a conversation with ${activeAgent.name.split(' ')[0]}`
                  : 'Click on any agent to begin'}
              </p>
            </div>
          ) : (
            <>
              {allMessages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const agent = getAgent(msg.agentId);
                const prev = idx > 0 ? allMessages[idx - 1] : null;
                const showHeader = !prev || prev.role !== msg.role || prev.agentId !== msg.agentId;
                const msgNum = String(idx + 1).padStart(2, '0');

                if (isUser) {
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-end"
                    >
                      <div className="max-w-[78%] text-[14px] leading-[1.65] text-zinc-100 border-l-2 border-brand-500/60 pl-4 py-0.5">
                        {renderMarkdown(msg.content)}
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3.5"
                  >
                    {agent && showHeader ? (
                      <div
                        className="w-8 h-8 flex items-center justify-center text-[11px] font-bold border shrink-0 mt-0.5"
                        style={{
                          backgroundColor: `${agent.color}22`,
                          color: agent.color,
                          borderColor: `${agent.color}44`,
                        }}
                      >
                        {agent.avatar}
                      </div>
                    ) : (
                      <div className="w-8 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      {showHeader && agent && (
                        <div className="flex items-baseline gap-2.5 mb-1.5">
                          <span className="text-[13px] font-semibold" style={{ color: agent.color }}>
                            {agent.name.replace(/^ShipWith\.AI:\s*/, '')}
                          </span>
                          <span className="text-[11px] text-zinc-600 truncate">
                            {agent.role}
                          </span>
                        </div>
                      )}
                      <div className="text-[14px] leading-[1.65] text-zinc-300 max-w-[56rem]">
                        {renderMarkdown(msg.content)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Streaming output */}
              {hasStreamContent && streamingAgent && currentStream?.isActive && (
                <motion.div
                  className="flex gap-3.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div
                    className="w-8 h-8 flex items-center justify-center text-[11px] font-bold border shrink-0 mt-0.5 relative"
                    style={{
                      backgroundColor: `${streamingAgent.color}22`,
                      color: streamingAgent.color,
                      borderColor: `${streamingAgent.color}66`,
                      boxShadow: `0 0 20px ${streamingAgent.color}40`,
                    }}
                  >
                    {streamingAgent.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2.5 mb-1.5">
                      <span className="text-[13px] font-semibold" style={{ color: streamingAgent.color }}>
                        {streamingAgent.name.replace(/^ShipWith\.AI:\s*/, '')}
                      </span>
                      <span className="text-[11px] text-brand-400">
                        thinking…
                      </span>
                    </div>
                    <div className="space-y-2 max-w-[56rem]">
                      {streamEvents.map((ev, i) => (
                        ev.type === 'text' ? (
                          <div key={i} className="text-[14px] leading-[1.65] text-zinc-300">{renderMarkdown(ev.content)}</div>
                        ) : (
                          <div key={i} className={`inline-flex items-center gap-1.5 text-[11px] py-0.5 px-2 rounded ${
                            ev.status === 'calling' ? 'bg-amber-500/10 text-amber-400' :
                            ev.status === 'error' ? 'bg-red-500/10 text-red-400' :
                            'bg-teal-500/10 text-teal-400'
                          }`}>
                            <span>{ev.status === 'calling' ? '⚡' : ev.status === 'error' ? '✗' : '✓'}</span>
                            <span>{ev.label}</span>
                            {ev.status === 'calling' && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* Quick-reply options */}
          {latestQuestion?.options && !isInvoking && (
            <div className="space-y-1.5 pt-3 pl-[2.75rem]">
              {latestQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleOptionClick(opt)}
                  disabled={isInvoking}
                  className="group block w-full text-left text-[13.5px] px-4 py-2.5 border border-white/[0.06] bg-white/[0.01] hover:bg-brand-500/[0.06] hover:border-brand-500/40 text-zinc-300 hover:text-white transition-all disabled:opacity-50"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}


          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-6 pb-4 pt-2 shrink-0">
          <div className="relative flex items-end bg-[#0a0a10]/90 backdrop-blur-md border border-white/[0.08] rounded-md hover:border-white/[0.14] focus-within:border-brand-500/50 transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={
                !activeAgent
                  ? 'Select an agent first...'
                  : gateState === 'signed_out'
                  ? 'Sign in to chat'
                  : gateState === 'out_of_credit'
                  ? 'Top up to continue'
                  : isInvoking
                  ? 'Waiting for response...'
                  : `Message ${activeAgent.name.split(' ')[0]}...`
              }
              disabled={isInvoking || !activeAgent || paywallActive}
              rows={1}
              className="flex-1 px-4 py-3.5 bg-transparent text-[14px] text-zinc-100 placeholder-zinc-600 focus:outline-none disabled:opacity-40 resize-none leading-relaxed"
            />
            <button
              type="submit"
              disabled={!input.trim() || isInvoking || !activeAgent || paywallActive}
              className="m-1.5 p-2.5 flex items-center justify-center bg-brand-500 hover:bg-brand-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 rounded transition-all shrink-0"
              aria-label="Send"
            >
              {isInvoking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
