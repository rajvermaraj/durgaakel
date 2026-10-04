"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatDateHi, formatINR, usePujaData } from "@/lib/client";
import LiveCounter from "@/components/LiveCounter";
import DonorWall from "@/components/DonorWall";
import { DEFAULT_TIERS } from "@/lib/types";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function DonorsPage() {
  const { data, loading, ranked } = usePujaData();
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim();
    const list = q
      ? ranked.filter((d) => (!d.anonymous && d.name.includes(q)) || (d.village ?? "").includes(q))
      : ranked;
    return showAll ? list : list.slice(0, 10);
  }, [ranked, showAll, query]);

  return (
    <main className="min-h-screen px-4 pb-32 pt-32">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-center font-display text-4xl font-bold text-gold-shimmer md:text-5xl">
          दानदाताओं की सूची
        </h1>
        <p className="mb-8 text-center text-sm tracking-widest text-divine-cream/65">
          सबसे ज़्यादा दान के हिसाब से · हर नया दान तुरंत जुड़ जाता है
        </p>

        <div className="mb-9 flex justify-center">
          <LiveCounter
            total={data?.total ?? 0}
            donors={data?.donorCount ?? 0}
            goal={data?.settings.goal ?? 0}
            spent={data?.spent ?? 0}
            loading={loading}
          />
        </div>

        {!loading && !query && (
          <div className="-mx-2 mb-12"><DonorWall ranked={ranked} tiers={data?.settings.tiers ?? DEFAULT_TIERS} /></div>
        )}

        <div className="mx-auto max-w-3xl">
        <h2 className="mb-4 text-center font-display text-2xl text-divine-marigold">📜 पूरी सूची</h2>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 नाम या गाँव से खोजें…"
          className="mb-5 w-full rounded-2xl border border-divine-gold/25 bg-divine-darker/60 px-4 py-3 text-divine-brightGold outline-none focus:border-divine-gold"
        />

        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-divine-red/20" />
            ))}
          </div>
        ) : (
          <ol className="space-y-3">
            <AnimatePresence initial={false}>
              {filtered.map((d, i) => (
                <motion.li
                  key={d.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 280, damping: 30 }}
                  className={`relative flex items-center gap-3 rounded-2xl border p-4 ${
                    i < 3 && !query
                      ? "border-divine-gold/50 bg-gradient-to-r from-divine-crimson/45 to-divine-red/20 shadow-glow"
                      : "border-divine-gold/15 bg-divine-darker/55"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                      i < 3 && !query ? "bg-divine-gold text-divine-deep" : "bg-divine-red/60 text-divine-brightGold"
                    }`}
                  >
                    {i < 3 && !query ? MEDALS[i] : i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-divine-brightGold">
                      {d.anonymous ? "अज्ञात भक्त 🙏" : d.name}
                      {d.village && !d.anonymous && (
                        <span className="ml-1 text-xs font-normal text-divine-cream/55">· {d.village}</span>
                      )}
                    </p>
                    <p className="truncate text-xs text-divine-cream/55">
                      {formatDateHi(d.timestamp)}
                      {d.message && !d.anonymous ? ` · “${d.message}”` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-lg font-bold tabular-nums text-divine-gold">{formatINR(d.amount)}</p>
                    <p className="text-[10px] text-divine-cream/50">{d.source === "cash" ? "नगद/पंडाल" : "ऑनलाइन"}</p>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        )}

        {!loading && filtered.length === 0 && (
          <p className="mt-10 text-center text-divine-cream/70">कोई नाम नहीं मिला। दूसरा नाम लिख कर खोजें।</p>
        )}

        {ranked.length > 10 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowAll((v) => !v)}
              className="rounded-full border border-divine-gold/40 px-6 py-3 text-divine-brightGold transition-colors hover:bg-divine-red/40"
            >
              {showAll ? "सिर्फ़ टॉप 10 दिखाएँ" : `सभी ${ranked.length} दानदाता देखें`}
            </button>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-divine-cream/45">
          जो भक्त अज्ञात रहना चाहते हैं, उनका नाम नहीं दिखाया जाता। हर दान का हिसाब समिति के पास सुरक्षित रहता है।
        </p>
      </div>
      </div>
    </main>
  );
}
