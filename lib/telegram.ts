/** Telegram bot से संदेश / बैकअप फ़ाइल भेजना। TELEGRAM_BOT_TOKEN और TELEGRAM_CHAT_ID न हों तो चुपचाप कुछ नहीं करता। */
const token = () => process.env.TELEGRAM_BOT_TOKEN || "";
const chat = () => process.env.TELEGRAM_CHAT_ID || "";
export const telegramReady = () => Boolean(token() && chat());

async function call(method: string, body: BodyInit): Promise<{ ok: boolean; error?: string }> {
  try {
    const r = await fetch(`https://api.telegram.org/bot${token()}/${method}`, { method: "POST", body, signal: AbortSignal.timeout(20000) });
    const j = (await r.json().catch(() => ({}))) as { ok?: boolean; description?: string };
    return j.ok ? { ok: true } : { ok: false, error: j.description || `HTTP ${r.status}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network error" };
  }
}

export async function tgMessage(text: string) {
  if (!telegramReady()) return { ok: false, error: "Telegram सेट नहीं है (.env.local में TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID भरें)" };
  const fd = new FormData();
  fd.append("chat_id", chat());
  fd.append("text", text.slice(0, 3900));
  return call("sendMessage", fd);
}

export async function tgDocument(filename: string, content: string, caption: string) {
  if (!telegramReady()) return { ok: false, error: "Telegram सेट नहीं है (.env.local में TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID भरें)" };
  const fd = new FormData();
  fd.append("chat_id", chat());
  fd.append("caption", caption.slice(0, 900));
  fd.append("document", new Blob([content], { type: "application/json" }), filename);
  return call("sendDocument", fd);
}
