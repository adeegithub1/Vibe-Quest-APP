'use client';

import { motion } from 'framer-motion';

export default function VibeDial({
  level,
  levelName,
  xp,
  xpNext,
}: {
  level: number;
  levelName: string;
  xp: number;
  xpNext: number;
}) {
  const R = 88;
  const C = 2 * Math.PI * R;
  const pct = Math.min(100, Math.round((xp / xpNext) * 100));
  const dash = (C * pct) / 100;

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-2 mt-1.5 flex justify-center">
        <svg viewBox="0 0 200 200" className="h-[210px] w-[210px]">
          <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" />
          <motion.circle
            cx="100"
            cy="100"
            r={R}
            fill="none"
            stroke="url(#vibeGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${C}`}
            transform="rotate(-90 100 100)"
            initial={{ strokeDasharray: `0 ${C}` }}
            animate={{ strokeDasharray: `${dash} ${C}` }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.3, 1] }}
          />
          <defs>
            <linearGradient id="vibeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C5CFC" />
              <stop offset="100%" stopColor="#FF4D8D" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="font-display text-3xl font-black">LVL {level}</div>
          <div className="mt-1 font-mono text-[11px] uppercase tracking-widest text-ink-mute">
            {levelName}
          </div>
        </div>
      </div>
      <div className="-mt-1 font-mono text-xs text-ink-mute">
        {xp.toLocaleString()} / {xpNext.toLocaleString()} XP
      </div>
    </div>
  );
}
