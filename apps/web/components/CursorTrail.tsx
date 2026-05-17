'use client';

import { useEffect, useRef } from 'react';

export function CursorTrail() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;

    let targetX = -100;
    let targetY = -100;
    let x = -100;
    let y = -100;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const onLeave = () => {
      dot.style.opacity = '0';
    };
    const onEnter = () => {
      dot.style.opacity = '1';
    };

    const loop = () => {
      x += (targetX - x) * 0.22;
      y += (targetY - y) * 0.22;
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('mouseenter', onEnter);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  return <div ref={dotRef} className="cursor-trail" aria-hidden />;
}
