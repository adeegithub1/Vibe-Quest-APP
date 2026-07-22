import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function RootPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('city')
    .eq('id', user.id)
    .single();

  // No city set yet is our proxy for "hasn't finished onboarding".
  if (!profile?.city) redirect('/onboarding');

  redirect('/home');
}
