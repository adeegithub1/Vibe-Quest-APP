import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const QuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(1).max(100).optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    lat: searchParams.get('lat'),
    lng: searchParams.get('lng'),
    radius: searchParams.get('radius') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc('nearby_missions', {
    lat: parsed.data.lat,
    lng: parsed.data.lng,
    radius_km: parsed.data.radius ?? 10,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ missions: data });
}
