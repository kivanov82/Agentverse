// In-memory event bus. Persistence lives in Firestore for long-lived data;
// this bus only exists to wire local pub/sub between tools that still call
// `getEventBus()`. `dbPath` and the polling helpers are kept for backwards
// compatibility with legacy call sites but are effectively no-ops.
import { nanoid } from 'nanoid';
import type { AgentEvent, EventType, AgentId } from './types';

// Bounded to keep the long-lived server process from growing without limit.
// Consumers that need durable history should write to Firestore instead.
const MAX_EVENTS = 1000;

export class EventBus {
  private events: AgentEvent[] = [];
  private subscribers: Map<string, (event: AgentEvent) => void> = new Map();
  private pollInterval: NodeJS.Timeout | null = null;
  private lastEventId: string | null = null;

  constructor(_dbPath?: string) {
    // dbPath is accepted for compatibility; the bus is in-memory.
  }

  emit(event: Omit<AgentEvent, 'id' | 'timestamp'>): AgentEvent {
    const fullEvent: AgentEvent = {
      ...event,
      id: nanoid(),
      timestamp: Date.now(),
    };

    this.events.push(fullEvent);
    if (this.events.length > MAX_EVENTS) {
      this.events.splice(0, this.events.length - MAX_EVENTS);
    }
    this.subscribers.forEach((callback) => callback(fullEvent));

    return fullEvent;
  }

  subscribe(callback: (event: AgentEvent) => void): string {
    const subscriptionId = nanoid();
    this.subscribers.set(subscriptionId, callback);
    return subscriptionId;
  }

  unsubscribe(subscriptionId: string): void {
    this.subscribers.delete(subscriptionId);
  }

  getEvents(options: {
    type?: EventType;
    source?: AgentId | 'system' | 'user';
    target?: AgentId;
    projectId?: string;
    since?: number;
    limit?: number;
  } = {}): AgentEvent[] {
    let filtered = this.events;

    if (options.type) filtered = filtered.filter((e) => e.type === options.type);
    if (options.source) filtered = filtered.filter((e) => e.source === options.source);
    if (options.target) filtered = filtered.filter((e) => e.target === options.target);
    if (options.projectId) filtered = filtered.filter((e) => e.projectId === options.projectId);
    if (options.since !== undefined) filtered = filtered.filter((e) => e.timestamp > options.since!);

    // Newest first
    const sorted = [...filtered].sort((a, b) => b.timestamp - a.timestamp);
    return options.limit ? sorted.slice(0, options.limit) : sorted;
  }

  startPolling(callback: (events: AgentEvent[]) => void, intervalMs: number = 1000): void {
    this.pollInterval = setInterval(() => {
      const events = this.getEvents({
        since: this.lastEventId ? undefined : Date.now() - intervalMs,
        limit: 100,
      });

      if (events.length > 0) {
        this.lastEventId = events[0].id;
        callback(events.reverse());
      }
    }, intervalMs);
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  close(): void {
    this.stopPolling();
    this.events = [];
    this.subscribers.clear();
  }
}

let eventBusInstance: EventBus | null = null;

export function getEventBus(dbPath?: string): EventBus {
  if (!eventBusInstance) {
    eventBusInstance = new EventBus(dbPath);
  }
  return eventBusInstance;
}

export const events = {
  taskCreated: (source: AgentId | 'user', projectId: string, task: { id: string; title: string; description: string }) =>
    getEventBus().emit({
      type: 'task.created',
      source,
      projectId,
      payload: task,
    }),

  taskAssigned: (source: AgentId, target: AgentId, projectId: string, taskId: string) =>
    getEventBus().emit({
      type: 'task.assigned',
      source,
      target,
      projectId,
      payload: { taskId },
    }),

  taskCompleted: (source: AgentId, projectId: string, taskId: string, artifacts?: string[] | Record<string, unknown>) =>
    getEventBus().emit({
      type: 'task.completed',
      source,
      projectId,
      payload: { taskId, ...(Array.isArray(artifacts) ? { artifacts } : artifacts || {}) },
    }),

  paymentSent: (from: AgentId | 'user', to: AgentId, amount: string, txHash?: string) =>
    getEventBus().emit({
      type: 'payment.sent',
      source: from,
      target: to,
      payload: { amount, txHash },
    }),

  messageSent: (from: AgentId, to: AgentId | 'user', message: string, projectId?: string) =>
    getEventBus().emit({
      type: 'message.sent',
      source: from,
      target: to as AgentId,
      projectId,
      payload: { message },
    }),

  artifactProduced: (source: AgentId, projectId: string, artifact: { path: string; type: string; description: string }) =>
    getEventBus().emit({
      type: 'artifact.produced',
      source,
      projectId,
      payload: artifact,
    }),

  taskFailed: (source: AgentId, projectId: string, taskId: string, error: string) =>
    getEventBus().emit({
      type: 'task.failed',
      source,
      projectId,
      payload: { taskId, error },
    }),

  taskRetrying: (source: AgentId, projectId: string, taskId: string, attempt: number, maxRetries: number) =>
    getEventBus().emit({
      type: 'task.retrying',
      source,
      projectId,
      payload: { taskId, attempt, maxRetries },
    }),

  taskEscalated: (source: AgentId, projectId: string, taskId: string, reason: string) =>
    getEventBus().emit({
      type: 'task.escalated',
      source,
      projectId,
      payload: { taskId, reason },
    }),
};
