"use client";

import { motion } from "framer-motion";
import { formatINR, formatLakh, useCountUp } from "@/lib/client";

interface Props {
  total: number;
  donors: number;
  goal: number;
  spent: number;
  loading?: boolean;
}

/** मुख्य "अब तक कुल जमा" काउंटर + लक्ष्य प्रगति */
export default function LiveCounter({ total, donors, goal, spent, loading }: Props) {
  const animated = useCountUp(total);
  const percent = goal > 0 ? Math.min(100, (total / goal) * 100) : 0;

  return (
    <div className="relative w-full max-w-xl">
      <div className="absolute inset-0 rounded-3xl bg-divine-orange/20 blur-2xl" />
      <div className="relative rounded-3xl border border-divine-gold/35 bg-divine-darker/70 px-6 py-7 text-center backdrop-blur">
        <p className="mb-1 text-xs tracking-[0.32em] text-divine-marigold/90">🪔 अब तक कुल जमा 🪔</p>
        <p className="font-display text-4xl font-bold tabular-nums text-gold-shimmer md:text-6xl">
          {loading ? "…" : formatINR(animated)}
        </p>

        {goal > 0 && (
          <div className="mt-5">
            <div className="h-3 overflow-hidden rounded-full bg-divine-deeper">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-divine-marigold via-divine-orange to-divine-crimson shadow-glow"
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-divine-cream/70">
              <span>{formatLakh(total)} / {formatLakh(goal)}</span>
              <span className="font-semibold text-divine-brightGold">{percent.toFixed(0)}% पूरा</span>
            </div>
          </div>
        )}

        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-divine-gold/15 pt-4 text-center">
          <div>
            <p className="font-display text-xl tabular-nums text-divine-brightGold">{donors}</p>
            <p className="text-[11px] text-divine-cream/60">दानदाता</p>
          </div>
          <div>
            <p className="font-display text-xl tabular-nums text-divine-brightGold">{formatINR(spent)}</p>
            <p className="text-[11px] text-divine-cream/60">अब तक खर्च</p>
          </div>
          <div>
            <p className="font-display text-xl tabular-nums text-divine-brightGold">
              {formatINR(Math.max(0, total - spent))}
            </p>
            <p className="text-[11px] text-divine-cream/60">बचा हुआ</p>
          </div>
        </div>
      </div>
    </div>
  );
}
