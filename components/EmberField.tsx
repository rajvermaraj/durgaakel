"use client";

import { useEffect, useRef } from "react";

/** पूरी साइट के पीछे ऊपर उठती सुनहरी चिंगारियाँ (हवन/दीप की लौ जैसी) */
export default function EmberField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = ref.current!, g = cv.getContext("2d")!;
    let w = 0, h = 0, raf = 0, sy = 0;
    const N = window.innerWidth < 768 ? 45 : 90;
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 32;
    const sg = sprite.getContext("2d")!;
    const gr = sg.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, "rgba(255,240,190,1)");
    gr.addColorStop(0.3, "rgba(255,170,60,.7)");
    gr.addColorStop(1, "rgba(255,90,20,0)");
    sg.fillStyle = gr;
    sg.fillRect(0, 0, 32, 32);
    const P = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), z: 0.3 + Math.random() * 0.7, s: Math.random() * 6.28 }));
    const fit = () => { w = cv.width = innerWidth; h = cv.height = innerHeight; };
    const onScroll = () => (sy = scrollY);
    fit();
    addEventListener("resize", fit);
    addEventListener("scroll", onScroll, { passive: true });
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;
      g.clearRect(0, 0, w, h);
      g.globalCompositeOperation = "lighter";
      for (const p of P) {
        p.y -= 0.00045 * p.z;
        if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
        const x = (p.x + Math.sin(now / 1800 + p.s) * 0.02) * w;
        const y = (((p.y - (sy * 0.00008 * p.z)) % 1.1) + 1.1) % 1.1 * h;
        const size = 6 + p.z * 16;
        g.globalAlpha = (0.25 + 0.5 * Math.abs(Math.sin(now / 700 + p.s))) * p.z;
        g.drawImage(sprite, x - size / 2, y - size / 2, size, size);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", fit); removeEventListener("scroll", onScroll); };
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-[1] h-full w-full" />;
}
