import type { Metadata, Viewport } from "next";
import "./globals.css";
import IntroZoom from "@/components/IntroZoom";
import TapDivine from "@/components/TapDivine";
import Nav from "@/components/Nav";
import DonateFab from "@/components/DonateFab";
import CustomCursor from "@/components/CustomCursor";
import FloatingPetals from "@/components/FloatingPetals";
import EmberField from "@/components/EmberField";
import { readDB } from "@/lib/db";

// notice हर बार DB से ताज़ा पढ़ी जाए, build के समय की नहीं
export const dynamic = "force-dynamic";

const TITLE = "अकेलवा पूर्व दुर्गा पूजा समिति · Akelwa Purva Durga Puja";
const DESC = "🪔 जय माता दी! ऑनलाइन दान करें, दानदाताओं की सूची, खर्च का पूरा हिसाब, कार्यक्रम और पूजा की फ़ोटो — बस्ती (उ.प्र.)";

// WhatsApp/Facebook पर लिंक भेजने पर माँ की फ़ोटो + नाम दिखे (SITE_URL .env.local में पूरा https पता रखें)
export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: TITLE,
  description: DESC,
  openGraph: {
    title: TITLE,
    description: DESC,
    type: "website",
    locale: "hi_IN",
    siteName: "Akelwa Purva Durga Puja",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "माँ दुर्गा" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/og.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#0b0720",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { settings } = readDB();

  return (
    <html lang="hi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&family=Noto+Serif+Devanagari:wght@600;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <EmberField />
        <IntroZoom />
        <TapDivine />
        <CustomCursor />
        <FloatingPetals />
        <Nav notice={settings.notice} live={settings.liveOn && settings.liveUrl ? { url: settings.liveUrl, title: settings.liveTitle } : undefined} />
        {children}
        <DonateFab />
      </body>
    </html>
  );
}
