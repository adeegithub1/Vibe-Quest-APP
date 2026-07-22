import Link from 'next/link';
import type { Mission } from '@/types/database';

const CATEGORY_ICON: Record<string, string> = {
  explore: '🗺️',
  self: '💪',
  social: '👥',
  fun: '🎮',
  earn: '💰',
  learn: '📚',
  connect: '❤️',
  create: '🎨',
  adventure: '🌍',
};

export function MissionStamp({ mission }: { mission: Mission }) {
  return (
    <div className="stamp-card relative mt-4 p-5 pb-4.5">
      <div className="absolute right-3.5 top-3.5 flex h-[52px] w-[52px] rotate-[8deg] items-center justify-center rounded-full bg-quest-gradient text-2xl shadow-quest-glow">
        {CATEGORY_ICON[mission.category] ?? '🎯'}
      </div>
      <div className="font-mono text-[11px] uppercase tracking-widest text-ink-mute">
        {mission.category}
      </div>
      <div className="mt-1 max-w-[75%] font-display text-[19px] font-extrabold">
        {mission.title}
      </div>
      <div className="mt-3.5 flex flex-wrap gap-2">
        <MetaPill>⏱ {mission.estimated_time}</MetaPill>
        <MetaPill>💰 {mission.estimated_cost}</MetaPill>
        {mission.distance && <MetaPill>📍 {mission.distance}</MetaPill>}
        <MetaPill>⚡ {mission.difficulty}</MetaPill>
      </div>
    </div>
  );
}

function MetaPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-[10px] border border-card-border bg-white/[0.06] px-2.5 py-1.5 font-mono text-[11px] font-semibold text-ink-dim">
      {children}
    </span>
  );
}

export function MissionRow({ mission }: { mission: Mission }) {
  return (
    <Link
      href={`/missions/${mission.id}`}
      className="mb-2.5 flex items-center gap-3 rounded-2xl border border-card-border bg-card p-3"
    >
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet/30 to-coral/15 text-lg">
        {CATEGORY_ICON[mission.category] ?? '🎯'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-bold">{mission.title}</div>
        <div className="mt-0.5 font-mono text-[11px] text-ink-mute">
          ⏱ {mission.estimated_time} · 💰 {mission.estimated_cost} · ⚡ {mission.difficulty}
        </div>
      </div>
      <div className="text-ink-mute">›</div>
    </Link>
  );
}
