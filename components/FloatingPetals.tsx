"use client";

import { useEffect, useState } from "react";

/** हल्की गिरती पंखुड़ियाँ (सिर्फ़ CSS — phone पर भी smooth) */
export default function FloatingPetals() {
  const [items, setItems] = useState<Array<{ left: number; size: number; dur: number; delay: number; sway: number }>>([]);

  useEffect(() => {
    const n = window.innerWidth < 768 ? 9 : 16;
    setItems(
      Array.from({ length: n }, () => ({
        left: Math.random() * 100,
        size: 8 + Math.random() * 9,
        dur: 11 + Math.random() * 12,
        delay: -Math.random() * 20,
        sway: (Math.random() - 0.5) * 160,
      }))
    );
  }, []);

  return (
    <>
      {items.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.72,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            ["--sway" as string]: `${p.sway}px`,
          }}
        />
      ))}
    </>
  );
}
