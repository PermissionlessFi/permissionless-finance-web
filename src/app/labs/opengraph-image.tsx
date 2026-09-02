import { ImageResponse } from "next/og";
import { LOGO_GEOMETRY } from "@/components/BrandLogo";
import { loadGoogleFont } from "@/lib/og-font";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Permissionless Finance Labs";

// Same parchment identity as chapter cards; the lab accent takes the spine.
const BG = "#f5f0e8";
const INK = "#4a3728";
const MUTED = "#7c6a4f";
const BORDER = "#d4c9b5";

export default async function Image() {
  const lab = { en: "Labs", storyEn: "The book's mechanisms, triggered by your own hand", color: "#a34a33" };

  const label = "PERMISSIONLESS FINANCE";
  const tag = "Interactive simulators";
  const domain = "permissionless.fi";
  const text = `${label}${lab.en}${lab.storyEn}${tag}${domain}`;
  const font = await loadGoogleFont("Spectral", text);

  if (!font) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: BG }}>
          <div style={{ width: 18, height: "100%", backgroundColor: lab.color }} />
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
        <div style={{ width: 18, height: "100%", backgroundColor: lab.color, display: "flex" }} />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 72px 56px",
          }}
        >
          {/* top: mark + label */}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <svg viewBox="15 77 210 86" width={110} height={45}>
              <path d={LOGO_GEOMETRY.rightLoop} fill="none" stroke={LOGO_GEOMETRY.longGreen} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" />
              <path d={LOGO_GEOMETRY.leftLoop} fill="none" stroke={LOGO_GEOMETRY.shortRed} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ fontSize: 28, color: MUTED, letterSpacing: 3, display: "flex" }}>{label}</div>
          </div>

          {/* middle: lab title + story */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ fontSize: 28, color: lab.color, display: "flex" }}>{tag}</div>
            <div style={{ fontSize: 72, lineHeight: 1.15, color: INK, fontWeight: 700, display: "flex", maxWidth: 1000 }}>
              {lab.en}
            </div>
            <div style={{ fontSize: 34, color: MUTED, display: "flex", maxWidth: 980 }}>{lab.storyEn}</div>
          </div>

          {/* bottom */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: `2px solid ${BORDER}`,
              paddingTop: 26,
            }}
          >
            <div style={{ fontSize: 26, color: MUTED, display: "flex" }}>{domain}/labs</div>
            <div style={{ fontSize: 26, color: BORDER, display: "flex" }}>CC BY 4.0</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Serif", data: font, weight: 700, style: "normal" }] }
  );
}
