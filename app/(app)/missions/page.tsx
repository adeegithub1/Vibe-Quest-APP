import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { CATEGORIES } from '@/lib/missions';
import { MissionRow } from '@/components/MissionCard';

export default async function MissionsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const supabase = createClient();
  const category = searchParams.category;

  const query = supabase.from('missions').select('*').order('created_at', { ascending: false }).limit(10);
  const { data: missions } = category ? await query.eq('category', category) : await query;

  const { data: groupMissions } = await supabase
    .from('group_missions')
    .select('*, group_mission_participants(count)')
    .order('created_at', { ascending: false })
    .limit(1);

  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-widest text-ink-mute">Missions</div>
      <h1 className="font-display text-2xl">Pick your category</h1>

      <div className="mt-3.5 grid grid-cols-2 gap-3">
        {CATEGORIES.map((c) => (
          <Link
            key={c.id}
            href={`/missions?category=${c.id}`}
            className={`flex min-h-[88px] flex-col justify-end rounded-2xl border p-4 ${
              category === c.id ? 'border-violet' : 'border-card-border'
            } bg-gradient-to-br from-violet/25 to-coral/10`}
          >
            <span className="text-xl">{c.emoji}</span>
            <span className="mt-1.5 font-display text-[13px] font-bold">{c.name}</span>
          </Link>
        ))}
      </div>

      {missions && missions.length > 0 && (
        <>
          <div className="mb-3 mt-6.5 text-[15px] font-bold">
            {category ? `${CATEGORIES.find((c) => c.id === category)?.name} missions` : 'All missions'}
          </div>
          {missions.map((m: any) => (
            <MissionRow key={m.id} mission={m} />
          ))}
        </>
      )}

      {groupMissions && groupMissions.length > 0 && (
        <>
          <div className="mb-3 mt-6.5 text-[15px] font-bold">
            🎯 {groupMissions[0].title}
          </div>
          <div className="rounded-2xl border border-card-border bg-gradient-to-br from-violet/20 to-coral/10 p-4.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-widest text-ink-mute">
                Group Mission
              </span>
              <span className="font-mono text-[11px] text-amber">
                ⏱ ends {new Date(groupMissions[0].end_time).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold">{groupMissions[0].description}</p>
            <form action={`/api/group-missions/${groupMissions[0].id}/join`} method="post">
              <button className="mt-3.5 w-full rounded-xl bg-quest-gradient py-2.5 text-[13px] font-bold">
                Join Mission
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
