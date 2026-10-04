"use client";

import { useEffect, useRef } from "react";

/**
 * हर क्लिक/टच पर: कमल खिलता है, दो सुनहरी लहरें फैलती हैं, चिंगारियाँ बिखरती हैं
 * और पंखुड़ियाँ झरती हैं। Canvas पर चलता है — हल्का और smooth; animation ख़त्म होते ही रुक जाता है।
 */
export default function TapDivine() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = ref.current!, c = cv.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const resize = () => {
      cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
      cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    type Bloom = { x: number; y: number; t: number };
    type Ring = { x: number; y: number; t: number; max: number };
    type Part = { x: number; y: number; vx: number; vy: number; life: number; max: number; w: number; rot: number; vr: number; kind: 0 | 1 };
    const blooms: Bloom[] = [], rings: Ring[] = [], parts: Part[] = [];
    let raf = 0, running = false, last = 0;

    const petalPath = (len: number, w: number) => {
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(w, -len * 0.5, 0, -len);
      c.quadraticCurveTo(-w, -len * 0.5, 0, 0);
    };

    const frame = (now: number) => {
      const dt = Math.min(2.5, (now - last) / 16.67);
      last = now;
      c.clearRect(0, 0, innerWidth, innerHeight);
      c.globalCompositeOperation = "lighter";

      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.t += dt * 16.67;
        const p = r.t / r.max;
        if (p >= 1) { rings.splice(i, 1); continue; }
        if (p < 0) continue;
        const e = 1 - Math.pow(1 - p, 3);
        c.globalAlpha = (1 - p) * 0.9;
        c.strokeStyle = "#ffd166"; c.lineWidth = 3.5 * (1 - p) + 0.5;
        c.beginPath(); c.arc(r.x, r.y, 14 + e * 120, 0, Math.PI * 2); c.stroke();
      }

      for (let i = blooms.length - 1; i >= 0; i--) {
        const b = blooms[i];
        b.t += dt * 16.67;
        const p = b.t / 1000;
        if (p >= 1) { blooms.splice(i, 1); continue; }
        const grow = Math.min(1, p / 0.45), s = 1 + 2.2 * Math.pow(grow - 1, 3) + 1.2 * Math.pow(grow - 1, 2); // easeOutBack
        const fade = p < 0.55 ? 1 : 1 - (p - 0.55) / 0.45;
        c.save();
        c.translate(b.x, b.y);
        c.rotate(p * 0.9);
        const glow = c.createRadialGradient(0, 0, 0, 0, 0, 70 * s);
        glow.addColorStop(0, `rgba(255,214,120,${0.55 * fade})`); glow.addColorStop(1, "rgba(255,120,60,0)");
        c.globalAlpha = 1; c.fillStyle = glow; c.beginPath(); c.arc(0, 0, 70 * s, 0, Math.PI * 2); c.fill();
        for (let layer = 0; layer < 3; layer++) {
          const n = 8, len = (48 - layer * 13) * s, w = (17 - layer * 3) * s;
          for (let i2 = 0; i2 < n; i2++) {
            c.save();
            c.rotate((i2 / n) * Math.PI * 2 + layer * (Math.PI / n) + layer * 0.2);
            petalPath(len, w);
            const g = c.createLinearGradient(0, 0, 0, -len);
            g.addColorStop(0, "rgba(255,214,102,.9)"); g.addColorStop(1, layer === 1 ? "rgba(255,255,255,.9)" : "rgba(255,70,150,.9)");
            c.globalAlpha = fade * (0.55 + layer * 0.12);
            c.fillStyle = g; c.fill();
            c.strokeStyle = "rgba(255,240,200,.9)"; c.lineWidth = 1; c.stroke();
            c.restore();
          }
        }
        c.globalAlpha = fade; c.fillStyle = "#fff6d0";
        c.beginPath(); c.arc(0, 0, 6 * s, 0, Math.PI * 2); c.fill();
        c.restore();
      }

      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life += dt;
        if (p.life > p.max) { parts.splice(i, 1); continue; }
        const f = 1 - p.life / p.max;
        if (p.kind === 0) {
          p.vx *= 0.955; p.vy = p.vy * 0.955 + 0.07 * dt;
          const nx = p.x + p.vx * dt, ny = p.y + p.vy * dt;
          c.globalAlpha = f; c.strokeStyle = f > 0.5 ? "#fff1b8" : "#ffa733"; c.lineWidth = 2.2 * f + 0.4;
          c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2); c.stroke();
          p.x = nx; p.y = ny;
        } else {
          p.vy += 0.018 * dt; p.vx *= 0.99;
          p.x += (p.vx + Math.sin(p.life * 0.09 + p.rot) * 0.6) * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
          c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.scale(1, Math.abs(Math.cos(p.life * 0.07 + p.rot)) * 0.7 + 0.3);
          petalPath(p.w * 1.6, p.w * 0.6);
          c.globalAlpha = f * 0.9; c.fillStyle = p.w > 8 ? "rgba(255,90,160,.95)" : "rgba(255,200,90,.95)"; c.fill();
          c.restore();
        }
      }

      c.globalCompositeOperation = "source-over";
      if (blooms.length || rings.length || parts.length) raf = requestAnimationFrame(frame);
      else { running = false; c.clearRect(0, 0, innerWidth, innerHeight); }
    };

    const onDown = (e: PointerEvent) => {
      const x = e.clientX, y = e.clientY;
      blooms.push({ x, y, t: 0 });
      rings.push({ x, y, t: 0, max: 700 }, { x, y, t: -140, max: 800 });
      for (let i = 0; i < 22 && parts.length < 300; i++) {
        const a = Math.random() * Math.PI * 2, v = 2.5 + Math.random() * 6.5;
        parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: 0, max: 26 + Math.random() * 26, w: 3, rot: 0, vr: 0, kind: 0 });
      }
      for (let i = 0; i < 9 && parts.length < 300; i++) {
        const a = Math.random() * Math.PI * 2, v = 1.5 + Math.random() * 3.2;
        parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2.2, life: 0, max: 85 + Math.random() * 60, w: 6 + Math.random() * 7, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.14, kind: 1 });
      }
      if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed left-0 top-0 z-[95]" aria-hidden />;
}
