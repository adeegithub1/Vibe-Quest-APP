'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { Mission } from '@/types/database';
import { MissionStamp } from './MissionCard';
import ConfettiBurst from './ConfettiBurst';

export default function MissionRunner({ mission }: { mission: Mission }) {
  const router = useRouter();
  const [done, setDone] = useState<boolean[]>(() => mission.steps.map(() => false));
  const [reflection, setReflection] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<null | {
    xp_earned: number;
    leveled_up: boolean;
    newly_unlocked_badges: string[];
  }>(null);

  const doneCount = done.filter(Boolean).length;
  const allDone = doneCount === mission.steps.length;

  function toggleStep(i: number) {
    setDone((d) => d.map((v, idx) => (idx === i ? !v : v)));
  }

  async function finishMission() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/complete-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mission_id: mission.id,
          completed_steps: mission.steps.map((_, i) => i),
          proof_text: reflection || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Try again.');
        setSubmitting(false);
        return;
      }
      setResult(data);
    } catch {
      setError('Network error — check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="relative flex min-h-[70vh] flex-col items-center justify-center px-2 text-center">
        <ConfettiBurst fire />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="text-6xl"
        >
          🎉
        </motion.div>
        <h1 className="mt-2.5 font-display text-2xl">MISSION COMPLETE!</h1>
        <p className="max-w-[260px] text-ink-dim">
          {mission.title} — you're building real momentum.
        </p>
        <div className="mt-4.5 w-full max-w-[280px] space-y-2.5">
          <RewardPill label="🏆 XP Earned" value={`+${result.xp_earned}`} color="text-lime" />
          {result.leveled_up && (
            <RewardPill label="📈 Level Up" value="New level!" color="text-amber" />
          )}
          {result.newly_unlocked_badges.length > 0 && (
            <RewardPill
              label="🎖️ New Badge"
              value={result.newly_unlocked_badges.join(', ')}
              color="text-violet"
            />
          )}
        </div>
        <button
          onClick={() => router.push('/home')}
          className="btn-primary mt-6 w-full max-w-[280px] rounded-2xl bg-quest-gradient px-5 py-4 font-display font-semibold shadow-quest-glow"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="font-mono text-[11px] uppercase tracking-widest text-ink-mute"
      >
        ‹ Back
      </button>

      <MissionStamp mission={mission} />

      <div className="mb-3 mt-6 flex items-baseline justify-between">
        <h3 className="text-[15px] font-bold">Mission Progress</h3>
        <span className="font-mono text-[11.5px] text-ink-mute">
          {doneCount}/{mission.steps.length} Tasks
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.07]">
        <motion.div
          className="h-full rounded-full bg-lime-gradient shadow-lime-glow"
          animate={{ width: `${(doneCount / mission.steps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="glass-card mt-4 p-4.5">
        {mission.steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 border-b border-white/[0.06] py-3.5 last:border-none ${
              done[i] ? 'opacity-80' : ''
            }`}
          >
            <div
              className={`flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                done[i] ? 'bg-lime-gradient text-[#12220a]' : 'bg-white/[0.06] text-ink-dim'
              }`}
            >
              {i + 1}
            </div>
            <div className="flex-1">
              <div className={`text-sm font-semibold ${done[i] ? 'text-ink-mute line-through' : ''}`}>
                {step.title}
              </div>
              <div className="mt-0.5 text-[12.5px] text-ink-dim">{step.description}</div>
            </div>
            <button
              onClick={() => toggleStep(i)}
              className={`ml-auto flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border-[1.5px] text-[13px] ${
                done[i]
                  ? 'border-transparent bg-lime-gradient text-[#12220a]'
                  : 'border-card-border bg-white/[0.03]'
              }`}
            >
              {done[i] ? '✓' : ''}
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <div className="field-label mb-2 font-mono text-[11px] uppercase tracking-wide text-ink-mute">
              What did you take away from this? (optional)
            </div>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={3}
              placeholder="Say a line about how it went..."
              className="w-full rounded-2xl border border-card-border bg-white/[0.05] p-3.5 text-sm font-semibold text-ink outline-none focus:border-violet"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-3 text-sm text-coral">{error}</p>}

      <button
        disabled={!allDone || submitting}
        onClick={finishMission}
        className="mt-5 w-full rounded-2xl bg-quest-gradient px-5 py-4 font-display font-semibold text-white shadow-quest-glow disabled:opacity-35"
      >
        {submitting ? 'Submitting…' : `🎉 Complete Mission (+${mission.xp_reward} XP)`}
      </button>
    </div>
  );
}

function RewardPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-card-border bg-card px-4 py-3 text-sm font-bold">
      <span>{label}</span>
      <span className={`font-mono ${color}`}>{value}</span>
    </div>
  );
}
