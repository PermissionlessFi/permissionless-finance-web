import type { Metadata } from "next";
import { Inter, Source_Serif_4, Spectral, Noto_Serif_SC } from "next/font/google";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, AUTHOR_NAME, SITE_X_HANDLE, AUTHOR_X_HANDLE } from "@/lib/site";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
// Self-hosted (bundled) KaTeX CSS — must come before globals so our
// overrides win, and so math still renders when a CDN is blocked.
import "katex/dist/katex.min.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

const spectral = Spectral({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-spectral",
  display: "swap",
});

// Primary reading serif (restored — matches the original design). Loaded with
// the latin subset (as before); CJK glyphs fall back to a system serif via the
// font stack in globals.css.
const notoSerifSC = Noto_Serif_SC({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-noto-serif-sc",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME.en} — Perpetual Futures Microstructure`,
    template: "%s", // chapter pages supply their full title
  },
  description: SITE_DESCRIPTION.en,
  authors: [{ name: AUTHOR_NAME }],
  creator: AUTHOR_NAME,
  publisher: AUTHOR_NAME,
  keywords: [
    "perpetual futures microstructure", "market microstructure", "perpetual futures",
    "funding rate", "liquidation cascade", "crypto derivatives", "DeFi",
    "on-chain finance", "digital assets", "永续合约", "市场微观结构", "资金费率",
  ],
  alternates: {
    canonical: "/",
    // Homepage is one bilingual URL (client-side EN/中文 toggle; server HTML is
    // EN), so only en + x-default are declared — there is no separate zh URL.
    languages: { en: "/", "x-default": "/" },
    types: { "application/rss+xml": "/feed.xml" },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME.en,
    title: `${SITE_NAME.en} — Perpetual Futures Microstructure`,
    description: SITE_DESCRIPTION.en,
    locale: "en_US",
    alternateLocale: "zh_CN",
  },
  twitter: { card: "summary_large_image", site: SITE_X_HANDLE, creator: AUTHOR_X_HANDLE },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

// Blocking, pre-paint script: applies the saved theme before the first paint
// to avoid a flash (FOUC) on load/navigation. It reads the SAME localStorage
// key the app uses ("book-theme") and sets `data-theme` on <html>; globals.css
// maps `data-theme` -> the CSS variables that drive every themed surface.
const themeInitScript = `(function(){try{var t=localStorage.getItem("book-theme");if(t!=="dark"&&t!=="parchment")t="light";document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${sourceSerif.variable} ${spectral.variable} ${notoSerifSC.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
        {/* Cookieless page analytics + real-user Core Web Vitals; both
            no-op outside Vercel. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
