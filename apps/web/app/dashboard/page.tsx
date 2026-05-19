'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShipWithAIStore, type ChatMessage } from '@/lib/store';
import { USE_CASES, type UseCaseId } from '@/lib/use-cases';
import { invokeAgent, PaywallError } from '@/lib/agent-client';
import {
  FolioHeader,
  Methodology,
  Correspondence,
  Composer,
  WorkspaceScroll,
  type MessageEntry,
  type MethodEntry,
  InlineMono,
  InlineLink,
} from '@/components/foundry';

const AUDIT_METHODS: MethodEntry[] = [
  {
    roman: 'I',
    name: 'Feynman',
    body: "Business-logic sweep. We explain each contract as if teaching a peer — any step we can't justify becomes a finding.",
  },
  {
    roman: 'II',
    name: 'Nemesis',
    body: 'Adversarial loop. We attack our own findings, feed the counter-findings back, and iterate until nothing new surfaces.',
  },
  {
    roman: 'III',
    name: 'State Inconsistency',
    body: 'Coupled-state desync hunt. Any op that mutates one variable without updating its partner is a bug waiting to ship.',
  },
];

const FOLIO_HEADERS: Record<UseCaseId, { eyebrow: string; title: string; lede: string }> = {
  'solidity-audit': {
    eyebrow: 'Folio I · The Method',
    title: 'How we audit.',
    lede: 'Every contract runs through three methodologies, in order — each one surfaces a different class of bug.',
  },
  seo: {
    eyebrow: 'Folio II · The Brief',
    title: 'How we rank.',
    lede: 'Technical sweep, content rewrite, schema. We earn the page or learn why we can\'t.',
  },
  'landing-page': {
    eyebrow: 'Folio · The Brief',
    title: 'Ship the page.',
    lede: 'Design, build, deploy — one page that converts.',
  },
  'app-prototype': {
    eyebrow: 'Folio · The Sketch',
    title: 'Sketch the app.',
    lede: 'An interactive prototype to show what the idea feels like.',
  },
  ecommerce: {
    eyebrow: 'Folio · The Storefront',
    title: 'Open the store.',
    lede: 'Catalog, payments, shipping — a storefront ready to accept orders.',
  },
};

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function senderInitials(message: ChatMessage, agents: ReturnType<typeof useShipWithAIStore.getState>['agents']): string {
  if (message.role === 'user') return 'YOU';
  if (message.role === 'system') return 'SYS';
  const agent = agents.find((a) => a.id === message.agentId);
  return agent?.avatar ?? 'AI';
}

function senderName(message: ChatMessage, agents: ReturnType<typeof useShipWithAIStore.getState>['agents']): { name: string; role?: string } {
  if (message.role === 'user') return { name: 'You' };
  if (message.role === 'system') return { name: 'System' };
  const agent = agents.find((a) => a.id === message.agentId);
  if (!agent) return { name: 'Agent' };
  return { name: agent.name, role: agent.role };
}

