import type { MoodId, Category } from '@/types/database';

export const MOODS: { id: MoodId; emoji: string; label: string }[] = [
  { id: 'bored', emoji: '😴', label: "I'm bored" },
  { id: 'improve', emoji: '💪', label: 'Improve myself' },
  { id: 'meet', emoji: '👥', label: 'Meet people' },
  { id: 'fun', emoji: '🎮', label: 'Have fun' },
  { id: 'earn', emoji: '💰', label: 'Earn money' },
  { id: 'learn', emoji: '📚', label: 'Learn' },
  { id: 'lonely', emoji: '❤️', label: 'I feel lonely' },
  { id: 'adventure', emoji: '🌍', label: 'Adventure' },
  { id: 'productive', emoji: '🧠', label: 'Be productive' },
  { id: 'creative', emoji: '🎨', label: 'Be creative' },
];

export const CATEGORIES: { id: Category; name: string; emoji: string }[] = [
  { id: 'explore', name: 'Explore', emoji: '🗺️' },
  { id: 'self', name: 'Self-Improvement', emoji: '💪' },
  { id: 'social', name: 'Social', emoji: '👥' },
  { id: 'fun', name: 'Fun', emoji: '🎮' },
  { id: 'earn', name: 'Earn', emoji: '💰' },
  { id: 'learn', name: 'Learn', emoji: '📚' },
  { id: 'connect', name: 'Social Connection', emoji: '❤️' },
  { id: 'create', name: 'Create', emoji: '🎨' },
  { id: 'adventure', name: 'Adventure', emoji: '🌍' },
];

// Maps a mood selected in onboarding to the mission category most likely
// to satisfy it — used to pick from the `missions` table server-side.
export const MOOD_TO_CATEGORY: Record<MoodId, Category> = {
  bored: 'explore',
  improve: 'self',
  meet: 'social',
  fun: 'fun',
  earn: 'earn',
  learn: 'learn',
  lonely: 'connect',
  adventure: 'adventure',
  productive: 'self',
  creative: 'create',
};

export const QUICK_PROMPTS = [
  '🎯 Surprise Me',
  '💰 Under ₹100',
  '👥 With Friends',
  '❤️ Feeling Lonely',
  '💪 Improve Myself',
  '🌍 Adventure Mode',
];
