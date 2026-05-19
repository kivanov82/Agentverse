'use client';

import { useEffect, useState, useMemo } from 'react';
import { useShipWithAIStore } from '@/lib/store';
import { F, fonts, Label, Mono } from './foundry';

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  if (minutes > 0) return `${minutes}m ${remaining}s`;
  return `${remaining}s`;
}

export function ProjectSummary() {
  const { projectStats, deliverables, agents, currentProject } = useShipWithAIStore();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!projectStats.startTime) { setElapsed(0); return; }
    const interval = setInterval(() => {
      setElapsed(Date.now() - projectStats.startTime!);
    }, 1000);
    return () => clearInterval(interval);
  }, [projectStats.startTime]);

  const agentUsage = useMemo(() => {
    const used = new Set<string>();
    deliverables.forEach((d) => used.add(d.producedBy));
    return { used: used.size, total: agents.length };
  }, [deliverables, agents]);

  if (!projectStats.startTime && deliverables.length === 0) {
    return (
      <p style={{
        fontFamily: fonts.display, fontStyle: 'italic',
        fontSize: 15, color: F.inkMute, margin: 0,
      }}>
        Stats appear once the project starts.
      </p>
    );
  }

  const rows: [string, string][] = [
    ['Duration', formatDuration(elapsed)],
    ['Spent', `$${projectStats.totalSpent.toFixed(2)}`],
    ['Tasks', String(projectStats.interactionCount)],
    ['Agents', `${agentUsage.used} / ${agentUsage.total}`],
    ['Deliverables', String(deliverables.length)],
  ];
  if (currentProject) rows.unshift(['Status', currentProject.status]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {rows.map(([k, v], i) => (
        <div
          key={k}
          style={{
            display: 'grid',
            gridTemplateColumns: '180px 1fr',
            padding: '12px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${F.hairlineFaint}`,
            alignItems: 'baseline',
          }}
        >
          <Label size="m" color={F.inkMute}>{k}</Label>
          <Mono size="m" color={F.ink} style={{ letterSpacing: '0.05em' }}>{v}</Mono>
        </div>
      ))}
    </div>
  );
}
