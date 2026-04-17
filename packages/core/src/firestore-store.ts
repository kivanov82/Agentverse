// Project persistence layer - Firestore-based storage (the live data layer)
import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { nanoid } from 'nanoid';

// Re-export shared persistence types so API routes can import from here directly
export type {
  StoredProject,
  StoredSession,
  StoredChatMessage,
  StoredDeliverable,
  StoredDeliverableContent,
  StoredDeliveryRequest,
  StoredInvocationCost,
  StoredUser,
  StoredLinkedIdentity,
  StoredCreditEntry,
  IdentityProvider,
  CreditSource,
} from './types-stored';

import type {
  StoredProject,
  StoredSession,
  StoredChatMessage,
  StoredDeliverable,
  StoredDeliverableContent,
  StoredDeliveryRequest,
  StoredInvocationCost,
  StoredUser,
  StoredLinkedIdentity,
  StoredCreditEntry,
  IdentityProvider,
  CreditSource,
} from './types-stored';

// ---- Firebase init ----

function getApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;

  // If running on GCP (Cloud Run), use default credentials
  if (process.env.K_SERVICE || process.env.GOOGLE_CLOUD_PROJECT) {
    return initializeApp({ projectId });
  }

  // Local dev: use service account key if provided
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (keyPath) {
    const path = require('path');
    const fs = require('fs');
    const resolved = path.isAbsolute(keyPath) ? keyPath : path.resolve(process.cwd(), keyPath);
    const serviceAccount = JSON.parse(fs.readFileSync(resolved, 'utf8'));
    return initializeApp({ credential: cert(serviceAccount), projectId });
  }

  // Fallback: FIREBASE_CONFIG or default credentials
  return initializeApp({ projectId });
}

// ---- FirestoreStore class ----

export class FirestoreStore {
  private db: Firestore;

  constructor() {
    const app = getApp();
    this.db = getFirestore(app);
    try {
      this.db.settings({ ignoreUndefinedProperties: true });
    } catch {
      // Already initialized (e.g. HMR) — safe to ignore
    }
  }

  // ---- Projects ----

  async saveProject(project: Omit<StoredProject, 'createdAt' | 'updatedAt'> & { createdAt?: number; updatedAt?: number }): Promise<StoredProject> {
    const now = Date.now();
    const full: StoredProject = {
      ...project,
      createdAt: project.createdAt ?? now,
      updatedAt: project.updatedAt ?? now,
    };
    await this.db.collection('projects').doc(full.id).set(full);
    return full;
  }

  async getProject(id: string): Promise<StoredProject | null> {
    const doc = await this.db.collection('projects').doc(id).get();
    return doc.exists ? (doc.data() as StoredProject) : null;
  }

  async listProjects(options: { status?: string; limit?: number } = {}): Promise<StoredProject[]> {
    let q = this.db.collection('projects').orderBy('updatedAt', 'desc') as FirebaseFirestore.Query;
    if (options.status) q = q.where('status', '==', options.status);
    if (options.limit) q = q.limit(options.limit);
    const snap = await q.get();
    return snap.docs.map((d) => d.data() as StoredProject);
  }

  // ---- Sessions ----

  async saveSession(session: Omit<StoredSession, 'createdAt' | 'updatedAt'> & { createdAt?: number; updatedAt?: number }): Promise<StoredSession> {
    const now = Date.now();
    const full: StoredSession = {
      ...session,
      createdAt: session.createdAt ?? now,
      updatedAt: session.updatedAt ?? now,
    };
    await this.db.collection('sessions').doc(full.id).set(full);
    return full;
  }

  async getSession(id: string): Promise<StoredSession | null> {
    const doc = await this.db.collection('sessions').doc(id).get();
    return doc.exists ? (doc.data() as StoredSession) : null;
  }

  async listSessions(options: { projectId?: string; status?: string; limit?: number } = {}): Promise<StoredSession[]> {
    let q = this.db.collection('sessions').orderBy('updatedAt', 'desc') as FirebaseFirestore.Query;
    if (options.projectId) q = q.where('projectId', '==', options.projectId);
    if (options.status) q = q.where('status', '==', options.status);
    if (options.limit) q = q.limit(options.limit);
    const snap = await q.get();
    return snap.docs.map((d) => d.data() as StoredSession);
  }

  async updateSessionStatus(id: string, status: string): Promise<void> {
    await this.db.collection('sessions').doc(id).update({ status, updatedAt: Date.now() });
  }

  async updateSessionAgents(id: string, involvedAgents: string[]): Promise<void> {
    await this.db.collection('sessions').doc(id).update({ involvedAgents, updatedAt: Date.now() });
  }

