import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MissionRunner from '@/components/MissionRunner';

export default async function MissionDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: mission } = await supabase.from('missions').select('*').eq('id', params.id).single();

  if (!mission) notFound();

  return <MissionRunner mission={mission as any} />;
}
