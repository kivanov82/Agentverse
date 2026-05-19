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

      {/* HERO */}
      <div style={{ padding: '88px 96px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}>
        {/* Left — headline */}
        <div>
          <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
            <F_Asterism size={10} color={F.accent} />
            <F_SmallCaps color={F.ink2} size={11} tracking={0.24}>The Commission · 01</F_SmallCaps>
          </div>
          <h1 style={{
            fontFamily: F_fonts.display,
            fontWeight: 300,
            fontSize: 220,
            lineHeight: 0.86,
            letterSpacing: '-0.045em',
            color: F.ink,
            margin: 0,
          }}>
            Ship<br />
            <span style={{ fontStyle: 'italic', fontWeight: 300 }}>it</span>
            <span style={{ color: F.accent }}>.</span>
          </h1>
        </div>

        {/* Right — standfirst */}
        <div style={{ paddingTop: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
              <F_Rule color={F.ink} length={32} weight={1.5} />
              <F_SmallCaps color={F.ink} size={11} tracking={0.24} weight={600}>Standfirst</F_SmallCaps>
            </div>
            <p style={{
              fontFamily: F_fonts.display,
              fontSize: 24,
              lineHeight: 1.35,
              fontWeight: 400,
              color: F.ink,
              margin: 0,
              maxWidth: 460,
              textWrap: 'pretty',
            }}>
              A studio of specialist agents — auditors, analysts,
              engineers — held on retainer. <em>State the work.</em> We deliver
              the audit, the rewrite, the deploy.
            </p>
          </div>

          <div style={{ marginTop: 48, display: 'flex', alignItems: 'baseline', gap: 24 }}>
            <button style={{
              fontFamily: F_fonts.ui,
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '0.02em',
              padding: '14px 22px',
              background: F.ink,
              color: F.surface,
              border: 'none',
              borderRadius: 0,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
            }}>
              Brief a project
              <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
            </button>
            <span style={{ fontFamily: F_fonts.ui, fontSize: 13, color: F.ink2 }}>
              or pick a ready commission below
            </span>
          </div>
        </div>
      </div>

      {/* RULE */}
      <div style={{ padding: '88px 96px 0' }}>
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
            <div key={c.roman} style={{
              padding: '28px 32px 32px',
              borderRight: i === 0 ? `1px solid ${F.hairline}` : 'none',
              cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 28 }}>
                {c.meta.map(([k, v], j) => (
                  <div key={k} style={{
                    display: 'grid',
                    gridTemplateColumns: '110px 1fr',
                    padding: '10px 0',
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

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: F.accent }}>
                <F_Rule color={F.accent} length={24} weight={1.5} />
                <F_SmallCaps color={F.accent} size={11} tracking={0.22} weight={600}>Commission</F_SmallCaps>
                <span style={{ fontSize: 14, marginLeft: 'auto', color: F.accent }}>→</span>
              </div>
            </div>
          ))}
        </div>

        <F_Rule color={F.ink} weight={1} />
      </div>

      {/* IN PROGRESS */}
      <div style={{ padding: '56px 96px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <F_SmallCaps color={F.ink} size={11} tracking={0.24} weight={600}>In Progress · Your Folios</F_SmallCaps>
          <F_Mono color={F.ink2} size={11} tracking={0.18}>01 · OPEN</F_Mono>
        </div>
        <F_Rule color={F.hairline} />
        {[
          { name: 'Solidity Audit', status: 'design phase', when: 'opened 28d ago', amt: '$1.35' },
        ].map((p) => (
          <div key={p.name} style={{
            display: 'grid',
            gridTemplateColumns: '24px 1fr 1fr 140px 80px',
            alignItems: 'center',
            padding: '18px 0',
            borderBottom: `1px solid ${F.hairlineFaint}`,
            gap: 16,
          }}>
            <F_Mono color={F.inkMute} size={11}>01</F_Mono>
            <span style={{ fontFamily: F_fonts.display, fontSize: 20, color: F.ink, letterSpacing: '-0.01em' }}>{p.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: F.signal }} />
              <F_SmallCaps color={F.ink2} size={10} tracking={0.18}>{p.status}</F_SmallCaps>
            </div>
            <F_Mono color={F.inkMute} size={11} tracking={0.12}>{p.when}</F_Mono>
            <F_Mono color={F.ink} size={12} tracking={0.05} style={{ textAlign: 'right' }}>{p.amt}</F_Mono>
          </div>
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
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <F_Mono color={F.ink2} size={10} tracking={0.14}>+ TOP UP</F_Mono>
              <F_Mono color={F.inkMute} size={10}>0x4f…2a91</F_Mono>
            </div>
          </div>

          <F_Rule color={F.hairlineFaint} />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <F_SmallCaps color={F.inkMute} size={10} tracking={0.22}>Folios</F_SmallCaps>
              <span style={{ fontFamily: F_fonts.ui, color: F.inkMute, fontSize: 15, lineHeight: 1 }}>+</span>
            </div>
            {[
              { n: 'Solidity Audit', when: '28d', active: true },
              { n: 'Landing Refresh', when: '4d', active: false },
            ].map((p) => (
              <div key={p.n} style={{
                padding: '10px 12px',
                margin: '0 -12px',
                background: p.active ? F.hover : 'transparent',
                borderLeft: p.active ? `2px solid ${F.accent}` : '2px solid transparent',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                cursor: 'pointer',
              }}>
                <span style={{ fontFamily: F_fonts.display, fontSize: 15, color: F.ink, fontStyle: p.active ? 'normal' : 'italic' }}>{p.n}</span>
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
          <div style={{ flex: 1, overflow: 'auto', padding: '28px 56px' }}>
            {/* Folio header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <F_Asterism size={9} color={F.accent} />
                <F_SmallCaps color={F.ink2} size={10} tracking={0.24}>Folio I · The Method</F_SmallCaps>
              </div>
              <h2 style={{
                fontFamily: F_fonts.display,
                fontSize: 34,
                fontWeight: 400,
                letterSpacing: '-0.02em',
                margin: 0,
                color: F.ink,
                lineHeight: 1.1,
              }}>
                How we audit.
              </h2>
              <p style={{
                fontFamily: F_fonts.display,
                fontSize: 17,
                lineHeight: 1.5,
                color: F.ink2,
                margin: '12px 0 0',
                maxWidth: 640,
                textWrap: 'pretty',
              }}>
                Every contract runs through three methodologies, in order — each one
                surfaces a different class of bug.
              </p>
            </div>

            {/* Three methodologies — newspaper columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: `1px solid ${F.ink}`, borderBottom: `1px solid ${F.hairline}` }}>
              {[
                {
                  r: 'I',
                  name: 'Feynman',
                  body: 'Business-logic sweep. We explain each contract as if teaching a peer — any step we can\'t justify becomes a finding.',
                },
                {
                  r: 'II',
                  name: 'Nemesis',
                  body: 'Adversarial loop. We attack our own findings, feed the counter-findings back, and iterate until nothing new surfaces.',
                },
                {
                  r: 'III',
                  name: 'State Inconsistency',
                  body: 'Coupled-state desync hunt. Any op that mutates one variable without updating its partner is a bug waiting to ship.',
                },
              ].map((m, i) => (
                <div key={m.r} style={{
                  padding: '20px 22px 22px',
                  borderRight: i < 2 ? `1px solid ${F.hairlineFaint}` : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontFamily: F_fonts.display, fontStyle: 'italic', fontSize: 15, color: F.accent }}>{m.r}.</span>
                    <span style={{ fontFamily: F_fonts.display, fontSize: 19, color: F.ink, letterSpacing: '-0.01em', lineHeight: 1.15 }}>{m.name}</span>
                  </div>
                  <p style={{
                    fontFamily: F_fonts.ui,
                    fontSize: 13,
                    lineHeight: 1.55,
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

          {/* Composer */}
          <div style={{ borderTop: `1px solid ${F.hairline}`, padding: '16px 56px 20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '0 4px',
              borderBottom: `1px solid ${F.ink}`,
              paddingBottom: 10,
            }}>
              <F_SmallCaps color={F.inkMute} size={10} tracking={0.22}>Reply —</F_SmallCaps>
              <span style={{ flex: 1, fontFamily: F_fonts.display, fontSize: 17, color: F.inkMute, fontStyle: 'italic' }}>
                Type a direction, ask a question, or attach a file…
              </span>
              <F_Mono color={F.inkMute} size={10}>⌘ ↵</F_Mono>
              <button style={{
                width: 32, height: 32, border: `1px solid ${F.ink}`, background: F.ink,
                color: F.surface, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" /></svg>
              </button>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 32, height: 32, background: F.ink, color: F.surface,
                  fontFamily: F_fonts.mono, fontSize: 11,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.05em',
                }}>{a.i}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: F_fonts.display, fontSize: 16, color: F.ink, lineHeight: 1.1 }}>{a.n}</div>
                  <F_SmallCaps color={F.inkMute} size={9} tracking={0.2}>{a.role}</F_SmallCaps>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 42 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: a.state === 'online' ? F.signal : F.inkMute }} />
                <F_Mono color={F.ink2} size={10} tracking={0.12}>{a.state}</F_Mono>
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
