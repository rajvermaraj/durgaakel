"use client";

import { useEffect, useRef } from "react";

/** दिव्य कर्सर: दीप-ज्योति + घूमता कमल-चक्र + चिंगारियों की पूँछ (सिर्फ़ माउस वाले डिवाइस पर) */
export default function CustomCursor() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.body.classList.add("custom-cursor");
    const cv = ref.current!, c = cv.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const resize = () => {
      cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
      cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const mk = (a: string, b: string) => {
      const s = document.createElement("canvas"); s.width = s.height = 64;
      const g = s.getContext("2d")!, r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      r.addColorStop(0, a); r.addColorStop(0.4, b); r.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = r; g.fillRect(0, 0, 64, 64);
      return s;
    };
    const sprites = [mk("rgba(255,244,210,1)", "rgba(255,190,80,.55)"), mk("rgba(255,200,120,1)", "rgba(255,90,140,.45)")];

    type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; s: number; k: number };
    const ps: P[] = [];
    let mx = -300, my = -300, rx = -300, ry = -300, px = -300, py = -300, hover = 0, hoverT = 0, press = 0, pressT = 0, ang = 0, raf = 0;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX; my = e.clientY;
      hoverT = (e.target as HTMLElement)?.closest?.("a,button,[role=button],input,textarea,select,label") ? 1 : 0;
    };
    const onDown = () => (pressT = 1);
    const onUp = () => (pressT = 0);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("resize", resize);

    const petal = (r: number) => {
      c.beginPath();
      c.moveTo(0, -r * 0.55);
      c.quadraticCurveTo(r * 0.34, -r * 0.95, 0, -r * 1.45);
      c.quadraticCurveTo(-r * 0.34, -r * 0.95, 0, -r * 0.55);
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;
      c.clearRect(0, 0, innerWidth, innerHeight);
      hover += (hoverT - hover) * 0.15;
      press += (pressT - press) * 0.3;
      rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
      ang += 0.012 + hover * 0.05;

      // चिंगारियाँ: गति के हिसाब से
      const sp = Math.hypot(mx - px, my - py);
      const n = Math.min(4, Math.floor(sp / 6) + (Math.random() < 0.25 ? 1 : 0));
      for (let i = 0; i < n && ps.length < 140; i++)
        ps.push({ x: mx + (Math.random() - 0.5) * 6, y: my + (Math.random() - 0.5) * 6, vx: (Math.random() - 0.5) * 0.9 - (mx - px) * 0.04, vy: -0.3 - Math.random() * 0.9, life: 0, max: 34 + Math.random() * 30, s: 5 + Math.random() * 11, k: Math.random() < 0.7 ? 0 : 1 });
      px = mx; py = my;

      c.globalCompositeOperation = "lighter";
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        if (++p.life > p.max) { ps.splice(i, 1); continue; }
        p.x += p.vx; p.y += p.vy; p.vx *= 0.985;
        const f = 1 - p.life / p.max, sz = p.s * (0.4 + f);
        c.globalAlpha = f * 0.85;
        c.drawImage(sprites[p.k], p.x - sz, p.y - sz, sz * 2, sz * 2);
      }

      // कमल-चक्र (8 पंखुड़ियाँ)
      const R = (15 + hover * 9) * (1 - press * 0.3);
      c.save();
      c.translate(rx, ry);
      c.globalAlpha = 0.55 + hover * 0.4;
      c.strokeStyle = "#ffd166"; c.lineWidth = 1.2;
      c.beginPath(); c.arc(0, 0, R, 0, Math.PI * 2); c.stroke();
      for (let i = 0; i < 8; i++) {
        c.save();
        c.rotate(ang + (i * Math.PI) / 4);
        petal(R * 0.8);
        c.fillStyle = i % 2 ? "rgba(255,90,150,.35)" : "rgba(255,190,80,.4)";
        c.fill();
        c.globalAlpha = 0.9; c.stroke();
        c.restore();
      }
      if (hover > 0.05) {
        c.globalAlpha = hover * 0.6; c.setLineDash([2, 5]);
        c.rotate(-ang * 2); c.beginPath(); c.arc(0, 0, R * 1.75, 0, Math.PI * 2); c.stroke();
      }
      c.restore();

      // दीप-ज्योति (कर्सर का केंद्र)
      const fl = 1 + Math.sin(now / 90) * 0.08;
      c.globalAlpha = 1;
      c.drawImage(sprites[0], mx - 20, my - 20, 40, 40);
      c.save();
      c.translate(mx, my);
      c.scale(fl * (1 - press * 0.25), fl * (1 - press * 0.25));
      const gr = c.createLinearGradient(0, -9, 0, 7);
      gr.addColorStop(0, "#fffbe8"); gr.addColorStop(0.5, "#ffc94d"); gr.addColorStop(1, "#ff5a2a");
      c.fillStyle = gr;
      c.beginPath();
      c.moveTo(0, -10); c.bezierCurveTo(6, -3, 5, 5, 0, 7); c.bezierCurveTo(-5, 5, -6, -3, 0, -10);
      c.fill();
      c.restore();
      c.globalCompositeOperation = "source-over";
    };
    raf = requestAnimationFrame(tick);

    return () => {
      document.body.classList.remove("custom-cursor");
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="pointer-events-none fixed left-0 top-0 z-[96] hidden md:block" aria-hidden />;
}
