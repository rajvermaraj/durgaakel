"use client";

import { useEffect, useRef, useState } from "react";

/**
 * वर्गाकार क्रॉप: फ़ोटो को उँगली से खिसकाएँ, स्लाइडर से ज़ूम करें, चेहरा गोले के बीच में लाएँ।
 * नतीजा 600×600 JPEG (दानदाता दीवार में गोल दिखेगी)।
 */
export default function PhotoCropper({ file, onCancel, onDone }: { file: File; onCancel: () => void; onDone: (blob: Blob) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement | null>(null);
  const [src, setSrc] = useState("");
  const [nat, setNat] = useState({ w: 0, h: 0 });
  const [S, setS] = useState(280);
  const [zoom, setZoom] = useState(1);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const u = URL.createObjectURL(file);
    setSrc(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const scaleOf = (z: number, s = S) => (nat.w ? (s / Math.min(nat.w, nat.h)) * z : 1);
  const clamp = (o: { x: number; y: number }, z: number, s = S) => {
    const sc = scaleOf(z, s);
    return { x: Math.min(0, Math.max(s - nat.w * sc, o.x)), y: Math.min(0, Math.max(s - nat.h * sc, o.y)) };
  };

  const onLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    img.current = el;
    const s = box.current?.clientWidth || 280;
    setS(s);
    setNat({ w: el.naturalWidth, h: el.naturalHeight });
    const sc = s / Math.min(el.naturalWidth, el.naturalHeight);
    setOff({ x: (s - el.naturalWidth * sc) / 2, y: (s - el.naturalHeight * sc) / 2 });
  };

  const changeZoom = (z: number) => {
    // ज़ूम करते समय बीच का हिस्सा स्थिर रहे
    const old = scaleOf(zoom), cx = (S / 2 - off.x) / old, cy = (S / 2 - off.y) / old;
    const sc = scaleOf(z);
    setZoom(z);
    setOff(clamp({ x: S / 2 - cx * sc, y: S / 2 - cy * sc }, z));
  };

  const down = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: off.x, oy: off.y };
  };
  const move = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setOff(clamp({ x: drag.current.ox + e.clientX - drag.current.x, y: drag.current.oy + e.clientY - drag.current.y }, zoom));
  };
  const up = () => { drag.current = null; };

  const done = () => {
    if (!img.current) return;
    const sc = scaleOf(zoom);
    const c = document.createElement("canvas");
    c.width = c.height = 600;
    c.getContext("2d")!.drawImage(img.current, -off.x / sc, -off.y / sc, S / sc, S / sc, 0, 0, 600, 600);
    c.toBlob((b) => b && onDone(b), "image/jpeg", 0.88);
  };

  const sc = scaleOf(zoom);
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4">
      <div className="w-full max-w-sm rounded-3xl border border-divine-gold/40 bg-divine-darker p-5 text-center">
        <p className="mb-1 font-display text-lg text-divine-brightGold">फ़ोटो सेट करें</p>
        <p className="mb-3 text-xs text-divine-cream/60">उँगली से खिसकाकर चेहरा गोले के बीच में लाएँ</p>
        <div ref={box} className="relative mx-auto aspect-square w-full max-w-[320px] touch-none select-none overflow-hidden rounded-2xl bg-black" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          {src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" onLoad={onLoad} draggable={false} className="absolute left-0 top-0 max-w-none origin-top-left" style={{ width: nat.w || undefined, height: nat.h || undefined, transform: `translate(${off.x}px, ${off.y}px) scale(${sc})`, opacity: nat.w ? 1 : 0 }} />
          )}
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, transparent 0, transparent 69.5%, rgba(0,0,0,.62) 70.5%)" }} />
          <div className="pointer-events-none absolute inset-0 rounded-full border-2 border-divine-gold/80" />
        </div>
        <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => changeZoom(Number(e.target.value))} className="mt-4 w-full accent-divine-orange" aria-label="ज़ूम" />
        <div className="mt-4 flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-full border border-divine-gold/40 py-2.5 text-sm text-divine-cream/80">रद्द करें</button>
          <button onClick={done} className="flex-1 rounded-full bg-divine-crimson py-2.5 text-sm font-bold text-divine-brightGold">✂️ यही रखें</button>
        </div>
      </div>
    </div>
  );
}
