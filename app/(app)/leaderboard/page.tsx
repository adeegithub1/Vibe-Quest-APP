import { createClient } from '@/lib/supabase/server';
import Leaderboard, { type LeaderboardEntry } from '@/components/Leaderboard';

export default async function LeaderboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: me } = user
    ? await supabase.from('profiles').select('city').eq('id', user.id).single()
    : { data: null };

  const { data: globalRows } = await supabase
    .from('profiles')
    .select('username, xp')
    .order('xp', { ascending: false })
    .limit(20);

  const { data: cityRows } = me?.city
    ? await supabase
        .from('profiles')
        .select('username, xp')
        .eq('city', me.city)
        .order('xp', { ascending: false })
        .limit(20)
    : { data: [] };

  // Friends leaderboard: accepted friendships involving the current user.
  let friendRows: LeaderboardEntry[] = [];
  if (user) {
    const { data: friendships } = await supabase
      .from('friendships')
      .select('requester_id, receiver_id')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

    const friendIds = (friendships ?? []).map((f) =>
      f.requester_id === user.id ? f.receiver_id : f.requester_id
    );
    if (friendIds.length > 0) {
      const { data } = await supabase
        .from('profiles')
        .select('username, xp')
        .in('id', [...friendIds, user.id])
        .order('xp', { ascending: false });
      friendRows = (data ?? []).map((r) => ({ ...r, isMe: false }));
    }
  }

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { data: weeklyCompletions } = await supabase
    .from('mission_completions')
    .select('user_id, xp_earned, profiles(username)')
    .gte('completed_at', weekAgo.toISOString());

  const weeklyTotals = new Map<string, { username: string; xp: number }>();
  (weeklyCompletions ?? []).forEach((c: any) => {
    const key = c.user_id;
    const prev = weeklyTotals.get(key)?.xp ?? 0;
    weeklyTotals.set(key, { username: c.profiles?.username ?? 'Explorer', xp: prev + c.xp_earned });
  });
  const weeklyRows = [...weeklyTotals.values()].sort((a, b) => b.xp - a.xp).slice(0, 20);

  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-widest text-ink-mute">
        Leaderboards
      </div>
      <h1 className="font-display text-2xl">Where you rank</h1>
      <Leaderboard
        global={globalRows ?? []}
        city={cityRows ?? []}
        friends={friendRows}
        weekly={weeklyRows}
      />
    </div>
  );
}
