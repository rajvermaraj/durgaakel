"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const LINKS = [
  { href: "/", label: "होम", icon: "🏠" },
  { href: "/notice", label: "सूचना", icon: "📢" },
  { href: "/donors", label: "दानदाता", icon: "🏆" },
  { href: "/expenses", label: "खर्च", icon: "📊" },
  { href: "/gallery", label: "गैलरी", icon: "🖼️" },
  { href: "/donate", label: "दान", icon: "🪔" },
];

export default function Nav({ notice, live }: { notice?: string; live?: { url: string; title: string } }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300 ${
          scrolled ? "border-divine-gold/25 bg-divine-darker/85 backdrop-blur-lg" : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <motion.span
              animate={{ scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              className="text-2xl drop-shadow-[0_0_12px_rgba(255,167,51,.9)]"
            >
              🪔
            </motion.span>
            <span className="leading-tight">
              <span className="block font-display text-base font-bold text-gold-shimmer md:text-xl">
                अकेलवा पूर्व दुर्गा पूजा समिति
              </span>
              <span className="block text-[10px] tracking-[0.2em] text-divine-marigold/80 md:text-xs">
                ग्राम अकेलवा पूर्व · बस्ती (उ.प्र.)
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-4 py-2 text-sm transition-all ${
                  pathname === l.href
                    ? "bg-divine-crimson text-divine-brightGold shadow-glow"
                    : "text-divine-cream/85 hover:bg-divine-red/40 hover:text-divine-gold"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {live && <a href={live.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white"><span className="h-2 w-2 animate-ping rounded-full bg-white" />LIVE</a>}
            <Link
              href="/donate"
              className="ml-2 rounded-full bg-gradient-to-r from-divine-orange to-divine-crimson px-5 py-2 text-sm font-bold text-white shadow-glow transition-transform hover:scale-105"
            >
              अब दान करें
            </Link>
          </nav>

          {live && <a href={live.url} target="_blank" rel="noopener noreferrer" className="mr-2 flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white md:hidden"><span className="h-2 w-2 animate-ping rounded-full bg-white" />LIVE</a>}
          <button
            onClick={() => setOpen(true)}
            className="rounded-xl border border-divine-gold/30 px-3 py-1.5 text-2xl text-divine-gold md:hidden"
            aria-label="मेन्यू खोलें"
          >
            ☰
          </button>
        </div>

        {notice && (
          <div className="overflow-hidden border-t border-divine-gold/15 bg-divine-red/25 py-1.5">
            <motion.p
              animate={{ x: ["100%", "-100%"] }}
              transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
              className="whitespace-nowrap text-center text-xs text-divine-brightGold md:text-sm"
            >
              {notice}
            </motion.p>
          </div>
        )}
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-5 bg-divine-darker/97 backdrop-blur-xl"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-6 top-6 text-4xl text-divine-gold"
              aria-label="बंद करें"
            >
              ✕
            </button>
            {LINKS.map((l, i) => (
              <motion.div key={l.href} initial={{ y: 26, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.06 }}>
                <Link
                  href={l.href}
                  className={`font-display text-3xl ${
                    pathname === l.href ? "text-gold-shimmer" : "text-divine-cream hover:text-divine-gold"
                  }`}
                >
                  {l.icon} {l.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-divine-gold/25 bg-divine-darker/97 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-lg md:hidden">
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1 text-[10px] transition-all ${
                active ? "bg-divine-crimson/55 text-divine-brightGold shadow-glow" : "text-divine-cream/70"
              }`}
            >
              <span className={`text-xl ${active ? "animate-flicker" : ""}`}>{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
