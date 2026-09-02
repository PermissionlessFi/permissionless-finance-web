"use client";

import { MenuBar } from "./MenuBar";
import { SearchBox } from "./SearchBox";
import { SettingsButton } from "./SettingsButton";
import { Lang } from "@/lib/types";

/**
 * The shared top navigation cluster used on both the landing page and the
 * chapter reader: the four pillar menus, search, and settings (language +
 * theme). The brand lockup lives at the header's far left (each header
 * places it), not in this right-aligned cluster. Chapter pages append their
 * own AI-panel button after this.
 */
export function TopNav({
  lang,
  onLangChange,
}: {
  lang: Lang;
  onLangChange: (l: Lang) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      <MenuBar lang={lang} />
      <SearchBox lang={lang} />
      <SettingsButton lang={lang} onLangChange={onLangChange} />
    </div>
  );
}
