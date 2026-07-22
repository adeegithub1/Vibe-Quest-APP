import type { Badge } from '@/types/database';

export default function BadgeCard({ badge, unlocked }: { badge: Badge; unlocked: boolean }) {
  return (
    <div
      title={badge.name}
      className={`flex aspect-square items-center justify-center rounded-2xl border border-card-border bg-card text-2xl ${
        unlocked ? '' : 'opacity-25 grayscale'
      }`}
    >
      {badge.icon}
    </div>
  );
}