  async updateSessionContext(id: string, context: Record<string, string>): Promise<void> {
    await this.db.collection('sessions').doc(id).update({ context, updatedAt: Date.now() });
  }

  async updateSession(id: string, updates: Partial<StoredSession>): Promise<void> {
    await this.db.collection('sessions').doc(id).update({ ...updates, updatedAt: Date.now() });
  }

  /**
   * Fork a session for divergent exploration.
   * Creates a new session with the same context and project facts, linked to the original.
   */
  async forkSession(sessionId: string, newName: string): Promise<StoredSession> {
    const original = await this.getSession(sessionId);
    if (!original) throw new Error(`Session ${sessionId} not found`);

    const { nanoid } = await import('nanoid');
    const now = Date.now();
    const forked: StoredSession = {
      ...original,
      id: nanoid(),
      name: newName,
      description: `Forked from "${original.name}"`,
      forkedFrom: sessionId,
      status: original.status,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.collection('sessions').doc(forked.id).set(forked);
    return forked;
  }

  /**
   * Check which agent summaries are stale (older than the given threshold).
   * Returns agent IDs whose context summaries may be outdated.
   */
  getStaleContextAgents(session: StoredSession, maxAgeMs: number = 30 * 60 * 1000): string[] {
    const now = Date.now();
    const timestamps = session.contextTimestamps || {};
    return Object.entries(session.context)
      .filter(([agentId]) => {
        const ts = timestamps[agentId];
        return !ts || (now - ts) > maxAgeMs;
      })
      .map(([agentId]) => agentId);
  }

  // ---- Chat Messages ----

  async saveChatMessage(message: Omit<StoredChatMessage, 'id' | 'timestamp'> & { id?: string; timestamp?: number }): Promise<StoredChatMessage> {
    const full: StoredChatMessage = {
      ...message,
      id: message.id ?? nanoid(),
      timestamp: message.timestamp ?? Date.now(),
    };
    await this.db.collection('sessions').doc(full.sessionId).collection('messages').doc(full.id).set(full);
    return full;
  }

  async getChatMessages(sessionId: string, options: { limit?: number; since?: number } = {}): Promise<StoredChatMessage[]> {
    let q = this.db.collection('sessions').doc(sessionId).collection('messages').orderBy('timestamp', 'asc') as FirebaseFirestore.Query;
    if (options.since) q = q.where('timestamp', '>', options.since);
    if (options.limit) q = q.limit(options.limit);
    const snap = await q.get();
    return snap.docs.map((d) => d.data() as StoredChatMessage);
  }

  // ---- Deliverables ----

  async saveDeliverable(deliverable: Omit<StoredDeliverable, 'id' | 'createdAt'> & { id?: string; createdAt?: number }): Promise<StoredDeliverable> {
    const full: StoredDeliverable = {
      ...deliverable,
      id: deliverable.id ?? nanoid(),
      createdAt: deliverable.createdAt ?? Date.now(),
    };
    await this.db.collection('deliverables').doc(full.id).set(full);
    return full;
  }

  async getDeliverable(id: string): Promise<StoredDeliverable | null> {
    const doc = await this.db.collection('deliverables').doc(id).get();
    return doc.exists ? (doc.data() as StoredDeliverable) : null;
  }

  async getDeliverables(options: { sessionId?: string; projectId?: string; type?: string } = {}): Promise<StoredDeliverable[]> {
    let q = this.db.collection('deliverables').orderBy('createdAt', 'desc') as FirebaseFirestore.Query;
    if (options.sessionId) q = q.where('sessionId', '==', options.sessionId);
    if (options.projectId) q = q.where('projectId', '==', options.projectId);
    if (options.type) q = q.where('type', '==', options.type);
    const snap = await q.get();
    return snap.docs.map((d) => d.data() as StoredDeliverable);
  }

  // ---- Deliverable Content ----

  async saveDeliverableContent(content: StoredDeliverableContent, docKey: string = 'main'): Promise<void> {
    await this.db.collection('deliverables').doc(content.deliverableId).collection('content').doc(docKey).set(content);
  }

  async getDeliverableContent(deliverableId: string, docKey: string = 'main'): Promise<StoredDeliverableContent | null> {
    const doc = await this.db.collection('deliverables').doc(deliverableId).collection('content').doc(docKey).get();
    return doc.exists ? (doc.data() as StoredDeliverableContent) : null;
  }

  // ---- Delivery Requests ----

  async saveDeliveryRequest(request: Omit<StoredDeliveryRequest, 'createdAt'> & { createdAt?: number }): Promise<StoredDeliveryRequest> {
    const full: StoredDeliveryRequest = {
      ...request,
      createdAt: request.createdAt ?? Date.now(),
    };
    await this.db.collection('sessions').doc(full.sessionId).collection('deliveryRequests').doc(full.id).set(full);
    return full;
  }

  async getDeliveryRequests(sessionId: string): Promise<StoredDeliveryRequest[]> {
    const snap = await this.db.collection('sessions').doc(sessionId).collection('deliveryRequests').orderBy('createdAt', 'asc').get();
    return snap.docs.map((d) => d.data() as StoredDeliveryRequest);
  }

  async updateDeliveryRequestStatus(id: string, sessionId: string, status: string, txHash?: string, output?: string): Promise<void> {
    const updates: Record<string, unknown> = { status };
    if (txHash !== undefined) updates.txHash = txHash;
    if (output !== undefined) updates.output = output;
    await this.db.collection('sessions').doc(sessionId).collection('deliveryRequests').doc(id).update(updates);
  }

  // ---- Invocation Costs ----

  async saveInvocationCost(cost: Omit<StoredInvocationCost, 'id' | 'createdAt'> & { id?: string; createdAt?: number }): Promise<StoredInvocationCost> {
    const full: StoredInvocationCost = {
      ...cost,
      id: cost.id ?? nanoid(),
      createdAt: cost.createdAt ?? Date.now(),
    };
    await this.db.collection('invocationCosts').doc(full.id).set(full);
    return full;
  }

  async getCostSummary(options: { sessionId?: string; agentId?: string } = {}): Promise<{ totalApiCost: number; totalUserCharge: number; count: number }> {
    let q = this.db.collection('invocationCosts') as FirebaseFirestore.Query;
    if (options.sessionId) q = q.where('sessionId', '==', options.sessionId);
    if (options.agentId) q = q.where('agentId', '==', options.agentId);
    const snap = await q.get();

    let totalApiCost = 0;
    let totalUserCharge = 0;
    snap.docs.forEach((d) => {
      const data = d.data() as StoredInvocationCost;
      totalApiCost += data.apiCost;
      totalUserCharge += data.userCharge;
    });
    return { totalApiCost, totalUserCharge, count: snap.size };
  }

  // ---- Workflows ----

  async saveWorkflow(workflow: { id: string; projectId: string; steps: any[]; status: string; createdAt: number; updatedAt: number }): Promise<void> {
    const { steps, ...workflowData } = workflow;
    await this.db.collection('workflows').doc(workflow.id).set(workflowData);

    const batch = this.db.batch();
    for (const step of steps) {
      const stepRef = this.db.collection('workflows').doc(workflow.id).collection('steps').doc(step.id);
      batch.set(stepRef, step);
    }
    await batch.commit();
  }

  async getWorkflow(workflowId: string): Promise<{ id: string; projectId: string; steps: any[]; status: string; createdAt: number; updatedAt: number } | null> {
    const doc = await this.db.collection('workflows').doc(workflowId).get();
    if (!doc.exists) return null;

    const data = doc.data()!;
    const stepsSnap = await this.db.collection('workflows').doc(workflowId).collection('steps').get();
    const steps = stepsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return { ...data, steps } as any;
  }

  async listWorkflows(projectId: string): Promise<any[]> {
    const snap = await this.db.collection('workflows').where('projectId', '==', projectId).orderBy('createdAt', 'desc').get();
    const results = [];
    for (const doc of snap.docs) {
      const wf = await this.getWorkflow(doc.id);
      if (wf) results.push(wf);
    }
    return results;
  }

  async listRunningWorkflows(): Promise<any[]> {
    const snap = await this.db.collection('workflows').where('status', '==', 'running').get();
    const results = [];
    for (const doc of snap.docs) {
      const wf = await this.getWorkflow(doc.id);
      if (wf) results.push(wf);
    }
    return results;
  }

  async updateWorkflowStep(workflowId: string, stepId: string, updates: Record<string, any>): Promise<void> {
    await this.db.collection('workflows').doc(workflowId).collection('steps').doc(stepId).update(updates);
    await this.db.collection('workflows').doc(workflowId).update({ updatedAt: Date.now() });
  }

  async updateWorkflowStatus(workflowId: string, status: string): Promise<void> {
    await this.db.collection('workflows').doc(workflowId).update({ status, updatedAt: Date.now() });
  }

  // ---- Users & Linked Identities ----

  async getUser(userId: string): Promise<StoredUser | null> {
    const doc = await this.db.collection('users').doc(userId).get();
    return doc.exists ? (doc.data() as StoredUser) : null;
  }

  async findUserByIdentity(provider: IdentityProvider, providerId: string): Promise<StoredUser | null> {
    const identityId = `${provider}_${providerId}`;
    const identityDoc = await this.db.collection('linkedIdentities').doc(identityId).get();
    if (!identityDoc.exists) return null;
    const identity = identityDoc.data() as StoredLinkedIdentity;
    return this.getUser(identity.userId);
  }

  /**
   * Look up (or create) the user behind a given identity. On first sign-up,
   * grants $5 of starter credit in the same transaction — so we never
   * double-grant if the signIn callback races.
   */
  async getOrCreateUserByIdentity(
    provider: IdentityProvider,
    providerId: string,
    profile: { email?: string; name?: string; image?: string; walletAddress?: string },
    starterCredit: number,
  ): Promise<StoredUser> {
    const identityId = `${provider}_${providerId}`;
    const identityRef = this.db.collection('linkedIdentities').doc(identityId);

    return this.db.runTransaction(async (tx) => {
      const identitySnap = await tx.get(identityRef);
      if (identitySnap.exists) {
        const identity = identitySnap.data() as StoredLinkedIdentity;
        const userRef = this.db.collection('users').doc(identity.userId);
        const userSnap = await tx.get(userRef);
        if (userSnap.exists) return userSnap.data() as StoredUser;
      }

      // New user — create User + grant starter credit + write ledger entry atomically
      const now = Date.now();
      const userId = nanoid();
      const user: StoredUser = {
        id: userId,
        email: profile.email,
        name: profile.name,
        image: profile.image,
        walletAddress: provider === 'siwe' ? providerId : profile.walletAddress,
        creditBalance: starterCredit,
        starterCreditGranted: true,
        createdAt: now,
        updatedAt: now,
      };
      tx.set(this.db.collection('users').doc(userId), user);

      const identity: StoredLinkedIdentity = {
        id: identityId,
        userId,
        provider,
        providerId,
        linkedAt: now,
      };
      tx.set(identityRef, identity);

      if (starterCredit > 0) {
        const entry: StoredCreditEntry = {
          id: nanoid(),
          userId,
          delta: starterCredit,
          balanceAfter: starterCredit,
          source: 'starter_grant',
          note: 'Welcome bonus',
          createdAt: now,
        };
        tx.set(this.db.collection('creditLedger').doc(entry.id), entry);
      }

      return user;
    });
  }

  async linkIdentity(
    userId: string,
    provider: IdentityProvider,
    providerId: string,
  ): Promise<void> {
    const identityId = `${provider}_${providerId}`;
    const identity: StoredLinkedIdentity = {
      id: identityId,
      userId,
      provider,
      providerId,
      linkedAt: Date.now(),
    };
    await this.db.collection('linkedIdentities').doc(identityId).set(identity);
  }

  // ---- Credit Ledger ----

  async getBalance(userId: string): Promise<number> {
    const doc = await this.db.collection('users').doc(userId).get();
    return doc.exists ? (doc.data() as StoredUser).creditBalance ?? 0 : 0;
  }

  /**
   * Applies a signed delta to the user balance and writes a ledger entry in
   * the same transaction. Returns the new balance. Throws if debiting below
   * zero — callers should pre-check balance and surface a paywall.
   */
  async applyCreditDelta(
    userId: string,
    delta: number,
    source: CreditSource,
    meta: { invocationCostId?: string; note?: string } = {},
  ): Promise<number> {
    const userRef = this.db.collection('users').doc(userId);
    const entryRef = this.db.collection('creditLedger').doc();

    return this.db.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);
      if (!userSnap.exists) throw new Error(`User ${userId} not found`);
      const user = userSnap.data() as StoredUser;
      const current = user.creditBalance ?? 0;
      const next = current + delta;
      if (next < 0) throw new Error(`Insufficient credit: ${current} + (${delta}) < 0`);

      const now = Date.now();
      tx.update(userRef, { creditBalance: next, updatedAt: now });

      const entry: StoredCreditEntry = {
        id: entryRef.id,
        userId,
        delta,
        balanceAfter: next,
        source,
        invocationCostId: meta.invocationCostId,
        note: meta.note,
        createdAt: now,
      };
      tx.set(entryRef, entry);

      return next;
    });
  }

  async listLedgerEntries(userId: string, limit: number = 20): Promise<StoredCreditEntry[]> {
    const snap = await this.db
      .collection('creditLedger')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map((d) => d.data() as StoredCreditEntry);
  }
}

// Singleton
let instance: FirestoreStore | null = null;

export function getFirestoreStore(): FirestoreStore {
  if (!instance) instance = new FirestoreStore();
  return instance;
}
