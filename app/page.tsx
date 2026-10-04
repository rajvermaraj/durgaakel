"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { formatINR, usePujaData } from "@/lib/client";
import LiveCounter from "@/components/LiveCounter";
import DonorWall from "@/components/DonorWall";
import { NoticeCards, UpcomingList } from "@/components/NoticeBoard";
import { DEFAULT_TIERS } from "@/lib/types";

const DurgaIdol = dynamic(() => import("@/components/DurgaIdol"), { ssr: false });

export default function HomePage() {
  const { data, loading, ranked } = usePujaData();
  const s = data?.settings;

  return (
    <main className="min-h-screen pb-28">
      {/* ---------- मुख्य (हीरो) ---------- */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pt-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(194,24,91,0.4),transparent_62%),radial-gradient(ellipse_at_bottom,rgba(255,123,28,0.22),transparent_58%)]" />
        <div className="rays" />
        <div className="sundisc" />
        <div className="mandala" />
        <div className="mandala rev" />
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="relative mb-5 text-center text-[11px] tracking-[0.28em] text-divine-marigold md:text-sm"
        >
          ॥ या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता ॥
        </motion.p>

        <div className="relative">
          <DurgaIdol size={480} />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="relative mt-5 text-center font-display text-3xl font-bold leading-tight text-gold-shimmer md:text-6xl"
        >
          अकेलवा पूर्व दुर्गा पूजा समिति
          <span className="mt-2 block font-body text-base font-normal tracking-wider text-divine-cream/90 md:text-2xl">
            ग्राम अकेलवा पूर्व · बस्ती (उत्तर प्रदेश)
          </span>
        </motion.h1>

        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className="relative mt-7 w-full max-w-xl">
          <LiveCounter
            total={data?.total ?? 0}
            donors={data?.donorCount ?? 0}
            goal={s?.goal ?? 0}
            spent={data?.spent ?? 0}
            loading={loading}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="relative mt-7 flex flex-wrap justify-center gap-3"
        >
          {s?.liveOn && s.liveUrl && (
            <a href={s.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full bg-red-600 px-8 py-3.5 font-bold text-white shadow-[0_0_30px_rgba(239,68,68,.7)] transition-transform hover:scale-105">
              <span className="h-3 w-3 animate-ping rounded-full bg-white" /> 🔴 LIVE — {s.liveTitle || "सीधा प्रसारण देखें"}
            </a>
          )}
          <Link
            href="/donate"
            className="rounded-full bg-gradient-to-r from-divine-orange to-divine-crimson px-8 py-3.5 font-bold text-white shadow-glowStrong transition-transform hover:scale-105"
          >
            🙏 अब दान करें
          </Link>
          <Link
            href="/donors"
            className="rounded-full border border-divine-gold/45 px-8 py-3.5 font-semibold text-divine-brightGold transition-colors hover:bg-divine-red/40"
          >
            🏆 दानदाताओं की सूची
          </Link>
        </motion.div>
      </section>

      {/* सुनहरी पट्टी */}
      <div className="marquee" aria-hidden>
        <div>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="mx-6 font-display text-sm tracking-[0.25em] text-divine-brightGold md:text-base">
              🔱 जय माता दी ✦ या देवी सर्वभूतेषु ✦ अकेलवा पूर्व दुर्गा पूजा 🪔
            </span>
          ))}
        </div>
      </div>

      <About data={data} />
      <NoticeSection data={data} />
      <TopDonors ranked={ranked} tiers={s?.tiers ?? DEFAULT_TIERS} />
      <ExtraSections data={data} />
      <Spending data={data} />
      <Contact data={data} />
    </main>
  );
}


