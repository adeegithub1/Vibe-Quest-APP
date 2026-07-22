import { createClient } from '@/lib/supabase/server';
import SignOutButton from '@/components/SignOutButton';

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const { data: allBadges } = await supabase.from('badges').select('*');
  const { data: unlocked } = await supabase.from('user_badges').select('badge_id').eq('user_id', user.id);
  const unlockedIds = new Set((unlocked ?? []).map((b) => b.badge_id));

  if (!profile) return null;

  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-widest text-ink-mute">Profile</div>
      <div className="mt-2.5 flex items-center gap-3.5">
        <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-quest-gradient font-display text-2xl font-extrabold shadow-quest-glow">
          {profile.username[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="font-display text-xl">{profile.username}</h2>
          <div className="mt-0.5 font-mono text-[11px] uppercase tracking-widest text-ink-mute">
            Level {profile.level} · {profile.level_name}
          </div>
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-3 gap-2.5">
        <Stat icon="🏆" value={profile.xp.toLocaleString()} label="XP" />
        <Stat icon="🔥" value={profile.streak} label="Streak" />
        <Stat icon="🎯" value={profile.missions_completed} label="Missions" />
      </div>

      <div className="mb-3 mt-6.5 flex items-baseline justify-between">
        <h3 className="text-[15px] font-bold">Badges</h3>
        <span className="font-mono text-[11.5px] text-ink-mute">
          {unlockedIds.size}/{allBadges?.length ?? 0}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {(allBadges ?? []).map((b) => (
          <div
            key={b.id}
            title={b.name}
            className={`flex aspect-square items-center justify-center rounded-2xl border border-card-border bg-card text-2xl ${
              unlockedIds.has(b.id) ? '' : 'opacity-25 grayscale'
            }`}
          >
            {b.icon}
          </div>
        ))}
      </div>

      {profile.preferences?.interests && profile.preferences.interests.length > 0 && (
        <>
          <div className="mb-3 mt-6.5 text-[15px] font-bold">Favorite categories</div>
          <div className="flex flex-wrap gap-2">
            {profile.preferences.interests.map((t: string) => (
              <span
                key={t}
                className="rounded-full bg-quest-gradient px-3.5 py-2 text-[12.5px] font-bold shadow-quest-glow"
              >
                {t}
              </span>
            ))}
          </div>
        </>
      )}

      <div className="mb-3 mt-6.5 text-[15px] font-bold">Safety</div>
      <div className="glass-card space-y-2 p-4.5">
        <Row label="📍 Location sharing" value={profile.location_sharing ? 'On (missions only)' : 'Off'} color="text-lime" />
        <Row label="🚫 Blocked users" value="0" color="text-ink-mute" />
        <Row label="🆘 Emergency option" value="Configure" color="text-coral" />
      </div>

      <div className="mt-6">
        <SignOutButton />
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="rounded-2xl border border-card-border bg-card px-2 py-3 text-center">
      <div className="font-mono text-base font-bold">
        {icon} {value}
      </div>
      <div className="mt-0.5 text-[10.5px] text-ink-mute">{label}</div>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex justify-between border-b border-white/[0.06] py-2 text-[13px] font-semibold last:border-none">
      <span>{label}</span>
      <span className={color}>{value}</span>
    </div>
  );
}
