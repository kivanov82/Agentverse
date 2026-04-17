import { NextRequest, NextResponse } from 'next/server';
import * as path from 'path';
import * as fs from 'fs';
import { runAgent } from '@shipwithai/core/agent-runner';
import { runAgentStreaming } from '@shipwithai/core/agent-runner-streaming';
import type { AgentRunConfig, AgentRunResult, AgentStreamCallbacks } from '@shipwithai/core/types';
import { getToolRegistry } from '@shipwithai/core/tools';
import { getDefaultHooks } from '@shipwithai/core/hooks';
import { listFiles } from '@shipwithai/core/github-repo';
import { loadAgentSkills, renderSkillsBlock } from '@shipwithai/core/agent-skills';
import { getFirestoreStore } from '@shipwithai/core/firestore-store';
import { calculateCost, isServerFreeMode } from '@/lib/pricing';
import { persistAuditReport } from '@/lib/audit-deliverable';
import { getSessionUser } from '@/lib/auth-server';

// Conservative estimate blocking new runs when the user clearly can't afford
// even a short interaction. $0.50 covers ~a cheap Sonnet turn at 5× markup;
// actual debit after the run may be higher or lower.
const MIN_BALANCE_USD = 0.5;

// Agent invocation via Anthropic API (streaming or non-streaming)
export async function POST(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params;
    const body = await request.json();
    const { prompt, projectId, context } = body;
    // Only keep last 4 messages (2 exchanges) for conversational continuity.
    // Everything else is in the context system (project facts + agent summaries).
    const rawHistory = body.history as HistoryMessage[] | undefined;
    const history = rawHistory?.slice(-4);

    console.log(`[invoke] Agent: ${agentId}, ProjectId: ${projectId || 'NONE'}, History: ${history?.length || 0}/${rawHistory?.length || 0} msgs`);

    // Check if streaming is requested
    const url = new URL(request.url);
    const stream = url.searchParams.get('stream') === 'true';

    // Auth + credit gate. FREE_MODE bypasses both for local dev.
    // SSE streaming can't return a clean 402 body, so we emit a fatal SSE event
    // with the same shape the client shows in the paywall.
    let userId: string | undefined;
    if (!isServerFreeMode) {
      const sessionUser = await getSessionUser();
      if (!sessionUser) {
        return paywallResponse(stream, 'unauthenticated', 'Sign in to continue');
      }
      const store = getFirestoreStore();
      const balance = await store.getBalance(sessionUser.id);
      if (balance < MIN_BALANCE_USD) {
        return paywallResponse(stream, 'insufficient_credit', 'Out of credits — top up to continue', balance);
      }
      userId = sessionUser.id;
    }

    // Validate agent exists
    const agentsDir = path.join(process.cwd(), '..', '..', 'agents');
    const agentDir = path.join(agentsDir, agentId);
    const configPath = path.join(agentDir, 'config.json');
    const claudeMdPath = path.join(agentDir, 'CLAUDE.md');

    if (!fs.existsSync(configPath)) {
      return NextResponse.json(
        { error: `Agent ${agentId} not found` },
        { status: 404 }
      );
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const baseSystemPrompt = fs.existsSync(claudeMdPath)
      ? fs.readFileSync(claudeMdPath, 'utf-8')
      : '';

    // Load SKILL.md files from agents/{agentId}/skills/*
    // Optional allowlist via config.json "skills": ["folder-a", "folder-b"]
    const skillsAllowlist = Array.isArray(config.skills) ? (config.skills as string[]) : undefined;
    const skills = loadAgentSkills(agentsDir, agentId, { allowlist: skillsAllowlist });
    const skillsBlock = renderSkillsBlock(skills);

    const messages = buildMessages(prompt, context, history);

    // Resolve the repo this agent should read/write. Default is the auto-generated
    // project repo. Use cases that operate on an existing user repo (e.g. solidity-audit)
    // override via project.metadata.auditTargetRepo — only fetched for the auditor
    // since no other agent consumes that metadata today.
    const repoOwner = process.env.GITHUB_REPO_OWNER;
    let repoFullName = projectId ? `${repoOwner}/shipwithai-${projectId.toLowerCase()}` : undefined;
    if (projectId && agentId === 'solidity-auditor') {
      try {
        const store = getFirestoreStore();
        const project = await store.getProject(projectId);
        const target = (project?.metadata as Record<string, unknown> | undefined)?.auditTargetRepo as
          | { owner?: string; name?: string }
          | undefined;
        if (target?.owner && target?.name) {
          repoFullName = `${target.owner}/${target.name}`;
        }
      } catch { /* non-fatal — fall back to auto-generated name */ }
    }

    // Load active branch from session metadata (if agent previously committed)
    const sessionId = body.sessionId as string | undefined;
    let activeBranch: string | undefined;
    if (sessionId) {
      try {
        const store = getFirestoreStore();
        const session = await store.getSession(sessionId);
        const branches = (session as any)?.activeBranches as Record<string, string> | undefined;
        activeBranch = branches?.[agentId];
      } catch { /* non-fatal */ }
    }

    // Fetch repo tree to give agent awareness of the project structure
    let repoTreeBlock = '';
    if (repoFullName) {
      try {
        const rootFiles = await listFiles(repoFullName, undefined, 'main');
        const tree = rootFiles.map((f) => `${f.type === 'dir' ? '📁' : '📄'} ${f.path}`).join('\n');
        repoTreeBlock = `\n\n## Repository Structure (${repoFullName})\n\`\`\`\n${tree}\n\`\`\`\nAlways use these actual paths when reading files. Do NOT guess paths.\n`;
      } catch { /* non-fatal — agent can still list root manually */ }
    }

    // Build agent run config
    const runConfig: AgentRunConfig = {
      agentId: agentId as AgentRunConfig['agentId'],
      model: getModel(config),
      systemPrompt: baseSystemPrompt + skillsBlock + repoTreeBlock,
      messages,
      maxTokens: (config.maxTokens as number) || 16000,
      maxIterations: (config.maxIterations as number) || 10,
      projectId,
      sessionId,
      repoFullName,
      activeBranch,
      onBranchCreated: sessionId ? async (branch: string) => {
        try {
          const store = getFirestoreStore();
          const session = await store.getSession(sessionId);
          const branches = (session as any)?.activeBranches || {};
          branches[agentId] = branch;
          await store.updateSession(sessionId, { activeBranches: branches } as any);
        } catch { /* non-fatal */ }
      } : undefined,
    };

    // Load tools from agent config
    const toolNames = config.tools as string[] | undefined;
    const outputTool = config.outputTool as string | undefined;
    if (toolNames && toolNames.length > 0) {
      const toolRegistry = getToolRegistry();
      // Include the output tool in the tools list if not already there
      const allToolNames = outputTool && !toolNames.includes(outputTool)
        ? [...toolNames, outputTool]
        : toolNames;
      runConfig.tools = toolRegistry.getDefinitions(allToolNames);
      runConfig.toolExecutor = toolRegistry.createExecutor();
    }

    // In "job" mode (orchestrator-driven), force structured output via output tool
    const invocationMode = body.mode as string | undefined;
    if (invocationMode === 'job' && outputTool) {
      runConfig.toolChoice = { type: 'tool', name: outputTool };
    }

    // Apply default execution hooks (branch protection, command safety, output truncation)
    runConfig.hooks = getDefaultHooks();

    if (stream) {
      // Streaming SSE with agentic loop
      return invokeViaAgentRunnerStreaming(runConfig, { mode: invocationMode, userId });
    }

    // Non-streaming with agentic loop
    const result = await runAgent(runConfig);
    await recordInvocationCost(runConfig, result, { mode: invocationMode, userId });
    const deliverable = await persistAuditReport(runConfig, result);
    return NextResponse.json({
      success: result.success,
      output: result.output,
      toolCalls: result.toolCallsLog,
      iterations: result.totalIterations,
      stopReason: result.stopReason,
      usage: result.usage,
      deliverable,
    });
  } catch (error) {
    console.error('Agent invocation error:', error);
    return NextResponse.json(
      { error: 'Failed to invoke agent', details: String(error) },
      { status: 500 }
    );
  }
}

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

