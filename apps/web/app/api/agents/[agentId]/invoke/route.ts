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
import { calculateCost, isServerFreeMode, MIN_BALANCE_USD } from '@/lib/pricing';
import { persistAuditReport } from '@/lib/audit-deliverable';
import { getSessionUser } from '@/lib/auth-server';

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
    // Optional client-supplied skill allowlist for this single invocation
    // (e.g. solidity-audit wizard picks a subset). Overrides the agent's
    // config.json default allowlist when present.
    const requestedSkills = Array.isArray(body.selectedSkills)
      ? (body.selectedSkills as string[])
      : undefined;

    console.log(`[invoke] Agent: ${agentId}, ProjectId: ${projectId || 'NONE'}, History: ${history?.length || 0}/${rawHistory?.length || 0} msgs`);

    // Check if streaming is requested
    const url = new URL(request.url);
    const stream = url.searchParams.get('stream') === 'true';

    // Validate agent exists (must happen before credit gate because fixed-price
    // skills set the required balance, so we need to load skills first).
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
    // Allowlist priority:
    //   1. body.selectedSkills (per-invocation choice)
    //   2. project.metadata.answers.selectedAuditSkills (for auditor, wizard-picked)
    //   3. config.json "skills" field (agent-wide default)
    const configAllowlist = Array.isArray(config.skills) ? (config.skills as string[]) : undefined;
    let projectSkills: string[] | undefined;
    if (!requestedSkills && agentId === 'solidity-auditor' && projectId) {
      try {
        const store = getFirestoreStore();
        const project = await store.getProject(projectId);
        const answers = (project?.metadata as Record<string, unknown> | undefined)?.answers as
          | Record<string, unknown>
          | undefined;
        const fromProject = answers?.selectedAuditSkills;
        if (Array.isArray(fromProject) && fromProject.every((s) => typeof s === 'string')) {
          projectSkills = fromProject as string[];
        }
      } catch { /* non-fatal — fall back to config allowlist */ }
    }
    const effectiveAllowlist = requestedSkills ?? projectSkills ?? configAllowlist;
    const skills = loadAgentSkills(agentsDir, agentId, { allowlist: effectiveAllowlist });
    const skillsBlock = renderSkillsBlock(skills);

    // Fixed-price mode: if any loaded skill declares priceUsd, skip token billing
    // and charge the sum upfront. Refund on run failure.
    const pricedSkills = skills.filter((s) => typeof s.priceUsd === 'number' && s.priceUsd > 0);
    const fixedPriceTotal = pricedSkills.reduce((sum, s) => sum + (s.priceUsd ?? 0), 0);
    const isFixedPriceRun = pricedSkills.length > 0;

    // Auth + credit gate. FREE_MODE bypasses both for local dev.
    // Required balance is the fixed-price total when known; otherwise fall back
    // to MIN_BALANCE_USD for token-based runs.
    // SSE streaming can't return a clean 402 body, so we emit a fatal SSE event
    // with the same shape the client shows in the paywall.
    let userId: string | undefined;
    let fixedPriceDebit: { entryId: string; amount: number; balanceAfter: number } | null = null;
    if (!isServerFreeMode) {
      const sessionUser = await getSessionUser();
      if (!sessionUser) {
        return paywallResponse(stream, 'unauthenticated', 'Sign in to continue');
      }
      const store = getFirestoreStore();
      const balance = await store.getBalance(sessionUser.id);
      const requiredBalance = isFixedPriceRun ? fixedPriceTotal : MIN_BALANCE_USD;
      if (balance < requiredBalance) {
        return paywallResponse(stream, 'insufficient_credit', 'Out of credits — top up to continue', balance);
      }
      userId = sessionUser.id;

      // Upfront debit for fixed-price runs — balance update is atomic inside
      // applyCreditDelta, so a concurrent run on the same user can't double-spend.
      if (isFixedPriceRun && userId) {
        try {
          const skillList = pricedSkills.map((s) => s.folder).join(', ');
          const result = await store.applyCreditDelta(
            userId,
            -fixedPriceTotal,
            'fixed_price_action',
            { note: `${agentId} · ${skillList}` },
          );
          fixedPriceDebit = { entryId: result.entryId, amount: fixedPriceTotal, balanceAfter: result.balanceAfter };
        } catch (debitErr) {
          console.error('[invoke] fixed-price upfront debit failed', debitErr);
          return paywallResponse(stream, 'insufficient_credit', 'Out of credits — top up to continue', balance);
        }
      }
    }

    const messages = buildMessages(prompt, context, history);

    // Resolve the repo this agent should read/write. Priority:
    //   1. project.metadata.auditTargetRepo — the user's existing repo (e.g.
    //      solidity-audit reads the user's contracts). Shared across all agents
    //      on that project so PM doesn't 404 trying to list a scratch repo that
    //      was never created.
    //   2. Auto-generated `${owner}/shipwithai-${projectId}` for flows that
    //      spin up a fresh repo (landing-page, ecommerce, etc.).
    //   3. `undefined` — agent has no repo context.
    const repoOwner = process.env.GITHUB_REPO_OWNER;
    let repoFullName: string | undefined;
    let hasTargetRepo = false;
    if (projectId) {
      try {
        const store = getFirestoreStore();
        const project = await store.getProject(projectId);
        const target = (project?.metadata as Record<string, unknown> | undefined)?.auditTargetRepo as
          | { owner?: string; name?: string }
          | undefined;
        if (target?.owner && target?.name) {
          repoFullName = `${target.owner}/${target.name}`;
          hasTargetRepo = true;
        }
      } catch { /* non-fatal */ }
    }
    if (!hasTargetRepo && projectId) {
      repoFullName = `${repoOwner}/shipwithai-${projectId.toLowerCase()}`;
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

    // Fetch repo tree to give agent awareness of the project structure.
    // Omit the branch arg so Octokit resolves the repo's actual default branch —
    // hardcoding "main" 404s on repos that still use "master" (e.g. Kasu).
    let repoTreeBlock = '';
    if (repoFullName) {
      try {
        const rootFiles = await listFiles(repoFullName);
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

    // Billing ctx passed through to completion handlers. Fixed-price runs skip
    // token debit (already debited upfront) and refund on failure.
    const billing: BillingContext = isFixedPriceRun
      ? { mode: 'fixed_price', userId, upfrontDebit: fixedPriceDebit, skillIds: pricedSkills.map((s) => s.folder) }
      : { mode: 'token', userId };

    if (stream) {
      // Streaming SSE with agentic loop
      return invokeViaAgentRunnerStreaming(runConfig, { mode: invocationMode, billing });
    }

    // Non-streaming with agentic loop
    const result = await runAgent(runConfig);
    const balanceAfter = await settleInvocation(runConfig, result, { mode: invocationMode, billing });
    const deliverable = await persistAuditReport(runConfig, result);
    return NextResponse.json({
      success: result.success,
      output: result.output,
      toolCalls: result.toolCallsLog,
      iterations: result.totalIterations,
      stopReason: result.stopReason,
      usage: result.usage,
      deliverable,
      balanceAfter,
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


// Billing strategy for a single invocation. Token mode (default) records +
// debits actual API cost × 5. Fixed-price mode has already debited a flat fee
// upfront; here we only refund on failure.
type BillingContext =
  | { mode: 'token'; userId?: string }
  | {
      mode: 'fixed_price';
      userId?: string;
      upfrontDebit: { entryId: string; amount: number; balanceAfter: number } | null;
      skillIds: string[];
    };

// Settle the invocation: record the token-usage row for analytics always,
// then apply the correct credit movement based on the billing mode. Returns
// the user's post-settle balance so it can be streamed back to the client.
async function settleInvocation(
  runConfig: AgentRunConfig,
  result: AgentRunResult,
  opts: { mode?: string; billing: BillingContext },
): Promise<number | undefined> {
  const { billing } = opts;
  const { inputTokens, outputTokens } = result.usage;
  const { apiCost, userCharge } = calculateCost(inputTokens ?? 0, outputTokens ?? 0, runConfig.model);
  const store = getFirestoreStore();

  // Always persist the cost row for observability, even when the user pays a
  // fixed price — we want margin data per skill.
  let savedId: string | undefined;
  if (inputTokens || outputTokens) {
    try {
      const saved = await store.saveInvocationCost({
        sessionId: runConfig.sessionId,
        agentId: runConfig.agentId,
        model: runConfig.model,
        inputTokens,
        outputTokens,
        apiCost,
        userCharge,
        mode: opts.mode || 'chat',
        userId: billing.userId,
      });
      savedId = saved.id;
    } catch (err) {
      console.error('[invoke] saveInvocationCost failed', err);
    }
  }

  if (!billing.userId) return undefined;

  if (billing.mode === 'token') {
    if (userCharge <= 0) return undefined;
    try {
      const { balanceAfter } = await store.applyCreditDelta(billing.userId, -userCharge, 'agent_invocation', {
        invocationCostId: savedId,
        note: `${runConfig.agentId} · ${runConfig.model}`,
      });
      return balanceAfter;
    } catch (debitErr) {
      // Insufficient credit after the fact — we let the work through since
      // we can't un-run the agent. Logged so we can reconcile if needed.
      console.error('[invoke] credit debit failed (work already done)', debitErr);
      return undefined;
    }
  }

  // Fixed-price: we debited upfront. Refund if the run actually failed.
  if (!result.success && billing.upfrontDebit) {
    try {
      const { balanceAfter } = await store.applyCreditDelta(
        billing.userId,
        billing.upfrontDebit.amount,
        'fixed_price_refund',
        {
          invocationCostId: savedId,
          note: `refund: ${runConfig.agentId} · ${billing.skillIds.join(', ')}`,
        },
      );
      return balanceAfter;
    } catch (refundErr) {
      console.error('[invoke] fixed-price refund failed', refundErr);
      return billing.upfrontDebit.balanceAfter;
    }
  }
  return billing.upfrontDebit?.balanceAfter;
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
  opts: { mode?: string; billing: BillingContext },
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
        const balanceAfter = await settleInvocation(runConfig, result, opts);
        const deliverable = await persistAuditReport(runConfig, result);

        // If agent returned an error message (e.g., API error), send it as text
        if (!result.success && result.output) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text: result.output })}\n\n`)
          );
        }

        // Send final result summary (including token usage + post-debit balance)
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'done',
            success: result.success,
            iterations: result.totalIterations,
            stopReason: result.stopReason,
            toolCalls: result.toolCallsLog,
            usage: result.usage,
            deliverable,
            balanceAfter,
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