/* ---------------- पंडाल के बारे में ---------------- */
function About({ data }: { data: ReturnType<typeof usePujaData>["data"] }) {
  const s = data?.settings;
  return (
    <section className="mx-auto max-w-4xl px-5 py-16">
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass p-7 md:p-11"
      >
        <h2 className="text-center font-display text-3xl text-gold-shimmer md:text-4xl">हमारा पंडाल</h2>
        <div className="orn">✦</div>
        <p className="text-center leading-relaxed text-divine-cream/85">{s?.about}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            ["🛕", "भव्य पंडाल", "फूलों व लाइटों से सजा पंडाल"],
            ["🍛", "रोज़ भोग", "सबके लिए मुफ़्त प्रसाद"],
            ["🎆", "नौ दिन उत्सव", "आरती, कीर्तन और कार्यक्रम"],
          ].map(([icon, title, sub]) => (
            <div key={title} className="glass !rounded-2xl p-4 text-center">
              <div className="text-3xl">{icon}</div>
              <p className="mt-1 font-display text-divine-brightGold">{title}</p>
              <p className="mt-1 text-xs text-divine-cream/65">{sub}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-2xl bg-divine-darker/70 p-4">
            <p className="text-divine-marigold">🕉️ आरती का समय</p>
            <p className="mt-1 text-divine-cream/85">{s?.aartiTime}</p>
          </div>
          <div className="rounded-2xl bg-divine-darker/70 p-4">
            <p className="text-divine-marigold">📅 पूजा तिथि</p>
            <p className="mt-1 text-divine-cream/85">{s?.pujaDates}</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------------- सूचना पट्टी (झलक) ---------------- */
function NoticeSection({ data }: { data: ReturnType<typeof usePujaData>["data"] }) {
  const hasSchedule = (data?.schedule ?? []).length > 0;
  const notices = (data?.notices ?? []).slice(0, 2);
  if (!hasSchedule && !notices.length) return null;
  return (
    <section className="mx-auto max-w-3xl px-5 py-10">
      <h2 className="text-center font-display text-3xl text-gold-shimmer md:text-4xl">📢 {data?.settings.noticeTitle || "सूचना पट्टी"}</h2>
      <div className="orn">✦</div>
      <NoticeCards notices={notices} />
      <UpcomingList items={data?.schedule ?? []} />
      <div className="mt-6 text-center">
        <Link href="/notice" className="rounded-full border border-divine-gold/45 px-6 py-3 text-divine-brightGold transition-colors hover:bg-divine-red/40">पूरी कार्यक्रम सारणी देखें →</Link>
      </div>
    </section>
  );
}

/* ---------------- एडमिन के जोड़े अतिरिक्त सेक्शन ---------------- */
function ExtraSections({ data }: { data: ReturnType<typeof usePujaData>["data"] }) {
  const list = (data?.sections ?? []).filter((x) => x.showOnHome).sort((a, b) => a.order - b.order);
  return (
    <>
      {list.map((x) => (
        <section key={x.id} className="mx-auto max-w-3xl px-5 py-8">
          <div className="glass p-6 text-center">
            <h2 className="font-display text-2xl text-gold-shimmer">{x.title}</h2>
            {x.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={x.image} alt={x.title} className="mx-auto my-4 max-h-80 rounded-xl object-cover" />}
            <p className="whitespace-pre-line text-divine-cream/85">{x.body}</p>
          </div>
        </section>
      ))}
    </>
  );
}

/* ---------------- मुख्य दानदाता (फ़ोटो दीवार) ---------------- */
function TopDonors({ ranked, tiers }: { ranked: ReturnType<typeof usePujaData>["ranked"]; tiers: import("@/lib/types").Tier[] }) {
  return (
    <section className="mx-auto max-w-5xl px-5 py-10">
      <h2 className="text-center font-display text-3xl text-gold-shimmer md:text-4xl">🏆 मुख्य दानदाता</h2>
      <div className="orn">✦</div>
      <p className="mb-8 text-center text-sm text-divine-cream/65">जितना बड़ा दान, उतनी बड़ी जगह — माँ सबका आशीर्वाद दें 🙏</p>
      <DonorWall ranked={ranked} tiers={tiers} maxTiers={3} />
      <div className="mt-9 text-center">
        <Link href="/donors" className="rounded-full border border-divine-gold/45 px-6 py-3 text-divine-brightGold transition-colors hover:bg-divine-red/40">
          सभी दानदाता देखें →
        </Link>
      </div>
    </section>
  );
}

/* ---------------- दान कहाँ लगता है ---------------- */
function Spending({ data }: { data: ReturnType<typeof usePujaData>["data"] }) {
  const items = (data?.expenditures ?? []).slice().sort((a, b) => b.amount - a.amount).slice(0, 4);
  return (
    <section className="mx-auto max-w-3xl px-5 py-10">
      <h2 className="mb-2 text-center font-display text-3xl text-gold-shimmer md:text-4xl">💰 आपका दान कहाँ लगता है</h2>
      <p className="mb-6 text-center text-sm text-divine-cream/65">पूरा हिसाब-किताब खुला है — कोई गोपनीयता नहीं</p>
      <div className="space-y-3">
        {items.map((e) => (
          <div key={e.id} className="glass !rounded-2xl flex items-center justify-between p-4">
            <div>
              <p className="font-semibold text-divine-brightGold">{e.category}</p>
              {e.note && <p className="text-xs text-divine-cream/60">{e.note}</p>}
            </div>
            <p className="font-display font-bold tabular-nums text-divine-gold">{formatINR(e.amount)}</p>
          </div>
        ))}
      </div>
      <div className="mt-7 text-center">
        <Link
          href="/expenses"
          className="rounded-full border border-divine-gold/45 px-6 py-3 text-divine-brightGold transition-colors hover:bg-divine-red/40"
        >
          पूरा खर्च देखें →
        </Link>
      </div>
    </section>
  );
}

/* ---------------- संपर्क ---------------- */
function Contact({ data }: { data: ReturnType<typeof usePujaData>["data"] }) {
  const s = data?.settings;
  return (
    <section className="mx-auto max-w-3xl px-5 py-12">
      <div className="rounded-3xl bg-gradient-to-r from-divine-red via-divine-crimson to-divine-orange p-[2px] shadow-glow">
        <div className="rounded-3xl bg-divine-deep px-6 py-10 text-center">
          <p className="mb-2 text-4xl">🪔</p>
          <h2 className="mb-3 font-display text-2xl text-gold-shimmer md:text-3xl">माँ के पंडाल में आपका स्वागत है</h2>
          <p className="mx-auto mb-6 max-w-md text-divine-cream/80">
            छोटा-बड़ा कोई भी दान — सब माँ के चरणों में। UPI, QR या कार्ड से कुछ सेकंड में दान करें।
          </p>
          <Link
            href="/donate"
            className="inline-block rounded-full bg-gradient-to-r from-divine-orange to-divine-crimson px-9 py-4 text-lg font-bold text-white shadow-glowStrong transition-transform hover:scale-105"
          >
            अब दान करें →
          </Link>
          <a
            href={`https://wa.me/?text=${encodeURIComponent("🪔 जय माता दी! अकेलवा पूर्व दुर्गा पूजा समिति में दान करें और पूरा हिसाब देखें 🙏 " + (typeof window !== "undefined" ? window.location.origin : ""))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full border border-green-400/50 px-6 py-3 text-sm font-semibold text-green-300 transition-colors hover:bg-green-500/15"
          >
            💬 WhatsApp पर शेयर करें
          </a>
          <div className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
            {(s?.contacts ?? []).map((c) => (
              <a
                key={c.phone}
                href={`tel:+91${c.phone}`}
                className="rounded-2xl border border-divine-gold/20 bg-divine-darker/60 p-3 transition-colors hover:bg-divine-red/30"
              >
                <p className="text-divine-cream/90">{c.name}</p>
                <p className="text-divine-brightGold">📞 {c.phone}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-divine-cream/45">
        © {new Date().getFullYear()} अकेलवा पूर्व दुर्गा पूजा समिति · बस्ती (उ.प्र.) · जय माता दी 🙏
      </p>
    </section>
  );
}

