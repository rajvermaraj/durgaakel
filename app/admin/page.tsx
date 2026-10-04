"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDateHi, formatINR } from "@/lib/client";
import PhotoCropper from "@/components/PhotoCropper";
import { DEFAULT_TIERS, GALLERY_CATEGORIES, type DB, type Expenditure, type Notice, type ScheduleItem, type Section } from "@/lib/types";

type Tab = "pending" | "donations" | "notice" | "schedule" | "sections" | "expenses" | "gallery" | "settings";
const box = "rounded-2xl border border-divine-gold/20 bg-divine-darker/60 p-4";
const inp = "w-full rounded-xl border border-divine-gold/25 bg-divine-darker/70 px-3 py-2 text-divine-brightGold outline-none focus:border-divine-gold";
const btn = "rounded-full bg-divine-crimson px-4 py-2 text-sm font-semibold text-divine-brightGold hover:bg-divine-red disabled:opacity-50";
const btnGhost = "rounded-full border border-divine-gold/35 px-3 py-1.5 text-xs text-divine-cream/80 hover:bg-divine-red/40";

async function mutate(entity: string, action: string, payload: { id?: string; data?: unknown }) {
  const res = await fetch("/api/admin/mutate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entity, action, ...payload }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "त्रुटि");
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [defaultPw, setDefaultPw] = useState(false);
  const [db, setDb] = useState<DB | null>(null);
  const [tab, setTab] = useState<Tab>("pending");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/mutate", { cache: "no-store" });
    if (r.ok) setDb(await r.json());
  }, []);

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        setAuthed(j.authed);
        setDefaultPw(j.defaultPassword);
        if (j.authed) load();
      });
  }, [load]);

  const run = async (fn: () => Promise<void>, ok = "✅ हो गया") => {
    try {
      await fn();
      await load();
      setMsg(ok);
    } catch (e) {
      setMsg("❌ " + (e instanceof Error ? e.message : "त्रुटि"));
    }
    setTimeout(() => setMsg(""), 2500);
  };

  if (authed === null) return <main className="min-h-screen pt-40 text-center text-divine-cream/60">…</main>;
  if (!authed) return <Login onDone={() => { setAuthed(true); load(); }} />;

  const pending = (db?.donations ?? []).filter((d) => d.status === "pending");

  return (
    <main className="min-h-screen px-4 pb-32 pt-32">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-display text-3xl text-gold-shimmer">एडमिन पैनल</h1>
          <button
            className={btnGhost}
            onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); setAuthed(false); }}
          >
            लॉग आउट
          </button>
        </div>

        {defaultPw && (
          <p className="mb-4 rounded-xl bg-divine-red/50 p-3 text-sm text-divine-brightGold">
            ⚠️ अभी डिफ़ॉल्ट password चल रहा है। <code>.env.local</code> में <code>ADMIN_PASSWORD</code> सेट करें।
          </p>
        )}
        {msg && <p className="fixed right-4 top-24 z-[70] rounded-xl bg-divine-darker px-4 py-2 text-sm text-divine-brightGold shadow-glow">{msg}</p>}

        <div className="mb-6 flex flex-wrap gap-2">
          {([
            ["pending", `⏳ पुष्टि (${pending.length})`],
            ["donations", "💰 दान"],
            ["notice", "📢 सूचना"],
            ["schedule", "🗓️ कार्यक्रम"],
            ["sections", "➕ अतिरिक्त"],
            ["expenses", "🧾 खर्च"],
            ["gallery", "🖼️ गैलरी"],
            ["settings", "⚙️ सेटिंग"],
          ] as [Tab, string][]).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className={`rounded-full px-4 py-2 text-sm ${tab === k ? "bg-divine-crimson text-divine-brightGold shadow-glow" : "border border-divine-gold/25 text-divine-cream/75"}`}>
              {label}
            </button>
          ))}
        </div>

        {!db ? <p className="text-divine-cream/60">लोड हो रहा है…</p> : (
          <>
            {tab === "pending" && (
              <div className="space-y-3">
                {pending.length === 0 && <p className="text-divine-cream/60">कोई दान पुष्टि के लिए बाकी नहीं 🙏</p>}
                {pending.map((d) => (
                  <div key={d.id} className={`${box} flex flex-wrap items-center gap-3`}>
                    {d.photo && !d.anonymous && /* eslint-disable-next-line @next/next/no-img-element */ <img src={d.photo} alt="" className="h-14 w-14 rounded-full border-2 border-divine-gold object-cover" />}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-divine-brightGold">{d.anonymous ? "अज्ञात भक्त" : d.name} · {formatINR(d.amount)}</p>
                      <p className="text-xs text-divine-cream/60">{formatDateHi(d.timestamp)} {d.village && `· ${d.village}`} {d.note && `· ${d.note}`}</p>
                    </div>
                    {d.photo && <button className={btnGhost} onClick={() => run(() => mutate("donations", "update", { id: d.id, data: { photo: "" } }), "फ़ोटो हटाई")}>फ़ोटो हटाएँ</button>}
                    <button className={btn} onClick={() => run(() => mutate("donations", "update", { id: d.id, data: { status: "confirmed" } }), "✅ पुष्टि हुई — रसीद भेजने के लिए 💰 दान टैब में 📲 दबाएँ")}>पुष्टि करें</button>
                    <button className={btnGhost} onClick={() => confirm("यह दान हटाएँ?") && run(() => mutate("donations", "delete", { id: d.id }))}>हटाएँ</button>
                  </div>
                ))}
              </div>
            )}

            {tab === "donations" && <Donations db={db} run={run} />}
            {tab === "notice" && <CrudList run={run} entity="notices" items={db.notices} fields={NOTICE_F} title={(n: Notice) => `${n.important ? "📢 " : ""}${n.title}`} addLabel="+ नई सूचना" blank={{ title: "", body: "", important: false }} />}
            {tab === "schedule" && <CrudList run={run} entity="schedule" items={[...db.schedule].sort((a, b) => a.order - b.order)} fields={SCHEDULE_F} title={(x: ScheduleItem) => `${x.order}. ${x.title} — ${x.date || x.day} ${x.time}`} addLabel="+ नया कार्यक्रम" blank={{ order: db.schedule.length + 1, day: "", date: "", time: "", title: "", place: "", reportTime: "", details: "" }} />}
            {tab === "sections" && <CrudList run={run} entity="sections" items={[...db.sections].sort((a, b) => a.order - b.order)} fields={SECTION_F} title={(x: Section) => x.title} addLabel="+ नया सेक्शन (होम/सूचना पेज पर दिखेगा)" blank={{ order: db.sections.length + 1, title: "", body: "", image: "", showOnHome: true }} />}
            {tab === "expenses" && <CrudList run={run} entity="expenditures" items={db.expenditures} fields={EXPENSE_F} title={(x: Expenditure) => `${x.category} — ${formatINR(x.amount)}`} addLabel="+ खर्च जोड़ें" blank={{ category: "", amount: 0, note: "" }} />}
            {tab === "gallery" && <Gallery db={db} run={run} />}
            {tab === "settings" && <SettingsForm db={db} run={run} />}
          </>
        )}
      </div>
    </main>
  );
}

