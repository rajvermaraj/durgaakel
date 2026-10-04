import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { makeId, newReceiptKey, readDB, update } from "@/lib/db";
import type { DB } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Coll = "donations" | "expenditures" | "gallery" | "notices" | "schedule" | "sections";
const COLLS: Record<Coll, string> = { donations: "don", expenditures: "exp", gallery: "gal", notices: "not", schedule: "sch", sections: "sec" };
const SETTINGS_KEYS = [
  "committeeName", "village", "district", "about", "notice", "goal", "upiId", "upiName", "qrImage",
  "pujaDates", "aartiTime", "contacts", "whatsapp", "tiers", "noticeTitle", "liveOn", "liveUrl", "liveTitle",
];
const NUM_FIELDS = ["amount", "order", "goal", "min", "size", "timestamp", "addedAt", "createdAt"];

interface Body {
  entity: string;
  action: "create" | "update" | "delete";
  id?: string;
  data?: Record<string, unknown>;
}

/** आने वाले data को साफ़ करें: id हटाएँ, संख्याएँ ठीक करें */
function clean(data: Record<string, unknown> = {}) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (k === "id") continue;
    out[k] = NUM_FIELDS.includes(k) ? Math.round(Number(v) || 0) : v;
  }
  return out;
}

/** Admin के सारे बदलाव एक ही endpoint से */
export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "admin login ज़रूरी है" }, { status: 401 });
  const { entity, action, id, data } = (await req.json()) as Body;
  if (!entity || !action) return NextResponse.json({ error: "ग़लत request" }, { status: 400 });

  try {
    if (entity === "settings") {
      const c = clean(data);
      const picked = Object.fromEntries(Object.entries(c).filter(([k]) => SETTINGS_KEYS.includes(k)));
      if (picked.tiers) picked.tiers = (picked.tiers as { min: unknown; label: unknown; size: unknown; thanks?: unknown }[]).map((t) => ({ min: Number(t.min) || 0, label: String(t.label || ""), thanks: String(t.thanks || "").slice(0, 200), size: Math.min(400, Math.max(48, Number(t.size) || 80)) }));
      if (picked.liveUrl !== undefined) { const u = String(picked.liveUrl).trim(); picked.liveUrl = /^https?:\/\//i.test(u) ? u : ""; }
      if (picked.liveOn !== undefined) picked.liveOn = Boolean(picked.liveOn);
      update((db) => { db.settings = { ...db.settings, ...picked }; });
      return NextResponse.json({ ok: true });
    }

    if (!(entity in COLLS)) return NextResponse.json({ error: "अज्ञात entity" }, { status: 400 });
    const key = entity as Coll;

    update((db) => {
      const list = db[key] as unknown as { id: string }[];
      if (action === "create") {
        const c = clean(data);
        const base: Record<string, unknown> = { id: makeId(COLLS[key]), ...c };
        if (key === "donations") {
          Object.assign(base, { name: c.anonymous ? "अज्ञात भक्त" : String(c.name || "भक्त").trim(), amount: c.amount || 0, anonymous: Boolean(c.anonymous), timestamp: c.timestamp || Date.now(), source: c.source || "cash", status: "confirmed", rk: newReceiptKey(), confirmedAt: Date.now(), phone: String(c.phone || "").replace(/\D/g, "").slice(-10) || undefined });
        }
        if (key === "gallery") { if (!c.url) throw new Error("image ज़रूरी है"); base.addedAt = Date.now(); base.category = c.category || "पंडाल"; base.caption = c.caption || ""; }
        if (key === "notices") { base.createdAt = Date.now(); base.important = Boolean(c.important); }
        if (key === "schedule" || key === "sections") { base.order = c.order || list.length + 1; }
        if (key === "expenditures") { base.category = String(c.category || "अन्य").trim(); }
        (key === "donations" || key === "gallery" || key === "notices" ? list.unshift(base as never) : list.push(base as never));
      } else if (action === "update" && id) {
        const c = clean(data);
        (db[key] as unknown as { id: string }[]) = list.map((x) => {
          if (x.id !== id) return x;
          const merged: Record<string, unknown> = { ...x, ...c, id: x.id };
          if (key === "donations") {
            if (typeof merged.phone === "string") merged.phone = merged.phone.replace(/\D/g, "").slice(-10) || undefined;
            if (!merged.rk) merged.rk = newReceiptKey();
            if (merged.status !== "pending" && !merged.confirmedAt) merged.confirmedAt = Date.now();
          }
          return merged as never;
        }) as never;
      } else if (action === "delete" && id) {
        (db[key] as unknown as { id: string }[]) = list.filter((x) => x.id !== id) as never;
      }
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "कुछ गड़बड़ हुई" }, { status: 400 });
  }
}

/** admin panel को पूरा data (pending सहित) */
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db: DB = readDB();
  return NextResponse.json(db, { headers: { "Cache-Control": "no-store" } });
}
