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
  NextActionBanner,
  type MessageEntry,
  type MethodEntry,
  InlineMono,
  InlineLink,
} from '@/components/foundry';

const AUDIT_METHODS: MethodEntry[] = [
  { roman: 'I',   name: 'Feynman',             body: "Business-logic sweep. Any step we can't justify becomes a finding." },
  { roman: 'II',  name: 'Nemesis',             body: 'Adversarial loop. We attack our own findings until nothing new surfaces.' },
  { roman: 'III', name: 'State Inconsistency', body: 'Coupled-state desync hunt. Any unupdated partner is a bug waiting to ship.' },
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
    lede: "Technical sweep, content rewrite, schema. We earn the page or learn why we can't.",
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

function focusComposer() {
  const el = document.getElementById('composer-reply') as HTMLTextAreaElement | null;
  if (!el) return;
  el.focus();
  // Scroll into view in case it's below the fold.
  el.scrollIntoView({ behavior: 'smooth', block: 'end' });
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

  // Pending user action heuristic — the banner only renders when this is true.
  // "Pending" = the most recent non-system message is from an agent, OR the
  // folio is brand-new (no messages yet) and the user must brief it.
  const pendingAction = useMemo(() => {
    const last = [...chatMessages].reverse().find((m) => m.role !== 'system');
    if (!last) return activeUseCase ? 'brief' : null;
    return last.role === 'agent' ? 'reply' : null;
  }, [chatMessages, activeUseCase]);

  const bannerDescription = useMemo(() => {
    if (pendingAction === 'brief') {
      return activeUseCase === 'solidity-audit'
        ? 'Pick a direction to begin the audit.'
        : 'Brief the studio to start the work.';
    }
    if (pendingAction === 'reply') return 'An agent is waiting on your reply.';
    return null;
  }, [pendingAction, activeUseCase]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages.length]);

  // RightRail "Ask" → prefill composer with @AgentName.
  useEffect(() => {
    const onAsk = (e: Event) => {
      const detail = (e as CustomEvent<{ agentId: string; agentName: string }>).detail;
      if (!detail) return;
      setInput((prev) => {
        const tag = `@${detail.agentName} `;
        if (prev.startsWith(tag)) return prev;
        return tag + (prev.trimStart() ? prev.trimStart() : '');
      });
      focusComposer();
    };
    window.addEventListener('shipwithai:ask', onAsk);
    return () => window.removeEventListener('shipwithai:ask', onAsk);
  }, []);

  const onSend = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;

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
        addChatMessage({ role: 'system', content: "You're out of credit. Top up to continue." });
      } else {
        addChatMessage({ role: 'system', content: (err as Error).message ?? 'Something went wrong.' });
      }
    } finally {
      setAgentTyping(null);
      updateAgentStatus(targetAgent.id, 'idle');
      setBusy(false);
    }
  }, [input, busy, agents, addChatMessage, setAgentTyping, updateAgentStatus, chatMessages, activeProjectId, activeSession]);

  if (!activeUseCase || !activeProjectId) {
    return (
      <>
        <WorkspaceScroll>
          <FolioHeader
            eyebrow="No folio open"
            title="Begin a commission."
            lede="Open one of the commissions on the landing page to start a folio."
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
      {bannerDescription && (
        <NextActionBanner
          description={bannerDescription}
          onCta={focusComposer}
        />
      )}

      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: '20px 56px 0', minHeight: 0 }}>
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
