import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const ALLOWED: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_BYTES = 3 * 1024 * 1024;
const hits = new Map<string, number[]>();

/** दानदाता अपनी फ़ोटो भेज सके। फ़ोटो सूची में तभी दिखती है जब admin दान की पुष्टि करे। */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 600_000);
  list.push(now);
  hits.set(ip, list);
  if (list.length > 4) return NextResponse.json({ error: "बहुत ज़्यादा कोशिशें — थोड़ी देर बाद करें" }, { status: 429 });

  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "फ़ाइल नहीं मिली" }, { status: 400 });
  const ext = ALLOWED[file.type];
  if (!ext) return NextResponse.json({ error: "सिर्फ़ jpg/png/webp फ़ोटो चलेगी" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "फ़ोटो 3MB से छोटी रखें" }, { status: 400 });

  const dir = path.join(process.cwd(), "data", "uploads", "donors");
  fs.mkdirSync(dir, { recursive: true });
  const name = `d_${now.toString(36)}${Math.random().toString(36).slice(2, 7)}.${ext}`;
  fs.writeFileSync(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ ok: true, url: `/uploads/donors/${name}` });
}
