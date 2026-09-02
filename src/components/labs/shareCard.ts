"use client";

import { LOGO_GEOMETRY } from "../BrandLogo";

/**
 * Share-card renderer — draws a 1200×630 PNG on a client canvas: brand mark
 * (real lemniscate paths via Path2D), lab title, the user's outcome, key
 * parameters, and the parameterized URL. Dark-navy card regardless of site
 * theme so it reads consistently on X. No external assets (CSP-safe).
 */

export interface ShareCardData {
  /** lab display name in the active language */
  title: string;
  /** the big outcome line (already localized) */
  outcome: string;
  /** short parameter facts, rendered as one dotted line */
  facts: string[];
  /** parameterized URL to print on the card */
  url: string;
  /** lab accent color for the edge bar */
  accent: string;
  zh: boolean;
}

const W = 1200;
const H = 630;
const BG = "#0f1729";
const HEADING = "#e5c07b";
const TEXT = "#d1d5db";
const MUTED = "#9ca3af";
const LINK = "#60a5fa";

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  // CJK has no spaces — wrap per character; latin wraps per word.
  const zh = /[一-鿿]/.test(text);
  const units = zh ? Array.from(text) : text.split(" ");
  const glue = zh ? "" : " ";
  const lines: string[] = [];
  let line = "";
  for (const u of units) {
    const probe = line ? line + glue + u : u;
    if (ctx.measureText(probe).width > maxWidth && line) {
      lines.push(line);
      line = u;
    } else {
      line = probe;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawMark(ctx: CanvasRenderingContext2D, x: number, y: number, width: number) {
  // Source mark spans x 24–216 (192 units) in its 240 canvas.
  const scale = width / 192;
  ctx.save();
  ctx.translate(x - 24 * scale, y - 86 * scale);
  ctx.scale(scale, scale);
  ctx.lineWidth = LOGO_GEOMETRY.strokeWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = LOGO_GEOMETRY.longGreen;
  ctx.stroke(new Path2D(LOGO_GEOMETRY.rightLoop));
  ctx.strokeStyle = LOGO_GEOMETRY.shortRed;
  ctx.stroke(new Path2D(LOGO_GEOMETRY.leftLoop));
  ctx.restore();
}

export async function renderShareCard(data: ShareCardData): Promise<Blob> {
  await document.fonts.ready;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const serif = `Spectral, "Songti SC", Georgia, serif`;

  // ground + accent edge
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = data.accent;
  ctx.fillRect(0, 0, 14, H);

  // brand row
  drawMark(ctx, 64, 56, 96);
  ctx.fillStyle = HEADING;
  ctx.font = `700 26px ${serif}`;
  ctx.fillText("PERMISSIONLESS FINANCE · LABS", 184, 88);

  // lab title
  ctx.fillStyle = MUTED;
  ctx.font = `400 30px ${serif}`;
  ctx.fillText(data.title, 64, 180);

  // outcome (wrapped, up to 3 lines)
  ctx.fillStyle = TEXT;
  ctx.font = `700 54px ${serif}`;
  const lines = wrapText(ctx, data.outcome, W - 64 - 80).slice(0, 3);
  lines.forEach((l, i) => ctx.fillText(l, 64, 262 + i * 74));

  // facts
  ctx.fillStyle = MUTED;
  ctx.font = `400 27px ${serif}`;
  ctx.fillText(data.facts.join("   ·   "), 64, 262 + lines.length * 74 + 34);

  // footer
  ctx.strokeStyle = "#1e2d4a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(64, H - 86);
  ctx.lineTo(W - 64, H - 86);
  ctx.stroke();
  ctx.fillStyle = LINK;
  ctx.font = `400 26px ${serif}`;
  ctx.fillText(data.url.replace(/^https?:\/\//, ""), 64, H - 42);
  ctx.fillStyle = MUTED;
  const cta = data.zh ? "打开链接,复现这一幕" : "Open the link to reproduce this run";
  const ctaW = ctx.measureText(cta).width;
  ctx.fillText(cta, W - 64 - ctaW, H - 42);

  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png")
  );
}

export async function downloadShareCard(data: ShareCardData, filename: string): Promise<void> {
  const blob = await renderShareCard(data);
  // best-effort clipboard copy alongside the download
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
  } catch {
    /* clipboard image support varies; the download below always works */
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
