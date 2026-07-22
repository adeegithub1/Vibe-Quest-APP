import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  await supabase
    .from('group_mission_participants')
    .insert({ group_mission_id: params.id, user_id: user.id });

  return NextResponse.redirect(new URL('/missions?joined=1', req.url));
}
