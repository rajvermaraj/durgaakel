"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatINR, formatLakh, usePujaData } from "@/lib/client";
import PhotoCropper from "@/components/PhotoCropper";
import ReceiptCard from "@/components/ReceiptCard";
import { DEFAULT_TIERS, tierOf, type Receipt } from "@/lib/types";

const PRESETS = [101, 251, 501, 1100, 2100, 5100];

export default function DonatePage() {
  const { data } = usePujaData(30000);
  const s = data?.settings;

  const [amount, setAmount] = useState<number>(501);
  const [name, setName] = useState("");
  const [village, setVillage] = useState("");
  const [message, setMessage] = useState("");
  const [txnId, setTxnId] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [photo, setPhoto] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const [phone, setPhone] = useState("");
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [rk, setRk] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  /** क्रॉप की हुई (600×600) फ़ोटो भेजें */
  async function uploadCropped(blob: Blob) {
    setCropFile(null);
    setError("");
    setPhotoBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", new File([blob], "p.jpg", { type: "image/jpeg" }));
      const r = await fetch("/api/donate/photo", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "फ़ोटो नहीं गई");
      setPhoto(j.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "फ़ोटो नहीं गई");
    } finally {
      setPhotoBusy(false);
    }
  }

  // दान दर्ज होने के बाद: पुष्टि होते ही रसीद अपने-आप दिखे
  useEffect(() => {
    if (!rk) return;
    let stop = false;
    const load = async () => {
      const r = await fetch(`/api/receipt?k=${encodeURIComponent(rk)}`, { cache: "no-store" });
      if (!stop && r.ok) setReceipt(await r.json());
    };
    load();
    const t = setInterval(() => { if (!receipt || receipt.status === "pending") load(); }, 7000);
    return () => { stop = true; clearInterval(t); };
  }, [rk, receipt]);


  const validAmt = Number.isFinite(amount) && amount >= 11;
  const upiLink = s
    ? `upi://pay?pa=${encodeURIComponent(s.upiId)}&pn=${encodeURIComponent(s.upiName || s.committeeName)}&cu=INR${
        validAmt ? `&am=${amount}` : ""
      }&tn=${encodeURIComponent("दुर्गा पूजा दान")}`
    : "#";

  const tiers = s?.tiers ?? DEFAULT_TIERS;
  const tier = validAmt ? tiers[tierOf(amount, tiers)] : null;
  const goal = s?.goal ?? 0;
  const total = data?.total ?? 0;
  const pct = goal > 0 ? Math.min(100, (total / goal) * 100) : 0;
  const qrUrl = `/api/qr?amt=${amount}`;
  const upiQuery = s ? `pa=${encodeURIComponent(s.upiId)}&pn=${encodeURIComponent(s.upiName || s.committeeName)}&cu=INR${validAmt ? `&am=${amount}` : ""}&tn=${encodeURIComponent("दुर्गा पूजा दान")}` : "";
  const [copied, setCopied] = useState(false);

  async function submit() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, amount, village, message, anonymous, txnId, phone, photo: anonymous ? "" : photo }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "कुछ गड़बड़ हुई");
      setRk(j.rk || "");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "कुछ गड़बड़ हुई");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-2xl border border-divine-gold/25 bg-divine-darker/60 px-4 py-3 text-divine-brightGold outline-none focus:border-divine-gold";

  return (
    <main className="min-h-screen px-4 pb-32 pt-32">
      {cropFile && <PhotoCropper file={cropFile} onCancel={() => setCropFile(null)} onDone={uploadCropped} />}
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-center font-display text-4xl font-bold text-gold-shimmer md:text-5xl">🪔 माँ के चरणों में दान</h1>
        <p className="mb-9 text-center text-sm tracking-widest text-divine-cream/65">
          पहले UPI से भुगतान करें, फिर नीचे अपना नाम दर्ज करें
        </p>

        {goal > 0 && (
          <div className="mx-auto mb-8 max-w-xl rounded-2xl border border-divine-gold/25 bg-divine-darker/60 p-4">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-xl font-bold text-divine-brightGold">{formatLakh(total)} <span className="text-sm font-normal text-divine-cream/60">/ {formatLakh(goal)}</span></p>
              <p className="text-sm text-divine-gold">{pct.toFixed(0)}% पूरा</p>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-divine-red/40">
              <div className="h-full rounded-full bg-gradient-to-r from-divine-marigold via-divine-orange to-divine-crimson shadow-glow transition-all duration-1000" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-center text-xs text-divine-cream/60">अब तक {data?.donorCount ?? 0} भक्तों ने सहयोग किया — आप भी जुड़ें 🙏</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-divine-gold/40 bg-divine-darker/70 p-10 text-center shadow-glow"
            >
              {receipt?.status === "confirmed" ? (
                <>
                  <p className="mb-5 font-display text-xl text-gold-shimmer">आपकी रसीद तैयार है 🙏</p>
                  <ReceiptCard r={receipt} rk={rk} />
                </>
              ) : (
                <>
                  <p className="text-6xl">🪔</p>
                  <h2 className="mt-3 font-display text-3xl text-gold-shimmer">धन्यवाद! जय माता दी 🙏</h2>
                  <p className="mx-auto mt-3 max-w-md text-divine-cream/80">
                    आपका {formatINR(amount)} का दान दर्ज हो गया है। कोषाध्यक्ष भुगतान की पुष्टि करेंगे — पुष्टि होते ही <b>आपकी धन्यवाद रसीद इसी पेज पर अपने-आप दिख जाएगी</b> और नाम दानदाताओं की सूची में जुड़ जाएगा।
                  </p>
                  {rk && <a href={`/receipt/${rk}`} className="mt-3 inline-block text-sm text-divine-gold underline">रसीद का लिंक (बाद में देखने के लिए सहेज लें)</a>}
                </>
              )}
              <button
                onClick={() => {
                  setDone(false);
                  setName("");
                  setMessage("");
                  setTxnId("");
                  setPhoto("");
                  setRk("");
                  setReceipt(null);
                }}
                className="mt-7 rounded-full border border-divine-gold/45 px-6 py-3 text-divine-brightGold hover:bg-divine-red/40"
              >
                एक और दान करें
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" className="grid gap-6 md:grid-cols-2">
              {/* चरण 1: भुगतान */}
              <section className="glass p-6">
                <h2 className="mb-4 font-display text-xl text-divine-brightGold">1️⃣ राशि चुनें और भुगतान करें</h2>
                <div className="mb-4 grid grid-cols-3 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setAmount(p)}
                      className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${
                        amount === p
                          ? "bg-divine-crimson text-divine-brightGold shadow-glow"
                          : "border border-divine-gold/25 text-divine-cream/80 hover:bg-divine-red/30"
                      }`}
                    >
                      ₹{p.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  min={11}
                  value={Number.isFinite(amount) ? amount : ""}
                  onChange={(e) => setAmount(e.target.value === "" ? NaN : Number(e.target.value))}
                  placeholder="अपनी राशि (₹)"
                  className={input}
                />

                {tier && (
                  <p className="mt-3 rounded-xl bg-divine-red/30 px-3 py-2 text-center text-xs text-divine-cream/85">
                    👑 इस राशि पर आप <b className="text-divine-brightGold">{tier.label}</b> में गिने जाएँगे{tier.size >= 150 ? " — दानदाता दीवार पर बड़ी फ़ोटो के साथ" : ""}
                  </p>
                )}

                <div className="mt-5 flex flex-col items-center">
                  {validAmt ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrUrl} alt="UPI QR" className="aspect-square w-[min(78vw,320px)] rounded-2xl border-4 border-divine-gold/60 bg-divine-cream" />
                      <a href={`${qrUrl}&dl=1`} download="durga-puja-qr.png" className="mt-2 text-xs text-divine-gold underline">⬇️ QR फ़ोटो सेव करें (गैलरी से किसी भी UPI ऐप में स्कैन करें)</a>
                    </>
                  ) : (
                    <p className="py-10 text-sm text-divine-cream/60">कम से कम ₹11 डालें</p>
                  )}

                  <p className="mt-4 text-sm text-divine-cream/80">UPI ID: <b className="text-divine-brightGold">{s?.upiId}</b></p>
                  <button
                    onClick={() => { navigator.clipboard?.writeText(s?.upiId ?? ""); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    className="mt-1 rounded-full border border-divine-gold/40 px-4 py-1.5 text-xs text-divine-brightGold hover:bg-divine-red/40"
                  >
                    {copied ? "✅ कॉपी हो गया" : "📋 UPI ID कॉपी करें"}
                  </button>

                  {validAmt && (
                    <div className="mt-5 w-full space-y-2 md:hidden">
                      <a href={upiLink} className="block rounded-full bg-gradient-to-r from-divine-orange to-divine-crimson px-7 py-3 text-center font-bold text-white shadow-glowStrong">UPI ऐप खोलें →</a>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <a href={`tez://upi/pay?${upiQuery}`} className="rounded-xl border border-divine-gold/30 py-2 text-divine-cream/85">Google Pay</a>
                        <a href={`phonepe://pay?${upiQuery}`} className="rounded-xl border border-divine-gold/30 py-2 text-divine-cream/85">PhonePe</a>
                        <a href={`paytmmp://pay?${upiQuery}`} className="rounded-xl border border-divine-gold/30 py-2 text-divine-cream/85">Paytm</a>
                      </div>
                    </div>
                  )}
                  <p className="mt-3 text-center text-[11px] leading-relaxed text-divine-cream/55">
                    ऐप न खुले तो: ऊपर का QR किसी दूसरे फ़ोन से स्कैन करें, या QR सेव करके अपने UPI ऐप में “गैलरी से स्कैन” चुनें, या UPI ID कॉपी करके भेजें।
                    WhatsApp/Facebook के अंदर यह पेज खुला हो तो ⋮ दबाकर “Chrome/ब्राउज़र में खोलें” चुनें।
                  </p>
                </div>
              </section>

              {/* चरण 2: विवरण */}
              <section className="glass p-6">
                <h2 className="mb-4 font-display text-xl text-divine-brightGold">2️⃣ भुगतान के बाद विवरण भरें</h2>
                <div className="space-y-3">
                  <input value={name} onChange={(e) => setName(e.target.value)} disabled={anonymous} placeholder="आपका नाम" maxLength={60} className={`${input} disabled:opacity-40`} />
                  <input value={village} onChange={(e) => setVillage(e.target.value)} placeholder="गाँव (वैकल्पिक)" maxLength={40} className={input} />
                  <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="माँ के लिए संदेश (वैकल्पिक)" maxLength={140} className={input} />
                  <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" placeholder="WhatsApp नंबर (वैकल्पिक — सिर्फ़ रसीद के लिए, कहीं दिखेगा नहीं)" className={input} />
                  <input value={txnId} onChange={(e) => setTxnId(e.target.value)} placeholder="UPI Ref / Transaction ID (पुष्टि में मदद करेगा)" maxLength={30} className={input} />
                  {!anonymous && (
                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-divine-gold/40 p-3 text-sm text-divine-cream/80">
                      {photo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={photo} alt="आपकी फ़ोटो" className="h-14 w-14 rounded-full border-2 border-divine-gold object-cover" /> : <span className="flex h-14 w-14 items-center justify-center rounded-full bg-divine-red/50 text-2xl">📷</span>}
                      <span>{photoBusy ? "फ़ोटो जा रही है…" : photo ? "फ़ोटो बदलें" : "अपनी फ़ोटो जोड़ें (वैकल्पिक) — दान के अनुसार दानदाता दीवार पर दिखेगी"}</span>
                      <input type="file" accept="image/*" hidden disabled={photoBusy} onChange={(e) => { const f = e.target.files?.[0]; if (f) setCropFile(f); e.target.value = ""; }} />
                    </label>
                  )}
                  <label className="flex items-center gap-2 text-sm text-divine-cream/80">
                    <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="h-4 w-4 accent-divine-orange" />
                    अज्ञात रहकर दान करें
                  </label>
                </div>

                {error && <p className="mt-4 rounded-xl bg-divine-red/40 px-4 py-2 text-sm text-divine-brightGold">{error}</p>}

                <button
                  onClick={submit}
                  disabled={busy || !validAmt}
                  className="mt-5 w-full rounded-full bg-gradient-to-r from-divine-orange to-divine-crimson py-3.5 font-bold text-white shadow-glowStrong transition-transform enabled:hover:scale-[1.02] disabled:opacity-50"
                >
                  {busy ? "दर्ज हो रहा है…" : `✅ मैंने ${validAmt ? formatINR(amount) : ""} का भुगतान कर दिया`}
                </button>
                <p className="mt-3 text-center text-[11px] text-divine-cream/50">
                  भुगतान की पुष्टि के बाद ही आपका नाम सूची में दिखेगा।
                </p>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
