import { NextResponse } from "next/server";
import { COOKIE_NAME, checkPassword, cookieOptions, createToken, usingDefaultPassword } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * ग़लत password की सीमा:
 *  - एक IP से 5 ग़लत कोशिश → 15 मिनट बंद
 *  - कुल मिलाकर (सारे IP) 20 ग़लत कोशिश/घंटा → सबके लिए 15 मिनट बंद (IP नकली भेजने वालों के लिए)
 */
const MAX_IP = 5, MAX_ALL = 20, LOCK_MS = 15 * 60_000, WINDOW_MS = 60 * 60_000;
const perIp = new Map<string, { fails: number[]; lockUntil: number }>();
let allFails: number[] = [];
let allLockUntil = 0;

const ipOf = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
const mins = (ms: number) => Math.max(1, Math.ceil(ms / 60000));

export async function POST(req: Request) {
  const now = Date.now();
  const ip = ipOf(req);
  const rec = perIp.get(ip) ?? { fails: [], lockUntil: 0 };

  if (now < allLockUntil || now < rec.lockUntil) {
    const wait = Math.max(allLockUntil, rec.lockUntil) - now;
    return NextResponse.json({ error: `बहुत ग़लत कोशिशें — ${mins(wait)} मिनट बाद फिर कोशिश करें` }, { status: 429 });
  }

  const { password } = (await req.json().catch(() => ({}))) as { password?: string };

  if (!password || !checkPassword(password)) {
    rec.fails = rec.fails.filter((t) => now - t < WINDOW_MS);
    rec.fails.push(now);
    allFails = allFails.filter((t) => now - t < WINDOW_MS);
    allFails.push(now);
    if (rec.fails.length >= MAX_IP) { rec.lockUntil = now + LOCK_MS; rec.fails = []; }
    if (allFails.length >= MAX_ALL) { allLockUntil = now + LOCK_MS; allFails = []; }
    perIp.set(ip, rec);
    await new Promise((r) => setTimeout(r, 800));
    const left = MAX_IP - rec.fails.length;
    return NextResponse.json({ error: rec.lockUntil > now ? `बहुत ग़लत कोशिशें — ${mins(LOCK_MS)} मिनट बाद फिर कोशिश करें` : `ग़लत password (और ${left} कोशिश बाकी)` }, { status: 401 });
  }

  perIp.delete(ip);
  const res = NextResponse.json({ ok: true, defaultPassword: usingDefaultPassword() });
  res.cookies.set(COOKIE_NAME, createToken(), cookieOptions());
  return res;
}