function getModel(config: Record<string, unknown>): string {
  return (config.model as string) || DEFAULT_MODEL;
}

interface HistoryMessage {
  role: 'user' | 'agent';
  content: string;
}

// Rough token estimate: ~4 chars per token
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Max tokens for context block (leave room for system prompt + conversation)
const MAX_CONTEXT_TOKENS = 4000;

function formatContext(context?: Record<string, unknown>): string {
  if (!context) return '';
  let block = '';

  // 1. Project facts FIRST (highest priority, placed at top to avoid lost-in-the-middle)
  const projectFacts = context.projectFacts as string | undefined;
  if (projectFacts) {
    block += `\n\n## Project Facts\nThese are the confirmed facts about this project. Do not contradict them.\n\n${projectFacts}\n`;
  }

  // 2. Team roster
  const team = context.availableTeam as string[] | undefined;
  if (team && team.length > 0) {
    block += `\n\n## Your team for this project\nOnly recommend these specialists (no others):\n${team.map((t) => `- ${t}`).join('\n')}\n`;
  }

  // 3. Agent summaries (token-budgeted — truncate oldest if over budget)
  const staleAgents = context.staleAgents as string[] | undefined;
  const otherAgents = context.otherAgents as Record<string, string> | undefined;
  if (otherAgents && Object.keys(otherAgents).length > 0) {
    const currentTokens = estimateTokens(block);
    const budgetForSummaries = MAX_CONTEXT_TOKENS - currentTokens;

    let summariesBlock = '';
    const entries = Object.entries(otherAgents);

    // Add summaries newest-first until budget exhausted
    for (const [id, summary] of entries.reverse()) {
      const staleWarning = staleAgents?.includes(id) ? ' _(context may be outdated)_' : '';
      const entry = `### ${id}${staleWarning}\n${summary}\n\n`;
      if (estimateTokens(summariesBlock + entry) > budgetForSummaries) {
        summariesBlock += `\n_(...earlier agent context truncated for brevity)_\n`;
        break;
      }
      summariesBlock = entry + summariesBlock; // prepend to maintain order
    }

    if (summariesBlock) {
      block += `\n\n## Context from other specialists\n\n${summariesBlock}`;
    }
  }

  return block ? `${block}\n---\n\n` : '';
}

