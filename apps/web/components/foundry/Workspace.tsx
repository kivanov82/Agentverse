'use client';
import * as React from 'react';
import { F } from './tokens';

interface WorkspaceProps {
  children: React.ReactNode;
}

/**
 * The workspace center column. Renders a scrolling correspondence area
 * (children) over a fixed bottom composer slot. The parent grid supplies
 * the column width (1fr).
 */
export function Workspace({ children }: WorkspaceProps) {
  return (
    <main style={{
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      background: F.surface,
    }}>
      {children}
    </main>
  );
}

export function WorkspaceScroll({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      flex: 1,
      overflow: 'auto',
      padding: '28px 56px',
      minHeight: 0,
    }}>
      {children}
    </div>
  );
}
