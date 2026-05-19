'use client';

import { useState, useMemo } from 'react';
import { useShipWithAIStore, Deliverable } from '@/lib/store';
import { F, fonts, Label, Mono, Body } from './foundry';

interface AgentGroup {
  agentId: string;
  agentName: string;
  agentInitials: string;
  deliverables: Deliverable[];
}

export function DeliverablesTree() {
  const { deliverables, agents } = useShipWithAIStore();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => {
    const groups: Record<string, AgentGroup> = {};
    deliverables.forEach((d) => {
      if (!groups[d.producedBy]) {
        const agent = agents.find((a) => a.id === d.producedBy);
        groups[d.producedBy] = {
          agentId: d.producedBy,
          agentName: agent?.name || d.producedBy,
          agentInitials: agent?.avatar || d.producedBy.slice(0, 2).toUpperCase(),
          deliverables: [],
        };
      }
      groups[d.producedBy].deliverables.push(d);
    });
    return Object.values(groups);
  }, [deliverables, agents]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (deliverables.length === 0) {
    return (
      <p style={{
        fontFamily: fonts.display, fontStyle: 'italic',
        fontSize: 15, color: F.inkMute, margin: 0,
      }}>
        No deliverables yet — agents publish their work here as it ships.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', borderTop: `1px solid ${F.ink}`, borderBottom: `1px solid ${F.ink}` }}>
      {grouped.map((group, gi) => {
        const open = expanded.has(group.agentId);
        return (
          <div
            key={group.agentId}
            style={{
              borderTop: gi === 0 ? 'none' : `1px solid ${F.hairlineFaint}`,
            }}
          >
            <button
              type="button"
              onClick={() => toggle(group.agentId)}
              style={{
                width: '100%',
                padding: '14px 4px',
                display: 'grid',
                gridTemplateColumns: '24px 28px 1fr auto',
                alignItems: 'center',
                gap: 12,
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                fontFamily: 'inherit', color: 'inherit',
                cursor: 'pointer',
                transition: 'background-color 120ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = F.hover; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Mono size="m" color={F.inkMute}>{open ? '▾' : '▸'}</Mono>
              <span style={{
                width: 24, height: 24, background: F.ink, color: F.surface,
                fontFamily: fonts.mono, fontSize: 9, letterSpacing: '0.05em',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{group.agentInitials}</span>
              <span style={{ fontFamily: fonts.display, fontSize: 17, color: F.ink }}>{group.agentName}</span>
              <Mono size="s" color={F.inkMute}>{group.deliverables.length}</Mono>
            </button>

            {open && (
              <div style={{ paddingLeft: 56, paddingBottom: 6 }}>
                {group.deliverables.map((d) => (
                  <DeliverableRow key={d.id} d={d} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DeliverableRow({ d }: { d: Deliverable }) {
  return (
    <div style={{ padding: '10px 0', borderTop: `1px solid ${F.hairlineFaint}` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontFamily: fonts.display, fontSize: 15, color: F.ink }}>{d.title}</span>
        <Mono size="s" color={F.inkMute} uppercase>{d.type.replace('_', ' ')}</Mono>
      </div>
      {d.description && (
        <Body size="xs" color={F.ink2} style={{ marginTop: 4 }}>{d.description}</Body>
      )}
      {(d.url || d.downloadUrl) && (
        <div style={{ marginTop: 6, display: 'flex', gap: 16 }}>
          {d.url && (
            <a href={d.url} target="_blank" rel="noopener noreferrer" style={{
              fontFamily: fonts.ui, fontSize: 12, color: F.accent,
              borderBottom: `1px solid ${F.accent}`, textDecoration: 'none',
            }}>View</a>
          )}
          {d.downloadUrl && (
            <a href={d.downloadUrl} style={{
              fontFamily: fonts.ui, fontSize: 12, color: F.accent,
              borderBottom: `1px solid ${F.accent}`, textDecoration: 'none',
            }}>Download</a>
          )}
        </div>
      )}
    </div>
  );
}
