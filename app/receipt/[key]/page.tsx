"use client";

import { useEffect, useState } from "react";
import ReceiptCard from "@/components/ReceiptCard";
import type { Receipt } from "@/lib/types";

export default function ReceiptPage({ params }: { params: { key: string } }) {
  const [r, setR] = useState<Receipt | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      const res = await fetch(`/api/receipt?k=${encodeURIComponent(params.key)}`, { cache: "no-store" });
      if (stop) return;
      if (res.status === 404) return setMissing(true);
      if (res.ok) setR(await res.json());
    };
    load();
    const t = setInterval(() => { if (!r || r.status === "pending") load(); }, 8000);
    return () => { stop = true; clearInterval(t); };
  }, [params.key, r]);

  return (
    <main className="min-h-screen px-4 pb-32 pt-32">
      {missing ? (
        <p className="text-center text-divine-cream/70">रसीद नहीं मिली। लिंक जाँच लें।</p>
      ) : !r ? (
        <p className="text-center text-divine-cream/60">…</p>
      ) : r.status === "pending" ? (
        <div className="glass mx-auto max-w-md p-8 text-center">
          <p className="text-5xl">⏳</p>
          <h1 className="mt-3 font-display text-2xl text-divine-brightGold">भुगतान की पुष्टि बाकी है</h1>
          <p className="mt-2 text-sm text-divine-cream/75">कोषाध्यक्ष के पुष्टि करते ही आपकी रसीद यहीं अपने-आप दिख जाएगी। इस पेज को खुला रखें या बाद में फिर खोलें।</p>
        </div>
      ) : (
        <ReceiptCard r={r} rk={params.key} />
      )}
    </main>
  );
}
