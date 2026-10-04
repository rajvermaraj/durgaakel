"use client";

import { formatINR } from "@/lib/client";
import type { Expenditure } from "@/lib/types";

const COLORS = ["#ffd166", "#ff7b1c", "#c2185b", "#ffa733", "#5a1470", "#ffe9a3", "#ff5f6d"];

/** गोल (donut) चार्ट — कहाँ-कहाँ पैसा लगा */
export function DonutChart({ items, centerLabel }: { items: Expenditure[]; centerLabel?: string }) {
  const total = items.reduce((s, i) => s + i.amount, 0) || 1;
  const R = 70;
  const C = 2 * Math.PI * R;
  let acc = 0;

  return (
    <div className="flex flex-col items-center gap-8 md:flex-row">
      <div className="relative shrink-0">
        <svg viewBox="0 0 180 180" className="h-52 w-52 -rotate-90">
          <circle cx="90" cy="90" r={R} fill="none" stroke="#0b0720" strokeWidth="26" />
          {items.map((item, i) => {
            const frac = item.amount / total;
            const dash = `${frac * C} ${C - frac * C}`;
            const offset = -acc * C;
            acc += frac;
            return (
              <circle
                key={item.id}
                cx="90"
                cy="90"
                r={R}
                fill="none"
                stroke={COLORS[i % COLORS.length]}
                strokeWidth="26"
                strokeDasharray={dash}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dasharray 1s ease" }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-lg font-bold text-gold-shimmer">{formatINR(total)}</span>
          <span className="text-[11px] text-divine-cream/60">{centerLabel || "कुल खर्च"}</span>
        </div>
      </div>
      <ul className="w-full space-y-2">
        {items.map((item, i) => (
          <li key={item.id} className="flex items-center gap-3 text-sm">
            <span className="h-3.5 w-3.5 shrink-0 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="flex-1 text-divine-cream/90">{item.category}</span>
            <span className="font-semibold tabular-nums text-divine-gold">
              {((item.amount / total) * 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** सीधी पट्टी (bar) चार्ट */
export function BarChart({ items }: { items: Expenditure[] }) {
  const max = Math.max(...items.map((i) => i.amount), 1);
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={item.id}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-divine-cream/90">{item.category}</span>
            <span className="font-semibold tabular-nums text-divine-gold">{formatINR(item.amount)}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-divine-deeper">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(item.amount / max) * 100}%`,
                background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, #ff7b1c)`,
                transition: "width 1.2s cubic-bezier(.16,1,.3,1)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
