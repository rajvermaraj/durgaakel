"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

/** नीचे तैरता हुआ "दान करें" बटन */
export default function DonateFab() {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.12], [0.9, 1]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 900);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <motion.div style={{ scale }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-24 right-4 z-[60] md:bottom-8">
      <Link
        href="/donate"
        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-divine-orange via-divine-crimson to-divine-red px-5 py-3 shadow-glowStrong transition-transform hover:scale-105"
      >
        <span className="animate-flicker text-xl">🪔</span>
        <span className="text-sm font-bold tracking-wide text-white">दान करें</span>
      </Link>
    </motion.div>
  );
}
