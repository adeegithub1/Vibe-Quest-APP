'use client';

import { useEffect, useState } from 'react';
import LocationCard from '@/components/LocationCard';

interface NearbyMission {
  id: string;
  title: string;
  category: string;
  distance_km: number;
}

const CATEGORY_EMOJI: Record<string, string> = {
  explore: '🗺️', self: '💪', social: '👥', fun: '🎮', earn: '💰',
  learn: '📚', connect: '❤️', create: '🎨', adventure: '🌍',
};

export default function ExplorePage() {
  const [status, setStatus] = useState<'idle' | 'asking' | 'granted' | 'denied'>('idle');
  const [missions, setMissions] = useState<NearbyMission[]>([]);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setStatus('denied');
      return;
    }
    setStatus('asking');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setStatus('granted');
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`/api/nearby-missions?lat=${latitude}&lng=${longitude}&radius=15`);
          const data = await res.json();
          setMissions(data.missions ?? []);
        } catch {
          setMissions([]);
        }
      },
      () => setStatus('denied')
    );
  }, []);

  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-widest text-ink-mute">Explore</div>
      <h1 className="font-display text-2xl">Nearby right now</h1>

      <div className="relative mt-3.5 h-[220px] overflow-hidden rounded-[20px] border border-card-border bg-[#14121f]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(124,92,252,0.25),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(62,230,224,0.2),transparent_50%)]" />
        <div className="absolute bottom-2.5 right-3 font-mono text-[10px] text-ink-mute">
          📍 location shared with your permission only
        </div>
        {status === 'asking' && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-ink-mute">
            Requesting location permission…
          </div>
        )}
        {status === 'denied' && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-ink-mute">
            Location permission denied — enable it in your browser settings to see missions near you.
          </div>
        )}
      </div>

      <div className="mb-3 mt-6.5 text-[15px] font-bold">Missions near you</div>
      {missions.length === 0 && status === 'granted' && (
        <p className="text-sm text-ink-mute">No missions with coordinates nearby yet.</p>
      )}
      {missions.map((m) => (
        <LocationCard
          key={m.id}
          name={m.title}
          distanceKm={Math.round(m.distance_km * 10) / 10}
          emoji={CATEGORY_EMOJI[m.category] ?? '🎯'}
        />
      ))}
    </div>
  );
}
