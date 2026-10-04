import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { readDB } from "@/lib/db";

export const runtime = "nodejs";

/** UPI QR खुद बनाता है — internet की ज़रूरत नहीं */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const amount = Number(url.searchParams.get("amt") || 0);
  const settings = readDB().settings;

  // अगर admin ने अपना QR अपलोड किया है तो सीधे वही भेजें
  if (settings.qrImage && !amount) {
    return NextResponse.redirect(new URL(settings.qrImage, url.origin));
  }

  const pa = url.searchParams.get("upi") || settings.upiId;
  const pn = settings.upiName || settings.committeeName;
  const link = `upi://pay?pa=${encodeURIComponent(pa)}&pn=${encodeURIComponent(pn)}&cu=INR${
    amount > 0 ? `&am=${amount}` : ""
  }&tn=${encodeURIComponent("दुर्गा पूजा दान")}`;

  const png = await QRCode.toBuffer(link, {
    type: "png",
    width: 720,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#05030f", light: "#fff3e0" },
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=60",
      ...(url.searchParams.get("dl") ? { "Content-Disposition": 'attachment; filename="durga-puja-qr.png"' } : {}),
    },
  });
}