function renderBody(content: string): React.ReactNode {
  // Lightweight inline mark-up: detect `bare-words` (mono) and bare URLs (link).
  const parts: React.ReactNode[] = [];
  const monoRegex = /`([^`]+)`/g;
  const urlRegex = /(https?:\/\/[^\s)]+)/g;

  let remaining = content;
  let keyIdx = 0;
  // Replace URLs first.
  remaining.split(urlRegex).forEach((seg, i) => {
    if (urlRegex.test(seg)) {
      parts.push(<InlineLink key={`u${keyIdx++}`} href={seg}>{seg.replace(/^https?:\/\//, '')}</InlineLink>);
    } else {
      // Within non-URL segments, mono-style `code` runs.
      seg.split(monoRegex).forEach((s, j) => {
        if (j % 2 === 1) {
          parts.push(<InlineMono key={`m${keyIdx++}`}>{s}</InlineMono>);
        } else if (s) {
          parts.push(<span key={`t${keyIdx++}`}>{s}</span>);
        }
      });
    }
  });

  // Render with paragraph breaks for double newlines.
  return content.split(/\n\n+/).map((para, i) => (
    <p key={i} style={{ margin: i === 0 ? '0 0 14px' : '14px 0', textWrap: 'pretty' as any }}>
      {para.split(/\n/).flatMap((line, j, arr) => [
        ...inlineMarkup(line),
        j < arr.length - 1 ? <br key={`br${j}`} /> : null,
      ]).filter(Boolean)}
    </p>
  ));
}

function inlineMarkup(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(`[^`]+`|https?:\/\/[^\s)]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(<span key={`x${key++}`}>{text.slice(last, m.index)}</span>);
    const tok = m[1];
    if (tok.startsWith('`')) {
      out.push(<InlineMono key={`x${key++}`}>{tok.slice(1, -1)}</InlineMono>);
    } else {
      out.push(<InlineLink key={`x${key++}`} href={tok}>{tok.replace(/^https?:\/\//, '')}</InlineLink>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(<span key={`x${key++}`}>{text.slice(last)}</span>);
  return out;
}

export default function WorkspacePage() {
  const router = useRouter();
  const {
    chatMessages,
    agents,
    activeProjectId,
    activeSession,
    activeUseCase,
    addChatMessage,
    setAgentTyping,
    updateAgentStatus,
  } = useShipWithAIStore();

  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const folioCopy = activeUseCase ? FOLIO_HEADERS[activeUseCase as UseCaseId] : null;
  const showMethodology = activeUseCase === 'solidity-audit';

  const messages: MessageEntry[] = useMemo(() => chatMessages
    .filter((m) => m.role !== 'system')
    .slice(-30)
    .map((m) => {
      const sender = senderName(m, agents);
      return {
        id: m.id,
        senderInitials: senderInitials(m, agents),
        senderName: sender.name,
        senderRole: sender.role,
        timestamp: formatTime(m.timestamp),
        body: renderBody(m.content),
      };
    }),
  [chatMessages, agents]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages.length]);

  const onSend = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;

    // Default routing: messages go to PM unless one specific agent owns the
    // active turn. Keeping the new shell simple — PM coordinates handoffs.
    const targetAgent = agents.find((a) => a.id === 'pm');
    if (!targetAgent) return;

    addChatMessage({ role: 'user', content: text, agentId: targetAgent.id });
    setInput('');
    setBusy(true);
    setAgentTyping(targetAgent.id);
    updateAgentStatus(targetAgent.id, 'thinking');

    const history = chatMessages
      .filter((m) => m.role === 'user' || m.role === 'agent')
      .slice(-8)
      .map((m) => ({ role: m.role as 'user' | 'agent', content: m.content }));

    try {
      let buffer = '';
      await invokeAgent({
        agentId: targetAgent.id,
        prompt: text,
        projectId: activeProjectId ?? undefined,
        sessionId: activeSession?.id,
        history,
        stream: true,
        onStream: (chunk) => { buffer += chunk; },
        onComplete: (resp) => {
          if (buffer || resp?.output) {
            addChatMessage({ role: 'agent', agentId: targetAgent.id, content: buffer || resp.output || '' });
          }
        },
      });
    } catch (err) {
      if (err instanceof PaywallError) {
        addChatMessage({ role: 'system', content: 'You\'re out of credit. Top up to continue.' });
      } else {
        addChatMessage({ role: 'system', content: (err as Error).message ?? 'Something went wrong.' });
      }
    } finally {
      setAgentTyping(null);
      updateAgentStatus(targetAgent.id, 'idle');
      setBusy(false);
    }
  }, [input, busy, agents, addChatMessage, setAgentTyping, updateAgentStatus, chatMessages, activeProjectId, activeSession]);

  // Empty workspace — guide user back to the landing
  if (!activeUseCase || !activeProjectId) {
    return (
      <>
        <WorkspaceScroll>
          <FolioHeader
            eyebrow="No folio open"
            title="Begin a commission."
            lede="Open one of the commissions on the landing page to start a folio. Each folio holds the brief, the correspondence, the methodology and the delivery for one engagement."
          />
          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '0.02em',
              padding: '14px 22px',
              background: 'var(--ink)',
              color: 'var(--surface)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 16,
            }}
          >
            Brief a project <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
          </button>
        </WorkspaceScroll>
        <Composer value={input} onChange={setInput} onSend={onSend} disabled />
      </>
    );
  }

  return (
    <>
      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: '28px 56px', minHeight: 0 }}>
        {folioCopy && (
          <FolioHeader
            eyebrow={folioCopy.eyebrow}
            title={folioCopy.title}
            lede={folioCopy.lede}
          />
        )}

        {showMethodology && <Methodology entries={AUDIT_METHODS} />}

        {messages.length > 0 && (
          <Correspondence messages={messages} entryCount={messages.length} />
        )}
      </div>
      <Composer
        value={input}
        onChange={setInput}
        onSend={onSend}
        disabled={busy}
      />
    </>
  );
}
