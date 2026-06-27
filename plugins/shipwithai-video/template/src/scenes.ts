// The video is data-driven: edit these scenes, not the React in Promo.tsx.
// Scene durations should sum to brand.fps * brand.durationSeconds (default 30 * 30 = 900).

export type Scene =
  | { type: "title"; durationInFrames: number; title: string; subtitle: string }
  | { type: "message"; durationInFrames: number; lines: string[] }
  | { type: "grid"; durationInFrames: number; heading: string; items: string[] }
  | { type: "showcase"; durationInFrames: number; image: string; caption: string }
  // A screen recording (mp4/webm in public/), fast-forwarded inside a branded frame.
  // playbackRate 3-5 = the speed-up; startFrom/endAt (in frames of the SOURCE) trim to the highlight.
  | { type: "clip"; durationInFrames: number; src: string; caption: string; playbackRate?: number; startFrom?: number; endAt?: number; muted?: boolean }
  // Animated counters: each stat counts up from 0 to `value`, with a label and the tagline below.
  | { type: "stat"; durationInFrames: number; stats: { value: number; label: string; suffix?: string }[]; tagline?: string }
  | { type: "cta"; durationInFrames: number; title: string; subtitle: string };

// Default = the ShipWithAI self-promo. `image: ""` renders a captioned placeholder,
// so the template renders out-of-the-box; drop real stills into public/ and set the
// filename to swap them in.
export const scenes: Scene[] = [
  { type: "title", durationInFrames: 120, title: "ShipWithAI", subtitle: "An AI studio that ships." },
  { type: "grid", durationInFrames: 180, heading: "One studio. Many specialists.", items: ["Audit", "E-commerce", "SEO", "Campaigns", "Video"] },
  { type: "showcase", durationInFrames: 150, image: "", caption: "Smart-contract audits — severity-rated, with proofs." },
  { type: "showcase", durationInFrames: 150, image: "", caption: "On-brand storefronts, built and shipped." },
  { type: "message", durationInFrames: 120, lines: ["From brief", "to deliverable.", "Run locally."] },
  { type: "cta", durationInFrames: 180, title: "shipwithai.nl", subtitle: "Ship with AI." },
];