type Run = (fn: () => Promise<void>, ok?: string) => Promise<void>;

function Login({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const go = async () => {
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (r.ok) onDone(); else setErr((await r.json().catch(() => ({}))).error || "ग़लत password");
  };
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className={`${box} w-full max-w-sm space-y-3 text-center`}>
        <p className="text-4xl">🔐</p>
        <h1 className="font-display text-2xl text-gold-shimmer">एडमिन लॉगिन</h1>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()} placeholder="Password" className={inp} />
        {err && <p className="text-sm text-divine-marigold">{err}</p>}
        <button onClick={go} className={`${btn} w-full`}>प्रवेश करें</button>
      </div>
    </main>
  );
}

type Field = { k: string; label: string; type?: "text" | "number" | "area" | "bool" | "image" | "datetime"; crop?: boolean };
const NOTICE_F: Field[] = [
  { k: "title", label: "शीर्षक" },
  { k: "body", label: "विवरण (समय, स्थान, क्या करना है…)", type: "area" },
  { k: "important", label: "ज़रूरी सूचना (ऊपर और चमकदार दिखे)", type: "bool" },
];
const SCHEDULE_F: Field[] = [
  { k: "title", label: "कार्यक्रम का नाम" },
  { k: "when", label: "तारीख़-समय (भरने पर क्रम अपने-आप लगेगा, \"अगला कार्यक्रम\" चमकेगा)", type: "datetime" },
  { k: "order", label: "क्रम संख्या (सिर्फ़ तब जब ऊपर समय न भरें)", type: "number" },
  { k: "day", label: "दिन (जैसे सप्तमी)" },
  { k: "date", label: "तारीख (जैसे १८ अक्टूबर)" },
  { k: "time", label: "कार्यक्रम का समय" },
  { k: "place", label: "स्थान" },
  { k: "reportTime", label: "कब तक कहाँ उपस्थित होना है" },
  { k: "details", label: "अन्य विवरण / निर्देश", type: "area" },
];
const SECTION_F: Field[] = [
  { k: "order", label: "क्रम संख्या", type: "number" },
  { k: "title", label: "शीर्षक" },
  { k: "body", label: "लिखावट", type: "area" },
  { k: "image", label: "फ़ोटो (वैकल्पिक)", type: "image" },
  { k: "showOnHome", label: "होम पेज पर भी दिखाएँ", type: "bool" },
];
const EXPENSE_F: Field[] = [
  { k: "category", label: "मद (जैसे पंडाल)" },
  { k: "amount", label: "रकम ₹", type: "number" },
  { k: "note", label: "विवरण", type: "area" },
];
const DONATION_F: Field[] = [
  { k: "name", label: "नाम" },
  { k: "amount", label: "राशि ₹", type: "number" },
  { k: "village", label: "गाँव" },
  { k: "message", label: "संदेश" },
  { k: "photo", label: "दानदाता की फ़ोटो (क्रॉप होगी)", type: "image", crop: true },
  { k: "phone", label: "WhatsApp नंबर (सिर्फ़ आपको दिखेगा)" },
  { k: "anonymous", label: "अज्ञात दान (नाम/फ़ोटो न दिखे)", type: "bool" },
  { k: "note", label: "नोट (जैसे UPI Ref)" },
];

