"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/lib/theme";
import { chapterHref } from "@/lib/keywords";
import { homeJsonLd } from "@/lib/seo-jsonld";
import { TopNav } from "@/components/TopNav";
import { MathBlueprint } from "@/components/MathBlueprint";
import { LogoMark, LogoLockup } from "@/components/BrandLogo";

// Built once; static first-party data (safe to serialize). Client components
// are still server-rendered, so this ships in the initial HTML for crawlers.
const HOME_JSON_LD = JSON.stringify(homeJsonLd()).replace(/</g, "\\u003c");

export default function Home() {
  const { theme } = useTheme();
  const [lang, setLang] = useState<"zh" | "en">("en");

  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: HOME_JSON_LD }} />

      {/* Decorative math-blueprint layer (fixed, behind everything) */}
      <MathBlueprint />

      {/* Top nav — reused from the chapter reader; brand lockup far left */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between h-[72px] px-4 backdrop-blur-sm"
        style={{ backgroundColor: "var(--theme-header-bg)", transition: "background-color 0.3s ease" }}
      >
        <LogoLockup markWidth={44} className="ml-2" />
        <TopNav lang={lang} onLangChange={setLang} />
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 pb-16">
        <div className="max-w-xl w-full">

          {/* Title */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-5">
              <LogoMark width={128} />
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold leading-tight mb-2"
              style={{ fontFamily: "var(--font-heading)", color: theme.headingColor }}
            >
              {lang === "zh" ? "无需许可的金融" : "Permissionless Finance"}
            </h1>
            <p
              className="text-base mt-1"
              style={{ fontFamily: "var(--font-heading)", color: theme.textSecondary }}
            >
              {lang === "zh"
                ? "从永续合约到链上全球市场"
                : "From Perpetual Futures to the On-Chain Global Market"}
            </p>
            <p
              className="text-xs tracking-widest mt-2"
              style={{ fontFamily: "var(--font-heading)", color: theme.textMuted }}
            >
              {lang === "zh"
                ? "市场微观结构视角"
                : "A Market Microstructure Perspective"}
            </p>
          </div>

          <div className="w-10 h-px mx-auto mb-8" style={{ backgroundColor: theme.border }} />

          {/* Foreword */}
          <div className="mb-8">
            <div
              className="text-sm leading-[1.9] space-y-4"
              style={{ fontFamily: "var(--font-serif)", color: theme.textSecondary }}
            >
              {lang === "zh" ? (
                <>
                  <p style={{ textIndent: "2em" }}>
                    传统金融用两百年时间构建了一套精密的信任机器，以中央对手方、多层清算和监管框架为支柱，却始终无法消除一个根本矛盾：制度化的信任本身就是最大的单点风险。从雷曼兄弟的倒塌到FTX的崩溃，每一次危机都在追问同一个问题：我们能否构建一种不依赖中介信用的金融体系？
                  </p>
                  <p style={{ textIndent: "2em" }}>
                    数字资产给出了一个激进的回答。永续合约，这个没有到期日、没有实物交割，而日均交易量却超越绝大多数传统市场的金融工具，正在证明一件深刻的事：价格发现本身可以是无需许可的。
                  </p>
                  <p style={{ textIndent: "2em" }}>
                    而当人工智能成为市场的基础设施，这场变革将被进一步加速。算法不再只是交易的工具，它正在成为做市、风控、清算乃至监管的执行者。代码定义规则，AI执行规则，共识验证规则，一个自主运行的金融系统正在从理论走向现实。
                  </p>
                  <p style={{ textIndent: "2em" }}>
                    本书从市场微观结构的视角，完整追溯这条路径。三十三章，十个篇章，一份从许可到无需许可、从制度信任到算法信任的思想地图。
                  </p>
                </>
              ) : (
                <>
                  <p style={{ textIndent: "2em" }}>
                    Traditional finance spent two centuries building a sophisticated trust machine — central counterparties, multi-layered clearing, regulatory frameworks — yet never resolved a fundamental contradiction: institutionalized trust is itself the greatest single point of failure. From the collapse of Lehman Brothers to the implosion of FTX, every crisis asks the same question: can we build a financial system that does not depend on intermediary credit?
                  </p>
                  <p style={{ textIndent: "2em" }}>
                    Digital assets offer a radical answer. The perpetual contract — an instrument with no expiry, no physical delivery, and daily volumes exceeding most traditional markets — is proving something profound: price discovery itself can be permissionless.
                  </p>
                  <p style={{ textIndent: "2em" }}>
                    As artificial intelligence becomes market infrastructure, this transformation accelerates further. Algorithms are no longer merely trading tools — they are becoming the executors of market-making, risk management, clearing, and even regulation. Code defines the rules, AI enforces them, consensus verifies them — an autonomous financial system is moving from theory to reality.
                  </p>
                  <p style={{ textIndent: "2em" }}>
                    This book traces the complete path through the lens of market microstructure. Thirty-three chapters, ten parts, one intellectual map from permission to permissionless, from institutional trust to algorithmic trust.
                  </p>
                </>
              )}
            </div>

            {/* Signature */}
            <div className="text-right mt-6">
              <p
                className="text-sm"
                style={{ fontFamily: "var(--font-heading)", color: theme.textSecondary }}
              >
                Eric Cheung, 2026
              </p>
            </div>
          </div>

          <div className="w-10 h-px mx-auto mb-8" style={{ backgroundColor: theme.border }} />

          {/* Primary CTA */}
          <div className="flex items-center justify-center gap-4">
            <Link
              href={chapterHref(lang, "01")}
              className="px-7 py-2.5 text-sm rounded-md transition-colors"
              style={{ fontFamily: "var(--font-heading)", backgroundColor: theme.buttonBg, color: theme.buttonText }}
            >
              {lang === "zh" ? "开始阅读" : "Start Reading"}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
