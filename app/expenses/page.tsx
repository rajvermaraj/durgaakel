"use client";

import { motion } from "framer-motion";
import { BarChart, DonutChart } from "@/components/Charts";
import { formatINR, usePujaData } from "@/lib/client";

export default function ExpensesPage() {
  const { data, loading } = usePujaData();
  const items = data?.expenditures ?? [];
  const total = items.reduce((s, e) => s + e.amount, 0);
  const collection = data?.total ?? 0;
  const balance = collection - total;

  return (
    <main className="min-h-screen px-4 pb-32 pt-32">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-center font-display text-4xl font-bold text-gold-shimmer md:text-5xl">
          खर्च का पूरा हिसाब
        </h1>
        <p className="mb-9 text-center text-sm tracking-widest text-divine-cream/65">
          एक-एक रुपये का हिसाब · सबके सामने
        </p>

        {/* सारांश */}
        <div className="mb-10 grid gap-3 sm:grid-cols-3">
          {[
            ["कुल जमा", formatINR(collection), "from-divine-marigold to-divine-orange"],
            ["कुल खर्च", formatINR(total), "from-divine-orange to-divine-crimson"],
            ["बचा हुआ", formatINR(balance), "from-divine-crimson to-divine-red"],
          ].map(([label, value, grad]) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl bg-gradient-to-br ${grad} p-[2px]`}
            >
              <div className="rounded-2xl bg-divine-darker/90 px-4 py-5 text-center">
                <p className="text-xs tracking-widest text-divine-cream/65">{label}</p>
                <p className="mt-1 font-display text-2xl font-bold tabular-nums text-divine-brightGold">{value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-64 animate-pulse rounded-3xl bg-divine-red/20" />
          </div>
        ) : (
          <>
            <section className="mb-9 glass p-6 md:p-9">
              <h2 className="mb-6 font-display text-2xl text-divine-brightGold">📊 खर्च का गोल चार्ट</h2>
              <DonutChart items={items} />
            </section>

            <section className="mb-9 glass p-6 md:p-9">
              <h2 className="mb-6 font-display text-2xl text-divine-brightGold">📶 किस मद में कितना</h2>
              <BarChart items={items} />
            </section>

            <section className="glass p-6 md:p-9">
              <h2 className="mb-6 font-display text-2xl text-divine-brightGold">🧾 पूरी सूची</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-divine-gold/20 text-left text-xs uppercase tracking-widest text-divine-marigold/85">
                      <th className="py-3 pr-4">मद</th>
                      <th className="py-3 pr-4">विवरण</th>
                      <th className="py-3 text-right">रकम</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((e) => (
                      <tr key={e.id} className="border-b border-divine-gold/10 last:border-0">
                        <td className="whitespace-nowrap py-3 pr-4 font-semibold text-divine-brightGold">{e.category}</td>
                        <td className="py-3 pr-4 text-divine-cream/70">{e.note || "—"}</td>
                        <td className="whitespace-nowrap py-3 text-right font-semibold tabular-nums text-divine-gold">
                          {formatINR(e.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={2} className="py-4 font-bold text-divine-cream">
                        कुल खर्च
                      </td>
                      <td className="py-4 text-right font-display text-lg font-bold tabular-nums text-gold-shimmer">
                        {formatINR(total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        <p className="mt-9 text-center text-xs text-divine-cream/45">
          बिल और पक्की रसीदें पंडाल के कार्यालय में देखी जा सकती हैं। कोषाध्यक्ष के फ़ोन नंबर होम पेज पर हैं।
        </p>
      </div>
    </main>
  );
}
