// Persistence-layer types shared across stores (Firestore is the live implementation).
// These types describe documents/collections regardless of backend.

export interface StoredProject {
  id: string;
  name: string;
  description?: string;
  status: string;
  budget?: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface StoredSession {
  id: string;
  projectId?: string;
  name: string;
  description?: string;
  status: string;
  involvedAgents: string[];
  context: Record<string, string>;             // per-agent summaries
  projectFacts?: string;                       // persistent project facts block
  forkedFrom?: string;                         // session ID this was forked from
  contextTimestamps?: Record<string, number>;  // agentId → timestamp of last summary update
  createdAt: number;
  updatedAt: number;
}

export interface StoredChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'agent' | 'system';
  agentId?: string;
  content: string;
  isQuestion: boolean;
  options?: string[];
  timestamp: number;
}

export interface StoredDeliverable {
  id: string;
  sessionId?: string;
  projectId?: string;
  type: string;
  title: string;
  description?: string;
  url?: string;
  downloadUrl?: string;
  preview?: string;
  producedBy: string;
  createdAt: number;
}

export interface StoredDeliverableContent {
  deliverableId: string;
  content: string;
  contentType: string;
  fileName?: string;
}

export interface StoredDeliveryRequest {
  id: string;
  sessionId: string;
  agentId: string;
  description?: string;
  estimatedCost?: string;
  status: string;
  txHash?: string;
  output?: string;
  createdAt: number;
}

export interface StoredInvocationCost {
  id: string;
  sessionId?: string;
  agentId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  apiCost: number;
  userCharge: number;
  mode: string;
  userId?: string;
  createdAt: number;
}

// Authenticated user account. Linked identities are stored separately in
// `linkedIdentities` keyed by `${provider}_${providerId}` so the same user
// can sign in via Google or SIWE wallet and reach the same balance.
export interface StoredUser {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  walletAddress?: string;
  creditBalance: number;
  starterCreditGranted: boolean;
  createdAt: number;
  updatedAt: number;
}

export type IdentityProvider = 'google' | 'siwe';

export interface StoredLinkedIdentity {
  id: string;              // `${provider}_${providerId}`
  userId: string;
  provider: IdentityProvider;
  providerId: string;      // sub for OAuth, lowercased address for SIWE
  linkedAt: number;
}

export type CreditSource =
  | 'starter_grant'
  | 'agent_invocation'
  | 'stripe'
  | 'x402'
  | 'admin_adjustment';

export interface StoredCreditEntry {
  id: string;
  userId: string;
  delta: number;          // positive for credits, negative for debits
  balanceAfter: number;
  source: CreditSource;
  invocationCostId?: string;
  note?: string;
  createdAt: number;
}
