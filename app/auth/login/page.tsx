'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (error) {
        setError(error.message);
      } else if (!data.session) {
        // Email confirmation is required (Supabase default) — there's no
        // session yet, so redirecting to a protected route would just get
        // bounced back here by middleware. Tell the user to check their inbox.
        setError(null);
        setInfo('Check your email to confirm your account, then log in.');
        setMode('signin');
      } else {
        router.push('/onboarding');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push('/home');
    }
    setLoading(false);
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-10">
      <div className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-ink-mute">
        VibeQuest
      </div>
      <h1 className="font-display text-2xl">
        {mode === 'signup' ? 'Create Account' : 'Welcome back'}
      </h1>
      <p className="text-ink-dim">Don&apos;t just scroll. Go do something.</p>

      <button
        onClick={handleGoogle}
        className="mt-6 w-full rounded-2xl border border-card-border bg-white/[0.05] py-3.5 text-sm font-bold"
      >
        Continue with Google
      </button>

      <div className="my-4 flex items-center gap-3 text-ink-mute">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'signup' && (
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full rounded-2xl border border-card-border bg-white/[0.05] p-3.5 text-sm font-semibold outline-none focus:border-violet"
          />
        )}
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-2xl border border-card-border bg-white/[0.05] p-3.5 text-sm font-semibold outline-none focus:border-violet"
        />
        <input
          required
          type="password"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-2xl border border-card-border bg-white/[0.05] p-3.5 text-sm font-semibold outline-none focus:border-violet"
        />

        {error && <p className="text-sm text-coral">{error}</p>}
        {info && <p className="text-sm text-lime">{info}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-quest-gradient py-3.5 font-display text-sm font-semibold shadow-quest-glow disabled:opacity-50"
        >
          {loading ? 'Please wait…' : mode === 'signup' ? 'Sign Up' : 'Log In'}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
        className="mt-4 text-center text-[13px] text-ink-mute"
      >
        {mode === 'signup' ? 'Already have an account? ' : 'New here? '}
        <span className="font-bold text-violet">{mode === 'signup' ? 'Log In' : 'Sign Up'}</span>
      </button>
    </div>
  );
}
