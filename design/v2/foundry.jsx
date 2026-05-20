// Foundry — v3 (app-fit pass)
// Goal: landing fits 1440×900 exactly; workspace fits 1440×900 with scroll
// only inside the correspondence region. Editorial chrome stripped.
(function () {
const F = window.foundryTokens;
const F_fonts = window.fonts;
const { SmallCaps: F_SmallCaps, Mono: F_Mono, Rule: F_Rule, RegMark: F_RegMark } = window;

// ============================================================
// LANDING — fits 1440x900 exactly. No scroll.
// ============================================================
const FoundryLanding = () => {
  return (
    <div style={{
      width: 1440,
      height: 900,
      background: F.surface,
      color: F.ink,
      fontFamily: F_fonts.ui,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* TOP BAR — minimal */}
      <div style={{
        height: 56,
        padding: '0 40px',
        borderBottom: `1px solid ${F.hairline}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <a style={{ fontFamily: F_fonts.ui, fontSize: 14, color: F.ink2, textDecoration: 'none' }}>How it works</a>
          <a style={{ fontFamily: F_fonts.ui, fontSize: 14, color: F.ink2, textDecoration: 'none' }}>Pricing</a>
          <button style={{
            fontFamily: F_fonts.ui,
            fontSize: 13,
            fontWeight: 500,
            padding: '9px 18px',
            background: F.ink,
            color: F.surface,
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}>Sign in <span style={{ fontSize: 14 }}>→</span></button>
        </div>
      </div>

      {/* HERO — fixed height, no scroll */}
      <div style={{
        padding: '64px 96px 56px',
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        gap: 80,
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <div>
          <h1 style={{
            fontFamily: F_fonts.display,
            fontWeight: 300,
            fontSize: 168,
            lineHeight: 0.92,
            letterSpacing: '-0.045em',
            color: F.ink,
            margin: 0,
          }}>
            Ship <span style={{ fontStyle: 'italic' }}>it</span><span style={{ color: F.accent }}>.</span>
          </h1>
        </div>
        <div>
          <p style={{
            fontFamily: F_fonts.display,
            fontSize: 26,
            lineHeight: 1.32,
            fontWeight: 400,
            color: F.ink,
            margin: 0,
            textWrap: 'pretty',
          }}>
            A studio of specialist agents — <em>auditors, analysts, engineers</em> — held on retainer. Brief the work. We deliver.
          </p>
          <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
            <button style={{
              fontFamily: F_fonts.ui,
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: '0.01em',
              padding: '15px 24px',
              background: F.ink,
              color: F.surface,
              border: `1px solid ${F.ink}`,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
            }}>Brief a project <span style={{ fontSize: 18, lineHeight: 1 }}>→</span></button>
            <button style={{
              fontFamily: F_fonts.ui,
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: '0.01em',
              padding: '15px 22px',
              background: 'transparent',
              color: F.ink,
              border: `1px solid ${F.ink}`,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
            }}>See commissions <span style={{ fontSize: 16, lineHeight: 1 }}>↓</span></button>
          </div>
        </div>
      </div>

      {/* COMMISSIONS — fills remaining viewport height */}
      <div style={{ flex: 1, padding: '0 96px 32px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 14,
          paddingBottom: 14,
          borderBottom: `1px solid ${F.ink}`,
        }}>
          <h2 style={{
            fontFamily: F_fonts.display,
            fontSize: 22,
            fontWeight: 400,
            color: F.ink,
            margin: 0,
            letterSpacing: '-0.01em',
          }}>Choose a commission</h2>
          <span style={{ fontFamily: F_fonts.ui, fontSize: 13, color: F.ink2 }}>Two ready · more next month</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, flex: 1 }}>
          {[
            {
              roman: 'I',
              name: 'Solidity Audit',
              dek: 'Three methodologies, one verdict. Audit your smart contracts before they ship.',
              meta: [['Lead', 'Security Auditor'], ['Turnaround', '≈ 48 hours'], ['From', '$0.25 USDC']],
              primary: true,
            },
            {
              roman: 'II',
              name: 'SEO Optimization',
              dek: 'Technical sweep, content rewrite, schema. Earn page one — or learn why you can\'t.',
              meta: [['Lead', 'Growth Analyst'], ['Turnaround', '≈ 72 hours'], ['From', '$0.40 USDC']],
              primary: false,
            },
          ].map((c) => (
            <a key={c.roman} href="#" style={{
              background: c.primary ? F.hover : 'transparent',
              border: `1px solid ${c.primary ? F.ink : F.hairline}`,
              padding: '22px 26px 24px',
              display: 'flex',
              flexDirection: 'column',
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                <span style={{
                  fontFamily: F_fonts.display,
                  fontStyle: 'italic',
                  fontSize: 20,
                  color: F.accent,
                }}>{c.roman}.</span>
                <h3 style={{
                  fontFamily: F_fonts.display,
                  fontSize: 34,
                  fontWeight: 400,
                  margin: 0,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  color: F.ink,
                }}>{c.name}</h3>
              </div>
              <p style={{
                fontFamily: F_fonts.ui,
                fontSize: 14,
                lineHeight: 1.5,
                color: F.ink2,
                margin: '0 0 18px',
                textWrap: 'pretty',
              }}>{c.dek}</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, marginBottom: 'auto' }}>
                {c.meta.map(([k, v], j) => (
                  <div key={k} style={{
                    padding: '8px 12px 8px 0',
                    borderLeft: j === 0 ? 'none' : `1px solid ${F.hairlineFaint}`,
                    paddingLeft: j === 0 ? 0 : 12,
                  }}>
                    <div style={{
                      fontFamily: F_fonts.ui,
                      fontSize: 10,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                      color: F.inkMute,
                      marginBottom: 4,
                    }}>{k}</div>
                    <div style={{ fontFamily: F_fonts.ui, fontSize: 13, color: F.ink }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{
                marginTop: 20,
                padding: '12px 16px',
                background: c.primary ? F.accent : 'transparent',
                border: `1px solid ${c.primary ? F.accent : F.ink}`,
                color: c.primary ? F.surface : F.ink,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: F_fonts.ui,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}>
                <span>Commission this</span>
                <span style={{ fontSize: 16 }}>→</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// WORKSPACE — fits 1440x900 with scroll ONLY in correspondence
// ============================================================
const FoundryWorkspace = () => {
  const phases = [
    { name: 'Discovery', state: 'done' },
    { name: 'Design', state: 'active' },
    { name: 'Build', state: 'pending' },
    { name: 'Review', state: 'pending' },
    { name: 'Deliver', state: 'pending' },
  ];

  const tabs = ['Observatory', 'Project', 'Files', 'Ledger'];
  const activeTab = 'Observatory';

  return (
    <div style={{
      width: 1440,
      height: 900,
      background: F.surface,
      color: F.ink,
      fontFamily: F_fonts.ui,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* TOP BAR — logo + folio breadcrumb + proper tab nav + status */}
      <div style={{
        height: 56,
        padding: '0 24px',
        borderBottom: `1px solid ${F.hairline}`,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 220 }}>
          <F_RegMark size={16} color={F.ink} strokeWidth={1.1} />
          <span style={{
            fontFamily: F_fonts.display,
            fontStyle: 'italic',
            fontSize: 19,
            color: F.ink,
            letterSpacing: '-0.01em',
          }}>ShipWith<span style={{ color: F.accent }}>.AI</span></span>
        </div>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: F_fonts.ui, fontSize: 13, color: F.inkMute }}>Folios</span>
          <span style={{ color: F.inkMute }}>/</span>
          <span style={{ fontFamily: F_fonts.display, fontSize: 16, color: F.ink, letterSpacing: '-0.005em' }}>Solidity Audit</span>
        </div>

        {/* Tabs — properly clickable */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'stretch', height: '100%', gap: 4 }}>
          {tabs.map((t) => {
            const active = t === activeTab;
            return (
              <button key={t} style={{
                background: 'transparent',
                border: 'none',
                fontFamily: F_fonts.ui,
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? F.ink : F.ink2,
                padding: '0 14px',
                cursor: 'pointer',
                position: 'relative',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                {t}
                {active && (
                  <div style={{
                    position: 'absolute',
                    bottom: -1,
                    left: 8,
                    right: 8,
                    height: 2,
                    background: F.accent,
                  }} />
                )}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 16, borderLeft: `1px solid ${F.hairline}`, height: 24 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: F.signal }} />
          <span style={{
            fontFamily: F_fonts.ui,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: F.ink,
          }}>Live</span>
        </div>
      </div>

      {/* MAIN ROW — fills remaining height; only middle column scrolls */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '232px 1fr 268px', minHeight: 0 }}>
        {/* LEFT RAIL */}
        <div style={{
          borderRight: `1px solid ${F.hairline}`,
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          overflow: 'auto',
        }}>
          {/* Account */}
          <div>
            <div style={{
              fontFamily: F_fonts.ui,
              fontSize: 10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              fontWeight: 500,
              color: F.inkMute,
              marginBottom: 8,
            }}>Account</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
              <span style={{
                fontFamily: F_fonts.display,
                fontSize: 28,
                fontWeight: 400,
                color: F.ink,
                letterSpacing: '-0.02em',
              }}>$1.35</span>
              <F_Mono color={F.inkMute} size={10}>USDC</F_Mono>
            </div>
            <button style={{
              width: '100%',
              fontFamily: F_fonts.ui,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              padding: '10px',
              background: F.ink,
              color: F.surface,
              border: 'none',
              cursor: 'pointer',
            }}>+ Top up</button>
          </div>

          <F_Rule color={F.hairlineFaint} />

          {/* Folios */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}>
              <div style={{
                fontFamily: F_fonts.ui,
                fontSize: 10,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontWeight: 500,
                color: F.inkMute,
              }}>Folios</div>
              <button style={{
                width: 22,
                height: 22,
                border: `1px solid ${F.hairline}`,
                background: 'transparent',
                color: F.ink2,
                cursor: 'pointer',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>+</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { n: 'Solidity Audit', when: '28d', active: true, urgent: true },
                { n: 'Landing Refresh', when: '4d', active: false, urgent: false },
                { n: 'Q4 Marketing Site', when: '12d', active: false, urgent: false },
              ].map((p) => (
                <div key={p.n} style={{
                  padding: '10px 12px',
                  margin: '0 -12px',
                  background: p.active ? F.hover : 'transparent',
                  borderLeft: p.active ? `2px solid ${F.accent}` : '2px solid transparent',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}>
                  <span style={{
                    fontFamily: F_fonts.ui,
                    fontSize: 13,
                    fontWeight: p.active ? 500 : 400,
                    color: p.active ? F.ink : F.ink2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>{p.n}</span>
                  {p.urgent && <span style={{ width: 6, height: 6, borderRadius: '50%', background: F.accent }} />}
                  <F_Mono color={F.inkMute} size={10}>{p.when}</F_Mono>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${F.hairlineFaint}` }}>
            <button style={{
              width: '100%',
              fontFamily: F_fonts.ui,
              fontSize: 13,
              color: F.ink2,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 0',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>Settings <span style={{ fontSize: 14 }}>→</span></button>
          </div>
        </div>

        {/* CENTER — pinned banner + scrollable chat + pinned composer */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          {/* Pinned action banner */}
          <div style={{
            padding: '10px 48px',
            background: F.accentSoft,
            borderBottom: `1px solid ${F.accent}`,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexShrink: 0,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: F.accent }} />
            <div style={{ flex: 1, fontFamily: F_fonts.display, fontSize: 15, color: F.ink }}>
              An agent is waiting on your reply.
            </div>
            <button style={{
              fontFamily: F_fonts.ui,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              padding: '7px 14px',
              background: F.accent,
              color: F.surface,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}>Reply <span style={{ fontSize: 14 }}>↓</span></button>
          </div>

          {/* Scrollable chat region */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px 48px 24px',
            minHeight: 0,
            scrollbarWidth: 'thin',
          }}>
            {/* Conversation entries */}
            {[
              { who: 'PM', name: 'Project Manager', role: 'Orchestrator', time: '11:58', body: <>Hi — I'm your Project Manager for the <em>Solidity Audit</em>. Before we hand off to the auditor, two quick confirmations:<br /><br />· Target repo: <span style={{ color: F.accent, borderBottom: `1px solid ${F.accent}` }}>github.com/Kasu-Finance/kasu-contracts</span><br />· Methodologies: Feynman · Nemesis · State<br />· Estimated turnaround: 48h, ≈ $0.25 USDC<br /><br />Shall I proceed?</>, me: false },
              { who: 'YOU', name: 'You', role: null, time: '12:01', body: <>Yes — proceed with all three methodologies. Priority on State Inconsistency.</>, me: true },
              { who: 'SA', name: 'Security Auditor', role: 'Audit lead', time: '12:02', body: <>Acknowledged. Initial pass on contracts complete. Three findings so far — one high, two medium. Full report drafting in progress.</>, me: false },
              { who: 'PM', name: 'Project Manager', role: 'Orchestrator', time: 'just now', body: <>Audit report ready for your review. One <strong>high-severity finding</strong> requires sign-off before publish. Open the report on the right, or reply with instructions.</>, me: false, pending: true },
            ].map((m, i) => (
              <div key={i} style={{
                marginBottom: 22,
                paddingBottom: m.pending ? 0 : 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 24,
                    height: 24,
                    background: m.me ? 'transparent' : F.ink,
                    color: m.me ? F.ink : F.surface,
                    border: m.me ? `1px solid ${F.ink}` : 'none',
                    fontFamily: F_fonts.mono,
                    fontSize: 9,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    letterSpacing: '0.05em',
                    fontWeight: 500,
                  }}>{m.who}</div>
                  <span style={{
                    fontFamily: F_fonts.display,
                    fontSize: 15,
                    color: F.ink,
                    letterSpacing: '-0.005em',
                  }}>{m.name}</span>
                  {m.role && (
                    <span style={{ fontFamily: F_fonts.ui, fontSize: 11, color: F.inkMute }}>· {m.role}</span>
                  )}
                  <F_Mono color={F.inkMute} size={10} style={{ marginLeft: 'auto' }}>{m.time}</F_Mono>
                </div>
                <div style={{
                  paddingLeft: 34,
                  fontFamily: F_fonts.display,
                  fontSize: 16,
                  lineHeight: 1.55,
                  color: F.ink,
                  textWrap: 'pretty',
                }}>{m.body}</div>
              </div>
            ))}
          </div>

          {/* Composer — pinned at bottom */}
          <div style={{
            borderTop: `1px solid ${F.hairline}`,
            padding: '12px 48px 16px',
            flexShrink: 0,
            background: F.surface,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'stretch',
              border: `1px solid ${F.ink}`,
              background: F.card,
            }}>
              <input
                type="text"
                placeholder="Type a direction, ask a question, or attach a file…"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontFamily: F_fonts.display,
                  fontSize: 16,
                  color: F.ink,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontStyle: 'italic',
                }}
              />
              <button title="Attach file" style={{
                padding: '0 14px',
                background: 'transparent',
                color: F.ink2,
                border: 'none',
                borderLeft: `1px solid ${F.hairline}`,
                cursor: 'pointer',
                fontSize: 16,
              }}>¶</button>
              <button style={{
                padding: '0 22px',
                background: F.ink,
                color: F.surface,
                border: 'none',
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
            <div style={{
              marginTop: 6,
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: F_fonts.mono,
              fontSize: 10,
              color: F.inkMute,
              letterSpacing: '0.05em',
            }}>
              <span>⌘ ↵ to send · ⌘ K for commands</span>
              <span>Auto-saved</span>
            </div>
          </div>
        </div>

        {/* RIGHT RAIL */}
        <div style={{
          borderLeft: `1px solid ${F.hairline}`,
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          overflow: 'auto',
        }}>
          <div>
            <div style={{
              fontFamily: F_fonts.ui,
              fontSize: 10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              fontWeight: 500,
              color: F.inkMute,
              marginBottom: 14,
            }}>Agents on this folio</div>

            {[
              { i: 'PM', n: 'Project Manager', role: 'Orchestrator', state: 'online' },
              { i: 'SA', n: 'Security Auditor', role: 'Audit lead', state: 'standing by' },
            ].map((a) => (
              <div key={a.i} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: `1px solid ${F.hairlineFaint}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 30, height: 30, background: F.ink, color: F.surface,
                    fontFamily: F_fonts.mono, fontSize: 11,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.05em',
                  }}>{a.i}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: F_fonts.display, fontSize: 15, color: F.ink, lineHeight: 1.1, letterSpacing: '-0.005em' }}>{a.n}</div>
                    <div style={{ fontFamily: F_fonts.ui, fontSize: 11, color: F.inkMute, marginTop: 2 }}>{a.role}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: a.state === 'online' ? F.signal : F.inkMute }} />
                    <span style={{ fontFamily: F_fonts.ui, fontSize: 11, color: F.ink2 }}>{a.state}</span>
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
          </div>

          <div>
            <div style={{
              fontFamily: F_fonts.ui,
              fontSize: 10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              fontWeight: 500,
              color: F.inkMute,
              marginBottom: 10,
            }}>This session</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[['Spent', '$0.25 USDC'], ['Tokens', '14,201'], ['Started', '12 min ago']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: F_fonts.ui, fontSize: 12, color: F.ink2 }}>{k}</span>
                  <span style={{ fontFamily: F_fonts.mono, fontSize: 11, color: F.ink, letterSpacing: '0.03em' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <button style={{
              width: '100%',
              fontFamily: F_fonts.ui,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              padding: '10px',
              background: 'transparent',
              color: F.ink,
              border: `1px solid ${F.ink}`,
              cursor: 'pointer',
            }}>View full report</button>
          </div>
        </div>
      </div>

      {/* PHASE BAR — clean, just labels */}
      <div style={{
        borderTop: `1px solid ${F.hairline}`,
        padding: '12px 32px',
        background: F.surface2,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {phases.map((p, i) => {
            const done = p.state === 'done';
            const active = p.state === 'active';
            return (
              <React.Fragment key={p.name}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    border: `1.5px solid ${done || active ? F.accent : F.hairline}`,
                    background: done ? F.accent : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {done && <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1 4.5L3.5 7L8 1.5" stroke={F.surface} strokeWidth="1.5" fill="none" /></svg>}
                    {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: F.accent }} />}
                  </div>
                  <span style={{
                    fontFamily: F_fonts.ui,
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    color: active ? F.accent : (done ? F.ink : F.inkMute),
                    letterSpacing: '0.01em',
                  }}>{p.name}</span>
                </div>
                {i < phases.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: 1,
                    background: done ? F.accent : F.hairline,
                    margin: '0 16px',
                    opacity: done ? 1 : 0.5,
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { FoundryLanding, FoundryWorkspace });
})();
