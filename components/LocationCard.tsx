export default function LocationCard({
  name,
  distanceKm,
  emoji,
  onClick,
}: {
  name: string;
  distanceKm: number;
  emoji: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="mb-2.5 flex w-full items-center gap-3 rounded-2xl border border-card-border bg-card p-3 text-left"
    >
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan/30 to-violet/15 text-lg">
        {emoji}
      </div>
      <div className="flex-1">
        <div className="text-[13.5px] font-bold">{name}</div>
        <div className="mt-0.5 font-mono text-[11px] text-ink-mute">📍 {distanceKm} km away</div>
      </div>
      <div className="text-ink-mute">›</div>
    </button>
  );
}
