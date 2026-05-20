'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShipWithAIStore, type ChatMessage } from '@/lib/store';
import { invokeAgent, PaywallError } from '@/lib/agent-client';
import {
  Composer,
  NextActionBanner,
  InlineMono,
  InlineLink,
  F,
  fonts,
} from '@/components/foundry';
import { AvatarTile } from '@/components/foundry/RightRail';

const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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

function renderBody(content: string): React.ReactNode {
  return content.split(/\n\n+/).map((para, i) => (
    <p key={i} style={{ margin: i === 0 ? '0 0 12px' : '12px 0', textWrap: 'pretty' as any }}>
      {para.split(/\n/).flatMap((line, j, arr) => [
        ...inlineMarkup(line),
        j < arr.length - 1 ? <br key={`br${j}`} /> : null,
      ]).filter(Boolean)}
    </p>
  ));
}

function focusComposer() {
  const el = document.getElementById('composer-reply') as HTMLInputElement | null;
  if (!el) return;
  el.focus();
  el.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

interface EntryProps {
  initials: string;
  isYou: boolean;
  name: string;
  role?: string;
  timestamp: string;
  body: React.ReactNode;
}

function Entry({ initials, isYou, name, role, timestamp, body }: EntryProps) {
  return (
    <article style={{ marginBottom: 22 }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 8,
        }}
      >
        <AvatarTile size={24} initials={initials} variant={isYou ? 'you' : 'agent'} />
        <span style={{ fontFamily: fonts.display, fontSize: 15, color: F.ink, lineHeight: 1.1 }}>
          {name}
        </span>
        {role && (
          <>
            <span style={{ fontFamily: fonts.ui, fontSize: 11, color: F.inkMute }}>·</span>
            <span style={{ fontFamily: fonts.ui, fontSize: 11, color: F.inkMute }}>{role}</span>
          </>
        )}
        <span style={{
          marginLeft: 'auto',
          fontFamily: fonts.mono,
          fontSize: 10,
          letterSpacing: '0.16em',
          color: F.inkMute,
        }}>
          {timestamp}
        </span>
      </header>
      <div
        style={{
          paddingLeft: 34,
          fontFamily: fonts.display,
          fontSize: 16,
          lineHeight: 1.55,
          color: F.ink,
        }}
      >
        {body}
      </div>
    </article>
  );
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

  const entries = useMemo(() => {
    return chatMessages
      .filter((m) => m.role !== 'system')
      .slice(-50)
      .map((m: ChatMessage) => {
        if (m.role === 'user') {
          return {
            id: m.id,
            initials: 'YOU',
            isYou: true,
            name: 'You',
            role: undefined as string | undefined,
            timestamp: formatTime(m.timestamp),
            body: renderBody(m.content),
          };
        }
        const agent = agents.find((a) => a.id === m.agentId);
        return {
          id: m.id,
          initials: agent?.avatar ?? 'AI',
          isYou: false,
          name: agent?.name ?? 'Agent',
          role: agent?.role,
          timestamp: formatTime(m.timestamp),
          body: renderBody(m.content),
        };
      });
  }, [chatMessages, agents]);

  // Pending action heuristic — banner only when something needs the user.
  const pendingAction = useMemo(() => {
    const last = [...chatMessages].reverse().find((m) => m.role !== 'system');
    if (!last) return activeUseCase ? 'brief' : null;
    return last.role === 'agent' ? 'reply' : null;
  }, [chatMessages, activeUseCase]);

  const bannerDescription = useMemo(() => {
    if (pendingAction === 'brief') {
      return activeUseCase === 'solidity-audit'
        ? 'Brief the auditor to begin.'
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

  // Empty state — no active folio
  if (!activeUseCase || !activeProjectId) {
    return (
      <>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            padding: '24px 48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <p style={{
            fontFamily: fonts.display, fontSize: 22, color: F.ink, margin: 0,
            letterSpacing: '-0.01em',
          }}>
            Begin a commission.
          </p>
          <p style={{
            fontFamily: fonts.ui, fontSize: 14, color: F.ink2, margin: 0,
            maxWidth: 380, textAlign: 'center',
          }}>
            Pick a commission on the home page to start a folio.
          </p>
          <button
            type="button"
            onClick={() => router.push('/')}
            style={{
              marginTop: 12,
              fontFamily: fonts.ui,
              fontSize: 14, fontWeight: 500, letterSpacing: '0.02em',
              padding: '12px 20px',
              background: F.ink, color: F.surface,
              border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 10,
            }}
          >
            Brief a project <span aria-hidden="true" style={{ fontSize: 17 }}>→</span>
          </button>
        </div>
        <Composer value={input} onChange={setInput} onSend={onSend} disabled />
      </>
    );
  }

  return (
    <>
      {bannerDescription && (
        <NextActionBanner
          description={bannerDescription}
          ctaLabel="Reply"
          onCta={focusComposer}
        />
      )}

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          padding: '24px 48px 8px',
        }}
      >
        {entries.length === 0 ? (
          <p style={{
            fontFamily: fonts.display, fontStyle: 'italic',
            fontSize: 17, color: F.inkMute, margin: '12px 0 0',
          }}>
            No correspondence yet. Brief the studio below to begin.
          </p>
        ) : (
          entries.map((e) => (
            <Entry
              key={e.id}
              initials={e.initials}
              isYou={e.isYou}
              name={e.name}
              role={e.role}
              timestamp={e.timestamp}
              body={e.body}
            />
          ))
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
