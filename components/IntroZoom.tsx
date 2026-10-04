"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { findDurgaImg } from "@/lib/durgaImg";

/** 4 स्टेज: ब्रह्मांड → पृथ्वी → अकेलवा → 3D माँ दुर्गा का प्रकट होना (~9 सेकंड) */
const STAGES = [
  { label: "ब्रह्मांड", sub: "आकाश से चलो…" },
  { label: "पृथ्वी", sub: "हमारी धरती" },
  { label: "अकेलवा पूर्व", sub: "बस्ती · उत्तर प्रदेश" },
  { label: "जय माता दी 🙏", sub: "माँ दुर्गा का दरबार" },
];

export default function IntroZoom() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speedRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [done, setDone] = useState(false);
  const [run, setRun] = useState(0);
  const [img, setImg] = useState<string | null>(null);
  const imgRef = useRef<string | null>(null);

  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  /** intro बंद करो: scroll वापस खोलो और 3D loop (GPU) रोको */
  const finish = useCallback((delay: number) => {
    setLeaving(true);
    setTimeout(() => {
      document.body.style.overflow = "";
      cleanupRef.current?.();
      cleanupRef.current = undefined;
      (window as unknown as { __introDone?: boolean }).__introDone = true;
      window.dispatchEvent(new Event("intro-done"));
      setDone(true);
    }, delay);
  }, []);

  useEffect(() => {
    // बिना 3D के सीधे साइट: motion कम करने की सेटिंग / धीमा फ़ोन / डेटा-सेवर / कम RAM / 12 घंटे में पहले देख चुके
    // (टेस्ट के लिए पता में ?intro=1 जोड़ें)
    try {
      const n = navigator as unknown as { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string } };
      const force = run > 0 || new URLSearchParams(location.search).get("intro") === "1";
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const slow = (n.deviceMemory !== undefined && n.deviceMemory <= 2) || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 3) || Boolean(n.connection?.saveData) || /(^|slow-)?[23]g/.test(n.connection?.effectiveType ?? "");
      const seenAt = Number(localStorage.getItem("intro_seen") || 0);
      if (!force && (reduce || slow || Date.now() - seenAt < 12 * 3600_000)) {
        finish(0);
        return;
      }
      localStorage.setItem("intro_seen", String(Date.now()));
    } catch { /* storage बंद हो तो intro चलने दें */ }
    document.body.style.overflow = "hidden";
    findDurgaImg().then((u) => { imgRef.current = u; setImg(u); });
    let cancelled = false;
    // सुरक्षा: कुछ भी अटके तो 15 सेकंड में अपने-आप खुल जाए
    const safety = setTimeout(() => finish(300), 15000);

    import("./intro/IntroScene")
      .then(({ buildIntro }) => {
        if (cancelled || !canvasRef.current) return;
        try {
          cleanupRef.current = buildIntro(canvasRef.current, speedRef.current, setStage, () => finish(1000), () => Boolean(imgRef.current));
        } catch {
          finish(100); // WebGL न चले तो सीधे वेबसाइट दिखाओ
        }
      })
      .catch(() => finish(100));

    return () => {
      cancelled = true;
      clearTimeout(safety);
      cleanupRef.current?.();
      document.body.style.overflow = "";
    };
  }, [finish, run]);

  const skip = () => finish(450);

  const replay = () => {
    setStage(0);
    setLeaving(false);
    setDone(false);
    setRun((n) => n + 1);
  };

  // intro छूट गया हो (पहले देख चुके / धीमा फ़ोन) तो भी यात्रा दोबारा देखने का बटन
  if (done)
    return (
      <button
        onClick={replay}
        className="fixed bottom-20 left-3 z-[60] flex items-center gap-2 rounded-full border border-divine-gold/50 bg-divine-darker/85 px-4 py-2.5 text-xs font-semibold text-divine-brightGold shadow-glow backdrop-blur-md transition-transform hover:scale-105 md:bottom-6 md:left-5 md:text-sm"
        aria-label="ब्रह्मांड से अकेलवा तक की यात्रा देखें"
      >
        <span>🌌</span>ब्रह्मांड से अकेलवा यात्रा देखें
      </button>
    );

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden bg-[#04010a] transition-all duration-[900ms] ${
        leaving ? "opacity-0 scale-110" : "opacity-100 scale-100"
      }`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* रफ़्तार की लकीरें (3D scene इनकी opacity चलाता है) */}
      <div
        ref={speedRef}
        className="pointer-events-none absolute -inset-1/4 opacity-0 transition-opacity duration-200"
        style={{
          background:
            "repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,214,102,0.16) 0deg 0.35deg, transparent 0.35deg 3deg)",
          maskImage: "radial-gradient(circle at 50% 50%, transparent 12%, black 72%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, transparent 12%, black 72%)",
        }}
      />

      {/* धरती से दिव्य लोक में प्रवेश: सुनहरा प्रकाश-विस्फोट */}
      {stage === 3 && (
        <motion.div
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 1.6 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,#fff6d6,rgba(255,196,80,0.9)_28%,rgba(255,90,140,0.45)_55%,transparent_75%)]"
        />
      )}

      {/* असली दुर्गा फ़ोटो (public/durga.*) — सुनहरे मंडल के साथ प्रकट */}
      {stage === 3 && img && (
        <motion.div
          className="pointer-events-none absolute inset-0 flex items-center justify-center pb-[16%]"
          initial={{ opacity: 0, scale: 0.6, filter: "blur(14px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mandala" />
          <div className="mandala rev" />
          <div className="absolute h-[60vmin] w-[60vmin] rounded-full bg-divine-orange/35 blur-3xl" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img}
            alt=""
            className="relative max-h-[62vh] max-w-[88vw] object-contain"
            style={{
              filter: "drop-shadow(0 0 30px rgba(255,167,51,.7))",
            }}
          />
        </motion.div>
      )}

      {/* कैप्शन */}
      <div className="absolute bottom-[11%] left-0 right-0 px-6 text-center">
        <motion.p
          key={`sub-${stage}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 text-sm tracking-[0.3em] text-divine-marigold/90 md:text-base"
        >
          {STAGES[stage].sub}
        </motion.p>
        <motion.h1
          key={`label-${stage}`}
          initial={{ opacity: 0, scale: 0.85, filter: "blur(12px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-4xl font-bold text-gold-shimmer drop-shadow-[0_0_30px_rgba(255,167,51,0.55)] md:text-7xl"
        >
          {STAGES[stage].label}
        </motion.h1>
      </div>

      {/* यात्रा के बिंदु */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
        {STAGES.map((s, i) => (
          <span
            key={s.label}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === stage ? "w-8 bg-divine-gold shadow-glow" : i < stage ? "w-3 bg-divine-orange/70" : "w-3 bg-white/20"
            }`}
          />
        ))}
      </div>

      <button
        onClick={skip}
        className="absolute right-5 top-5 z-10 rounded-full border border-divine-gold/60 bg-black/50 px-6 py-3 text-sm font-semibold tracking-wider text-divine-brightGold backdrop-blur-sm hover:text-divine-gold"
      >
        सीधे साइट पर जाएँ ✕
      </button>
    </div>
  );
}
