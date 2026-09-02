"use client";

import { useEffect, useRef } from "react";

/**
 * Perpetual-futures math blueprint — interactive homepage background.
 *
 * 7 mathematically-drawn figures (funding clamp, liquidation curve, leverage
 * fan, tiered margin, EMA mark price, order-book depth, compound funding) with
 * English hand-note captions + scattered formulas, over blueprint graph paper.
 * All text is English (author ruling 2026-07-05).
 *
 * - Everything uses currentColor (container color: var(--theme-text)) — all
 *   three themes adapt automatically; no hard-coded colors.
 * - Motion: visible draw/erase cycles (pathLength=1 + dashoffset), formula
 *   breathing, per-unit drift, cursor parallax (depth per unit), and a
 *   cursor-following spotlight. Only transform/opacity/dashoffset animate;
 *   parallax vars are set via rAF-throttled JS, no re-renders.
 * - prefers-reduced-motion: all motion + spotlight off, figures completed.
 * - fixed, pointer-events:none, aria-hidden — no layout impact, no CLS.
 */
export function MathBlueprint() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        el.style.setProperty("--px", (nx * -26).toFixed(1) + "px");
        el.style.setProperty("--py", (ny * -18).toFixed(1) + "px");
        el.style.setProperty("--mx", e.clientX + "px");
        el.style.setProperty("--my", e.clientY + "px");
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="mbp" ref={ref} aria-hidden="true">
      <style>{CSS}</style>

      {/* blueprint graph paper (fine + coarse), faded in the center for readability */}
      <div className="mbp-grid" />
      {/* cursor: graph-paper flashlight (grid sharpens near cursor — line-based,
          reads identically in light & dark) + terminal crosshair with ring */}
      <div className="mbp-gridspot" />
      <div className="mbp-cross-h" />
      <div className="mbp-cross-v" />
      <div className="mbp-cross-o" />

      {/* U1 · funding clamp */}
      <div className="mbp-u u1" style={vars("52s", "-20s", "16px", "-10px")}>
        <div className="px" style={dp(1.3)}>
          <svg viewBox="0 0 240 160">
            <path className="ax" d="M18 80 H226 M122 14 V150" vectorEffect="non-scaling-stroke" />
            <path className="dsh" d="M52 150 L192 10" vectorEffect="non-scaling-stroke" />
            <path className="c draw" d="M30 142 L92 80 H152 L214 18" pathLength={1} vectorEffect="non-scaling-stroke" style={dvars("20s", "-8s")} />
            <text className="ft" x={24} y={26} fontSize={12} style={bvars("12s", "-4s")}>F = P + clamp(I − P, ±0.05%)</text>
            <text className="fl" x={150} y={150} fontSize={10.5}>funding clamp</text>
          </svg>
        </div>
      </div>

      {/* U5 · mark price EMA */}
      <div className="mbp-u u5" style={vars("64s", "-40s", "-12px", "9px")}>
        <div className="px" style={dp(0.7)}>
          <svg viewBox="0 0 300 120">
            <path className="ax" d="M16 12 V104 M16 104 H292" vectorEffect="non-scaling-stroke" />
            <path className="cn draw" d="M22 66 L34 52 L44 72 L56 47 L68 63 L80 42 L92 60 L104 38 L118 56 L130 35 L142 52 L156 30 L168 47 L182 28 L194 44 L208 24 L222 40 L236 22 L250 36 L264 18 L278 32" pathLength={1} vectorEffect="non-scaling-stroke" style={dvars("26s", "-13s")} />
            <path className="c draw" d="M22 62 C70 58 90 52 120 46 C170 37 220 32 280 26" pathLength={1} vectorEffect="non-scaling-stroke" style={dvars("18s", "-5s")} />
            <text className="ft" x={158} y={98} fontSize={12} style={bvars("15s", "-7s")}>Markₜ = Indexₜ + EMA(basis)</text>
            <text className="fl" x={22} y={22} fontSize={10.5}>mark price · EMA</text>
          </svg>
        </div>
      </div>

      {/* U7 · compound funding */}
      <div className="mbp-u u7" style={vars("46s", "-10s", "-16px", "12px")}>
        <div className="px" style={dp(1.5)}>
          <svg viewBox="0 0 260 170">
            <path className="ax" d="M30 18 V150 M30 150 H240" vectorEffect="non-scaling-stroke" />
            <path className="dsh" d="M30 150 L236 104" vectorEffect="non-scaling-stroke" />
            <path className="c draw" d="M30 150 Q150 146 236 84 M30 150 Q160 148 236 56 M30 150 Q170 149 236 26" pathLength={1} vectorEffect="non-scaling-stroke" style={dvars("24s", "-11s")} />
            <text className="ft" x={54} y={32} fontSize={13} style={bvars("13s", "-3s")}>Cost(n) = (1+F)ⁿ − 1</text>
            <text className="fl" x={150} y={162} fontSize={10.5}>compound funding</text>
          </svg>
        </div>
      </div>

      {/* U2 · liquidation price */}
      <div className="mbp-u u2" style={vars("70s", "-58s", "12px", "14px")}>
        <div className="px" style={dp(1.1)}>
          <svg viewBox="0 0 240 160">
            <path className="ax" d="M28 18 V142 M20 142 H224" vectorEffect="non-scaling-stroke" />
            <path className="dsh" d="M32 44 H218" vectorEffect="non-scaling-stroke" />
            <path className="c draw" d="M44 136 C50 92 58 68 76 57 C100 50 150 46.5 214 45" pathLength={1} vectorEffect="non-scaling-stroke" style={dvars("17s", "-2s")} />
            <text className="ft" x={96} y={126} fontSize={13} style={bvars("14s", "-9s")}>
              P<tspan dy={3.5} fontSize={9}>liq</tspan><tspan dy={-3.5}> = Pₑ(1 − 1/L + m)</tspan>
            </text>
            <text className="fl" x={128} y={30} fontSize={10.5}>liquidation price</text>
          </svg>
        </div>
      </div>

      {/* U3 · leverage fan */}
      <div className="mbp-u u3" style={vars("58s", "-32s", "14px", "-14px")}>
        <div className="px" style={dp(0.9)}>
          <svg viewBox="0 0 240 160">
            <path className="ax" d="M56 16 V148 M24 44 H226" vectorEffect="non-scaling-stroke" />
            <path className="dsh" d="M36 134 H224" vectorEffect="non-scaling-stroke" />
            <path className="c draw" d="M56 44 L88 134 M56 44 L118 134 M56 44 L154 134 M56 44 L196 134 M56 44 L228 116" pathLength={1} vectorEffect="non-scaling-stroke" style={dvars("22s", "-15s")} />
            <circle className="dot" cx={88} cy={134} r={2.2} />
            <circle className="dot" cx={118} cy={134} r={2.2} />
            <circle className="dot" cx={154} cy={134} r={2.2} />
            <circle className="dot" cx={196} cy={134} r={2.2} />
            <text className="ft" x={124} y={28} fontSize={13} style={bvars("11s", "-6s")}>ROE = L × ΔP/Pₑ</text>
            <text className="fl" x={132} y={152} fontSize={10.5}>leverage &amp; liquidation</text>
          </svg>
        </div>
      </div>

      {/* U4 · tiered margin */}
      <div className="mbp-u u4" style={vars("54s", "-26s", "-14px", "-9px")}>
        <div className="px" style={dp(1.2)}>
          <svg viewBox="0 0 260 160">
            <path className="ax" d="M22 22 V144 M22 144 H246" vectorEffect="non-scaling-stroke" />
            <path className="dsh" d="M74 128 V110 M114 110 V92 M154 92 V74 M194 74 V56" vectorEffect="non-scaling-stroke" />
            <path className="c draw" d="M34 128 H74 M74 110 H114 M114 92 H154 M154 74 H194 M194 56 H240" pathLength={1} vectorEffect="non-scaling-stroke" style={dvars("21s", "-17s")} />
            <circle className="dot" cx={34} cy={128} r={2} /><circle className="odot" cx={74} cy={128} r={2} />
            <circle className="dot" cx={74} cy={110} r={2} /><circle className="odot" cx={114} cy={110} r={2} />
            <circle className="dot" cx={114} cy={92} r={2} /><circle className="odot" cx={154} cy={92} r={2} />
            <circle className="dot" cx={154} cy={74} r={2} /><circle className="odot" cx={194} cy={74} r={2} />
            <circle className="dot" cx={194} cy={56} r={2} /><circle className="odot" cx={240} cy={56} r={2} />
            <text className="ft" x={92} y={38} fontSize={12} style={bvars("16s", "-8s")}>MM = N·MMRᵢ − D</text>
            <text className="fl" x={26} y={158} fontSize={10.5}>tiered margin</text>
          </svg>
        </div>
      </div>

      {/* U6 · order-book depth */}
      <div className="mbp-u u6" style={vars("44s", "-22s", "12px", "-12px")}>
        <div className="px" style={dp(1.4)}>
          <svg viewBox="0 0 300 170">
            <path className="ax" d="M30 150 H270" vectorEffect="non-scaling-stroke" />
            <path className="fill3" d="M44 150 V64 H76 V80 H102 V96 H124 V116 H143 V150 Z" />
            <path className="fill3" d="M157 150 V116 H176 V96 H198 V80 H224 V64 H256 V150 Z" />
            <path className="c draw" d="M44 150 V64 H76 V80 H102 V96 H124 V116 H143 V150" pathLength={1} vectorEffect="non-scaling-stroke" style={dvars("23s", "-4s")} />
            <path className="c draw" d="M157 150 V116 H176 V96 H198 V80 H224 V64 H256 V150" pathLength={1} vectorEffect="non-scaling-stroke" style={dvars("23s", "-15.5s")} />
            <path className="dsh" d="M36 88 H264 M102 92 V128 M198 92 V128" vectorEffect="non-scaling-stroke" />
            <text className="ft" x={92} y={28} fontSize={13} style={bvars("18s", "-10s")}>∫ depth·dP = IMN</text>
            <text className="fl" x={196} y={164} fontSize={10.5}>order-book depth</text>
          </svg>
        </div>
      </div>

      {/* scattered formulas */}
      <span className="mbp-f f1" style={{ ...bvars("10s", "-3s"), ...dp(1.6) }}>(1+F)ⁿ − 1</span>
      <span className="mbp-f f2" style={{ ...bvars("17s", "-8s"), ...dp(0.8) }}>ROE = L·ΔP/Pₑ</span>
      <span className="mbp-f f3" style={{ ...bvars("13s", "-5s"), ...dp(1.2) }}>∫ depth · dP</span>
      <span className="mbp-f f4 safe" style={{ ...bvars("19s", "-11s"), ...dp(0.6) }}>Markₜ = Indexₜ + EMA(basis)</span>
      <span className="mbp-f f5" style={{ ...bvars("12s", "-2s"), ...dp(1.0) }}>F = P + clamp(I − P, ±0.05%)</span>
    </div>
  );
}

