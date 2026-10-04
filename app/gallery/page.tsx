"use client";

import { useMemo, useState } from "react";
import GalleryGrid from "@/components/GalleryGrid";
import { usePujaData } from "@/lib/client";

export default function GalleryPage() {
  const { data, loading } = usePujaData();
  const items = data?.gallery ?? [];
  const [cat, setCat] = useState("सभी");

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean));
    return ["सभी", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => (cat === "सभी" ? items : items.filter((i) => i.category === cat)), [items, cat]);

  return (
    <main className="min-h-screen px-4 pb-32 pt-32">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-center font-display text-4xl font-bold text-gold-shimmer md:text-5xl">
          पूजा की फ़ोटो
        </h1>
        <p className="mb-8 text-center text-sm tracking-widest text-divine-cream/65">
          पंडाल, मूर्ति, आरती और विसर्जन की यादें
        </p>

        {categories.length > 1 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full px-4 py-2 text-sm transition-all ${
                  cat === c
                    ? "bg-divine-crimson text-divine-brightGold shadow-glow"
                    : "border border-divine-gold/25 text-divine-cream/75 hover:bg-divine-red/30"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="masonry">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`mb-4 animate-pulse rounded-2xl bg-divine-red/20 ${i % 2 ? "h-56" : "h-72"}`} />
            ))}
          </div>
        ) : (
          <GalleryGrid items={filtered} />
        )}

        <p className="mt-10 text-center text-sm text-divine-cream/55">
          पंडाल की फ़ोटो समिति के सदस्यों को दें — वे एडमिन पैनल से यहाँ जोड़ देंगे। 🙏
        </p>
      </div>
    </main>
  );
}
