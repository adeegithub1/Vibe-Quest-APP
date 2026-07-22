import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import VibeDial from '@/components/VibeDial';
import StatStrip from '@/components/StatStrip';
import { MissionRow } from '@/components/MissionCard';
import { CATEGORIES } from '@/lib/missions';

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  const { data: recentMissions } = await supabase
    .from('missions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  const { data: latestPost } = await supabase
    .from('posts')
    .select('*, profiles(username)')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!profile) return null;

  return (
    <div>
      <div className="mb-4.5 flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-widest text-ink-mute">
            Hey {profile.username} 👋
          </div>
          <h2 className="mt-0.5 font-display text-xl">What&apos;s your vibe today?</h2>
        </div>
        <Link
          href="/profile"
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-quest-gradient font-display text-base font-extrabold shadow-quest-glow"
        >
          {profile.username[0]?.toUpperCase()}
        </Link>
      </div>

      <VibeDial level={profile.level} levelName={profile.level_name} xp={profile.xp} xpNext={profile.xp_next} />
      <StatStrip streak={profile.streak} missions={profile.missions_completed} badges={0} />

      <Link
        href="/ai"
        className="mt-5.5 block w-full rounded-2xl bg-quest-gradient px-5 py-5 text-center font-display text-[15px] font-semibold shadow-quest-glow"
      >
        🎯 GENERATE MY MISSION
      </Link>

      {recentMissions && recentMissions.length > 0 && (
        <>
          <div className="mb-3 mt-6.5 flex items-baseline justify-between">
            <h3 className="text-[15px] font-bold">Continue your quest</h3>
          </div>
          <MissionRow mission={recentMissions[0] as any} />
        </>
      )}

      <div className="mb-3 mt-6.5 flex items-baseline justify-between">
        <h3 className="text-[15px] font-bold">Browse by category</h3>
        <Link href="/missions" className="font-mono text-[11.5px] text-ink-mute">
          See all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.slice(0, 4).map((c) => (
          <Link
            key={c.id}
            href={`/missions?category=${c.id}`}
            className="flex min-h-[88px] flex-col justify-end rounded-2xl border border-card-border bg-gradient-to-br from-violet/25 to-coral/10 p-4"
          >
            <span className="text-xl">{c.emoji}</span>
            <span className="mt-1.5 font-display text-[13px] font-bold">{c.name}</span>
          </Link>
        ))}
      </div>

      {latestPost && (
        <>
          <div className="mb-3 mt-6.5 flex items-baseline justify-between">
            <h3 className="text-[15px] font-bold">From your community</h3>
            <Link href="/community" className="font-mono text-[11.5px] text-ink-mute">
              See all
            </Link>
          </div>
          <div className="rounded-[20px] border border-card-border bg-card p-4">
            <div className="text-[13.5px] font-bold">{(latestPost as any).profiles?.username}</div>
            {latestPost.caption && (
              <p className="mt-2 text-[13px] text-ink-dim">&ldquo;{latestPost.caption}&rdquo;</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
