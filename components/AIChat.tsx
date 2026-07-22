'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QUICK_PROMPTS } from '@/lib/missions';
import type { Mission } from '@/types/database';

type ChatMessage =
  | { role: 'user'; text: string }
  | { role: 'ai'; mission: Mission | null; text?: string };

const QUICK_PROMPT_TEXT: Record<string, string> = {
  '🎯 Surprise Me': 'Surprise me with something fun today',
  '💰 Under ₹100': 'I have under ₹100 and 2 hours, what should I do',
  '👥 With Friends': 'Give me something fun to do with 3 friends',
  '❤️ Feeling Lonely': "I'm feeling lonely today, give me something to do",
  '💪 Improve Myself': 'I want to improve my confidence today',
  '🌍 Adventure Mode': 'Give me a solo adventure for 2 hours',
};

export default function AIChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/generate-mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [...m, { role: 'ai', mission: null, text: 'Something went wrong — try again.' }]);
      } else {
        setMessages((m) => [...m, { role: 'ai', mission: data.mission }]);
      }
    } catch {
      setMessages((m) => [...m, { role: 'ai', mission: null, text: 'Network error — try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="font-mono text-[11px] uppercase tracking-widest text-ink-mute">🤖 Vibe AI</div>
      <h1 className="font-display text-2xl">Tell me your situation</h1>
      <p className="text-ink-dim">Time, budget, who&apos;s with you, mood — I&apos;ll build the plan.</p>

      <div className="mt-3.5 flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q}
            onClick={() => send(QUICK_PROMPT_TEXT[q] ?? q)}
            className="rounded-full border border-card-border bg-white/[0.06] px-3.5 py-2 text-[12.5px] font-bold"
          >
            {q}
          </button>
        ))}
      </div>

      <div ref={scrollRef} className="mt-4.5 flex-1 space-y-2.5 overflow-y-auto">
        {messages.map((msg, i) =>
          msg.role === 'user' ? (
            <div
              key={i}
              className="ml-auto max-w-[82%] rounded-2xl rounded-br-[5px] bg-quest-gradient px-3.5 py-3 text-[13.5px]"
            >
              {msg.text}
            </div>
          ) : (
            <div
              key={i}
              className="max-w-[92%] rounded-2xl rounded-bl-[5px] border border-card-border bg-card px-3.5 py-3 text-[13.5px]"
            >
              {msg.mission ? <GeneratedPlan mission={msg.mission} onStart={() => router.push(`/missions/${msg.mission!.id}`)} /> : msg.text}
            </div>
          )
        )}
        {loading && (
          <div className="max-w-[60%] rounded-2xl rounded-bl-[5px] border border-card-border bg-card px-3.5 py-3 text-[13px] text-ink-mute">
            Building your mission…
          </div>
        )}
      </div>

      <div className="sticky bottom-0 flex gap-2 bg-gradient-to-t from-void via-void/90 to-transparent pt-2.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="I have ₹500, 4 hours, in Delhi with a friend..."
          className="flex-1 rounded-2xl border border-card-border bg-white/[0.05] px-3.5 py-3 text-[13.5px] outline-none focus:border-violet"
        />
        <button
          onClick={() => send(input)}
          className="flex h-[46px] w-[46px] items-center justify-center rounded-2xl bg-quest-gradient text-lg"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

function GeneratedPlan({ mission, onStart }: { mission: Mission; onStart: () => void }) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-widest text-ink-mute">
        {mission.estimated_time} Adventure
      </div>
      <div className="mt-1 font-display text-[17px] font-bold">{mission.title}</div>
      <div className="mt-2 space-y-1.5">
        {mission.steps.map((s, i) => (
          <div key={i} className="flex gap-2 text-[13px] font-semibold">
            <span className="flex-shrink-0 font-mono text-violet">Step {i + 1}</span>
            <span>{s.description}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 text-[13px] font-bold text-lime">🏆 Reward: +{mission.xp_reward} XP</div>
      <button
        onClick={onStart}
        className="mt-3 rounded-xl bg-quest-gradient px-3.5 py-2.5 text-[12.5px] font-bold"
      >
        Start This Mission
      </button>
    </div>
  );
}
