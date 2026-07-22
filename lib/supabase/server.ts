import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

// Client scoped to the current request, respects the signed-in user's RLS policies.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component with no request context — safe to ignore
            // because middleware refreshes the session on every request.
          }
        },
      },
    }
  );
}

// Service-role client — bypasses RLS. Server-only, used exclusively for the
// gamification engine (XP/streak/badge writes) after validating the request.
// Never import this file into a client component.
import { createClient as createServiceClient } from '@supabase/supabase-js';

export function createAdminClient() {
  return createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
