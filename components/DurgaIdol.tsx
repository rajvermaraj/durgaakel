"use client";

import { useEffect, useRef, useState } from "react";
import { findDurgaImg } from "@/lib/durgaImg";

/**
 * हीरो में माँ दुर्गा। public/durga.(png|jpg|webp) मिले तो असली फ़ोटो (तैरती, माउस से झुकती, सुनहरी आभा के साथ);
 * न मिले तो 3D मूर्ति (Three.js)।
 */
export default function DurgaIdol({ size = 480 }: { size?: number }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [img, setImg] = useState<string | null>(null);

  useEffect(() => {
    let stop: (() => void) | undefined, cancelled = false, started = false;
    const start = async () => {
      if (started || cancelled) return;
      started = true;
      const src = await findDurgaImg();
      if (cancelled) return;
      if (src) return setImg(src);
      try {
        const { mountHero } = await import("./intro/durga3d");
        if (cancelled || !cv.current) return;
        stop = mountHero(cv.current);
      } catch {
        setFailed(true);
      }
    };
    const w = window as unknown as { __introDone?: boolean };
    if (w.__introDone) start();
    window.addEventListener("intro-done", start);
    const fallback = setTimeout(start, 16000);
    return () => {
      cancelled = true;
      clearTimeout(fallback);
      window.removeEventListener("intro-done", start);
      stop?.();
    };
  }, []);

  // असली फ़ोटो: माउस/टच के साथ हल्का 3D झुकाव
  useEffect(() => {
    if (!img) return;
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / innerWidth - 0.5) * 2, y = (e.clientY / innerHeight - 0.5) * 2;
      if (tilt.current) tilt.current.style.transform = `rotateY(${x * 9}deg) rotateX(${-y * 6}deg)`;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [img]);

  return (
    <div className="relative mx-auto" style={{ width: `min(94vw, ${size}px)`, aspectRatio: "1", perspective: 1000 }} aria-label="Maa Durga">
      {img ? (
        <div ref={tilt} className="relative h-full w-full transition-transform duration-300 ease-out" style={{ transformStyle: "preserve-3d" }}>
          <div className="absolute inset-[4%] animate-[spin_40s_linear_infinite] rounded-full opacity-70" style={{ background: "conic-gradient(from 0deg, rgba(255,209,102,.5), rgba(255,79,147,.15), rgba(255,209,102,.5), rgba(255,79,147,.15), rgba(255,209,102,.5))", maskImage: "radial-gradient(circle, transparent 60%, #000 62%, #000 66%, transparent 68%)", WebkitMaskImage: "radial-gradient(circle, transparent 60%, #000 62%, #000 66%, transparent 68%)" }} />
          <div className="absolute inset-[12%] rounded-full bg-divine-orange/30 blur-3xl animate-flicker" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img}
            alt="माँ दुर्गा"
            className="relative h-full w-full animate-floaty object-contain"
            style={{
              filter: "drop-shadow(0 0 28px rgba(255,167,51,.6)) saturate(1.1) contrast(1.05)",
            }}
          />
        </div>
      ) : failed ? (
        <div className="flex h-full items-center justify-center text-8xl">🔱</div>
      ) : (
        <canvas ref={cv} className="h-full w-full animate-[fadein_1.2s_ease_both]" />
      )}
    </div>
  );
}
