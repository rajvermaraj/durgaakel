"use client";

import { usePujaData } from "@/lib/client";
import { NoticeCards, ScheduleTimeline } from "@/components/NoticeBoard";

export default function NoticePage() {
  const { data, loading } = usePujaData();
  return (
    <main className="min-h-screen px-4 pb-32 pt-32">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-center font-display text-4xl font-bold text-gold-shimmer md:text-5xl">📢 {data?.settings.noticeTitle || "सूचना पट्टी"}</h1>
        <p className="mb-9 text-center text-sm tracking-widest text-divine-cream/65">कब क्या होगा · कहाँ और कितने बजे पहुँचना है</p>
        {loading ? <div className="h-40 animate-pulse rounded-2xl bg-divine-red/20" /> : (
          <>
            <NoticeCards notices={data?.notices ?? []} />
            <h2 className="mb-5 mt-10 text-center font-display text-2xl text-divine-marigold">🗓️ कार्यक्रम सारणी</h2>
            <ScheduleTimeline items={data?.schedule ?? []} />
            {(data?.sections ?? []).slice().sort((a, b) => a.order - b.order).map((s) => (
              <div key={s.id} className="glass mt-8 p-6">
                <h3 className="font-display text-xl text-divine-brightGold">{s.title}</h3>
                {s.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={s.image} alt={s.title} className="my-3 max-h-72 w-full rounded-xl object-cover" />}
                <p className="whitespace-pre-line text-sm text-divine-cream/85">{s.body}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </main>
  );
}
