"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { GalleryItem } from "@/lib/types";

/** गैलरी: masonry + lazy load + बड़ा करके देखने (lightbox) */
export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [active, setActive] = useState<GalleryItem | null>(null);

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-divine-gold/25 bg-divine-darker/50 p-10 text-center">
        <p className="mb-2 text-4xl">🖼️</p>
        <p className="text-divine-cream/80">अभी कोई फ़ोटो नहीं जुड़ी है।</p>
        <p className="mt-1 text-sm text-divine-cream/55">समिति के सदस्य एडमिन पैनल से फ़ोटो जोड़ सकते हैं।</p>
      </div>
    );
  }

  return (
    <>
      <div className="masonry">
        {items.map((it, i) => (
          <motion.button
            key={it.id}
            onClick={() => setActive(it)}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "60px" }}
            transition={{ delay: (i % 4) * 0.05 }}
            className="group relative mb-4 block w-full overflow-hidden rounded-2xl border border-divine-gold/20 text-left"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.url}
              alt={it.caption}
              loading="lazy"
              decoding="async"
              className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                i % 5 === 0 ? "aspect-[3/4]" : i % 3 === 0 ? "aspect-square" : "aspect-[4/3]"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-divine-darker/85 via-transparent to-transparent opacity-70 transition-opacity group-hover:opacity-95" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-sm text-divine-brightGold">{it.caption}</p>
              <p className="text-[11px] text-divine-cream/60">{it.category}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4 backdrop-blur"
          onClick={() => setActive(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-h-[86vh] max-w-4xl overflow-hidden rounded-2xl border border-divine-gold/40"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active.url} alt={active.caption} className="max-h-[76vh] w-full object-contain bg-divine-darker" />
            <p className="bg-divine-darker px-4 py-3 text-center text-sm text-divine-brightGold">
              {active.caption} <span className="text-divine-cream/50">· {active.category}</span>
            </p>
          </motion.div>
          <button onClick={() => setActive(null)} className="absolute right-5 top-5 text-4xl text-divine-gold" aria-label="बंद करें">
            ✕
          </button>
        </div>
      )}
    </>
  );
}
