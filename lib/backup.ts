import fs from "fs";
import path from "path";
import { tgDocument } from "./telegram";

const STATE = path.join(process.cwd(), "data", "backup-state.json");
const DB_FILE = path.join(process.cwd(), "data", "db.json");
const DAY = 24 * 3600_000;

function lastBackup(): number {
  try { return JSON.parse(fs.readFileSync(STATE, "utf8")).last || 0; } catch { return 0; }
}

/** db.json को Telegram पर भेजें */
export async function runBackup(reason = "manual") {
  if (!fs.existsSync(DB_FILE)) return { ok: false, error: "अभी कोई data ही नहीं है" };
  const raw = fs.readFileSync(DB_FILE, "utf8");
  const stamp = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" }).replace(" ", "_").replace(/:/g, "-");
  let counts = "";
  try { const j = JSON.parse(raw); counts = `दान ${j.donations?.length ?? 0} · खर्च ${j.expenditures?.length ?? 0} · फ़ोटो ${j.gallery?.length ?? 0}`; } catch { /* ignore */ }
  const res = await tgDocument(`puja-backup-${stamp}.json`, raw, `🪔 पूजा वेबसाइट बैकअप (${reason})\n${counts}`);
  if (res.ok) fs.writeFileSync(STATE, JSON.stringify({ last: Date.now() }));
  return res;
}

/** हर घंटे जाँचता है; 24 घंटे से पुराना बैकअप हो तो नया भेजता है */
export function startBackupScheduler() {
  const g = globalThis as unknown as { __backupTimer?: boolean };
  if (g.__backupTimer) return;
  g.__backupTimer = true;
  const tick = async () => {
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return;
    if (Date.now() - lastBackup() >= DAY) await runBackup("रोज़ का अपने-आप");
  };
  setTimeout(tick, 60_000);
  setInterval(tick, 3600_000);
}
