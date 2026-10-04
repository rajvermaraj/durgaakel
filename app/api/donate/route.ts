import { NextResponse } from "next/server";
import { addDonation } from "@/lib/db";
import { tgMessage } from "@/lib/telegram";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// एक IP से 1 मिनट में अधिकतम 5 request (spam रोकने के लिए)
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 5;
}

/** कोई भी भक्त बिना login दान दर्ज कर सकता है — पर सूची में admin की पुष्टि के बाद ही जुड़ता है */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) {
    return NextResponse.json({ error: "बहुत ज़्यादा कोशिशें — थोड़ी देर बाद फिर करें" }, { status: 429 });
  }
  try {
    const body = (await req.json()) as {
      name?: string;
      amount?: number | string;
      village?: string;
      message?: string;
      anonymous?: boolean;
      txnId?: string;
      photo?: string;
      phone?: string;
    };

    const amount = Math.round(Number(body.amount));
    const anonymous = Boolean(body.anonymous);
    const name = (body.name ?? "").trim();

    if (!anonymous && name.length < 2) {
      return NextResponse.json({ error: "कृपया अपना नाम लिखें (या अज्ञात दान चुनें)" }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount < 11) {
      return NextResponse.json({ error: "कृपया ₹11 या उससे ज़्यादा की राशि डालें" }, { status: 400 });
    }
    if (amount > 5000000) {
      return NextResponse.json({ error: "राशि बहुत बड़ी है, कृपया समिति से संपर्क करें" }, { status: 400 });
    }

    const donation = addDonation({
      name: name.slice(0, 60),
      amount,
      village: body.village?.slice(0, 40),
      message: body.message?.slice(0, 140),
      anonymous,
      photo: typeof body.photo === "string" && /^\/uploads\/donors\/[\w.-]+$/.test(body.photo) ? body.photo : undefined,
      phone: (body.phone ?? "").replace(/\D/g, "").slice(-10) || undefined,
      source: "online",
      status: "pending",
      note: body.txnId ? `UPI Ref: ${body.txnId}` : undefined,
    });

    // कोषाध्यक्ष को तुरंत Telegram पर सूचना (सेट हो तो)
    void tgMessage(
      `🪔 नया दान — पुष्टि बाकी\nनाम: ${donation.anonymous ? "अज्ञात" : donation.name}${donation.village ? ` (${donation.village})` : ""}\nराशि: ₹${donation.amount}\n${donation.note ?? ""}\n${donation.phone ? `फ़ोन: ${donation.phone}\n` : ""}${donation.photo ? "📷 फ़ोटो के साथ\n" : ""}\nपुष्टि: ${process.env.SITE_URL || ""}/admin`
    );

    // भक्त को सिर्फ़ उसकी अपनी रसीद-चाबी लौटाएँ
    return NextResponse.json({ ok: true, rk: donation.rk });
  } catch {
    return NextResponse.json({ error: "कुछ गड़बड़ हुई, फिर कोशिश करें" }, { status: 500 });
  }
}
