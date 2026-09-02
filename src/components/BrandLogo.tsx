import Link from "next/link";

/* Brand mark: Bernoulli lemniscate ∞ (r² = a²·cos 2θ), spec v1.0 (2026-07).
 * Canvas 240×240, a = 96, node trim ±13°, stroke 15, round caps.
 * Loop colors are FIXED across all themes (long green right / short red left).
 * Glint animation: one 9px highlight patrols the ∞ — green sweeps the right
 * loop during 0–50% of a 4.2s cycle, hands over at the node, red sweeps the
 * left loop during 50–100%. Pure CSS (keyframes in globals.css); hidden under
 * prefers-reduced-motion. Never rotate, stretch, recolor, or restyle. */

const RIGHT_LOOP = "M131.08,130.79 L132.40,132.01 L133.74,133.21 L135.10,134.41 L136.48,135.59 L137.89,136.76 L139.31,137.91 L140.76,139.04 L142.24,140.16 L143.74,141.25 L145.28,142.33 L146.84,143.37 L148.44,144.39 L150.07,145.38 L151.74,146.33 L153.44,147.25 L155.18,148.13 L156.96,148.96 L158.78,149.75 L160.64,150.48 L162.53,151.15 L164.47,151.77 L166.44,152.32 L168.45,152.80 L170.49,153.20 L172.57,153.52 L174.68,153.76 L176.81,153.90 L178.97,153.94 L181.15,153.88 L183.35,153.71 L185.55,153.42 L187.76,153.01 L189.95,152.47 L192.14,151.81 L194.29,151.01 L196.42,150.07 L198.50,149.00 L200.52,147.78 L202.47,146.43 L204.34,144.93 L206.11,143.30 L207.78,141.54 L209.32,139.65 L210.74,137.65 L212.00,135.53 L213.11,133.32 L214.05,131.02 L214.81,128.65 L215.39,126.22 L215.78,123.75 L215.98,121.25 L215.98,118.75 L215.78,116.25 L215.39,113.78 L214.81,111.35 L214.05,108.98 L213.11,106.68 L212.00,104.47 L210.74,102.35 L209.32,100.35 L207.78,98.46 L206.11,96.70 L204.34,95.07 L202.47,93.57 L200.52,92.22 L198.50,91.00 L196.42,89.93 L194.29,88.99 L192.14,88.19 L189.95,87.53 L187.76,86.99 L185.55,86.58 L183.35,86.29 L181.15,86.12 L178.97,86.06 L176.81,86.10 L174.68,86.24 L172.57,86.48 L170.49,86.80 L168.45,87.20 L166.44,87.68 L164.47,88.23 L162.53,88.85 L160.64,89.52 L158.78,90.25 L156.96,91.04 L155.18,91.87 L153.44,92.75 L151.74,93.67 L150.07,94.62 L148.44,95.61 L146.84,96.63 L145.28,97.67 L143.74,98.75 L142.24,99.84 L140.76,100.96 L139.31,102.09 L137.89,103.24 L136.48,104.41 L135.10,105.59 L133.74,106.79 L132.40,107.99 L131.08,109.21";
const LEFT_LOOP = "M108.92,130.79 L107.60,132.01 L106.26,133.21 L104.90,134.41 L103.52,135.59 L102.11,136.76 L100.69,137.91 L99.24,139.04 L97.76,140.16 L96.26,141.25 L94.72,142.33 L93.16,143.37 L91.56,144.39 L89.93,145.38 L88.26,146.33 L86.56,147.25 L84.82,148.13 L83.04,148.96 L81.22,149.75 L79.36,150.48 L77.47,151.15 L75.53,151.77 L73.56,152.32 L71.55,152.80 L69.51,153.20 L67.43,153.52 L65.32,153.76 L63.19,153.90 L61.03,153.94 L58.85,153.88 L56.65,153.71 L54.45,153.42 L52.24,153.01 L50.05,152.47 L47.86,151.81 L45.71,151.01 L43.58,150.07 L41.50,149.00 L39.48,147.78 L37.53,146.43 L35.66,144.93 L33.89,143.30 L32.22,141.54 L30.68,139.65 L29.26,137.65 L28.00,135.53 L26.89,133.32 L25.95,131.02 L25.19,128.65 L24.61,126.22 L24.22,123.75 L24.02,121.25 L24.02,118.75 L24.22,116.25 L24.61,113.78 L25.19,111.35 L25.95,108.98 L26.89,106.68 L28.00,104.47 L29.26,102.35 L30.68,100.35 L32.22,98.46 L33.89,96.70 L35.66,95.07 L37.53,93.57 L39.48,92.22 L41.50,91.00 L43.58,89.93 L45.71,88.99 L47.86,88.19 L50.05,87.53 L52.24,86.99 L54.45,86.58 L56.65,86.29 L58.85,86.12 L61.03,86.06 L63.19,86.10 L65.32,86.24 L67.43,86.48 L69.51,86.80 L71.55,87.20 L73.56,87.68 L75.53,88.23 L77.47,88.85 L79.36,89.52 L81.22,90.25 L83.04,91.04 L84.82,91.87 L86.56,92.75 L88.26,93.67 L89.93,94.62 L91.56,95.61 L93.16,96.63 L94.72,97.67 L96.26,98.75 L97.76,99.84 L99.24,100.96 L100.69,102.09 L102.11,103.24 L103.52,104.41 L104.90,105.59 L106.26,106.79 L107.60,107.99 L108.92,109.21";

