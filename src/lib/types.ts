export type Lang = "zh" | "en";

export interface Chapter {
  num: string;
  title: { zh: string; en: string };
  partIndex: number;
}

export interface Part {
  index: number;
  title: { zh: string; en: string };
  chapters: Chapter[];
}

export interface ChapterMeta {
  num: string;
  lang: Lang;
  title: string;
  partTitle: string;
  prevChapter: string | null;
  nextChapter: string | null;
}
