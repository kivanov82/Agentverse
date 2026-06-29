import React from "react";
import {
  AbsoluteFill,
  Series,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
  OffthreadVideo,
  Audio,
  staticFile,
} from "remotion";
import { brand } from "./brand";
import { scenes, Scene } from "./scenes";

const serif = `${brand.font}, Georgia, "Times New Roman", serif`;

const useEntrance = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 200 } });
};

const Fade: React.FC<{ children: React.ReactNode; dur: number }> = ({ children, dur }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12, dur - 12, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

const TitleScene: React.FC<{ s: Extract<Scene, { type: "title" }> }> = ({ s }) => {
  const e = useEntrance(6);
  const scale = interpolate(e, [0, 1], [0.92, 1]);
  return (
    <AbsoluteFill style={{ backgroundColor: brand.paper, justifyContent: "center", alignItems: "center" }}>
      <div style={{ transform: `scale(${scale})`, textAlign: "center" }}>
        {brand.logo ? (
          <Img src={staticFile(brand.logo)} style={{ height: 120, marginBottom: 32 }} />
        ) : (
          <div style={{ width: 72, height: 6, backgroundColor: brand.accent, margin: "0 auto 40px" }} />
        )}
        <div style={{ fontFamily: serif, fontSize: 150, color: brand.ink, fontWeight: 600, letterSpacing: -2 }}>{s.title}</div>
        <div style={{ fontFamily: serif, fontSize: 46, color: brand.ink, opacity: 0.7, marginTop: 24 }}>{s.subtitle}</div>
      </div>
    </AbsoluteFill>
  );
};

const MessageScene: React.FC<{ s: Extract<Scene, { type: "message" }> }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: brand.accent, justifyContent: "center", padding: "0 160px" }}>
      {s.lines.map((ln, i) => {
        const sp = spring({ frame: frame - i * 12, fps, config: { damping: 200 } });
        const op = interpolate(sp, [0, 1], [0, 1]);
        const tx = interpolate(sp, [0, 1], [-40, 0]);
        return (
          <div
            key={i}
            style={{ opacity: op, transform: `translateX(${tx}px)`, fontFamily: serif, fontSize: 110, color: brand.paper, fontWeight: 600, lineHeight: 1.05 }}
          >
            {ln}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const GridScene: React.FC<{ s: Extract<Scene, { type: "grid" }> }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: brand.paper, justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
      <div style={{ fontFamily: serif, fontSize: 58, color: brand.ink, marginBottom: 60 }}>{s.heading}</div>
      <div style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center", maxWidth: 1500 }}>
        {s.items.map((it, i) => {
          const sp = spring({ frame: frame - i * 8, fps, config: { damping: 200 } });
          const op = interpolate(sp, [0, 1], [0, 1]);
          const ty = interpolate(sp, [0, 1], [30, 0]);
          return (
            <div
              key={it}
              style={{ opacity: op, transform: `translateY(${ty}px)`, padding: "28px 44px", border: `3px solid ${brand.ink}`, fontFamily: serif, fontSize: 42, color: brand.ink }}
            >
              <span style={{ color: brand.accent, marginRight: 12 }}>·</span>
              {it}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// A large title that drops in across the TOP of a clip/showcase frame, with a
// solid ink scrim band so it stays legible over footage.
const TopHeading: React.FC<{ text: string }> = ({ text }) => {
  const h = useEntrance(10);
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(26,26,26,0.55)",
        padding: "26px 44px",
        opacity: interpolate(h, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(h, [0, 1], [-20, 0])}px)`,
      }}
    >
      <span style={{ fontFamily: serif, fontSize: 58, fontWeight: 600, color: brand.paper, letterSpacing: -0.5 }}>{text}</span>
    </div>
  );
};

const ShowcaseScene: React.FC<{ s: Extract<Scene, { type: "showcase" }> }> = ({ s }) => {
  const e = useEntrance(4);
  const ty = interpolate(e, [0, 1], [60, 0]);
  const scale = interpolate(e, [0, 1], [0.96, 1]);
  return (
    <AbsoluteFill style={{ backgroundColor: brand.ink, justifyContent: "center", alignItems: "center" }}>
      <div
        style={{ position: "relative", transform: `translateY(${ty}px) scale(${scale})`, width: 1400, height: 720, backgroundColor: brand.paper, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {s.image ? (
          <Img src={staticFile(s.image)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ color: brand.ink, opacity: 0.35, fontFamily: serif, fontSize: 40 }}>[ {s.caption} ]</div>
        )}
        {s.heading ? <TopHeading text={s.heading} /> : null}
      </div>
      <div style={{ position: "absolute", bottom: 70, left: 120, right: 120, fontFamily: serif, fontSize: 46, color: brand.paper }}>
        <span style={{ borderBottom: `4px solid ${brand.accent}`, paddingBottom: 8 }}>{s.caption}</span>
      </div>
    </AbsoluteFill>
  );
};

const ClipScene: React.FC<{ s: Extract<Scene, { type: "clip" }> }> = ({ s }) => {
  const e = useEntrance(4);
  const ty = interpolate(e, [0, 1], [60, 0]);
  const scale = interpolate(e, [0, 1], [0.96, 1]);
  return (
    <AbsoluteFill style={{ backgroundColor: brand.ink, justifyContent: "center", alignItems: "center" }}>
      <div
        style={{ position: "relative", transform: `translateY(${ty}px) scale(${scale})`, width: 1600, height: 810, backgroundColor: brand.ink, overflow: "hidden", border: `2px solid ${brand.accent}` }}
      >
        <OffthreadVideo
          src={staticFile(s.src)}
          playbackRate={s.playbackRate ?? 4}
          trimBefore={s.startFrom}
          trimAfter={s.endAt}
          muted={s.muted ?? true}
          style={{ width: "100%", height: "100%", objectFit: s.fit ?? "cover" }}
        />
        {s.heading ? <TopHeading text={s.heading} /> : null}
      </div>
      <div style={{ position: "absolute", bottom: 70, left: 120, right: 120, fontFamily: serif, fontSize: 46, color: brand.paper }}>
        <span style={{ borderBottom: `4px solid ${brand.accent}`, paddingBottom: 8 }}>{s.caption}</span>
      </div>
    </AbsoluteFill>
  );
};

const StatScene: React.FC<{ s: Extract<Scene, { type: "stat" }> }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: brand.paper, justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: 100, justifyContent: "center", flexWrap: "wrap" }}>
        {s.stats.map((st, i) => {
          const sp = spring({ frame: frame - i * 10, fps, config: { damping: 200 } });
          const n = Math.round(interpolate(sp, [0, 1], [0, st.value]));
          const op = interpolate(sp, [0, 1], [0, 1]);
          return (
            <div key={st.label} style={{ opacity: op, textAlign: "center" }}>
              <div style={{ fontFamily: serif, fontSize: 170, color: brand.ink, fontWeight: 600, letterSpacing: -2 }}>
                {n}
                {st.suffix ?? ""}
              </div>
              <div style={{ fontFamily: serif, fontSize: 40, color: brand.ink, opacity: 0.7, marginTop: -8 }}>{st.label}</div>
            </div>
          );
        })}
      </div>
      {s.tagline ? (
        <div style={{ fontFamily: serif, fontSize: 64, color: brand.accent, fontWeight: 600, marginTop: 70, opacity: interpolate(spring({ frame: frame - 36, fps, config: { damping: 200 } }), [0, 1], [0, 1]) }}>
          {s.tagline}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const CtaScene: React.FC<{ s: Extract<Scene, { type: "cta" }> }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sweep = interpolate(spring({ frame, fps, config: { damping: 200 } }), [0, 1], [0, 100]);
  const op = interpolate(useEntrance(6), [0, 1], [0, 1]);
  return (
    <AbsoluteFill style={{ backgroundColor: brand.ink, justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${sweep}%`, backgroundColor: brand.accent, opacity: 0.15 }} />
      <div style={{ opacity: op, textAlign: "center" }}>
        <div style={{ fontFamily: serif, fontSize: 120, color: brand.paper, fontWeight: 600 }}>{s.title}</div>
        <div style={{ fontFamily: serif, fontSize: 50, color: brand.accent, marginTop: 20 }}>{s.subtitle}</div>
      </div>
    </AbsoluteFill>
  );
};

// The hero: the agent fleet as a hub-and-spoke network. A center node sits in the
// middle with one cluster per plugin evenly around it; accent pulses travel
// center -> cluster along each edge on a loop to read as task-passing.
//
// "AI-native org" story (optional, read top->bottom): when `humans` is set a
// directing bar sits ABOVE the center (humans direct the fleet); when
// `contextLayer` is set a full-width shared bar sits at the BASE that every
// cluster plugs into, with bidirectional pulses (agents read from / write to it).
// When the bottom bar is present the ellipse + center shift UP to make room.
const NetworkScene: React.FC<{ s: Extract<Scene, { type: "network" }> }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const W = 1920;
  const H = 1080;
  const cx = W / 2;

  const hasHumans = !!s.humans;
  const hasContext = !!s.contextLayer;

  // shared-context bar at the base (full width, ~120px tall)
  const barH = 120;
  const barMargin = 28;
  const barTop = H - barH - barMargin; // 932
  const barLeft = 90;
  const barRight = W - 90;
  const barW = barRight - barLeft;

  // ellipse + center: lift UP when the bottom bar is present so it stays legible
  const cy = hasContext ? (s.heading ? 472 : 452) : H / 2 + (s.heading ? 34 : 0);
  const rx = 430;
  const ry = hasContext ? 250 : 300;
  const n = s.clusters.length;
  const nodes = s.clusters.map((c, i) => {
    const ang = -Math.PI / 2 + (i + 0.5) * ((2 * Math.PI) / n);
    return { plugin: c.plugin, agents: c.agents, x: cx + rx * Math.cos(ang), y: cy + ry * Math.sin(ang) };
  });

  // even, sorted anchor points along the bar so cluster -> bar connectors don't cross
  const anchorX: number[] = new Array(n);
  nodes
    .map((nd, i) => ({ i, x: nd.x, y: nd.y }))
    .sort((a, b) => a.x - b.x || a.y - b.y)
    .forEach((o, k) => {
      anchorX[o.i] = barLeft + barW * ((k + 0.5) / n);
    });

  const centerSp = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  const centerScale = interpolate(centerSp, [0, 1], [0.5, 1]);
  const headSp = spring({ frame: frame - 2, fps, config: { damping: 200 } });

  // humans bar geometry (top center) + connector down to the pm node
  const humansY = s.heading ? 168 : 124; // pill center
  const humansBottom = humansY + 30;
  const pmTop = cy - 76;
  const humansSp = spring({ frame: frame - 10, fps, config: { damping: 200 } });

  // bottom bar reveal
  const barSp = spring({ frame: frame - 16, fps, config: { damping: 200 } });
  const barOp = interpolate(barSp, [0, 1], [0, 1]);
  const barTy = interpolate(barSp, [0, 1], [44, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: brand.paper }}>
      {/* edges + pulses */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", top: 0, left: 0 }}>
        {/* center <-> cluster edges + task-passing pulses */}
        {nodes.map((nd, i) => {
          const edgeSp = spring({ frame: frame - (12 + i * 5), fps, config: { damping: 200 } });
          const edgeOp = interpolate(edgeSp, [0, 1], [0, 0.85]);
          const ex = interpolate(edgeSp, [0, 1], [cx, nd.x]);
          const ey = interpolate(edgeSp, [0, 1], [cy, nd.y]);
          const cycle = 45;
          const t = ((frame + i * (cycle / n)) % cycle) / cycle;
          const px = cx + (nd.x - cx) * t;
          const py = cy + (nd.y - cy) * t;
          const travel = interpolate(t, [0, 0.12, 0.88, 1], [0, 1, 1, 0]);
          const gate = interpolate(frame, [22, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <g key={`c${i}`}>
              <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="rgba(26,26,26,0.18)" strokeWidth={2} opacity={edgeOp} />
              <circle cx={px} cy={py} r={7} fill={brand.accent} opacity={travel * gate} />
            </g>
          );
        })}

        {/* cluster <-> shared-context-layer edges + bidirectional pulses (read & write) */}
        {hasContext
          ? nodes.map((nd, i) => {
              const ax = anchorX[i];
              const ay = barTop;
              const eSp = spring({ frame: frame - (26 + i * 4), fps, config: { damping: 200 } });
              const grow = interpolate(eSp, [0, 1], [0, 1]);
              const lx = interpolate(grow, [0, 1], [nd.x, ax]);
              const ly = interpolate(grow, [0, 1], [nd.y, ay]);
              const cycle = 60;
              const gate = interpolate(frame, [30, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              // down: cluster -> bar (write)
              const td = ((frame + i * (cycle / n)) % cycle) / cycle;
              const dx = nd.x + (ax - nd.x) * td;
              const dy = nd.y + (ay - nd.y) * td;
              const dTravel = interpolate(td, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
              // up: bar -> cluster (read), offset half a cycle
              const tu = ((frame + i * (cycle / n) + cycle / 2) % cycle) / cycle;
              const ux = ax + (nd.x - ax) * tu;
              const uy = ay + (nd.y - ay) * tu;
              const uTravel = interpolate(tu, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
              return (
                <g key={`x${i}`}>
                  <line x1={nd.x} y1={nd.y} x2={lx} y2={ly} stroke="rgba(228,87,46,0.22)" strokeWidth={2} opacity={grow} />
                  <circle cx={dx} cy={dy} r={6} fill={brand.accent} opacity={dTravel * gate} />
                  <circle cx={ux} cy={uy} r={5} fill="rgba(26,26,26,0.5)" opacity={uTravel * gate} />
                </g>
              );
            })
          : null}

        {/* humans -> pm connector (subtle: humans direct the fleet) */}
        {hasHumans
          ? (() => {
              const grow = interpolate(humansSp, [0, 1], [0, 1]);
              const y2 = interpolate(grow, [0, 1], [humansBottom, pmTop]);
              const cycle = 50;
              const t = (frame % cycle) / cycle;
              const py = humansBottom + (pmTop - humansBottom) * t;
              const tr = interpolate(t, [0, 0.12, 0.88, 1], [0, 1, 1, 0]);
              const gate = interpolate(frame, [24, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <g>
                  <line x1={cx} y1={humansBottom} x2={cx} y2={y2} stroke="rgba(26,26,26,0.25)" strokeWidth={2} opacity={grow} />
                  <circle cx={cx} cy={py} r={5} fill={brand.accent} opacity={tr * gate * 0.8} />
                </g>
              );
            })()
          : null}
      </svg>

      {/* clusters: plugin label + agent pills */}
      {nodes.map((nd, i) => {
        const sp = spring({ frame: frame - (18 + i * 6), fps, config: { damping: 200 } });
        const op = interpolate(sp, [0, 1], [0, 1]);
        const sc = interpolate(sp, [0, 1], [0.85, 1]);
        return (
          <div key={i} style={{ position: "absolute", left: nd.x, top: nd.y, width: 300, transform: `translate(-50%, -50%) scale(${sc})`, opacity: op, textAlign: "center" }}>
            <div style={{ fontFamily: "'SF Mono', ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 20, letterSpacing: 3, textTransform: "uppercase", color: "rgba(26,26,26,0.5)", marginBottom: 12 }}>{nd.plugin}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {nd.agents.map((a, j) => {
                const psp = spring({ frame: frame - (30 + i * 6 + j * 3), fps, config: { damping: 200 } });
                const pop = interpolate(psp, [0, 1], [0, 1]);
                const pty = interpolate(psp, [0, 1], [10, 0]);
                return (
                  <div key={a} style={{ opacity: pop, transform: `translateY(${pty}px)`, fontFamily: serif, fontSize: 22, color: brand.ink, padding: "5px 14px", border: "1.5px solid rgba(26,26,26,0.3)", borderRadius: 999, backgroundColor: brand.paper, whiteSpace: "nowrap" }}>{a}</div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* center node with accent ring */}
      <div style={{ position: "absolute", left: cx, top: cy, transform: `translate(-50%, -50%) scale(${centerScale})` }}>
        <div style={{ width: 152, height: 152, borderRadius: "50%", border: "2px solid rgba(228,87,46,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 118, height: 118, borderRadius: "50%", border: `5px solid ${brand.accent}`, backgroundColor: brand.paper, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: serif, fontWeight: 600, fontSize: 44, color: brand.ink }}>{s.center}</div>
        </div>
      </div>

      {/* humans bar (top center) — directs the fleet */}
      {hasHumans ? (
        <div style={{ position: "absolute", left: cx, top: humansY, transform: `translate(-50%, -50%) scale(${interpolate(humansSp, [0, 1], [0.9, 1])})`, opacity: interpolate(humansSp, [0, 1], [0, 1]) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 32px", borderRadius: 999, border: "1.5px solid rgba(26,26,26,0.26)", backgroundColor: brand.paper }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: brand.accent }} />
            <span style={{ fontFamily: serif, fontSize: 30, color: "rgba(26,26,26,0.82)" }}>{s.humans}</span>
          </div>
        </div>
      ) : null}

      {/* shared context layer (full-width base bar) */}
      {hasContext ? (
        <div style={{ position: "absolute", left: barLeft, top: barTop, width: barW, height: barH, transform: `translateY(${barTy}px)`, opacity: barOp, borderRadius: 20, border: "2px solid rgba(228,87,46,0.55)", backgroundColor: "rgba(228,87,46,0.05)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div style={{ fontFamily: serif, fontSize: 34, fontWeight: 600, color: brand.ink, letterSpacing: -0.5 }}>{s.contextLayer!.label}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: "'SF Mono', ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 22, color: "rgba(26,26,26,0.62)" }}>
            {s.contextLayer!.items.map((it, k) => (
              <React.Fragment key={it}>
                {k > 0 ? <span style={{ color: brand.accent }}>·</span> : null}
                <span>{it}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : null}

      {s.heading ? (
        <div style={{ position: "absolute", top: 46, left: 0, right: 0, textAlign: "center", opacity: interpolate(headSp, [0, 1], [0, 1]), transform: `translateY(${interpolate(headSp, [0, 1], [-16, 0])}px)` }}>
          <span style={{ fontFamily: serif, fontSize: 56, fontWeight: 600, color: brand.ink, letterSpacing: -1 }}>{s.heading}</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const ListScene: React.FC<{ s: Extract<Scene, { type: "list" }> }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cols = s.columns ?? 1;
  const headSp = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ backgroundColor: brand.paper, padding: "110px 150px", flexDirection: "column" }}>
      <div style={{ opacity: interpolate(headSp, [0, 1], [0, 1]), transform: `translateY(${interpolate(headSp, [0, 1], [24, 0])}px)`, fontFamily: serif, fontSize: 84, fontWeight: 600, color: brand.ink, letterSpacing: -1, marginBottom: 64 }}>{s.heading}</div>
      <div style={{ display: "grid", gridTemplateColumns: cols === 2 ? "1fr 1fr" : "1fr", columnGap: 110, rowGap: 40 }}>
        {s.items.map((it, i) => {
          const sp = spring({ frame: frame - (14 + i * 6), fps, config: { damping: 200 } });
          const op = interpolate(sp, [0, 1], [0, 1]);
          const tx = interpolate(sp, [0, 1], [-30, 0]);
          return (
            <div key={i} style={{ opacity: op, transform: `translateX(${tx}px)`, borderLeft: `4px solid ${brand.accent}`, paddingLeft: 28 }}>
              <div style={{ fontFamily: serif, fontSize: 46, color: brand.ink, fontWeight: 600, lineHeight: 1.1 }}>{it.label}</div>
              {it.sub ? <div style={{ fontFamily: serif, fontSize: 28, color: "rgba(26,26,26,0.6)", marginTop: 6 }}>{it.sub}</div> : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// A horizontal flow of labelled boxes joined by arrows, revealed left-to-right.
const Flow: React.FC<{ steps: string[]; accent: boolean; delay: number }> = ({ steps, accent, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line = accent ? brand.accent : "rgba(26,26,26,0.38)";
  const text = accent ? brand.ink : "rgba(26,26,26,0.55)";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, flexWrap: "nowrap", maxWidth: 1760 }}>
      {steps.map((s, i) => {
        const sp = spring({ frame: frame - (delay + i * 7), fps, config: { damping: 200 } });
        const op = interpolate(sp, [0, 1], [0, 1]);
        const ty = interpolate(sp, [0, 1], [16, 0]);
        return (
          <React.Fragment key={i}>
            {i > 0 ? <span style={{ color: line, fontSize: 26, opacity: op, padding: "0 2px" }}>→</span> : null}
            <div style={{ opacity: op, transform: `translateY(${ty}px)`, border: `2px solid ${line}`, borderRadius: 10, padding: "14px 16px", fontFamily: serif, fontSize: 21, color: text, background: accent ? "rgba(228,87,46,0.06)" : "transparent", whiteSpace: "nowrap", textAlign: "center", lineHeight: 1.05 }}>{s}</div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const MazeScene: React.FC<{ s: Extract<Scene, { type: "maze" }> }> = ({ s }) => {
  const headOp = interpolate(useEntrance(2), [0, 1], [0, 1]);
  const capOp = interpolate(useEntrance(80), [0, 1], [0, 1]);
  return (
    <AbsoluteFill style={{ backgroundColor: brand.paper, justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 72, padding: "0 80px" }}>
      {s.heading ? <div style={{ position: "absolute", top: 64, left: 0, right: 0, textAlign: "center", fontFamily: serif, fontSize: 56, fontWeight: 600, color: brand.ink, opacity: headOp }}>{s.heading}</div> : null}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'SF Mono', ui-monospace, Menlo, monospace", fontSize: 18, letterSpacing: 3, textTransform: "uppercase", color: "rgba(26,26,26,0.45)", marginBottom: 18 }}>{s.before.label}</div>
        <Flow steps={s.before.steps} accent={false} delay={6} />
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'SF Mono', ui-monospace, Menlo, monospace", fontSize: 18, letterSpacing: 3, textTransform: "uppercase", color: brand.accent, marginBottom: 18 }}>{s.after.label}</div>
        <Flow steps={s.after.steps} accent delay={44} />
      </div>
      {s.caption ? <div style={{ position: "absolute", bottom: 72, left: 0, right: 0, textAlign: "center", fontFamily: serif, fontSize: 38, color: brand.ink, opacity: capOp }}>{s.caption}</div> : null}
    </AbsoluteFill>
  );
};

function renderScene(s: Scene) {
  switch (s.type) {
    case "title":
      return <TitleScene s={s} />;
    case "message":
      return <MessageScene s={s} />;
    case "grid":
      return <GridScene s={s} />;
    case "showcase":
      return <ShowcaseScene s={s} />;
    case "clip":
      return <ClipScene s={s} />;
    case "stat":
      return <StatScene s={s} />;
    case "network":
      return <NetworkScene s={s} />;
    case "list":
      return <ListScene s={s} />;
    case "maze":
      return <MazeScene s={s} />;
    case "cta":
      return <CtaScene s={s} />;
  }
}

export const Promo: React.FC = () => {
  const total = scenes.reduce((n, s) => n + s.durationInFrames, 0);
  return (
    <AbsoluteFill style={{ backgroundColor: brand.paper }}>
      {brand.music ? (
        <Audio
          src={staticFile(brand.music)}
          volume={(f) =>
            interpolate(f, [0, 15, total - 30, total], [0, 0.75, 0.75, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      ) : null}
      <Series>
        {scenes.map((s, i) => (
          <Series.Sequence key={i} durationInFrames={s.durationInFrames}>
            <Fade dur={s.durationInFrames}>{renderScene(s)}</Fade>
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
