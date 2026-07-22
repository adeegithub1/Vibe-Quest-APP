import { z } from 'zod';

// Server-only. This file must never be imported from a 'use client' component —
// it reads ANTHROPIC_API_KEY, which must never reach the browser bundle.

const StepSchema = z.object({
  title: z.string().min(1).max(60),
  description: z.string().min(1).max(240),
});

export const GeneratedMissionSchema = z.object({
  title: z.string().min(1).max(80),
  duration: z.string().min(1).max(30),
  budget: z.number().nonnegative(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  players: z.number().int().min(1).max(20),
  steps: z.array(StepSchema).min(2).max(8),
  xp_reward: z.number().int().min(10).max(1000),
});

export type GeneratedMission = z.infer<typeof GeneratedMissionSchema>;

export interface GenerateMissionInput {
  prompt: string; // free text, e.g. "I have ₹500, 4 hours, in Delhi with a friend"
  city?: string | null;
  interests?: string[];
  difficultyPreference?: 'Easy' | 'Medium' | 'Hard' | null;
  indoorOutdoor?: 'indoor' | 'outdoor' | null;
}

const SYSTEM_PROMPT = `You design short, safe, real-world "missions" for a youth adventure app called VibeQuest.
Given a person's free-text description of their time, budget, location, mood and who they're with,
respond with ONLY a JSON object (no prose, no markdown fences) matching this shape:

{
  "title": string,
  "duration": string (e.g. "4 Hours"),
  "budget": number (in INR),
  "difficulty": "Easy" | "Medium" | "Hard",
  "players": number,
  "steps": [{ "title": string, "description": string }],
  "xp_reward": number
}

Rules:
- 3 to 6 steps, each a concrete, safe, real-world action.
- Never suggest anything illegal, dangerous, or that encourages risky behavior
  (e.g. no trespassing, no confrontations with strangers in unsafe ways, no
  substances, no unsafe stunts, no meeting strangers alone at night).
- Prefer public places for any social step.
- Keep cost realistic and within the stated budget.
- xp_reward should roughly scale with duration and difficulty (100-150 XP per hour).`;

/**
 * Calls the Anthropic API server-side and validates the structured output.
 * Falls back to a deterministic local generator if the API call fails or
 * the response doesn't match the schema, so the feature degrades gracefully.
 */
export async function generateMissionWithAI(
  input: GenerateMissionInput
): Promise<GeneratedMission> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return localFallback(input);
  }

  try {
    const contextLines = [
      input.city ? `City: ${input.city}` : null,
      input.interests?.length ? `Interests: ${input.interests.join(', ')}` : null,
      input.difficultyPreference ? `Preferred difficulty: ${input.difficultyPreference}` : null,
      input.indoorOutdoor ? `Preference: ${input.indoorOutdoor}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `${input.prompt}\n\n${contextLines}`.trim(),
          },
        ],
      }),
    });

    if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);

    const data = await response.json();
    const text = data.content?.find((b: any) => b.type === 'text')?.text ?? '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return GeneratedMissionSchema.parse(parsed);
  } catch (err) {
    console.error('AI mission generation failed, using local fallback:', err);
    return localFallback(input);
  }
}

// Deterministic, dependency-free fallback so the feature never hard-fails
// (used when ANTHROPIC_API_KEY is unset, e.g. in local dev / this build).
function localFallback(input: GenerateMissionInput): GeneratedMission {
  const budgetMatch = input.prompt.match(/₹?\s?(\d{2,5})/);
  const hourMatch = input.prompt.match(/(\d+(\.\d+)?)\s?(hour|hr)/i);
  const peopleMatch = input.prompt.match(/(\d+)\s?(friend|people|player)/i);
  const impliesCompanion = /friend|girlfriend|boyfriend|partner/i.test(input.prompt);

  const budget = budgetMatch ? parseInt(budgetMatch[1], 10) : 300;
  const hours = hourMatch ? parseFloat(hourMatch[1]) : 3;
  const players = peopleMatch ? parseInt(peopleMatch[1], 10) : impliesCompanion ? 2 : 1;
  const difficulty: 'Easy' | 'Medium' | 'Hard' = hours >= 3 ? 'Medium' : 'Easy';

  const stepPool = [
    { title: 'Explore', description: 'Visit a historical place or landmark nearby' },
    {
      title: 'Food Challenge',
      description: `Try a local food item under ₹${Math.min(200, Math.round(budget * 0.4))}`,
    },
    { title: 'Photography', description: 'Take 5 creative photographs of your surroundings' },
    { title: 'Connect', description: 'Ask a local person one interesting question' },
    { title: 'Document', description: 'Create a 30-second video documenting the adventure' },
  ];

  const steps = stepPool.slice(0, hours >= 3 ? 5 : 4);

  return {
    title: players > 1 ? 'The Squad Adventure Quest' : 'The Solo Explorer Quest',
    duration: `${hours} Hour${hours > 1 ? 's' : ''}`,
    budget: Math.round(budget * 0.6),
    difficulty,
    players,
    steps,
    xp_reward: Math.round(hours * 100 + players * 30),
  };
}
