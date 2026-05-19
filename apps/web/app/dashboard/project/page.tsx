'use client';

import { useShipWithAIStore } from '@/lib/store';
import { ProjectBrief } from '@/components/ProjectBrief';
import { DeliverablesTree } from '@/components/DeliverablesTree';
import { ProjectSummary } from '@/components/ProjectSummary';
import {
  FolioHeader,
  WorkspaceScroll,
  Composer,
  Label,
  Mono,
  F,
} from '@/components/foundry';
import { useState } from 'react';

export default function ProjectPage() {
  const {
    deliverables,
    activeUseCase,
    activeSession,
    agents,
  } = useShipWithAIStore();
  const isUseCaseMode = !!activeUseCase;
  const [input, setInput] = useState('');

  return (
    <>
      <WorkspaceScroll>
        <FolioHeader
          eyebrow="Folio · The Record"
          title="Project."
          lede="The brief, the residents, the deliveries — all in one ledger."
        />

        {isUseCaseMode && (
          <Section label="Brief">
            <ProjectBrief />
          </Section>
        )}

        {activeSession && (
          <Section label={`Residents · ${activeSession.involvedAgents.length}`}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {activeSession.involvedAgents.length === 0 ? (
                <p style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 15, color: F.inkMute, margin: 0,
                }}>
                  No residents yet — open correspondence on the workspace to involve agents.
                </p>
              ) : (
                activeSession.involvedAgents.map((id) => {
                  const a = agents.find((x) => x.id === id);
                  if (!a) return null;
                  return (
                    <div
                      key={id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 10px',
                        border: `1px solid ${F.hairline}`,
                        background: F.surface,
                      }}
                    >
                      <span style={{
                        width: 22, height: 22, background: F.ink, color: F.surface,
                        fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.05em',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{a.avatar}</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: F.ink }}>{a.name}</span>
                      <Mono size="s" color={F.inkMute}>{a.role}</Mono>
                    </div>
                  );
                })
              )}
            </div>
          </Section>
        )}

        <Section label="Summary">
          <ProjectSummary />
        </Section>

        <Section label={deliverables.length ? `Deliverables · ${deliverables.length}` : 'Deliverables'}>
          <DeliverablesTree />
        </Section>
      </WorkspaceScroll>

      <Composer value={input} onChange={setInput} onSend={() => setInput('')} disabled />
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section style={{
      marginTop: 32,
      borderTop: `1px solid ${F.hairline}`,
      paddingTop: 18,
    }}>
      <div style={{ marginBottom: 16 }}>
        <Label size="l" color={F.ink}>{label}</Label>
      </div>
      {children}
    </section>
  );
}
