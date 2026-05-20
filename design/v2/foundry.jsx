// Foundry — Direction A: cream paper, ink, vermilion
// Two screens: Landing + Workspace
(function () {
const F = window.foundryTokens;
const F_fonts = window.fonts;
const { SmallCaps: F_SmallCaps, Mono: F_Mono, Rule: F_Rule, RegMark: F_RegMark, Asterism: F_Asterism } = window;

// ============================================================
// MASTHEAD — shared across screens in Direction A
// ============================================================
const FoundryMasthead = ({ center, right }) => (
  <div style={{
    height: 56,
    padding: '0 32px',
    borderBottom: `1px solid ${F.hairline}`,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    background: F.surface,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <F_RegMark size={16} color={F.ink} strokeWidth={1.1} />
      <span style={{
        fontFamily: F_fonts.display,
        fontStyle: 'italic',
        fontSize: 21,
        fontWeight: 400,
        color: F.ink,
        letterSpacing: '-0.01em',
      }}>ShipWith<span style={{ color: F.accent }}>.AI</span></span>
    </div>
    <div style={{ textAlign: 'center' }}>
      {center || (
        <F_Mono color={F.ink2} size={11} tracking={0.22}>MAY · XIX · MMXXVI</F_Mono>
      )}
    </div>
    <div style={{ textAlign: 'right' }}>
      {right || (
        <F_Mono color={F.ink2} size={11} tracking={0.22}>VOL III · ISSUE 14</F_Mono>
      )}
    </div>
  </div>
);

// ============================================================
// LANDING — Foundry
// ============================================================
const FoundryLanding = () => {
  return (
    <div style={{
      width: 1440,
      minHeight: 1120,
      background: F.surface,
      color: F.ink,
      fontFamily: F_fonts.ui,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <FoundryMasthead />

      {/* HERO — v2: shrunk so offerings visible above fold */}
      <div style={{ padding: '48px 96px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
        {/* Left — headline */}
        <div>
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <F_Asterism size={10} color={F.accent} />
            <F_SmallCaps color={F.ink2} size={11} tracking={0.24}>The Commission · 01</F_SmallCaps>
          </div>
          <h1 style={{
            fontFamily: F_fonts.display,
            fontWeight: 300,
            fontSize: 144,
            lineHeight: 0.88,
            letterSpacing: '-0.04em',
            color: F.ink,
            margin: 0,
          }}>
            Ship <span style={{ fontStyle: 'italic', fontWeight: 300 }}>it</span><span style={{ color: F.accent }}>.</span>
          </h1>
          <p style={{
            fontFamily: F_fonts.display,
            fontSize: 22,
            lineHeight: 1.4,
            fontWeight: 400,
            color: F.ink,
            margin: '24px 0 0',
            maxWidth: 520,
            textWrap: 'pretty',
          }}>
            A studio of specialist agents — auditors, analysts, engineers — held on retainer.
            <em> State the work.</em> We deliver.
          </p>
        </div>

        {/* Right — action panel */}
        <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* How it works */}
          <div>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <F_Rule color={F.ink} length={32} weight={1.5} />
              <F_SmallCaps color={F.ink} size={11} tracking={0.24} weight={600}>How a commission works</F_SmallCaps>
            </div>
            <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0, border: `1px solid ${F.hairline}` }}>
              {[
                ['I.', 'Brief', 'Tell the studio what you need, in plain language.'],
                ['II.', 'Commission', 'Top up your account. Agents go to work.'],
                ['III.', 'Receive', 'Audit, rewrite, or deploy — delivered to your inbox.'],
              ].map(([r, n, d], idx) => (
                <li key={r} style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr',
                  alignItems: 'baseline',
                  padding: '12px 16px',
                  borderTop: idx === 0 ? 'none' : `1px solid ${F.hairlineFaint}`,
                }}>
                  <span style={{ fontFamily: F_fonts.display, fontStyle: 'italic', fontSize: 16, color: F.accent }}>{r}</span>
                  <div>
                    <div style={{ fontFamily: F_fonts.display, fontSize: 17, color: F.ink, lineHeight: 1.2 }}>{n}</div>
                    <div style={{ fontFamily: F_fonts.ui, fontSize: 13, color: F.ink2, marginTop: 2 }}>{d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* PRIMARY CTA + secondary */}
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 12 }}>
            <button style={{
              fontFamily: F_fonts.ui,
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: '0.01em',
              padding: '16px 24px',
              background: F.ink,
              color: F.surface,
              border: `1px solid ${F.ink}`,
              borderRadius: 0,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              flex: '0 1 auto',
            }}>
              Brief a new project
              <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
            </button>
            <button style={{
              fontFamily: F_fonts.ui,
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: '0.01em',
              padding: '16px 24px',
              background: 'transparent',
              color: F.ink,
              border: `1px solid ${F.ink}`,
              borderRadius: 0,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              flex: '0 1 auto',
            }}>
              Browse commissions
              <span style={{ fontSize: 16, lineHeight: 1 }}>↓</span>
            </button>
          </div>
        </div>
      </div>

      {/* RULE */}
      <div style={{ padding: '48px 96px 0' }}>
        <F_Rule color={F.hairline} />
      </div>

      {/* OFFERINGS */}
      <div style={{ padding: '32px 96px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 }}>
          <F_SmallCaps color={F.ink} size={11} tracking={0.24} weight={600}>Today's Commissions</F_SmallCaps>
          <F_Mono color={F.ink2} size={11} tracking={0.18}>02 · OFFERINGS</F_Mono>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderTop: `1px solid ${F.ink}` }}>
          {[
            {
              roman: 'I',
              name: 'Solidity Audit',
              dek: 'Three methodologies; one verdict. Audit your smart contracts before they ship.',
              meta: [
                ['Scope', 'Feynman · Nemesis · State'],
                ['Lead', 'Security Auditor'],
                ['Turnaround', '≈ 48h · 0.25 USDC'],
              ],
            },
            {
              roman: 'II',
              name: 'SEO Optimization',
              dek: 'Technical sweep, content rewrite, schema. Earn page one — or learn why you can\'t.',
              meta: [
                ['Scope', 'Technical · Content · Schema'],
                ['Lead', 'Growth Analyst'],
                ['Turnaround', '≈ 72h · 0.40 USDC'],
              ],
            },
          ].map((c, i) => (
            <a key={c.roman} href="#" style={{
              padding: '24px 28px 28px',
              borderRight: i === 0 ? `1px solid ${F.hairline}` : 'none',
              cursor: 'pointer',
              textDecoration: 'none',
              color: 'inherit',
              display: 'block',
              position: 'relative',
              background: i === 0 ? F.hover : 'transparent',
            }}>
              {/* hover indicator strip on top */}
              {i === 0 && <div style={{ position: 'absolute', top: -1, left: 0, right: 0, height: 2, background: F.accent }} />}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{
                  fontFamily: F_fonts.display,
                  fontStyle: 'italic',
                  fontSize: 22,
                  fontWeight: 400,
                  color: F.accent,
                }}>{c.roman}.</span>
                <F_Mono color={F.inkMute} size={10} tracking={0.16}>{`0${i + 1} / 02`}</F_Mono>
              </div>
              <h3 style={{
                fontFamily: F_fonts.display,
                fontSize: 38,
                fontWeight: 400,
                margin: '0 0 12px',
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                color: F.ink,
              }}>{c.name}</h3>
              <p style={{
                fontFamily: F_fonts.ui,
                fontSize: 14,
                lineHeight: 1.55,
                color: F.ink2,
                margin: '0 0 24px',
                maxWidth: 460,
                textWrap: 'pretty',
              }}>{c.dek}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20 }}>
                {c.meta.map(([k, v], j) => (
                  <div key={k} style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr',
                    padding: '8px 0',
                    borderTop: j === 0 ? 'none' : `1px solid ${F.hairlineFaint}`,
                    alignItems: 'baseline',
                  }}>
                    <F_SmallCaps color={F.inkMute} size={10} tracking={0.2}>{k}</F_SmallCaps>
                    <span style={{
                      fontFamily: F_fonts.ui,
                      fontSize: 13,
                      color: F.ink,
                      letterSpacing: '-0.005em',
                    }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Real button — visible primary action */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: i === 0 ? F.accent : 'transparent',
                border: i === 0 ? `1px solid ${F.accent}` : `1px solid ${F.ink}`,
                color: i === 0 ? F.surface : F.ink,
              }}>
                <span style={{
                  fontFamily: F_fonts.ui,
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}>Commission this</span>
                <span style={{ fontSize: 16 }}>→</span>
              </div>
            </a>
          ))}
        </div>

        <F_Rule color={F.ink} weight={1} />
      </div>

      {/* IN PROGRESS — now a clear continuation hook */}
      <div style={{ padding: '40px 96px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <F_SmallCaps color={F.ink} size={11} tracking={0.24} weight={600}>In Progress · Your Folios</F_SmallCaps>
          <F_Mono color={F.ink2} size={11} tracking={0.18}>01 · OPEN</F_Mono>
        </div>
        <F_Rule color={F.hairline} />
        {[
          { name: 'Solidity Audit', status: 'awaiting your reply', when: 'opened 28d ago', amt: '$1.35', urgent: true },
        ].map((p) => (
          <a key={p.name} href="#" style={{
            display: 'grid',
            gridTemplateColumns: '24px 1fr 1fr 140px 1fr auto',
            alignItems: 'center',
            padding: '16px 0',
            borderBottom: `1px solid ${F.hairlineFaint}`,
            gap: 16,
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer',
          }}>
            <F_Mono color={F.inkMute} size={11}>01</F_Mono>
            <span style={{ fontFamily: F_fonts.display, fontSize: 20, color: F.ink, letterSpacing: '-0.01em' }}>{p.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.urgent ? F.accent : F.signal }} />
              <F_SmallCaps color={p.urgent ? F.accent : F.ink2} size={10} tracking={0.18} weight={p.urgent ? 600 : 500}>{p.status}</F_SmallCaps>
            </div>
            <F_Mono color={F.inkMute} size={11} tracking={0.12}>{p.when}</F_Mono>
            <F_Mono color={F.ink} size={12} tracking={0.05} style={{ textAlign: 'right' }}>{p.amt}</F_Mono>
            <span style={{
              fontFamily: F_fonts.ui,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              padding: '8px 14px',
              border: `1px solid ${F.ink}`,
              color: F.ink,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}>Resume <span style={{ fontSize: 14 }}>→</span></span>
          </a>
        ))}
      </div>

      {/* FOOTER COLOPHON */}
      <div style={{ padding: '64px 96px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <F_Asterism size={9} color={F.inkMute} />
          <F_Mono color={F.inkMute} size={10} tracking={0.2}>
            COLOPHON · SET IN NEWSREADER &amp; GEIST · PRINTED ON THE WEB
          </F_Mono>
        </div>
        <F_Mono color={F.accent} size={11} tracking={0.22}>SHIPWITHAI.NL</F_Mono>
      </div>
    </div>
  );
};

// ============================================================
// WORKSPACE — Foundry
// ============================================================
const FoundryWorkspace = () => {
  const phases = [
    { name: 'Discovery', sub: 'Project brief', state: 'done' },
    { name: 'Design', sub: 'Direction', state: 'active' },
    { name: 'Development', sub: 'GitHub repo', state: 'pending' },
    { name: 'Review', sub: 'Sign-off', state: 'pending' },
    { name: 'Go Live', sub: 'Live site', state: 'pending' },
  ];

  return (
    <div style={{
      width: 1440,
      height: 900,
      background: F.surface,
      color: F.ink,
      fontFamily: F_fonts.ui,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* TOP BAR */}
      <div style={{
        height: 56,
        padding: '0 24px',
        borderBottom: `1px solid ${F.hairline}`,
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <F_RegMark size={16} color={F.ink} strokeWidth={1.1} />
          <span style={{ fontFamily: F_fonts.display, fontStyle: 'italic', fontSize: 19, color: F.ink, letterSpacing: '-0.01em' }}>
            ShipWith<span style={{ color: F.accent }}>.AI</span>
          </span>
          <div style={{ width: 1, height: 18, background: F.hairline, margin: '0 12px' }} />
          <F_SmallCaps color={F.ink2} size={10} tracking={0.22}>Folio · Solidity Audit</F_SmallCaps>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="3" fill="none" stroke={F.ink2} strokeWidth="1.2" /><circle cx="7" cy="7" r="1" fill={F.ink2} /></svg>
          <F_SmallCaps color={F.ink} size={11} tracking={0.22} weight={600}>Observatory</F_SmallCaps>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: F.signal }} />
          <F_SmallCaps color={F.ink} size={10} tracking={0.22}>Live</F_SmallCaps>
        </div>
      </div>

      {/* MAIN ROW */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '240px 1fr 280px', minHeight: 0 }}>
        {/* LEFT RAIL */}
        <div style={{ borderRight: `1px solid ${F.hairline}`, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div>
            <F_SmallCaps color={F.inkMute} size={10} tracking={0.22}>Account · K</F_SmallCaps>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: F_fonts.display, fontSize: 30, fontWeight: 400, color: F.ink, letterSpacing: '-0.02em' }}>$1.35</span>
              <F_Mono color={F.inkMute} size={10}>USDC</F_Mono>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button style={{
                flex: 1,
                fontFamily: F_fonts.ui,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                padding: '8px 10px',
                background: F.ink,
                color: F.surface,
                border: `1px solid ${F.ink}`,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}>+ Top up</button>
              <button style={{
                fontFamily: F_fonts.mono,
                fontSize: 10,
                letterSpacing: '0.05em',
                padding: '8px 10px',
                background: 'transparent',
                color: F.ink2,
                border: `1px solid ${F.hairline}`,
                cursor: 'pointer',
              }}>0x4f…2a91</button>
            </div>
          </div>

          <F_Rule color={F.hairlineFaint} />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <F_SmallCaps color={F.inkMute} size={10} tracking={0.22}>Folios</F_SmallCaps>
              <span style={{ fontFamily: F_fonts.ui, color: F.inkMute, fontSize: 15, lineHeight: 1 }}>+</span>
            </div>
            {[
              { n: 'Solidity Audit', when: '28d', active: true, urgent: true },
              { n: 'Landing Refresh', when: '4d', active: false, urgent: false },
            ].map((p) => (
              <div key={p.n} style={{
                padding: '10px 12px',
                margin: '0 -12px',
                background: p.active ? F.hover : 'transparent',
                borderLeft: p.active ? `2px solid ${F.accent}` : '2px solid transparent',
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                alignItems: 'baseline',
                gap: 8,
                cursor: 'pointer',
              }}>
                <span style={{ fontFamily: F_fonts.display, fontSize: 15, color: F.ink, fontStyle: p.active ? 'normal' : 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.n}</span>
                {p.urgent && <span style={{ width: 6, height: 6, borderRadius: '50%', background: F.accent }} />}
                <F_Mono color={F.inkMute} size={10}>{p.when}</F_Mono>
              </div>
            ))}
          </div>

          <F_Rule color={F.hairlineFaint} />

          <div>
            <F_SmallCaps color={F.inkMute} size={10} tracking={0.22}>Workshop</F_SmallCaps>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { n: 'Agents', active: true },
                { n: 'Project', active: false },
                { n: 'Ledger', active: false },
              ].map((it) => (
                <div key={it.n} style={{
                  padding: '8px 12px',
                  margin: '0 -12px',
                  background: it.active ? F.hover : 'transparent',
                  borderLeft: it.active ? `2px solid ${F.accent}` : '2px solid transparent',
                  fontFamily: F_fonts.ui,
                  fontSize: 13,
                  color: it.active ? F.ink : F.ink2,
                  fontWeight: it.active ? 500 : 400,
                  cursor: 'pointer',
                }}>{it.n}</div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER — the workshop */}
        <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Next-action banner pinned at top of column */}
          <div style={{
            padding: '12px 56px',
            background: F.accentSoft,
            borderBottom: `1px solid ${F.accent}`,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: F.accent }} />
            <div style={{ flex: 1 }}>
              <F_SmallCaps color={F.accent} size={10} tracking={0.22} weight={600}>Next — Awaiting your reply</F_SmallCaps>
              <div style={{ fontFamily: F_fonts.display, fontSize: 15, color: F.ink, marginTop: 2 }}>
                Pick a direction to begin the audit.
              </div>
            </div>
            <button style={{
              fontFamily: F_fonts.ui,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              padding: '8px 14px',
              background: F.accent,
              color: F.surface,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}>Jump to reply <span style={{ fontSize: 14 }}>↓</span></button>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '24px 56px' }}>
            {/* Folio header — condensed */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <F_Asterism size={9} color={F.accent} />
                <F_SmallCaps color={F.ink2} size={10} tracking={0.24}>Folio I · The Method</F_SmallCaps>
              </div>
              <h2 style={{
                fontFamily: F_fonts.display,
                fontSize: 26,
                fontWeight: 400,
                letterSpacing: '-0.02em',
                margin: 0,
                color: F.ink,
                lineHeight: 1.1,
              }}>
                How we audit.
              </h2>
            </div>

            {/* Three methodologies — condensed newspaper columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: `1px solid ${F.ink}`, borderBottom: `1px solid ${F.hairline}` }}>
              {[
                { r: 'I', name: 'Feynman', body: 'Business-logic sweep. Any step we can\'t justify becomes a finding.' },
                { r: 'II', name: 'Nemesis', body: 'Adversarial loop. We attack our own findings until nothing new surfaces.' },
                { r: 'III', name: 'State Inconsistency', body: 'Coupled-state desync hunt. Any unupdated partner is a bug waiting to ship.' },
              ].map((m, i) => (
                <div key={m.r} style={{
                  padding: '14px 18px 16px',
                  borderRight: i < 2 ? `1px solid ${F.hairlineFaint}` : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8, minHeight: '2.4em' }}>
                    <span style={{ fontFamily: F_fonts.display, fontStyle: 'italic', fontSize: 14, color: F.accent, flexShrink: 0 }}>{m.r}.</span>
                    <span style={{ fontFamily: F_fonts.display, fontSize: 17, color: F.ink, letterSpacing: '-0.01em', lineHeight: 1.15 }}>{m.name}</span>
                  </div>
                  <p style={{
                    fontFamily: F_fonts.ui,
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: F.ink2,
                    margin: 0,
                    textWrap: 'pretty',
                  }}>{m.body}</p>
                </div>
              ))}
            </div>

            {/* Correspondence */}
            <div style={{ marginTop: 36 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
                <F_SmallCaps color={F.ink} size={10} tracking={0.24} weight={600}>Correspondence</F_SmallCaps>
                <F_Mono color={F.inkMute} size={10} tracking={0.16}>3 entries</F_Mono>
              </div>

              {/* Message */}
              <div style={{ borderTop: `1px solid ${F.hairline}`, paddingTop: 18 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 28, height: 28, background: F.ink, color: F.surface,
                    fontFamily: F_fonts.mono, fontSize: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.05em',
                  }}>PM</div>
                  <span style={{ fontFamily: F_fonts.display, fontSize: 17, color: F.ink }}>Project Manager</span>
                  <span style={{ fontFamily: F_fonts.ui, fontSize: 12, color: F.inkMute }}>— Orchestrator</span>
                  <F_Mono color={F.inkMute} size={10} style={{ marginLeft: 'auto' }}>14:02 CET</F_Mono>
                </div>
                <div style={{ paddingLeft: 40, paddingBottom: 4 }}>
                  <p style={{ fontFamily: F_fonts.display, fontSize: 17, lineHeight: 1.55, color: F.ink, margin: '0 0 14px', textWrap: 'pretty' }}>
                    Audit complete. Total cost <span style={{ fontFamily: F_fonts.mono, fontSize: 14 }}>~$0.25 USDC</span>.
                    Deployed to <span style={{ borderBottom: `1px solid ${F.accent}`, color: F.accent }}>bean-and-bloom.vercel.app</span>.
                    Ready to go live whenever you are.
                  </p>

                  {/* Choice rows */}
                  <div style={{ marginTop: 18 }}>
                    <F_SmallCaps color={F.inkMute} size={10} tracking={0.22}>Pick a direction —</F_SmallCaps>
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column' }}>
                      {[
                        ['a', 'Cozy & warm', 'earth tones, handwritten serifs'],
                        ['b', 'Modern & minimal', 'clean lines, generous white space'],
                        ['c', 'Playful & colorful', 'bold tints, illustrated marks'],
                      ].map(([k, n, d]) => (
                        <button key={k} style={{
                          background: 'transparent',
                          border: 'none',
                          borderTop: `1px solid ${F.hairlineFaint}`,
                          padding: '14px 4px',
                          textAlign: 'left',
                          fontFamily: 'inherit',
                          cursor: 'pointer',
                          display: 'grid',
                          gridTemplateColumns: '22px 1fr auto',
                          alignItems: 'baseline',
                          gap: 12,
                        }}>
                          <F_Mono color={F.inkMute} size={11}>{k.toUpperCase()}</F_Mono>
                          <span>
                            <span style={{ fontFamily: F_fonts.display, fontSize: 17, color: F.ink }}>{n}</span>
                            <span style={{ fontFamily: F_fonts.ui, fontSize: 13, color: F.ink2, marginLeft: 10 }}>— {d}</span>
                          </span>
                          <span style={{ color: F.inkMute, fontSize: 14 }}>→</span>
                        </button>
                      ))}
                      <div style={{ borderTop: `1px solid ${F.hairlineFaint}` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Composer — v2: full bordered input field, not just a hairline */}
          <div style={{ borderTop: `1px solid ${F.hairline}`, padding: '14px 56px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <F_SmallCaps color={F.ink} size={10} tracking={0.24} weight={600}>Your reply</F_SmallCaps>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <span style={{ fontFamily: F_fonts.ui, fontSize: 11, color: F.inkMute, cursor: 'pointer' }}>¶ Attach</span>
                <F_Mono color={F.inkMute} size={10}>⌘ ↵ to send</F_Mono>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'stretch',
              border: `1px solid ${F.ink}`,
              background: F.card,
            }}>
              <span style={{
                flex: 1,
                padding: '14px 16px',
                fontFamily: F_fonts.display,
                fontSize: 17,
                color: F.inkMute,
                fontStyle: 'italic',
              }}>Type a direction, ask a question, or attach a file…</span>
              <button style={{
                padding: '0 20px',
                border: 'none',
                borderLeft: `1px solid ${F.ink}`,
                background: F.ink,
                color: F.surface,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: F_fonts.ui,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}>Send <span style={{ fontSize: 14 }}>→</span></button>
            </div>
          </div>
        </div>

        {/* RIGHT RAIL — In Residence */}
        <div style={{ borderLeft: `1px solid ${F.hairline}`, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <F_SmallCaps color={F.inkMute} size={10} tracking={0.22}>In Residence</F_SmallCaps>
            <F_Mono color={F.inkMute} size={10}>2/2</F_Mono>
          </div>

          {[
            { i: 'PM', n: 'Project Manager', role: 'Orchestrator', state: 'online' },
            { i: 'SA', n: 'Security Auditor', role: 'Audit lead', state: 'standing by' },
          ].map((a) => (
            <div key={a.i} style={{ paddingBottom: 16, borderBottom: `1px solid ${F.hairlineFaint}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 32, height: 32, background: F.ink, color: F.surface,
                  fontFamily: F_fonts.mono, fontSize: 11,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.05em',
                }}>{a.i}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: F_fonts.display, fontSize: 16, color: F.ink, lineHeight: 1.1 }}>{a.n}</div>
                  <F_SmallCaps color={F.inkMute} size={9} tracking={0.2}>{a.role}</F_SmallCaps>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 42 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: a.state === 'online' ? F.signal : F.inkMute }} />
                  <F_Mono color={F.ink2} size={10} tracking={0.12}>{a.state}</F_Mono>
                </div>
                <button style={{
                  fontFamily: F_fonts.ui,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  background: 'transparent',
                  color: F.ink,
                  border: `1px solid ${F.hairline}`,
                  cursor: 'pointer',
                }}>Ask</button>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 'auto' }}>
            <F_SmallCaps color={F.inkMute} size={10} tracking={0.22}>Session</F_SmallCaps>
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 6 }}>
              {[
                ['Spend', '$0.25'],
                ['Tokens', '14,201'],
                ['Started', '14:02 CET'],
              ].map(([k, v]) => (
                <React.Fragment key={k}>
                  <F_SmallCaps color={F.ink2} size={10} tracking={0.18}>{k}</F_SmallCaps>
                  <F_Mono color={F.ink} size={11}>{v}</F_Mono>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM PHASE LINE */}
      <div style={{ borderTop: `1px solid ${F.hairline}`, padding: '14px 32px', background: F.surface2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'center', position: 'relative' }}>
          {phases.map((p, i) => {
            const done = p.state === 'done';
            const active = p.state === 'active';
            return (
              <div key={p.name} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                paddingRight: 12,
                borderRight: i < 4 ? `1px solid ${F.hairlineFaint}` : 'none',
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  border: `1px solid ${done || active ? F.accent : F.hairline}`,
                  background: done ? F.accent : (active ? F.surface : 'transparent'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {done && <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1 4.5L3.5 7L8 1.5" stroke={F.surface} strokeWidth="1.5" fill="none" /></svg>}
                  {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: F.accent }} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{
                    fontFamily: F_fonts.display,
                    fontSize: 15,
                    color: active ? F.ink : (done ? F.ink : F.ink2),
                    letterSpacing: '-0.01em',
                    fontStyle: active ? 'italic' : 'normal',
                  }}>{p.name}</span>
                  <F_Mono color={F.inkMute} size={9} tracking={0.16}>{p.sub}</F_Mono>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { FoundryLanding, FoundryWorkspace });
})();
