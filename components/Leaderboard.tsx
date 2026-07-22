'use client';

import { useState } from 'react';

export interface LeaderboardEntry {
  username: string;
  xp: number;
  isMe?: boolean;
}

export default function Leaderboard({
  global,
  city,
  friends,
  weekly,
}: {
  global: LeaderboardEntry[];
  city: LeaderboardEntry[];
  friends: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
}) {
  const [tab, setTab] = useState<'global' | 'city' | 'friends' | 'weekly'>('global');
  const data = { global, city, friends, weekly }[tab];

  return (
    <div>
      <div className="mt-3.5 flex gap-1.5 rounded-2xl bg-white/[0.04] p-1.5">
        {(['global', 'city', 'friends', 'weekly'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-xl py-2.5 text-center text-[11.5px] font-bold capitalize ${
              tab === t ? 'bg-quest-gradient text-white' : 'text-ink-mute'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="glass-card mt-3.5 p-4.5">
        {data.map((row, i) => (
          <div
            key={row.username}
            className="flex items-center gap-3 border-b border-white/[0.06] py-2.5 last:border-none"
          >
            <div className={`w-6 font-mono text-[13px] font-bold ${i < 3 ? 'text-amber' : 'text-ink-mute'}`}>
              {i + 1}
            </div>
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-quest-gradient font-display text-xs font-extrabold">
              {row.username[0]?.toUpperCase()}
            </div>
            <div className="flex-1 text-[13px] font-bold">
              {row.username}
              {row.isMe ? ' (you)' : ''}
            </div>
            <div className="font-mono text-xs font-bold text-lime">{row.xp.toLocaleString()} XP</div>
          </div>
        ))}
        {data.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-mute">No data yet — be the first!</p>
        )}
      </div>
    </div>
  );
}
