'use client';

import { useEffect, useRef } from 'react';

interface ConstellationBackgroundProps {
  density?: 'low' | 'medium' | 'high';
  className?: string;
}

type NodeColor = 'orange' | 'teal' | 'white';

interface Node {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  phase: number;
  driftR: number;
  size: number;
  color: NodeColor;
}

interface Star {
  x: number;
  y: number;
  opacity: number;
  twinkle: number;
  speed: number;
}

interface Arc {
  from: number;
  to: number;
  progress: number;
  duration: number;
}

const COLOR_RGB: Record<NodeColor, string> = {
  orange: '249, 115, 22',
  teal: '45, 212, 191',
  white: '226, 232, 240',
};

export function ConstellationBackground({ density = 'medium', className = '' }: ConstellationBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const applySize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    applySize();

    const nodeCount = density === 'high' ? 18 : density === 'low' ? 9 : 13;
    const starCount = density === 'high' ? 140 : density === 'low' ? 60 : 100;

    const makeNodes = (): Node[] => {
      const nodes: Node[] = [];
      const cx = width / 2;
      const cy = height / 2;
      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2 + Math.random() * 0.3;
        const radius = 180 + (i % 3) * 120 + Math.random() * 80;
        const color: NodeColor = i === 0 ? 'orange' : i === 3 ? 'teal' : i === 7 ? 'orange' : i === 10 ? 'teal' : 'white';
        nodes.push({
          baseX: cx + Math.cos(angle) * radius,
          baseY: cy + Math.sin(angle) * radius * 0.65,
          x: 0,
          y: 0,
          phase: Math.random() * Math.PI * 2,
          driftR: 8 + Math.random() * 14,
          size: color === 'white' ? 1.4 + Math.random() * 1.2 : 2.4 + Math.random() * 1.6,
          color,
        });
      }
      return nodes;
    };

    const makeStars = (): Star[] =>
      Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        opacity: 0.1 + Math.random() * 0.5,
        twinkle: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.2,
      }));

    let nodes = makeNodes();
    let stars = makeStars();
    const arcs: Arc[] = [];
    let arcTimer = 0;
    let t = 0;
    let raf = 0;

    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, width, height);

      // Twinkling stars
      for (const s of stars) {
        const a = s.opacity * (0.55 + 0.45 * Math.sin(t * s.speed + s.twinkle));
        ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
        ctx.fillRect(s.x, s.y, 1, 1);
      }

      // Update node positions (gentle orbit drift)
      for (const n of nodes) {
        n.x = n.baseX + Math.sin(t * 0.35 + n.phase) * n.driftR;
        n.y = n.baseY + Math.cos(t * 0.27 + n.phase) * n.driftR;
      }

      // Connection lines (distance-based opacity)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 280) {
            const op = 0.11 * (1 - d / 280);
            ctx.strokeStyle = `rgba(148, 163, 184, ${op})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Handoff arcs — occasional bright sweep between two nodes
      arcTimer++;
      if (arcTimer > 220 && arcs.length < 3) {
        arcTimer = 0;
        const from = Math.floor(Math.random() * nodes.length);
        let to = from;
        while (to === from) to = Math.floor(Math.random() * nodes.length);
        arcs.push({ from, to, progress: 0, duration: 75 });
      }
      for (let i = arcs.length - 1; i >= 0; i--) {
        const a = arcs[i];
        a.progress += 1 / a.duration;
        if (a.progress >= 1) {
          arcs.splice(i, 1);
          continue;
        }
        const n1 = nodes[a.from];
        const n2 = nodes[a.to];
        const p = a.progress;
        const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        const x = n1.x + (n2.x - n1.x) * ease;
        const y = n1.y + (n2.y - n1.y) * ease;

        // Trailing line
        ctx.strokeStyle = `rgba(249, 115, 22, ${0.75 * (1 - p * 0.7)})`;
        ctx.lineWidth = 1.4;
        ctx.shadowColor = 'rgba(249, 115, 22, 0.55)';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Traveling dot
        ctx.fillStyle = `rgba(253, 186, 116, ${0.95})`;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw nodes with pulse
      for (const n of nodes) {
        const pulse = 0.55 + 0.45 * Math.sin(t * 1.3 + n.phase);
        const rgb = COLOR_RGB[n.color];
        // Outer halo
        ctx.fillStyle = `rgba(${rgb}, ${0.06 + 0.06 * pulse})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size * 6, 0, Math.PI * 2);
        ctx.fill();
        // Inner core
        ctx.fillStyle = `rgba(${rgb}, ${0.35 + 0.45 * pulse})`;
        ctx.shadowColor = `rgba(${rgb}, 0.8)`;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onResize = () => {
      applySize();
      nodes = makeNodes();
      stars = makeStars();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      aria-hidden
    />
  );
}
