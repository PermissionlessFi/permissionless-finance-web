<div align="center">

# Permissionless Finance

### From Perpetual Futures to the On-Chain Global Market

*A Market Microstructure Perspective*

**Eric Cheung**

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-4f6d48.svg)](https://creativecommons.org/licenses/by/4.0/)
[![Languages](https://img.shields.io/badge/languages-English%20%C2%B7%20Chinese-a34a33.svg)](#translations--help-the-book-speak-every-language)
[![Chapters](https://img.shields.io/badge/chapters-33-1f2a44.svg)](#the-architecture-of-the-book)
[![Read online](https://img.shields.io/badge/read-permissionless.fi-4f6d48.svg)](https://permissionless.fi)

**[📖 Read online](https://permissionless.fi) · [⬇ Download PDF / EPUB](https://permissionless.fi/download) · [🧪 Interactive Labs](https://permissionless.fi/labs) · [🗺 Open Problems](https://permissionless.fi/problems)**

</div>

---

> Traditional finance spent two centuries building a sophisticated trust machine — central counterparties, multi-layered clearing, regulatory frameworks — yet never resolved a single contradiction at its core: **institutionalized trust is itself the greatest single point of failure.** From the collapse of Lehman Brothers to the implosion of FTX, every crisis asks the same question — *can we build a financial system that does not depend on intermediary credit?*

**Permissionless Finance** is a book-length answer, told through the instrument that proves the point: the **perpetual futures contract** — no expiry, no physical delivery, and daily volumes that now exceed most traditional markets. It argues something deceptively simple and genuinely radical: **price discovery itself can be permissionless.**

This is not a trading manual and not a crypto polemic. It is a rigorous study, written from the vantage point of **market microstructure** — the discipline that asks how prices actually form, order by order, trade by trade — of how an entire financial system is being rebuilt in the open: from permission to permissionless, from institutional trust to algorithmic trust, and toward a market where **code defines the rules, AI enforces them, and consensus verifies them.**

---

## Why this book exists

Most writing on digital-asset markets sits at one of two extremes: breathless narrative with no mechanism, or protocol documentation with no theory. This book lives in the space between — it takes the tools economists built to understand the NYSE and the LSE (adverse selection, price impact, the reflexivity of liquidity, volatility clustering) and turns them on a market that never closes, has no designated market maker, and settles on a public ledger.

The result is a map of an idea as much as a market: a single arc, traced across **ten parts and thirty-three chapters**, from the microstructure of a single order to a global vision of autonomous, on-chain finance.

## The reading experience

This repository is the source of **[permissionless.fi](https://permissionless.fi)** — a bilingual (English · Chinese) reader built for a book that is meant to be *studied*, not just read:

- **🤖 An AI tutor on every page** — ask questions, get quizzed, and follow discussion threads grounded in the chapter you're reading.
- **🧪 Interactive Labs** — deterministic simulators of the book's core mechanisms: the **liquidation cascade**, the **funding-rate game**, and the **order book** under adverse selection. Change one parameter and watch the theory move.
- **📚 A living glossary** — 50+ core terms, each defined once and linked from every chapter that uses it.
- **🗺 Open Problems** — the unresolved question each part of the book ends on, collected as an invitation to research.
- **🧭 Learning paths** — curated routes through the book for traders, quants, and builders.
- **⬇ Free forever** — the complete work as PDF and EPUB, in both languages, under CC BY 4.0.

## The architecture of the book

| Part | Theme | Chapters |
|:----:|:------|:--------:|
| **I** | **Foundation** — what makes digital assets distinct, and the rise of the perpetual | 1–3 |
| **II** | **Ecosystem** — the participants, service providers, and structural trade-offs | 4–6 |
| **III** | **Microstructure** — orders, the order book, and Hyperliquid's innovations | 7–9 |
| **IV** | **Pricing Mechanisms** — funding rates, the reflexivity of leverage & liquidation, insurance funds | 10–12 |
| **V** | **Information & Efficiency** — price discovery, mark-price governance, informational efficiency | 13–15 |
| **VI** | **Arbitrage & Anomalies** — how efficiency propagates, why "risk-free" arbitrage isn't, where it fails | 16–18 |
| **VII** | **Liquidity** — provision as a strategic game, endogeneity & fragility, the public-goods dilemma | 19–21 |
| **VIII** | **Volatility** — a four-source decomposition, the microstructure of clustering, forecasting | 22–24 |
| **IX** | **Engineering** — market-quality metrics, the economics of regulation, and an ideal decentralized clearing & settlement architecture | 25–30 |
| **X** | **The Future** — when AI becomes market infrastructure, and the global vision of autonomous world finance | 31–33 |

## Read it

- **Online:** **[permissionless.fi](https://permissionless.fi)** — the full reader, both languages, with the AI tutor and Labs.
- **Download:** **[PDF & EPUB](https://permissionless.fi/download)** — English and Chinese, free, CC BY 4.0.

---

## Translations — help the book speak every language

> This book began in Chinese, was carried into English, and belongs to whoever wants to read it next.

Permissionless Finance is released under **CC BY 4.0** for a reason: the ideas in it should not be gated by language. If perpetual futures are a permissionless market, this should be a permissionless book. **We warmly invite translators, students, and practitioners anywhere in the world to bring it into their own language** — Español, Français, 日本語, 한국어, Português, Русский, Türkçe, العربية, and beyond.

The text lives as clean, per-chapter Markdown — one file per chapter, no proprietary format:

```
content/
├── en/     # English  — 01.md … 33.md + preface, disclaimer, license, about
└── zh/     # Chinese  — the original edition
```

### How to contribute a translation

> Full guide: **[CONTRIBUTING.md](CONTRIBUTING.md#translations)** — file conventions, terminology discipline, and how credit works.

1. **[Open a translation claim](../../issues/new?template=translation.yml)** to claim a language and coordinate with others — this keeps two people from translating Part I twice.
2. **Fork**, and create `content/<code>/` for your [language code](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes) (e.g. `es`, `ja`, `ko`).
3. **Translate chapter by chapter.** Start with the **Preface + Part I** — it establishes the terminology the rest of the book leans on. You don't have to finish the whole book to be useful; a completed part is a real contribution.
4. **Keep the scaffolding.** Preserve figures, formulas, tables, and citation markers exactly; translate the prose around them. Consult the **[glossary](https://permissionless.fi/glossary)** so the core terms stay consistent — and hold the line on the distinctions the book is careful about (e.g. *clearing* vs *settlement* vs *liquidation*).
5. **Open a pull request.** Maintainers will review the translation and wire your language into the reader — routing, the language switcher, and the download build.

**Translators are credited as the authors of their edition.** A faithful translation of this book is a work of scholarship, and it will be named as one.

New to open source? A single well-translated chapter, a fixed typo, or a sharper term in the glossary are all genuinely welcome first contributions.

## Contributing beyond translation

- **[Errata & corrections](../../issues/new?template=errata.yml)** — spot a wrong number, a broken formula, a dead reference? Fidelity to the mechanism is the whole point of this book.
- **[The reader](../../issues/new?template=site.yml)** — bug reports and improvements to the site, the Labs simulators, and the AI tutor are welcome.
- **Open problems** — if a chapter's open question sparks research, we'd love to link your work.

Please note: the **manuscript itself is authored, not crowd-sourced.** Corrections and translations are embraced; substantive rewrites of the argument are the author's to make.

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for the full guide.

## How to cite

```bibtex
@book{cheung2026permissionless,
  author    = {Cheung, Eric},
  title     = {Permissionless Finance: From Perpetual Futures to the On-Chain Global Market},
  subtitle  = {A Market Microstructure Perspective},
  year      = {2026},
  url        = {https://permissionless.fi},
  note      = {Licensed under CC BY 4.0}
}
```

## License

<a href="https://creativecommons.org/licenses/by/4.0/"><img align="right" width="88" height="31" src="https://mirrors.creativecommons.org/presskit/buttons/88x31/svg/by.svg" alt="CC BY 4.0"></a>

Two licenses, both permissive:

| What | License | Where |
|---|---|---|
| **The book** — text, figures, PDF/EPUB (`content/`, `public/images/`, `public/downloads/`) | **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)** | [`LICENSE`](LICENSE) |
| **The website** — the Next.js app (`src/`, `scripts/`, config) | **[MIT](https://opensource.org/licenses/MIT)** | [`LICENSE-CODE`](LICENSE-CODE) |

You are free to **share** and **adapt** the book — including translating it — for any purpose, even commercially, as long as you give appropriate credit. The code you may use however you like.

## Author

**Eric Cheung** — writing at the intersection of market microstructure, digital-asset markets, and the design of autonomous financial systems.

---

<div align="center">

*From permission to permissionless. From institutional trust to algorithmic trust.*

**[Start reading →](https://permissionless.fi)**

</div>
