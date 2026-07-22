'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import MoodSelector from '@/components/MoodSelector';
import type { MoodId } from '@/types/database';

const STEPS = ['mood', 'basics', 'interests', 'social', 'difficulty'] as const;
type Step = (typeof STEPS)[number];

const INTEREST_OPTIONS = [
  'Photography', 'Food', 'Music', 'Sports', 'Fitness', 'Art',
  'Gaming', 'Tech', 'Nature', 'Reading', 'Movies', 'Dance',
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [stepIdx, setStepIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mood, setMood] = useState<MoodId | null>(null);
  const [city, setCity] = useState('');
  const [time, setTime] = useState('');
  const [budget, setBudget] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [social, setSocial] = useState<'solo' | 'friends' | null>(null);
  const [place, setPlace] = useState<'indoor' | 'outdoor' | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);

  const step = STEPS[stepIdx];
  const next = () => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  const back = () => setStepIdx((i) => Math.max(i - 1, 0));

  function toggleInterest(t: string) {
    setInterests((arr) => (arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]));
  }

  async function finish() {
    setSaving(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        city,
        preferences: {
          time_available: time,
          budget,
          interests,
          social: social ?? undefined,
          place: place ?? undefined,
          difficulty: difficulty ?? undefined,
        },
      })
      .eq('id', user.id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push(`/home?firstMood=${mood ?? 'bored'}`);
  }

  return (
    <div className="min-h-screen px-5 py-6">
      <div className="font-mono text-[11px] uppercase tracking-widest text-ink-mute">
        Welcome · Step {stepIdx + 1} of {STEPS.length}
      </div>
      <div className="mb-5 mt-2 flex gap-1.5">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full ${i <= stepIdx ? 'bg-quest-gradient' : 'bg-white/10'}`}
          />
        ))}
      </div>

      {step === 'mood' && (
        <>
          <h1 className="text-[26px] font-display leading-tight">
            What are you
            <br />
            feeling right now?
          </h1>
          <p className="text-ink-dim">We&apos;ll build your first mission around this.</p>
          <MoodSelector selected={mood} onSelect={setMood} />
          <NavButtons canNext={!!mood} onNext={next} showBack={false} />
        </>
      )}

      {step === 'basics' && (
        <>
          <h1 className="font-display text-2xl">Tell us the basics</h1>
          <p className="text-ink-dim">So every mission actually fits your day.</p>

          <FieldLabel>Your city / location</FieldLabel>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Delhi, Mumbai, Bengaluru"
            className="w-full rounded-2xl border border-card-border bg-white/[0.05] p-3.5 text-sm font-semibold outline-none focus:border-violet"
          />

          <FieldLabel>Time available today</FieldLabel>
          <ChipRow options={['30 min', '1 hour', '2-3 hours', 'Half day']} value={time} onChange={setTime} />

          <FieldLabel>Budget</FieldLabel>
          <ChipRow
            options={['Free', 'Under ₹100', '₹100–500', '₹500+']}
            value={budget}
            onChange={setBudget}
          />

          <NavButtons canNext={!!city && !!time && !!budget} onNext={next} onBack={back} />
        </>
      )}

      {step === 'interests' && (
        <>
          <h1 className="font-display text-2xl">What are you into?</h1>
          <p className="text-ink-dim">Pick a few. This shapes your mission categories.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => toggleInterest(t)}
                className={`rounded-full border px-3.5 py-2 text-[12.5px] font-bold ${
                  interests.includes(t)
                    ? 'border-transparent bg-quest-gradient shadow-quest-glow'
                    : 'border-card-border bg-white/[0.06]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <NavButtons canNext={interests.length > 0} onNext={next} onBack={back} />
        </>
      )}

      {step === 'social' && (
        <>
          <h1 className="font-display text-2xl">Solo, or with people?</h1>
          <div className="mt-2.5 flex gap-2.5">
            <SoloOpt label="🧍 Solo" active={social === 'solo'} onClick={() => setSocial('solo')} />
            <SoloOpt label="👥 With friends" active={social === 'friends'} onClick={() => setSocial('friends')} />
          </div>
          <FieldLabel>Indoor or outdoor?</FieldLabel>
          <div className="flex gap-2.5">
            <SoloOpt label="🏠 Indoor" active={place === 'indoor'} onClick={() => setPlace('indoor')} />
            <SoloOpt label="🌤️ Outdoor" active={place === 'outdoor'} onClick={() => setPlace('outdoor')} />
          </div>
          <NavButtons canNext={!!social && !!place} onNext={next} onBack={back} />
        </>
      )}

      {step === 'difficulty' && (
        <>
          <h1 className="font-display text-2xl">Pick your difficulty</h1>
          <p className="text-ink-dim">You can change this anytime later.</p>
          <div className="mt-4 flex flex-col gap-2.5">
            {(
              [
                ['easy', '⚡ Easy', 'Low effort, quick wins'],
                ['medium', '🔥 Medium', 'A real challenge'],
                ['hard', '💀 Hard', 'Push your limits'],
              ] as const
            ).map(([id, label, desc]) => (
              <button
                key={id}
                onClick={() => setDifficulty(id)}
                className={`rounded-[18px] border-[1.5px] px-4 py-3.5 text-left ${
                  difficulty === id
                    ? 'border-violet bg-gradient-to-br from-violet/30 to-coral/10'
                    : 'border-card-border bg-card'
                }`}
              >
                <div className="text-sm font-bold">{label}</div>
                <div className="mt-0.5 text-[11px] text-ink-mute">{desc}</div>
              </button>
            ))}
          </div>
          {error && <p className="mt-3 text-sm text-coral">{error}</p>}
          <div className="mt-5 flex gap-2.5">
            <button onClick={back} className="flex-1 rounded-2xl border border-card-border py-4 font-display text-sm font-semibold">
              ← Back
            </button>
            <button
              onClick={finish}
              disabled={!difficulty || saving}
              className="flex-[2] rounded-2xl bg-quest-gradient py-4 font-display text-sm font-semibold shadow-quest-glow disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Find my first mission →'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 mt-4.5 font-mono text-[11px] uppercase tracking-wider text-ink-mute">
      {children}
    </div>
  );
}

function ChipRow({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`rounded-full border px-3.5 py-2 text-[12.5px] font-bold ${
            value === o ? 'border-transparent bg-quest-gradient shadow-quest-glow' : 'border-card-border bg-white/[0.06]'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function SoloOpt({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-2xl border-[1.5px] px-2 py-4 text-center text-[12.5px] font-bold ${
        active ? 'border-violet bg-gradient-to-br from-violet/30 to-coral/10' : 'border-card-border bg-card'
      }`}
    >
      {label}
    </button>
  );
}

function NavButtons({
  canNext,
  onNext,
  onBack,
  showBack = true,
}: {
  canNext: boolean;
  onNext: () => void;
  onBack?: () => void;
  showBack?: boolean;
}) {
  return (
    <div className="mt-5 flex gap-2.5">
      {showBack && onBack && (
        <button onClick={onBack} className="flex-1 rounded-2xl border border-card-border py-4 font-display text-sm font-semibold">
          ← Back
        </button>
      )}
      <button
        onClick={onNext}
        disabled={!canNext}
        className={`${showBack ? 'flex-[2]' : 'w-full'} rounded-2xl bg-quest-gradient py-4 font-display text-sm font-semibold shadow-quest-glow disabled:opacity-40`}
      >
        Continue →
      </button>
    </div>
  );
}
