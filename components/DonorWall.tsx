"use client";

import { motion } from "framer-motion";
import { formatINR } from "@/lib/client";
import { tierOf, type Donation, type Tier } from "@/lib/types";

/**
 * दानदाता दीवार — दान जितना ज़्यादा, फ़ोटो उतनी बड़ी और चमक उतनी तेज़।
 * स्तर (tiers) एडमिन पैनल → सेटिंग से बदले जा सकते हैं।
 */
export default function DonorWall({ ranked, tiers, maxTiers }: { ranked: Donation[]; tiers: Tier[]; maxTiers?: number }) {
  const order = tiers.map((t, i) => ({ t, i })).sort((a, b) => b.t.min - a.t.min);
  const groups = order
    .map(({ t, i }) => ({ t, rank: i, list: ranked.filter((d) => tierOf(d.amount, tiers) === i).sort((a, b) => b.amount - a.amount) }))
    .filter((g) => g.list.length > 0)
    .slice(0, maxTiers ?? 99);

  if (groups.length === 0) return <p className="text-center text-divine-cream/70">अभी कोई दान दर्ज नहीं हुआ — सबसे पहले आप दान करें! 🪔</p>;

  return (
    <div className="space-y-12">
      {groups.map((g, gi) => (
        <section key={g.rank}>
          <h3 className={`mb-6 text-center font-display ${gi === 0 ? "text-2xl md:text-3xl text-gold-shimmer" : "text-lg md:text-xl text-divine-marigold"}`}>
            {gi === 0 ? "👑 " : ""}{g.t.label}
            <span className="ml-2 text-xs font-normal text-divine-cream/50">{g.t.min > 0 ? `₹${g.t.min.toLocaleString("en-IN")} से ऊपर` : ""}</span>
          </h3>
          {g.t.thanks && <p className="-mt-4 mb-6 text-center text-xs italic text-divine-cream/60">{g.t.thanks}</p>}
          <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-8">
            {g.list.map((d, k) => (
              <DonorCard key={d.id} d={d} size={g.t.size} top={gi === 0} delay={k * 0.06} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function DonorCard({ d, size, top, delay }: { d: Donation; size: number; top: boolean; delay: number }) {
  const showPhoto = d.photo && !d.anonymous;
  const ring = Math.max(2, Math.round(size / 40));
  const glow = Math.round(size / 5);
  const nameCls = size >= 200 ? "text-xl md:text-2xl" : size >= 140 ? "text-base md:text-lg" : size >= 90 ? "text-sm" : "text-xs";
  return (
    <motion.figure
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, type: "spring", stiffness: 160, damping: 18 }}
      className="relative flex flex-col items-center text-center"
      style={{ width: `min(${size + 30}px, 44vw)`, maxWidth: size >= 200 ? "86vw" : undefined }}
    >
      <div className="relative" style={{ width: `min(${size}px, ${size >= 200 ? 78 : 40}vw)`, aspectRatio: "1" }}>
        {top && <div className="absolute -inset-3 animate-[spin_16s_linear_infinite] rounded-full" style={{ background: "conic-gradient(from 0deg, #ffd166, transparent 25%, #ff4f93, transparent 55%, #ffd166)", opacity: 0.8, filter: "blur(3px)" }} />}
        <div className="relative h-full w-full overflow-hidden rounded-full bg-divine-red/50" style={{ border: `${ring}px solid #ffd166`, boxShadow: `0 0 ${glow}px rgba(255,167,51,.55)` }}>
          {showPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={d.photo} alt={d.name} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-divine-crimson to-divine-red text-divine-brightGold" style={{ fontSize: size * 0.42 }}>
              {d.anonymous ? "🙏" : (d.name.trim()[0] ?? "🪔")}
            </div>
          )}
        </div>
        {top && <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-4xl drop-shadow-[0_0_10px_rgba(255,209,102,.9)]">👑</span>}
      </div>
      <figcaption className="mt-3 w-full">
        <p className={`truncate font-display font-bold text-divine-brightGold ${nameCls}`}>{d.anonymous ? "अज्ञात भक्त" : d.name}</p>
        {d.village && !d.anonymous && size >= 90 && <p className="truncate text-xs text-divine-cream/55">{d.village}</p>}
        <p className={`font-display font-bold tabular-nums text-divine-gold ${size >= 140 ? "text-lg" : "text-sm"}`}>{formatINR(d.amount)}</p>
        {d.message && !d.anonymous && size >= 140 && <p className="mt-1 line-clamp-2 text-xs italic text-divine-cream/65">“{d.message}”</p>}
      </figcaption>
    </motion.figure>
  );
}
