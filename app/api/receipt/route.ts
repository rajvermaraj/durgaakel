import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { FALLBACK_THANKS, tierOf, type Receipt } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const hits = new Map<string, number[]>();

/** रसीद सिर्फ़ तब मिलती है जब admin ने भुगतान की पुष्टि कर दी हो। चाबी (k) के बिना कुछ नहीं खुलता। */
export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(ip, list);
  if (list.length > 40) return NextResponse.json({ error: "बहुत ज़्यादा request" }, { status: 429 });

  const k = new URL(req.url).searchParams.get("k") || "";
  if (k.length < 8) return NextResponse.json({ error: "रसीद नहीं मिली" }, { status: 404 });

  const db = readDB();
  const d = db.donations.find((x) => x.rk === k);
  if (!d) return NextResponse.json({ error: "रसीद नहीं मिली" }, { status: 404 });

  if (d.status === "pending") {
    const out: Receipt = { status: "pending" };
    return NextResponse.json(out, { headers: { "Cache-Control": "no-store" } });
  }

  const tiers = db.settings.tiers;
  const tier = tiers[tierOf(d.amount, tiers)];
  const out: Receipt = {
    status: "confirmed",
    name: d.anonymous ? "अज्ञात भक्त" : d.name,
    amount: d.amount,
    village: d.anonymous ? undefined : d.village,
    timestamp: d.confirmedAt ?? d.timestamp,
    anonymous: d.anonymous,
    no: d.id.replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase(),
    tierLabel: tier?.label,
    thanks: tier?.thanks || FALLBACK_THANKS,
    committee: db.settings.committeeName,
    photo: d.anonymous ? undefined : d.photo,
  };
  return NextResponse.json(out, { headers: { "Cache-Control": "no-store" } });
}