function buildMessages(prompt: string, context?: Record<string, unknown>, history?: HistoryMessage[]): Array<{ role: 'user' | 'assistant'; content: string }> {
  const contextBlock = formatContext(context);
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  // Add conversation history as multi-turn messages
  if (history && history.length > 0) {
    // First message gets the context block prepended
    let firstUserDone = false;
    for (const msg of history) {
      const role = msg.role === 'agent' ? 'assistant' as const : 'user' as const;
      if (role === 'user' && !firstUserDone) {
        messages.push({ role, content: `${contextBlock}${msg.content}` });
        firstUserDone = true;
      } else {
        messages.push({ role, content: msg.content });
      }
    }
    // Add the new prompt
    messages.push({ role: 'user', content: prompt });
  } else {
    // No history — single message with context
    messages.push({ role: 'user', content: `${contextBlock}${prompt}` });
  }

  return messages;
}


// Record token cost + 5x markup to Firestore and debit the signed-in user's
// credit balance. Cost recording is fire-and-forget (failures logged but
// never break the response); the ledger debit is best-effort — if it fails
// we log loudly since it means the user got free work.
async function recordInvocationCost(
  runConfig: AgentRunConfig,
  result: AgentRunResult,
  opts: { mode?: string; userId?: string },
): Promise<void> {
  try {
    const { inputTokens, outputTokens } = result.usage;
    if (!inputTokens && !outputTokens) return;
    const { apiCost, userCharge } = calculateCost(inputTokens, outputTokens, runConfig.model);
    const store = getFirestoreStore();
    const saved = await store.saveInvocationCost({
      sessionId: runConfig.sessionId,
      agentId: runConfig.agentId,
      model: runConfig.model,
      inputTokens,
      outputTokens,
      apiCost,
      userCharge,
      mode: opts.mode || 'chat',
      userId: opts.userId,
    });

    if (opts.userId && userCharge > 0) {
      try {
        await store.applyCreditDelta(opts.userId, -userCharge, 'agent_invocation', {
          invocationCostId: saved.id,
          note: `${runConfig.agentId} · ${runConfig.model}`,
        });
      } catch (debitErr) {
        // Insufficient credit after the fact — we let the work through since
        // we can't un-run the agent. Logged so we can reconcile if needed.
        console.error('[invoke] credit debit failed (work already done)', debitErr);
      }
    }
  } catch (err) {
    console.error('[invoke] saveInvocationCost failed', err);
  }
}

function paywallResponse(
  stream: boolean,
  code: 'unauthenticated' | 'insufficient_credit',
  message: string,
  balance?: number,
): Response {
  const payload = { success: false, error: message, errorCode: code, balance };
  if (!stream) {
    return NextResponse.json(payload, { status: 402 });
  }
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
  return new Response(body, {
    status: 402,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Streaming version using agent runner with SSE bridge
function invokeViaAgentRunnerStreaming(
  runConfig: AgentRunConfig,
  opts: { mode?: string; userId?: string } = {},
): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const callbacks: AgentStreamCallbacks = {
          onText: (text) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          },
          onToolCall: (toolName, input) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'tool_call', toolName, input })}\n\n`)
            );
          },
          onToolResult: (toolName, result, isError) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'tool_result', toolName, result, isError })}\n\n`)
            );
          },
          onIteration: (iteration, stopReason) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'iteration', iteration, stopReason })}\n\n`)
            );
          },
        };

        const result = await runAgentStreaming(runConfig, callbacks);
        await recordInvocationCost(runConfig, result, opts);
        const deliverable = await persistAuditReport(runConfig, result);

        // If agent returned an error message (e.g., API error), send it as text
        if (!result.success && result.output) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: result.output })}\n\n`)
          );
        }

        // Send final result summary (including token usage for UI cost display)
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'done',
            success: result.success,
            iterations: result.totalIterations,
            stopReason: result.stopReason,
            toolCalls: result.toolCallsLog,
            usage: result.usage,
            deliverable,
          })}\n\n`)
        );

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: String(error) })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// GET: Get agent info
export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  const { agentId } = params;
  const agentDir = path.join(process.cwd(), '..', '..', 'agents', agentId);
  const configPath = path.join(agentDir, 'config.json');

  if (!fs.existsSync(configPath)) {
    return NextResponse.json(
      { error: `Agent ${agentId} not found` },
      { status: 404 }
    );
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  return NextResponse.json(config);
}
