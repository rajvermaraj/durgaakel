"use client";

import { formatDateHi, formatINR } from "@/lib/client";
import type { Receipt } from "@/lib/types";

/** धन्यवाद रसीद — सिर्फ़ पुष्टि हो चुके दान की */
export default function ReceiptCard({ r, rk }: { r: Receipt; rk: string }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/receipt/${rk}` : "";
  const text = `🪔 जय माता दी! मैंने ${r.committee ?? "अकेलवा पूर्व दुर्गा पूजा समिति"} में ${formatINR(r.amount ?? 0)} का दान किया। आप भी माँ के चरणों में सहयोग करें 🙏\n${typeof window !== "undefined" ? window.location.origin : ""}`;
  return (
    <div className="mx-auto w-full max-w-md">
      <div id="receipt-card" className="relative overflow-hidden rounded-3xl border border-divine-gold/50 bg-divine-darker shadow-glowStrong">
        <div className="relative h-56 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/durga.webp" alt="माँ दुर्गा" className="absolute inset-0 h-full w-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-divine-darker/30 to-divine-darker" />
          <p className="absolute bottom-3 left-0 right-0 text-center font-display text-lg text-gold-shimmer">॥ जय माता दी ॥</p>
        </div>
        <div className="space-y-3 px-6 pb-7 pt-2 text-center">
          {r.photo && /* eslint-disable-next-line @next/next/no-img-element */ <img src={r.photo} alt="" className="mx-auto -mt-14 h-20 w-20 rounded-full border-4 border-divine-gold object-cover shadow-glow" />}
          <p className="text-sm text-divine-marigold">✅ भुगतान की पुष्टि हो गई</p>
          <h1 className="font-display text-2xl text-divine-brightGold">धन्यवाद, {r.name}!</h1>
          {r.village && <p className="text-xs text-divine-cream/60">{r.village}</p>}
          <p className="font-display text-5xl font-bold tabular-nums text-gold-shimmer">{formatINR(r.amount ?? 0)}</p>
          {r.tierLabel && <p className="inline-block rounded-full border border-divine-gold/40 px-4 py-1 text-sm text-divine-gold">👑 {r.tierLabel}</p>}
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-divine-cream/85">{r.thanks}</p>
          <div className="border-t border-divine-gold/20 pt-3 text-xs text-divine-cream/55">
            <p>{r.committee}</p>
            <p>{r.timestamp ? formatDateHi(r.timestamp) : ""} · रसीद क्र. {r.no}</p>
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-green-400/50 px-6 py-3 text-sm font-semibold text-green-300 hover:bg-green-500/15">💬 WhatsApp पर बताएँ</a>
        <button onClick={() => navigator.clipboard?.writeText(url)} className="rounded-full border border-divine-gold/40 px-6 py-3 text-sm text-divine-brightGold hover:bg-divine-red/40">🔗 रसीद का लिंक कॉपी करें</button>
      </div>
      <p className="mt-3 text-center text-[11px] text-divine-cream/45">रसीद सहेजने के लिए स्क्रीनशॉट ले लें।</p>
    </div>
  );
}
