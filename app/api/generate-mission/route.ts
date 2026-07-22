import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { generateMissionWithAI } from '@/lib/ai';

const RequestSchema = z.object({
  prompt: z.string().min(2).max(500),
});

export async function POST(req: NextRequest) {
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('city')
    .eq('id', user.id)
    .single();

  const mission = await generateMissionWithAI({
    prompt: parsed.data.prompt,
    city: profile?.city ?? null,
  });

  // Persist as a mission row so it can be completed like any other mission
  // and shows up correctly in mission_completions / the community feed.
  const { data: saved, error } = await supabase
    .from('missions')
    .insert({
      title: mission.title,
      description: `AI-generated ${mission.duration} adventure`,
      category: 'adventure',
      difficulty: mission.difficulty,
      estimated_time: mission.duration,
      estimated_cost: `₹${mission.budget}`,
      distance: null,
      xp_reward: mission.xp_reward,
      steps: mission.steps,
      requirements: [],
      is_ai_generated: true,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    // Still return the generated plan even if persistence fails, so the
    // user isn't blocked — it just can't be tracked step-by-step yet.
    return NextResponse.json({ mission, persisted: false });
  }

  return NextResponse.json({ mission: saved, persisted: true });
}