const LONG_GREEN = "#4f6d48";
const SHORT_RED = "#a34a33";
const GLINT_GREEN = "#7ba36f";
const GLINT_RED = "#c97757";

/** Raw lemniscate path data + brand colors, for canvas renderers (share
 *  cards) that redraw the mark outside React. 240×240 canvas coordinates. */
export const LOGO_GEOMETRY = {
  rightLoop: RIGHT_LOOP,
  leftLoop: LEFT_LOOP,
  longGreen: LONG_GREEN,
  shortRed: SHORT_RED,
  strokeWidth: 15,
} as const;

/* Tight crop of the mark within the 240×240 canvas (paths span 24–216 ×
 * 86–154; ±8.5 covers the round caps of the 15-unit stroke). */
const VIEW_BOX = "15 77 210 86";
const ASPECT = 86 / 210;

export function LogoMark({
  width = 64,
  animated = true,
  className = "",
}: {
  width?: number;
  animated?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox={VIEW_BOX}
      width={width}
      height={Math.round(width * ASPECT)}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d={RIGHT_LOOP} fill="none" stroke={LONG_GREEN} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" />
      <path d={LEFT_LOOP} fill="none" stroke={SHORT_RED} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" />
      {animated && (
        <>
          <path d={RIGHT_LOOP} pathLength={1} className="logo-glint logo-glint-long" fill="none" stroke={GLINT_GREEN} strokeWidth={9} strokeLinecap="round" />
          <path d={LEFT_LOOP} pathLength={1} className="logo-glint logo-glint-short" fill="none" stroke={GLINT_RED} strokeWidth={9} strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

/** Horizontal lockup (mark + wordmark) linking home. Wordmark: Spectral 700
 *  all-caps +0.08em, --theme-heading — same voice as the site headings. */
export function LogoLockup({
  markWidth = 44,
  fontSize = 12.5,
  href = "/",
  wordmark = true,
  className = "",
}: {
  markWidth?: number;
  fontSize?: number;
  href?: string;
  wordmark?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="Permissionless Finance — Home"
      className={`flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity ${className}`}
    >
      <LogoMark width={markWidth} />
      {wordmark && (
        <span
          className="hidden md:inline whitespace-nowrap font-bold uppercase"
          style={{
            fontFamily: "var(--font-heading)",
            fontSize,
            letterSpacing: "0.08em",
            color: "var(--theme-heading)",
          }}
        >
          Permissionless&nbsp;Finance
        </span>
      )}
    </Link>
  );
}
