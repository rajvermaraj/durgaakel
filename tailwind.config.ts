import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        divine: {
          red: "#5a1470",
          crimson: "#c2185b",
          orange: "#ff7b1c",
          marigold: "#ffa733",
          gold: "#ffd166",
          brightGold: "#ffe9a3",
          deep: "#0b0720",
          darker: "#05030f",
          cream: "#fff3e0",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(255, 167, 51, 0.45)",
        glowStrong: "0 0 48px rgba(255, 123, 28, 0.6)",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
      animation: {
        flicker: "flicker 2.5s ease-in-out infinite",
        floaty: "floaty 5s ease-in-out infinite",
        shimmer: "shimmer 4s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
