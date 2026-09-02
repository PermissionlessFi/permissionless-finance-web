import { ImageResponse } from "next/og";
import { getChapterMeta } from "@/lib/toc";
import { SITE_NAME, SITE_SUBTITLE } from "@/lib/site";
import { loadGoogleFont } from "@/lib/og-font";
import { resolveChapterParam } from "@/lib/keywords";
import { Lang } from "@/lib/types";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Permissionless Finance";

// Book identity: parchment ground, ink-brown headings, warm accent —
// mirrors the site's parchment theme rather than a generic gradient card.
const BG = "#f5f0e8";
const INK = "#4a3728";
const MUTED = "#7c6a4f";
const ACCENT = "#b0703b";
const BORDER = "#d4c9b5";

interface Props {
  params: Promise<{ lang: string; chapter: string }>;
}

export default async function Image({ params }: Props) {
  const { lang: langParam, chapter } = await params;
  const lang = (langParam === "en" ? "en" : "zh") as Lang;
  const num = resolveChapterParam(chapter) ?? chapter;
  const meta = getChapterMeta(num, lang);

  const isNumbered = /^\d+$/.test(num);
  const label = meta
    ? isNumbered
      ? lang === "zh" ? `第${parseInt(num)}章` : `Chapter ${parseInt(num)}`
      : meta.partTitle
    : "";
  const title = meta?.title ?? SITE_SUBTITLE[lang];
  const bookName = SITE_NAME[lang];
  const domain = "permissionless.fi";

  // Subset to exactly the glyphs used. Noto Serif SC covers CJK + latin;
  // Spectral matches the site's English heading face.
  const text = `${label}${title}${bookName}${domain}`;
  const font = await loadGoogleFont(lang === "zh" ? "Noto Serif SC" : "Spectral", text);

  if (!font) {
    // Offline/degraded: text-free branded card (satori cannot render text without a font)
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: BG }}>
          <div style={{ width: 18, height: "100%", backgroundColor: ACCENT }} />
        </div>
      ),
      size
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: BG,
          fontFamily: "Serif",
        }}
      >
        {/* spine accent */}
        <div style={{ width: 18, height: "100%", backgroundColor: ACCENT, display: "flex" }} />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px 56px",
          }}
        >
          {/* top: book name */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34, color: MUTED, letterSpacing: lang === "zh" ? 6 : 2, display: "flex" }}>
              {bookName}
            </div>
            <div style={{ width: 56, height: 3, backgroundColor: BORDER, marginTop: 22, display: "flex" }} />
          </div>

          {/* middle: chapter label + title */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {label ? (
              <div style={{ fontSize: 30, color: ACCENT, display: "flex" }}>{label}</div>
            ) : null}
            <div
              style={{
                fontSize: title.length > (lang === "zh" ? 18 : 60) ? 52 : 64,
                lineHeight: 1.25,
                color: INK,
                fontWeight: 700,
                display: "flex",
                maxWidth: 1000,
              }}
            >
              {title}
            </div>
          </div>

          {/* bottom: domain */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: `2px solid ${BORDER}`,
              paddingTop: 28,
            }}
          >
            <div style={{ fontSize: 26, color: MUTED, display: "flex" }}>{domain}</div>
            <div style={{ fontSize: 26, color: BORDER, display: "flex" }}>CC BY 4.0</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Serif", data: font, weight: 700, style: "normal" }] }
  );
}
