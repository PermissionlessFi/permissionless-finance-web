# Contributing

Thank you for being here. **Permissionless Finance** is a free, CC BY 4.0 book, and it gets better
when readers push back on it — a wrong number caught, a term made sharper, a chapter carried into a
new language.

There are three kinds of contribution, in rough order of how much they help:

1. **[Translations](#translations)** — bring the book into a new language
2. **[Errata & corrections](#errata--corrections)** — fix what's wrong
3. **[The reader](#the-website)** — improve the website, simulators, and tooling

One boundary to state up front: **the manuscript is authored, not crowd-sourced.** Corrections and
translations are embraced. Rewrites of the argument itself — restructuring a chapter, changing what
a section claims — are the author's to make. If you think an argument is wrong, that's a valuable
issue to open, not a pull request to write.

---

## Translations

> The book began in Chinese, was carried into English, and belongs to whoever wants to read it next.

The text lives as clean, per-chapter Markdown — one file per chapter, no proprietary format:

```
content/
├── en/     # English  — 01.md … 33.md, preface, disclaimer, license, about
└── zh/     # Chinese  — the original edition
```

### Claiming a language

**Open an issue using the [Translation claim](../../issues/new?template=translation.yml) template**
before you start. This is the one step worth not skipping — it keeps two people from translating
Part I twice, and lets translators of the same language find each other.

Claiming a language doesn't oblige you to finish the whole book. A completed part is a real
contribution, and several people can share one language.

### Doing the work

1. **Fork**, then create `content/<code>/` using the
   [ISO 639-1 code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) for your language
   (`es`, `ja`, `ko`, `pt`, `fr`, …). Mirror the English filenames exactly: `01.md` … `33.md`,
   `preface.md`, `disclaimer.md`, `license.md`, `about.md`.
2. **Start with `preface.md` and Part I (`01.md`–`03.md`).** They establish the vocabulary the rest
   of the book leans on; translating them first makes every later chapter easier and more consistent.
3. **Translate the prose. Keep the scaffolding.** Specifically, leave these untouched:
   - **Figure and table references** — image paths and filenames stay exactly as they are
   - **Formulas** — LaTeX/math notation is not translated
   - **Citation markers** — `[1]`, `[2]`, … must keep their numbers and positions
   - **Heading structure** — `# Chapter N: …` and `## N.1 …` keep their numbering
   - **Data** — figures, dates, and named entities stay factually identical
4. **Hold the terminology.** Consult the [glossary](https://permissionless.fi/glossary) and stay
   consistent within your edition. The book is deliberately careful about distinctions that many
   texts blur — **clearing** vs **settlement** vs **liquidation** is the sharpest example. If your
   language collapses them, pick a convention, note it in your PR, and apply it everywhere.
5. **Open a pull request**, even a partial one. Draft PRs are welcome while a part is in progress.

Maintainers review the translation and wire the language into the reader — routing, the language
switcher, and the download build. **That last part is ours, not yours:** you write Markdown, we
handle the plumbing.

### Credit

**Translators are credited as the authors of their edition.** A faithful translation of a book like
this is a work of scholarship, and it will be named as one — in the repository, on the site, and in
the edition's own front matter.

### Machine translation

Machine translation is a fine *starting point* and a poor *ending point*. If you use it, say so in
the PR, and make sure you've read and corrected every paragraph yourself. A chapter that reads as
raw model output will be sent back — not out of purism, but because a reader can already run this
book through a translator; the value you add is the judgment on top.

---

## Errata & corrections

Fidelity to the mechanism is the whole point of this book, so corrections are genuinely welcome —
a wrong number, a broken formula, a dead citation, a figure that contradicts its caption.

- **Small and unambiguous** (typo, broken link, wrong digit): open a PR directly.
- **Anything substantive** (a claim you believe is wrong, a mechanism described incorrectly): open
  an issue first with the [Errata template](../../issues/new?template=errata.yml) so it can be
  discussed before text changes.

When reporting, please include the **language, chapter, and section number**, quote the passage, and
say what you believe is correct — with a source where one applies.

---

## The website

The reader is a Next.js app; the book's content is plain Markdown under `content/`.

```bash
npm install
cp .env.example .env.local   # fill in what you need — see below
npm run build && npm start   # http://localhost:3000
```

Notes that will save you time:

- **AI features** (chapter Q&A, quiz, discussion) need `KIMI_API_KEY` and `KIMI_BASE_URL`. Without
  them the site builds and reads perfectly — only the AI panel errors.
- **Search** needs a Meilisearch instance. Without it, search degrades gracefully; everything else
  works.
- Bug reports are most useful with the **page URL, browser, and what you expected** instead.

Improvements to the Labs simulators are welcome, with one caveat worth knowing: they are **teaching
models, not trading models.** They deliberately simplify. A change that makes a simulator more
realistic but harder to learn from is not an improvement — say in your PR what the change teaches.

---

## Code of conduct

Be decent. Assume good faith, critique ideas rather than people, and remember that many
contributors here are working in their second or third language.

## License

By contributing, you agree that your contribution is licensed under whichever license covers the
part of the project you touched:

- **Book content** — translations, errata, anything under `content/`, `public/images/`, or
  `public/downloads/` — is licensed under
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), the same license as the book
  ([`LICENSE`](LICENSE)).
- **Website code** — `src/`, `scripts/`, configuration — is licensed under
  [MIT](https://opensource.org/licenses/MIT) ([`LICENSE-CODE`](LICENSE-CODE)).
