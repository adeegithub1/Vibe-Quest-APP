export default function StatStrip({
  streak,
  missions,
  badges,
}: {
  streak: number;
  missions: number;
  badges: number;
}) {
  const stats = [
    { icon: '🔥', value: streak, label: 'Day Streak' },
    { icon: '🎯', value: missions, label: 'Missions' },
    { icon: '🏆', value: badges, label: 'Badges' },
  ];
  return (
    <div className="mt-3.5 grid grid-cols-3 gap-2.5">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-card-border bg-card px-2 py-3 text-center">
          <div className="font-mono text-base font-bold">
            {s.icon} {s.value}
          </div>
          <div className="mt-0.5 text-[10.5px] text-ink-mute">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
