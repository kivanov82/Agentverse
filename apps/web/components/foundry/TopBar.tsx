'use client';
import * as React from 'react';
import Link from 'next/link';
import { F, fonts } from './tokens';
import { RegMark } from './marks';
import { Wordmark } from './Wordmark';

export interface WorkspaceTab {
  id: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

interface TopBarProps {
  /** Optional folio name — renders as breadcrumb after "Folios /". Omit on neutral pages. */
  folioName?: string;
  onFoliosClick?: () => void;
  tabs: WorkspaceTab[];
  live?: boolean;
}

/** Workspace top bar — replaces v2 masthead. Breadcrumb + clickable tabs + live pip. */
export function TopBar({ folioName, onFoliosClick, tabs, live = true }: TopBarProps) {
  return (
    <header
      style={{
        height: 56,
        padding: '0 24px',
        borderBottom: `1px solid ${F.hairline}`,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        background: F.surface,
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {/* Left cluster — brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 200 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
          <RegMark size={16} strokeWidth={1.1} />
          <Wordmark size={19} />
        </Link>
      </div>

      {/* Breadcrumb */}
      {folioName && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <button
            type="button"
            onClick={onFoliosClick}
            style={{
              background: 'transparent', border: 'none', padding: 0,
              fontFamily: fonts.ui, fontSize: 13, color: F.inkMute,
              cursor: onFoliosClick ? 'pointer' : 'default',
              transition: 'color 120ms ease',
            }}
            onMouseEnter={(e) => { if (onFoliosClick) e.currentTarget.style.color = F.ink2; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = F.inkMute; }}
          >
            Folios
          </button>
          <span style={{ fontFamily: fonts.ui, fontSize: 13, color: F.inkMute }}>/</span>
          <span style={{
            fontFamily: fonts.display, fontSize: 16, color: F.ink, letterSpacing: '-0.005em',
          }}>{folioName}</span>
        </div>
      )}

      {/* Tabs (pushed right) */}
      <div style={{
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'stretch',
        height: '100%',
      }}>
        {tabs.map((t) => <Tab key={t.id} tab={t} />)}
      </div>

      {/* Status pip */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        paddingLeft: 16,
        marginLeft: 8,
        borderLeft: `1px solid ${F.hairline}`,
        height: 24,
      }}>
        <span
          aria-hidden="true"
          className={live ? 'live-pulse' : ''}
          style={{ width: 7, height: 7, borderRadius: '50%', background: live ? F.signal : F.inkMute }}
        />
        <span style={{
          fontFamily: fonts.ui, fontSize: 10, fontWeight: 600,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: F.ink,
        }}>{live ? 'Live' : 'Idle'}</span>
      </div>
    </header>
  );
}

function Tab({ tab }: { tab: WorkspaceTab }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onClick={tab.onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        padding: '0 14px',
        background: hover && !tab.active ? F.hover : 'transparent',
        border: 'none',
        borderRadius: 0,
        fontFamily: fonts.ui,
        fontSize: 13,
        fontWeight: tab.active ? 600 : 500,
        color: tab.active ? F.ink : F.ink2,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        transition: 'background-color 120ms ease, color 120ms ease',
      }}
    >
      {tab.label}
      {tab.active && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 8, right: 8, bottom: -1,
            height: 2,
            background: F.accent,
          }}
        />
      )}
    </button>
  );
}
