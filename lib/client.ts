"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PublicData } from "@/lib/types";

/** हर 6 सेकंड में data refresh — इसलिए नया दान सबके मोबाइल पर दिख जाता है */
export function usePujaData(pollMs = 6000) {
  const [data, setData] = useState<PublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/data", { cache: "no-store" });
      if (res.ok) setData((await res.json()) as PublicData);
    } catch {
      /* offline — पुराना data दिखता रहेगा */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    timer.current = setInterval(load, pollMs);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      if (timer.current) clearInterval(timer.current);
      window.removeEventListener("focus", onFocus);
    };
  }, [load, pollMs, tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const ranked = useMemo(
    () => [...(data?.donations ?? [])].sort((a, b) => b.amount - a.amount),
    [data?.donations]
  );

  return { data, loading, ranked, refresh };
}

/** ₹ भारतीय तरीके से: 1,20,000 */
export function formatINR(n: number) {
  return "₹" + Math.round(n || 0).toLocaleString("en-IN");
}

/** 25 अक्टूबर, सुबह 9:30 */
export function formatDateHi(ts: number) {
  try {
    return new Date(ts).toLocaleString("hi-IN", {
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return new Date(ts).toLocaleDateString("hi-IN");
  }
}

/** 0 से target तक animation के साथ गिनती */
export function useCountUp(target: number, duration = 1800) {
  const [value, setValue] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const begin = from.current;
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(begin + (target - begin) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/** ₹3.2 लाख / ₹5 लाख जैसा छोटा रूप */
export function formatLakh(n: number) {
  n = Math.round(n || 0);
  if (n >= 10000000) return "₹" + (n / 10000000).toFixed(2).replace(/\.?0+$/, "") + " करोड़";
  if (n >= 100000) return "₹" + (n / 100000).toFixed(2).replace(/\.?0+$/, "") + " लाख";
  return formatINR(n);
}