/* Per-unit drift vars: duration, delay, dx, dy */
function vars(dd: string, ddl: string, dx: string, dy: string): React.CSSProperties {
  return { "--dd": dd, "--ddl": ddl, "--dx": dx, "--dy": dy } as React.CSSProperties;
}
/* Per-path draw vars: duration, delay */
function dvars(d: string, dl: string): React.CSSProperties {
  return { "--d": d, "--dl": dl } as React.CSSProperties;
}
/* Breathing vars: duration, delay */
function bvars(bd: string, bdl: string): React.CSSProperties {
  return { "--bd": bd, "--bdl": bdl } as React.CSSProperties;
}
/* Parallax depth */
function dp(depth: number): React.CSSProperties {
  return { "--dp": depth } as React.CSSProperties;
}

const CSS = `
.mbp{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;color:var(--theme-text)}
.mbp-grid{position:absolute;inset:-2px;opacity:.06;
background-image:linear-gradient(currentColor 1px,transparent 1px),linear-gradient(90deg,currentColor 1px,transparent 1px),linear-gradient(currentColor 1px,transparent 1px),linear-gradient(90deg,currentColor 1px,transparent 1px);
background-size:240px 240px,240px 240px,48px 48px,48px 48px;
-webkit-mask-image:radial-gradient(ellipse 62% 58% at 50% 46%,transparent 34%,#000 78%);
mask-image:radial-gradient(ellipse 62% 58% at 50% 46%,transparent 34%,#000 78%)}
.mbp-gridspot{position:absolute;inset:-2px;opacity:.16;
background-image:linear-gradient(currentColor 1px,transparent 1px),linear-gradient(90deg,currentColor 1px,transparent 1px),linear-gradient(currentColor 1px,transparent 1px),linear-gradient(90deg,currentColor 1px,transparent 1px);
background-size:240px 240px,240px 240px,48px 48px,48px 48px;
-webkit-mask-image:radial-gradient(240px circle at var(--mx,-500px) var(--my,-500px),#000 20%,transparent 72%);
mask-image:radial-gradient(240px circle at var(--mx,-500px) var(--my,-500px),#000 20%,transparent 72%)}
.mbp-cross-h{position:absolute;left:0;right:0;top:0;height:0;border-top:1px dashed currentColor;opacity:.13;transform:translateY(var(--my,-500px));transition:transform .15s ease-out;will-change:transform}
.mbp-cross-v{position:absolute;top:0;bottom:0;left:0;width:0;border-left:1px dashed currentColor;opacity:.13;transform:translateX(var(--mx,-500px));transition:transform .15s ease-out;will-change:transform}
.mbp-cross-o{position:absolute;left:0;top:0;width:14px;height:14px;border:1px solid currentColor;border-radius:50%;opacity:.22;transform:translate(calc(var(--mx,-500px) - 7px),calc(var(--my,-500px) - 7px));transition:transform .15s ease-out;will-change:transform}
.mbp-u{position:absolute;animation:mbpDrift var(--dd,50s) ease-in-out var(--ddl,0s) infinite alternate;will-change:transform}
.mbp .px{transform:translate3d(calc(var(--px,0px)*var(--dp,1)),calc(var(--py,0px)*var(--dp,1)),0);transition:transform .7s cubic-bezier(.22,.61,.36,1);will-change:transform}
.mbp svg{display:block;width:100%;height:auto;overflow:visible}
.mbp .c{fill:none;stroke:currentColor;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round;opacity:.17}
.mbp .cn{fill:none;stroke:currentColor;stroke-width:.9;stroke-linecap:round;stroke-linejoin:round;opacity:.12}
.mbp .ax{fill:none;stroke:currentColor;stroke-width:.75;stroke-linecap:round;opacity:.09}
.mbp .dsh{fill:none;stroke:currentColor;stroke-width:.8;stroke-dasharray:4 4;stroke-linecap:round;opacity:.09}
.mbp .dot{fill:currentColor;opacity:.17}
.mbp .odot{fill:none;stroke:currentColor;stroke-width:1;opacity:.17}
.mbp .fill3{fill:currentColor;opacity:.05}
.mbp .ft,.mbp-f{font-family:KaTeX_Math,"STIX Two Math","Latin Modern Math",Georgia,"Times New Roman",serif;font-style:italic}
.mbp .ft{fill:currentColor;opacity:.13;animation:mbpBr var(--bd,14s) ease-in-out var(--bdl,0s) infinite}
.mbp .fl{fill:currentColor;opacity:.12;font-family:var(--font-heading),Georgia,serif;font-style:normal;letter-spacing:.14em}
.mbp-f{position:absolute;color:currentColor;opacity:.13;white-space:nowrap;
animation:mbpBr var(--bd,14s) ease-in-out var(--bdl,0s) infinite;
transform:translate3d(calc(var(--px,0px)*var(--dp,1)),calc(var(--py,0px)*var(--dp,1)),0);
transition:transform .7s cubic-bezier(.22,.61,.36,1)}
.mbp .safe{animation-name:mbpBrS;opacity:.06}
.mbp .draw{stroke-dasharray:1;stroke-dashoffset:0;animation:mbpDraw var(--d,20s) linear var(--dl,0s) infinite}
@keyframes mbpDraw{0%{stroke-dashoffset:1}26%{stroke-dashoffset:0}70%{stroke-dashoffset:0}92%{stroke-dashoffset:-1}100%{stroke-dashoffset:-1}}
@keyframes mbpBr{0%,100%{opacity:.09}50%{opacity:.17}}
@keyframes mbpBrS{0%,100%{opacity:.04}50%{opacity:.07}}
@keyframes mbpDrift{from{transform:translate(0,0)}to{transform:translate(var(--dx,14px),var(--dy,-10px))}}
.mbp .u1{left:2%;top:5%;width:300px}
.mbp .u5{left:36%;top:1%;width:300px}
.mbp .u7{right:2%;top:6%;width:300px}
.mbp .u2{right:.5%;top:40%;width:240px}
.mbp .u3{left:1%;top:48%;width:270px}
.mbp .u4{left:5%;bottom:2%;width:300px}
.mbp .u6{right:4%;bottom:3%;width:340px}
.mbp .f1{right:11%;top:30%;font-size:16px}
.mbp .f2{left:2.5%;top:36%;font-size:15px}
.mbp .f3{left:46%;bottom:4%;font-size:22px}
.mbp .f4{right:24%;top:16%;font-size:14px}
.mbp .f5{left:28%;bottom:12%;font-size:14px}
@media (max-width:768px){
.mbp .u2,.mbp .u3,.mbp .u5,.mbp .f2,.mbp .f4,.mbp .f5{display:none}
.mbp .u1{width:220px}.mbp .u7{width:220px}.mbp .u4{width:220px}.mbp .u6{width:240px}
}
@media (max-width:480px){
.mbp .u4,.mbp .u7,.mbp .f1{display:none}
.mbp .u1{width:190px;top:8%}.mbp .u6{width:210px}
}
@media (prefers-reduced-motion:reduce){
.mbp *{animation:none!important;transition:none!important}
.mbp-gridspot,.mbp-cross-h,.mbp-cross-v,.mbp-cross-o{display:none}
}
`;
