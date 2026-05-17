// Client for invoking agents from the UI

// Fired on `window` after any invocation that debits credits, carrying the
// post-debit balance. `useCredits` listens and updates optimistically so the
// UI doesn't have to refetch /api/credits after every agent call.
export const BALANCE_CHANGED_EVENT = 'shipwithai:balance-changed';

function maybeEmitBalanceChanged(balance: unknown): void {
  if (typeof window === 'undefined') return;
  if (typeof balance !== 'number' || !Number.isFinite(balance)) return;
  window.dispatchEvent(new CustomEvent(BALANCE_CHANGED_EVENT, { detail: { balance } }));
}

export type PaywallErrorCode = 'unauthenticated' | 'insufficient_credit';

/**
 * Thrown when the invoke API returns 402. Consumers can `instanceof PaywallError`
 * to distinguish "user needs to sign in / top up" from generic failures and
 * surface the paywall overlay instead of dropping the message into chat.
 */
export class PaywallError extends Error {
  readonly code: PaywallErrorCode;
  readonly balance?: number;
  constructor(code: PaywallErrorCode, message: string, balance?: number) {
    super(message);
    this.name = 'PaywallError';
    this.code = code;
    this.balance = balance;
  }
}

export interface ToolCallEvent {
  toolName: string;
  input?: Record<string, unknown>;
}

export interface ToolResultEvent {
  toolName: string;
  result: string;
  isError: boolean;
}

export interface InvokeOptions {
  agentId: string;
  prompt: string;
  projectId?: string;
  sessionId?: string;
  context?: Record<string, unknown>;
  history?: Array<{ role: 'user' | 'agent'; content: string }>;
  stream?: boolean;
  onStream?: (chunk: string) => void;
  onToolCall?: (event: ToolCallEvent) => void;
  onToolResult?: (event: ToolResultEvent) => void;
  onIteration?: (iteration: number, stopReason: string) => void;
  onComplete?: (response: AgentResponse) => void;
  onError?: (error: Error) => void;
}

export interface AgentDeliverable {
  deliverableId: string;
  pdfUrl: string;
  downloadUrl: string;
}

export interface AgentResponse {
  success: boolean;
  output: string;
  error?: string;
  toolCalls?: Array<{ toolName: string; input: Record<string, unknown>; output: string; isError: boolean }>;
  iterations?: number;
  stopReason?: string;
  deliverable?: AgentDeliverable | null;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  pricing: {
    baseRate: string;
    currency: string;
    perUnit: string;
  };
}

/**
 * Invoke an agent with a prompt
 * Supports both streaming and non-streaming modes
 */
export async function invokeAgent(options: InvokeOptions): Promise<AgentResponse> {
  const { agentId, prompt, projectId, sessionId, context, history, stream, onStream, onToolCall, onToolResult, onIteration, onComplete, onError } = options;

  const url = `/api/agents/${agentId}/invoke${stream ? '?stream=true' : ''}`;

  try {
    if (stream && onStream) {
      // Streaming mode
      console.log('[agent-client] Starting streaming request to:', url);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, projectId, sessionId, context, history }),
      });

      console.log('[agent-client] Response status:', response.status);

      if (response.status === 402) {
        const data = await safeReadPaywallPayload(response);
        throw new PaywallError(
          (data?.errorCode as PaywallErrorCode) ?? 'insufficient_credit',
          (data?.error as string) ?? 'Payment required',
          data?.balance as number | undefined,
        );
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to invoke agent');
      }

      if (!response.body) {
        throw new Error('No response body for streaming');
      }

      // Read the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullOutput = '';
      let buffer = '';

      console.log('[agent-client] Starting to read stream...');

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('[agent-client] Stream done');
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Split on double newline (SSE event boundary)
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || ''; // Keep incomplete last part in buffer

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data: ')) continue;

          const data = line.slice(6);
          if (data === '[DONE]') {
            console.log('[agent-client] Received [DONE]');
            continue;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              fullOutput += parsed.text;
              onStream(parsed.text);
            } else if (parsed.type === 'tool_call') {
              onToolCall?.({ toolName: parsed.toolName, input: parsed.input });
            } else if (parsed.type === 'tool_result') {
              onToolResult?.({ toolName: parsed.toolName, result: parsed.result, isError: parsed.isError });
            } else if (parsed.type === 'iteration') {
              onIteration?.(parsed.iteration, parsed.stopReason);
            } else if (parsed.type === 'done') {
              // Final summary from agent runner
              maybeEmitBalanceChanged(parsed.balanceAfter);
              const result: AgentResponse = {
                success: parsed.success,
                output: fullOutput,
                toolCalls: parsed.toolCalls,
                iterations: parsed.iterations,
                stopReason: parsed.stopReason,
                deliverable: parsed.deliverable ?? null,
              };
              onComplete?.(result);
              return result;
            }
          } catch {
            // Ignore unparseable events
          }
        }
      }

      console.log('[agent-client] Final output length:', fullOutput.length);
      const result: AgentResponse = { success: true, output: fullOutput };
      onComplete?.(result);
      return result;
    } else {
      // Non-streaming mode
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, projectId, sessionId, context, history }),
      });

      const data = await response.json();

      if (response.status === 402) {
        throw new PaywallError(
          (data?.errorCode as PaywallErrorCode) ?? 'insufficient_credit',
          data?.error ?? 'Payment required',
          data?.balance,
        );
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to invoke agent');
      }

      maybeEmitBalanceChanged(data.balanceAfter);
      const result: AgentResponse = {
        success: data.success,
        output: data.output,
        error: data.error,
        toolCalls: data.toolCalls,
        iterations: data.iterations,
        stopReason: data.stopReason,
        deliverable: data.deliverable ?? null,
      };

      onComplete?.(result);
      return result;
    }
  } catch (error) {
    console.error('[agent-client] Error:', error);
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    return { success: false, output: '', error: err.message };
  }
}

// Tolerant of either SSE (`data: {...}\n\n[DONE]`) or plain JSON, since the
// paywall route can emit either depending on whether the caller asked for streaming.
async function safeReadPaywallPayload(response: Response): Promise<Record<string, unknown> | null> {
  try {
    const text = await response.text();
    const trimmed = text.trim();
    if (trimmed.startsWith('{')) return JSON.parse(trimmed);
    const firstLine = trimmed.split('\n').find((l) => l.startsWith('data: '));
    if (!firstLine) return null;
    const json = firstLine.slice(6).trim();
    if (!json || json === '[DONE]') return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Get agent configuration
 */
export async function getAgentConfig(agentId: string): Promise<AgentConfig | null> {
  try {
    const response = await fetch(`/api/agents/${agentId}/invoke`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Get cost estimate for invoking an agent
 */
export function getCostEstimate(config: AgentConfig): string {
  const { baseRate, currency, perUnit } = config.pricing;
  return `~${baseRate} ${currency}/${perUnit}`;
}

/**
 * List all available agents with their configs
 */
export const AGENT_IDS = [
  'pm',
  'ux-analyst',
  'ui-designer',
  'ui-developer',
  'backend-developer',
  'solidity-developer',
  'solidity-auditor',
  'infrastructure',
  'qa-tester',
  'unit-tester',
  'tech-writer',
  'marketing',
] as const;

export type AgentId = typeof AGENT_IDS[number];