async function uploadFile(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error);
  return j.url as string;
}

/** एक field का editor (text / number / area / bool / image) */
function FieldEditor({ f, value, onChange }: { f: Field; value: unknown; onChange: (v: unknown) => void }) {
  const [busy, setBusy] = useState(false);
  const [crop, setCrop] = useState<File | null>(null);
  if (f.type === "bool")
    return (
      <label className="flex items-center gap-2 text-sm text-divine-cream/80">
        <input type="checkbox" className="h-4 w-4 accent-divine-orange" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} /> {f.label}
      </label>
    );
  if (f.type === "image")
    return (
      <div className="text-sm text-divine-cream/70">
        {f.label}
        {crop && <PhotoCropper file={crop} onCancel={() => setCrop(null)} onDone={async (blob) => { setCrop(null); setBusy(true); try { onChange(await uploadFile(new File([blob], "p.jpg", { type: "image/jpeg" }))); } catch (er) { alert(er instanceof Error ? er.message : "त्रुटि"); } setBusy(false); }} />}
        <div className="mt-1 flex items-center gap-3">
          {Boolean(value) && /* eslint-disable-next-line @next/next/no-img-element */ <img src={String(value)} alt="" className="h-16 w-16 rounded-full border border-divine-gold/40 object-cover" />}
          <label className={`${btnGhost} cursor-pointer`}>
            {busy ? "अपलोड…" : value ? "बदलें" : "📷 चुनें"}
            <input type="file" accept="image/*" hidden onChange={async (e) => { const file = e.target.files?.[0]; e.target.value = ""; if (!file) return; if (f.crop) { setCrop(file); return; } setBusy(true); try { onChange(await uploadFile(file)); } catch (er) { alert(er instanceof Error ? er.message : "त्रुटि"); } setBusy(false); }} />
          </label>
          {Boolean(value) && <button type="button" className={btnGhost} onClick={() => onChange("")}>हटाएँ</button>}
        </div>
      </div>
    );
  return (
    <label className="block text-sm text-divine-cream/70">
      {f.label}
      {f.type === "area" ? (
        <textarea rows={3} className={inp} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={inp} type={f.type === "number" ? "number" : f.type === "datetime" ? "datetime-local" : "text"} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

/** हर चीज़ के लिए एक जैसा: जोड़ें / बदलें / हटाएँ */
function CrudList<T extends { id: string }>({ run, entity, items, fields, title, addLabel, blank, extra }: {
  run: Run; entity: string; items: T[]; fields: Field[]; title: (x: T) => string; addLabel: string; blank: Record<string, unknown>;
  extra?: (x: T) => React.ReactNode;
}) {
  const [open, setOpen] = useState<string | null>(null); // item id या "new"
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const edit = (id: string, init: Record<string, unknown>) => { setOpen(id); setDraft(init); };
  const form = (onSave: () => void, onDel?: () => void) => (
    <div className="mt-3 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.k} className={f.type === "area" || f.type === "image" ? "sm:col-span-2" : ""}>
            <FieldEditor f={f} value={draft[f.k]} onChange={(v) => setDraft({ ...draft, [f.k]: v })} />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button className={btn} onClick={onSave}>💾 सेव करें</button>
        <button className={btnGhost} onClick={() => setOpen(null)}>रद्द करें</button>
        {onDel && <button className={`${btnGhost} ml-auto`} onClick={onDel}>🗑️ हटाएँ</button>}
      </div>
    </div>
  );
  return (
    <div className="space-y-3">
      <div className={box}>
        {open === "new" ? <p className="text-divine-marigold">{addLabel.replace("+ ", "")}</p> : <button className={btn} onClick={() => edit("new", { ...blank })}>{addLabel}</button>}
        {open === "new" && form(() => run(async () => { await mutate(entity, "create", { data: draft }); setOpen(null); }, "✅ जुड़ गया"))}
      </div>
      {items.length === 0 && <p className="text-divine-cream/60">अभी कुछ नहीं है।</p>}
      {items.map((x) => (
        <div key={x.id} className={box}>
          <div className="flex items-center gap-3">
            {Boolean((x as Record<string, unknown>).photo) && /* eslint-disable-next-line @next/next/no-img-element */ <img src={String((x as Record<string, unknown>).photo)} alt="" className="h-10 w-10 rounded-full object-cover" />}
            <p className="min-w-0 flex-1 truncate text-divine-brightGold">{title(x)}</p>
            {extra?.(x)}
            <button className={btnGhost} onClick={() => (open === x.id ? setOpen(null) : edit(x.id, { ...(x as Record<string, unknown>) }))}>{open === x.id ? "बंद" : "✏️ बदलें"}</button>
          </div>
          {open === x.id && form(
            () => run(async () => { await mutate(entity, "update", { id: x.id, data: draft }); setOpen(null); }, "✅ बदलाव सेव हुआ"),
            () => confirm("पक्का हटाना है?") && run(async () => { await mutate(entity, "delete", { id: x.id }); setOpen(null); }, "🗑️ हट गया")
          )}
        </div>
      ))}
    </div>
  );
}

function Donations({ db, run }: { db: DB; run: Run }) {
  const list = db.donations.filter((d) => d.status !== "pending").sort((a, b) => b.amount - a.amount);
  return (
    <CrudList run={run} entity="donations" items={list} fields={DONATION_F} addLabel="+ नगद दान जोड़ें (फ़ोटो सहित)"
      blank={{ name: "", amount: 0, village: "", message: "", photo: "", anonymous: false, note: "" }}
      title={(d) => `${d.anonymous ? "अज्ञात भक्त" : d.name} — ${formatINR(d.amount)}${d.village ? ` (${d.village})` : ""}`}
      extra={(d) => (
        <>
          <span className="hidden text-xs text-divine-cream/50 sm:inline">{d.source === "cash" ? "नगद" : "ऑनलाइन"}</span>
          {d.rk && (
            <a className={btnGhost} target="_blank" rel="noopener noreferrer"
              href={`https://wa.me/${d.phone ? "91" + d.phone : ""}?text=${encodeURIComponent(`🙏 जय माता दी! आपके ${formatINR(d.amount)} के दान की पुष्टि हो गई है। आपकी धन्यवाद रसीद: ${typeof window !== "undefined" ? window.location.origin : ""}/receipt/${d.rk}`)}`}>
              📲 रसीद भेजें
            </a>
          )}
        </>
      )} />
  );
}

function Gallery({ db, run }: { db: DB; run: Run }) {
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<string>(GALLERY_CATEGORIES[0]);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    await run(async () => {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      await mutate("gallery", "create", { data: { url: j.url, caption, category } });
      setCaption("");
    }, "✅ फ़ोटो जुड़ी");
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <div className={`${box} grid gap-2 sm:grid-cols-3`}>
        <input className={inp} placeholder="कैप्शन" value={caption} onChange={(e) => setCaption(e.target.value)} />
        <select className={inp} value={category} onChange={(e) => setCategory(e.target.value)}>
          {GALLERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <label className={`${btn} cursor-pointer text-center ${busy ? "opacity-50" : ""}`}>
          {busy ? "अपलोड…" : "📷 फ़ोटो चुनें"}
          <input type="file" accept="image/*" hidden disabled={busy} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {db.gallery.map((g) => (
          <div key={g.id} className={`${box} p-2`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.url} alt={g.caption} className="aspect-[4/3] w-full rounded-lg object-cover" />
            <p className="mt-2 truncate text-sm text-divine-brightGold">{g.caption || "—"}</p>
            <button className={`${btnGhost} mr-1 mt-1`} onClick={() => { const c = prompt("नया कैप्शन", g.caption); if (c !== null) run(() => mutate("gallery", "update", { id: g.id, data: { caption: c } }), "✅ कैप्शन बदला"); }}>✏️ कैप्शन</button>
            <button className={`${btnGhost} mt-1`} onClick={() => confirm("फ़ोटो हटाएँ?") && run(() => mutate("gallery", "delete", { id: g.id }))}>हटाएँ</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsForm({ db, run }: { db: DB; run: Run }) {
  const [s, setS] = useState({ ...db.settings, tiers: db.settings.tiers ?? DEFAULT_TIERS, liveOn: db.settings.liveOn ?? false, liveUrl: db.settings.liveUrl ?? "", liveTitle: db.settings.liveTitle ?? "" });
  const set = (k: keyof typeof s) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setS({ ...s, [k]: k === "goal" ? Number(e.target.value) : e.target.value });
  const row = (label: string, k: keyof typeof s, area = false) => (
    <label className="block text-sm text-divine-cream/70">
      {label}
      {area ? <textarea rows={3} className={inp} value={String(s[k])} onChange={set(k)} /> : <input className={inp} value={String(s[k])} onChange={set(k)} />}
    </label>
  );
  const upC = (i: number, patch: Partial<(typeof s.contacts)[number]>) => setS({ ...s, contacts: s.contacts.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  const upT = (i: number, patch: Partial<(typeof s.tiers)[number]>) => setS({ ...s, tiers: s.tiers.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  return (
    <div className="space-y-4">
      <div className={`${box} space-y-3`}>
        <p className="text-divine-marigold">समिति की जानकारी</p>
        {row("समिति का नाम", "committeeName")}
        {row("गाँव", "village")}
        {row("ज़िला / राज्य", "district")}
        {row("हमारे बारे में", "about", true)}
        {row("ऊपर चलने वाली सूचना पट्टी (एक लाइन)", "notice", true)}
        {row("सूचना पेज का शीर्षक", "noticeTitle")}
        {row("पूजा की तिथि", "pujaDates")}
        {row("आरती का समय", "aartiTime")}
      </div>
      <div className={`${box} space-y-3`}>
        <p className="text-divine-marigold">🔴 लाइव प्रसारण (आरती / विसर्जन)</p>
        <label className="flex items-center gap-2 text-sm text-divine-cream/80">
          <input type="checkbox" className="h-4 w-4 accent-divine-orange" checked={s.liveOn} onChange={(e) => setS({ ...s, liveOn: e.target.checked })} />
          LIVE चालू है (होम पेज और मेन्यू में लाल “LIVE” बटन दिखेगा)
        </label>
        {row("YouTube / Facebook लाइव का लिंक (https://…)", "liveUrl")}
        {row("बटन पर लिखा नाम", "liveTitle")}
      </div>
      <div className={`${box} space-y-3`}>
        <p className="text-divine-marigold">दान एवं भुगतान</p>
        {row("लक्ष्य राशि ₹ (प्रगति-पट्टी इसी से बनती है)", "goal")}
        {row("UPI ID", "upiId")}
        {row("UPI पर दिखने वाला नाम", "upiName")}
        {row("WhatsApp नंबर (91 के साथ, जैसे 919876543210)", "whatsapp")}
      </div>
      <div className={`${box} space-y-3`}>
        <p className="text-divine-marigold">दानदाता स्तर — राशि के हिसाब से फ़ोटो का आकार</p>
        <p className="text-xs text-divine-cream/55">जिसका दान “कम से कम राशि” पार करे, उसे वही स्तर और आकार मिलता है। आकार 48–400 px।</p>
        {s.tiers.map((t, i) => (
          <div key={i} className="space-y-2 rounded-xl border border-divine-gold/15 p-2">
            <div className="grid grid-cols-[1fr_1fr_80px_auto] gap-2">
              <input className={inp} value={t.label} placeholder="स्तर का नाम" onChange={(e) => upT(i, { label: e.target.value })} />
              <input className={inp} type="number" value={t.min} placeholder="कम से कम ₹" onChange={(e) => upT(i, { min: Number(e.target.value) })} />
              <input className={inp} type="number" value={t.size} placeholder="px" onChange={(e) => upT(i, { size: Number(e.target.value) })} />
              <button className={btnGhost} onClick={() => setS({ ...s, tiers: s.tiers.filter((_, j) => j !== i) })}>✕</button>
            </div>
            <input className={inp} value={t.thanks ?? ""} placeholder="इस स्तर के लिए धन्यवाद संदेश (रसीद और दीवार पर दिखेगा)" onChange={(e) => upT(i, { thanks: e.target.value })} />
          </div>
        ))}
        <button className={btnGhost} onClick={() => setS({ ...s, tiers: [...s.tiers, { label: "नया स्तर", min: 0, size: 100, thanks: "" }] })}>+ स्तर जोड़ें</button>
      </div>
      <div className={`${box} space-y-3`}>
        <p className="text-divine-marigold">संपर्क</p>
        {s.contacts.map((c, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <input className={inp} value={c.name} placeholder="नाम (पद सहित)" onChange={(e) => upC(i, { name: e.target.value })} />
            <input className={inp} value={c.phone} placeholder="फ़ोन" onChange={(e) => upC(i, { phone: e.target.value })} />
            <button className={btnGhost} onClick={() => setS({ ...s, contacts: s.contacts.filter((_, j) => j !== i) })}>✕</button>
          </div>
        ))}
        <button className={btnGhost} onClick={() => setS({ ...s, contacts: [...s.contacts, { name: "", phone: "", role: "" }] })}>+ संपर्क जोड़ें</button>
      </div>
      <div className="flex flex-wrap gap-3">
        <button className={btn} onClick={() => run(() => mutate("settings", "update", { data: s }), "✅ सेटिंग सेव हुई")}>💾 सारी सेटिंग सेव करें</button>
        <button className={btnGhost} onClick={() => run(async () => { const r = await fetch("/api/admin/backup", { method: "POST" }); if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "भेज नहीं पाए"); }, "✅ Telegram पर बैकअप चला गया")}>📤 Telegram पर बैकअप भेजें</button>
        <button className={btnGhost} onClick={() => { const b = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `puja-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); }}>⬇️ पूरा बैकअप डाउनलोड</button>
      </div>
    </div>
  );
}
