import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_SUBTITLE, SITE_TAGLINE } from "@/lib/site";
import { loadGoogleFont } from "@/lib/og-font";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Permissionless Finance — 无需许可的金融";

const BG = "#f5f0e8";
const INK = "#4a3728";
const MUTED = "#7c6a4f";
const ACCENT = "#b0703b";
const BORDER = "#d4c9b5";

export default async function Image() {
  const domain = "permissionless.fi";
  const text = `${SITE_NAME.zh}${SITE_NAME.en}${SITE_SUBTITLE.en}${SITE_TAGLINE.zh}${domain}CC BY 4.0`;
  const font = await loadGoogleFont("Noto Serif SC", text);

  if (!font) {
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
        <div style={{ width: 18, height: "100%", backgroundColor: ACCENT, display: "flex" }} />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 24,
            padding: "0 80px",
          }}
        >
          <div style={{ fontSize: 76, color: INK, fontWeight: 700, display: "flex", letterSpacing: 10 }}>
            {SITE_NAME.zh}
          </div>
          <div style={{ fontSize: 44, color: INK, display: "flex" }}>{SITE_NAME.en}</div>
          <div style={{ width: 56, height: 3, backgroundColor: BORDER, display: "flex" }} />
          <div style={{ fontSize: 28, color: MUTED, display: "flex" }}>{SITE_SUBTITLE.en}</div>
          <div style={{ fontSize: 24, color: ACCENT, letterSpacing: 6, display: "flex" }}>
            {SITE_TAGLINE.zh}
          </div>
          <div style={{ fontSize: 24, color: MUTED, display: "flex", marginTop: 16 }}>
            {domain} · CC BY 4.0
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Serif", data: font, weight: 700, style: "normal" }] }
  );
}
