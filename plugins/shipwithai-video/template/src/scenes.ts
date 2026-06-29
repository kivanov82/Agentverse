// The video is data-driven: edit these scenes, not the React in Promo.tsx.
// Scene durations should sum to brand.fps * brand.durationSeconds (default 30 * 30 = 900).

export type Scene =
  | { type: "title"; durationInFrames: number; title: string; subtitle: string }
  | { type: "message"; durationInFrames: number; lines: string[] }
  | { type: "grid"; durationInFrames: number; heading: string; items: string[] }
  | { type: "showcase"; durationInFrames: number; image: string; caption: string; heading?: string }
  // A screen recording (mp4/webm in public/), fast-forwarded inside a branded frame.
  // playbackRate 3-5 = the speed-up; startFrom/endAt (in frames of the SOURCE) trim to the highlight.
  // heading = a LARGE title across the top of the clip; fit "contain" letterboxes wide sources (no crop), "cover" (default) fills.
  | { type: "clip"; durationInFrames: number; src: string; caption: string; playbackRate?: number; startFrom?: number; endAt?: number; muted?: boolean; heading?: string; fit?: "cover" | "contain" }
  // Animated counters: each stat counts up from 0 to `value`, with a label and the tagline below.
  | { type: "stat"; durationInFrames: number; stats: { value: number; label: string; suffix?: string }[]; tagline?: string }
  // The agent fleet as a hub-and-spoke network: a center node (e.g. "pm") with one cluster per plugin
  // arranged around it, and task-passing pulses animating center -> cluster along each edge.
  // Optional "AI-native org" story: `humans` adds a directing bar ABOVE the center (humans → fleet),
  // `contextLayer` adds a full-width shared-context bar at the BASE that every cluster plugs into
  // (with bidirectional pulses — agents read from / write to it). Both are backwards-compatible.
  | { type: "network"; durationInFrames: number; heading?: string; center: string; clusters: { plugin: string; agents: string[] }[]; humans?: string; contextLayer?: { label: string; items: string[] } }
  // A staggered list of deliverables/features; columns: 2 for long lists.
  | { type: "list"; durationInFrames: number; heading: string; columns?: 1 | 2; items: { label: string; sub?: string }[] }
  // A before/after workflow — two rows of labelled boxes joined by arrows ("remove the maze").
  | { type: "maze"; durationInFrames: number; heading?: string; caption?: string; before: { label: string; steps: string[] }; after: { label: string; steps: string[] } }
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
