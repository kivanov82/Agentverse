import React from "react";
import {
  AbsoluteFill,
  Series,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Img,
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

const ShowcaseScene: React.FC<{ s: Extract<Scene, { type: "showcase" }> }> = ({ s }) => {
  const e = useEntrance(4);
  const ty = interpolate(e, [0, 1], [60, 0]);
  const scale = interpolate(e, [0, 1], [0.96, 1]);
  return (
    <AbsoluteFill style={{ backgroundColor: brand.ink, justifyContent: "center", alignItems: "center" }}>
      <div
        style={{ transform: `translateY(${ty}px) scale(${scale})`, width: 1400, height: 720, backgroundColor: brand.paper, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {s.image ? (
          <Img src={staticFile(s.image)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ color: brand.ink, opacity: 0.35, fontFamily: serif, fontSize: 40 }}>[ {s.caption} ]</div>
        )}
      </div>
      <div style={{ position: "absolute", bottom: 70, left: 120, right: 120, fontFamily: serif, fontSize: 46, color: brand.paper }}>
        <span style={{ borderBottom: `4px solid ${brand.accent}`, paddingBottom: 8 }}>{s.caption}</span>
      </div>
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
    case "cta":
      return <CtaScene s={s} />;
  }
}

export const Promo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: brand.paper }}>
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
