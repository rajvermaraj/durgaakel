import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/** admin फ़ोटो अपलोड करे (गैलरी / QR के लिए) */
export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "admin login ज़रूरी है" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "फ़ाइल नहीं मिली" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "सिर्फ़ फ़ोटो (jpg/png/webp) चलेगी" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "फ़ोटो 5MB से छोटी होनी चाहिए" }, { status: 400 });

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : file.type === "image/gif" ? "gif" : "jpg";
  const name = `puja_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}.${ext}`;

  const dir = path.join(process.cwd(), "data", "uploads");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ ok: true, url: `/uploads/${name}` });
}
