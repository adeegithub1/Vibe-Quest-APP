import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { applyMissionCompletion, BADGE_RULES } from '@/lib/gamification';

const RequestSchema = z.object({
  mission_id: z.string().uuid(),
  completed_steps: z.array(z.number().int().nonnegative()),
  proof_text: z.string().max(500).optional().nullable(),
  proof_image_url: z.string().url().optional().nullable(),
});

export async function POST(req: NextRequest) {
  // 1. Authenticate with the request-scoped client (respects RLS).
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const { mission_id, completed_steps, proof_text, proof_image_url } = parsed.data;

  // 2. Load the mission server-side — the XP reward and step count come
  // from the database, never from the client payload.
  const { data: mission, error: missionError } = await supabase
    .from('missions')
    .select('id, xp_reward, steps, category')
    .eq('id', mission_id)
    .single();

  if (missionError || !mission) {
    return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
  }

  const totalSteps = Array.isArray(mission.steps) ? mission.steps.length : 0;
  if (completed_steps.length < totalSteps) {
    return NextResponse.json(
      { error: 'All mission steps must be completed first' },
      { status: 400 }
    );
  }

  // 3. From here on, use the service-role client — it's the only thing
  // allowed to write XP/level/streak/badges (see supabase/rls.sql).
  const admin = createAdminClient();

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('level, xp, xp_next, streak, longest_streak, missions_completed, last_completed_date')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const result = applyMissionCompletion(profile, mission.xp_reward, today);

  // 4. Persist the completion record (idempotency: one completion per
  // mission per user per day is a reasonable product rule — adjust as needed).
  const { error: completionError } = await admin.from('mission_completions').insert({
    user_id: user.id,
    mission_id,
    proof_text: proof_text ?? null,
    proof_image_url: proof_image_url ?? null,
    completed_steps,
    xp_earned: mission.xp_reward,
  });

  if (completionError) {
    return NextResponse.json({ error: 'Could not record completion' }, { status: 500 });
  }

  // 5. Persist the new gamification state.
  const { error: updateError } = await admin
    .from('profiles')
    .update({
      level: result.level,
      level_name: result.level_name,
      xp: result.xp,
      xp_next: result.xp_next,
      streak: result.streak,
      longest_streak: result.longest_streak,
      missions_completed: result.missions_completed,
      last_completed_date: result.last_completed_date,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (updateError) {
    return NextResponse.json({ error: 'Could not update profile' }, { status: 500 });
  }

  // 6. Badge check — count completions per category and unlock any newly
  // satisfied badges.
  const { data: completions } = await admin
    .from('mission_completions')
    .select('mission_id, missions!inner(category)')
    .eq('user_id', user.id);

  const categoryCounts: Record<string, number> = {};
  (completions ?? []).forEach((c: any) => {
    const cat = c.missions?.category;
    if (cat) categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
  });

  const { data: allBadges } = await admin.from('badges').select('id, name');
  const { data: userBadges } = await admin
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', user.id);
  const unlockedIds = new Set((userBadges ?? []).map((b: any) => b.badge_id));

  const newlyUnlocked: string[] = [];
  for (const badge of allBadges ?? []) {
    if (unlockedIds.has(badge.id)) continue;
    const rule = BADGE_RULES[badge.name];
    if (
      rule &&
      rule({
        missions_completed: result.missions_completed,
        streak: result.streak,
        categoryCounts,
      })
    ) {
      await admin.from('user_badges').insert({ user_id: user.id, badge_id: badge.id });
      newlyUnlocked.push(badge.name);
    }
  }

  return NextResponse.json({
    xp_earned: mission.xp_reward,
    leveled_up: result.leveled_up,
    streak_broken: result.streak_broken,
    profile: result,
    newly_unlocked_badges: newlyUnlocked,
  });
}
