import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { runBackup } from "@/lib/backup";
import { telegramReady } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ telegram: telegramReady() });
}

/** अभी Telegram पर बैकअप भेजें */
export async function POST() {
  if (!isAdmin()) return NextResponse.json({ error: "admin login ज़रूरी है" }, { status: 401 });
  const r = await runBackup("हाथ से");
  return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.error || "भेज नहीं पाए" }, { status: 400 });
}
