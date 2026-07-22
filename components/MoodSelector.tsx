'use client';

import { motion } from 'framer-motion';
import type { MoodId } from '@/types/database';
import { MOODS } from '@/lib/missions';

export default function MoodSelector({
  selected,
  onSelect,
}: {
  selected: MoodId | null;
  onSelect: (id: MoodId) => void;
}) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2.5">
      {MOODS.map((m) => {
        const isSelected = selected === m.id;
        return (
          <motion.button
            key={m.id}
            type="button"
            onClick={() => onSelect(m.id)}
            whileTap={{ scale: 0.96 }}
            className={`rounded-[18px] border-[1.5px] px-3 py-4 text-center transition-all ${
              isSelected
                ? 'border-violet bg-gradient-to-br from-violet/30 to-coral/10 shadow-quest-glow -translate-y-0.5'
                : 'border-card-border bg-card'
            }`}
          >
            <span className="mb-2 block text-2xl">{m.emoji}</span>
            <span className="text-[12.5px] font-bold font-body">{m.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
