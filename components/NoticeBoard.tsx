"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { countdownHi, sortSchedule, stateMap, whenMs } from "@/lib/schedule";
import type { Notice, ScheduleItem } from "@/lib/types";

export { sortSchedule };

/** हर मिनट में ताज़ा "अब" (अगला कार्यक्रम अपने-आप बदलता रहे) */
export function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function NoticeCards({ notices }: { notices: Notice[] }) {
  if (!notices.length) return null;
  return (
    <div className="space-y-3">
      {[...notices].sort((a, b) => Number(b.important) - Number(a.important) || b.createdAt - a.createdAt).map((n) => (
        <div key={n.id} className={`rounded-2xl border p-4 ${n.important ? "border-divine-gold/60 bg-gradient-to-r from-divine-crimson/45 to-divine-red/25 shadow-glow" : "border-divine-gold/20 bg-divine-darker/60"}`}>
          <p className="font-display text-lg text-divine-brightGold">{n.important ? "📢 " : "📌 "}{n.title}</p>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-divine-cream/85">{n.body}</p>
        </div>
      ))}
    </div>
  );
}

/** होम पेज के लिए: अगला/चल रहे कार्यक्रम (हो चुके नहीं) */
export function UpcomingList({ items, limit = 3 }: { items: ScheduleItem[]; limit?: number }) {
  const now = useNow();
  const sorted = sortSchedule(items);
  const st = stateMap(sorted, now);
  const list = sorted.filter((i) => st[i.id] !== "past").slice(0, limit);
  return (
    <div className="mt-4 space-y-2">
      {list.map((it) => {
        const s = st[it.id];
        const hot = s === "next" || s === "now";
        const t = whenMs(it);
        return (
          <div key={it.id} className={`!rounded-2xl p-3.5 text-sm ${hot ? "rounded-2xl border border-divine-gold/60 bg-gradient-to-r from-divine-crimson/40 to-divine-red/20 shadow-glow" : "glass"}`}>
            {hot && <p className="mb-1 text-xs font-bold text-divine-gold">{s === "now" ? "🔴 अभी चल रहा है" : `⏭️ अगला कार्यक्रम${t ? ` · ${countdownHi(t, now)}` : ""}`}</p>}
            <p className="font-semibold text-divine-brightGold">{it.title} <span className="text-xs font-normal text-divine-marigold">{[it.day, it.date].filter(Boolean).join(" · ")}</span></p>
            <p className="text-divine-cream/80">🕒 {it.time} {it.place && `· 📍 ${it.place}`}</p>
            {it.reportTime && <p className="text-divine-gold">🙋 {it.reportTime}</p>}
          </div>
        );
      })}
    </div>
  );
}

export function ScheduleTimeline({ items }: { items: ScheduleItem[] }) {
  const now = useNow();
  const list = sortSchedule(items);
  const st = stateMap(list, now);
  if (!list.length) return <p className="text-center text-divine-cream/60">कार्यक्रम सारणी जल्द ही यहाँ जुड़ेगी।</p>;
  return (
    <ol className="relative space-y-5 border-l-2 border-divine-gold/30 pl-6">
      {list.map((it, i) => {
        const s = st[it.id];
        const past = s === "past";
        const hot = s === "next" || s === "now";
        const t = whenMs(it);
        return (
          <motion.li key={it.id} id={hot ? "next-event" : undefined} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i, 5) * 0.05 }} className={`relative ${past ? "opacity-45" : ""}`}>
            <span className={`absolute -left-[33px] top-3 h-4 w-4 rounded-full border-2 ${past ? "border-divine-cream/40 bg-divine-darker" : hot ? "animate-pulse border-divine-gold bg-divine-orange shadow-glowStrong" : "border-divine-gold bg-divine-crimson shadow-glow"}`} />
            <div className={`!rounded-2xl p-4 ${hot ? "rounded-2xl border-2 border-divine-gold/70 bg-gradient-to-r from-divine-crimson/45 to-divine-red/25 shadow-glowStrong" : "glass"}`}>
              {hot && <p className="mb-1 text-sm font-bold text-divine-gold">{s === "now" ? "🔴 अभी चल रहा है" : `⏭️ अगला कार्यक्रम${t ? ` · ${countdownHi(t, now)}` : ""}`}</p>}
              {past && <p className="mb-1 text-xs text-divine-cream/60">✔ संपन्न हुआ</p>}
              <p className="text-xs text-divine-marigold">{[it.day, it.date].filter(Boolean).join(" · ")}</p>
              <p className="font-display text-lg text-divine-brightGold">{it.title}</p>
              <dl className="mt-2 grid gap-1 text-sm text-divine-cream/85 sm:grid-cols-2">
                {it.time && <div><dt className="inline text-divine-cream/55">🕒 समय: </dt><dd className="inline">{it.time}</dd></div>}
                {it.place && <div><dt className="inline text-divine-cream/55">📍 स्थान: </dt><dd className="inline">{it.place}</dd></div>}
                {it.reportTime && <div className="sm:col-span-2"><dt className="inline text-divine-cream/55">🙋 उपस्थित होना: </dt><dd className="inline font-semibold text-divine-gold">{it.reportTime}</dd></div>}
              </dl>
              {it.details && <p className="mt-2 whitespace-pre-line text-xs text-divine-cream/65">{it.details}</p>}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
