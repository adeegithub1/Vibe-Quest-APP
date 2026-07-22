'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut();
        router.push('/auth/login');
      }}
      className="w-full rounded-2xl border border-card-border py-3.5 text-sm font-bold text-coral"
    >
      Sign Out
    </button>
  );
}
