'use client';

import { useEffect, useRef } from 'react';

const COLORS = ['#7C5CFC', '#FF4D8D', '#C6FF4D', '#FFB020', '#3EE6E0'];

export default function ConfettiBurst({ fire }: { fire: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fire || !hostRef.current) return;
    const host = hostRef.current;
    const pieces: HTMLDivElement[] = [];

    for (let i = 0; i < 50; i++) {
      const p = document.createElement('div');
      const size = 5 + Math.random() * 6;
      p.style.position = 'absolute';
      p.style.top = '-10px';
      p.style.left = Math.random() * 100 + '%';
      p.style.width = size + 'px';
      p.style.height = size * 1.6 + 'px';
      p.style.borderRadius = '2px';
      p.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
      const duration = 1.4 + Math.random() * 1.2;
      const delay = Math.random() * 0.3;
      p.style.animation = `vq-fall ${duration}s linear forwards`;
      p.style.animationDelay = `${delay}s`;
      host.appendChild(p);
      pieces.push(p);
    }

    const timeout = setTimeout(() => pieces.forEach((p) => p.remove()), 3200);
    return () => {
      clearTimeout(timeout);
      pieces.forEach((p) => p.remove());
    };
  }, [fire]);

  return (
    <>
      <style>{`
        @keyframes vq-fall {
          to { transform: translateY(760px) rotate(600deg); opacity: 0; }
        }
      `}</style>
      <div ref={hostRef} className="pointer-events-none absolute inset-0 overflow-hidden" />
    </>
  );
}
