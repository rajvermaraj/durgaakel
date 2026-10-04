import type { ScheduleItem } from "./types";

const EVENT_LASTS_MS = 3 * 3600_000; // कार्यक्रम शुरू होने के 3 घंटे तक "चल रहा" माना जाएगा

export const whenMs = (s: ScheduleItem) => {
  const t = s.when ? Date.parse(s.when) : NaN;
  return Number.isFinite(t) ? t : null;
};

/** तारीख़-समय वाले पहले (समय से), बाकी क्रम संख्या से */
export function sortSchedule(list: ScheduleItem[]) {
  return [...list].sort((a, b) => {
    const x = whenMs(a), y = whenMs(b);
    if (x !== null && y !== null) return x - y;
    if (x !== null) return -1;
    if (y !== null) return 1;
    return a.order - b.order;
  });
}

export type EventState = "past" | "now" | "next" | "later" | "undated";

/** हर कार्यक्रम की स्थिति: हो चुका / चल रहा / अगला / आगे */
export function stateMap(sorted: ScheduleItem[], now: number): Record<string, EventState> {
  const out: Record<string, EventState> = {};
  let nextFound = false;
  for (const it of sorted) {
    const t = whenMs(it);
    if (t === null) { out[it.id] = "undated"; continue; }
    if (now >= t && now < t + EVENT_LASTS_MS) out[it.id] = "now";
    else if (now >= t + EVENT_LASTS_MS) out[it.id] = "past";
    else if (!nextFound) { out[it.id] = "next"; nextFound = true; }
    else out[it.id] = "later";
  }
  return out;
}

/** "2 दिन 4 घंटे बाद" */
export function countdownHi(target: number, now: number) {
  const m = Math.max(0, Math.floor((target - now) / 60000));
  const d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60;
  if (d > 0) return `${d} दिन ${h} घंटे बाद`;
  if (h > 0) return `${h} घंटे ${mm} मिनट बाद`;
  return `${mm} मिनट बाद`;
}
