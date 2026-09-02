/**
 * Load a Google Font subsetted to exactly the glyphs we render — the standard
 * satori/ImageResponse pattern. Subsetting keeps CJK loads tiny (a full
 * Noto Serif SC would be several MB; a title's worth of glyphs is a few KB).
 * A plain (non-browser) fetch UA makes Google return TTF, which satori needs.
 * Returns null on any failure — callers must degrade to a text-free design.
 */
export async function loadGoogleFont(family: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@700&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const match = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
    if (!match) return null;
    const res = await fetch(match[1]);
    if (!res.ok) return null;
    return res.arrayBuffer();
  } catch {
    return null;
  }
}
