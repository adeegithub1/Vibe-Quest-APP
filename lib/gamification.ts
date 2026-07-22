// Server-side gamification logic. Never import this into a client component
// for the purpose of mutating state — it exists so app/api/complete-mission
// can compute the next authoritative profile state, which is then written
// with the service-role client.

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Beginner',
  2: 'Explorer',
  3: 'Challenger',
  4: 'Adventurer',
  5: 'Creator',
  6: 'Trailblazer',
  7: 'Explorer',
  8: 'Pathfinder',
  9: 'Champion',
  10: 'Legend',
};

export function levelName(level: number): string {
  return LEVEL_NAMES[level] ?? (level > 10 ? 'Legend' : 'Beginner');
}

// XP required to go from `level` to `level + 1`. Grows ~15% per level so
// early levels feel fast and later ones feel earned.
export function xpForNextLevel(level: number, base = 1000): number {
  return Math.round(base * Math.pow(1.15, level - 1));
}

export interface ProfileGamificationState {
  level: number;
  xp: number;
  xp_next: number;
  streak: number;
  longest_streak: number;
  missions_completed: number;
  last_completed_date: string | null; // YYYY-MM-DD
}

export interface GamificationResult extends ProfileGamificationState {
  level_name: string;
  leveled_up: boolean;
  streak_broken: boolean;
}

/**
 * Applies an XP award to a profile's gamification state, rolling levels
 * forward and updating the daily streak. Pure function — the caller is
 * responsible for persisting the result and for verifying `today` server-side.
 */
export function applyMissionCompletion(
  current: ProfileGamificationState,
  xpEarned: number,
  today: string // YYYY-MM-DD, server clock
): GamificationResult {
  let { level, xp, xp_next, streak, longest_streak, missions_completed, last_completed_date } =
    current;

  // --- streak logic ---
  let streakBroken = false;
  if (last_completed_date === today) {
    // already completed something today — streak unchanged
  } else if (last_completed_date === yesterday(today)) {
    streak += 1;
  } else if (last_completed_date === null) {
    streak = 1;
  } else {
    streakBroken = streak > 0;
    streak = 1;
  }
  longest_streak = Math.max(longest_streak, streak);

  // --- xp / level logic ---
  xp += xpEarned;
  let leveledUp = false;
  while (xp >= xp_next) {
    xp -= xp_next;
    level += 1;
    xp_next = xpForNextLevel(level);
    leveledUp = true;
  }

  missions_completed += 1;

  return {
    level,
    xp,
    xp_next,
    streak,
    longest_streak,
    missions_completed,
    last_completed_date: today,
    level_name: levelName(level),
    leveled_up: leveledUp,
    streak_broken: streakBroken,
  };
}

function yesterday(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

// --- Badge rules -----------------------------------------------------
// Each rule receives the fresh profile state plus category-completion
// counts and returns true if the badge should be (re)checked as unlocked.
export interface BadgeCheckContext {
  missions_completed: number;
  streak: number;
  categoryCounts: Record<string, number>; // e.g. { explore: 3, self: 6 }
}

export const BADGE_RULES: Record<string, (ctx: BadgeCheckContext) => boolean> = {
  'First Explorer': (ctx) => ctx.missions_completed >= 1,
  '7-Day Streak': (ctx) => ctx.streak >= 7,
  'Photographer': (ctx) => (ctx.categoryCounts['create'] ?? 0) >= 5,
  'Social Butterfly': (ctx) => (ctx.categoryCounts['social'] ?? 0) >= 5,
  'Self-Improver': (ctx) => (ctx.categoryCounts['self'] ?? 0) >= 5,
  'Knowledge Seeker': (ctx) => (ctx.categoryCounts['learn'] ?? 0) >= 5,
  'Adventure Master': (ctx) => (ctx.categoryCounts['adventure'] ?? 0) >= 10,
  '100 Missions': (ctx) => ctx.missions_completed >= 100,
};
