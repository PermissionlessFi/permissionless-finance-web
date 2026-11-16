"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Lang } from "@/lib/types";

/**
 * Language state for hub pages that now have path-based locales (/faq vs
 * /zh/faq). `initialLang` is set by the server page so the first HTML paint
 * is already in the right language (query-string toggles were client-only).
 * Old `?lang=zh` links are replaced with the canonical path, hash preserved.
 */
export function useHubLang(initialLang: Lang, enPath: string, zhPath: string) {
  const router = useRouter();
  const pathname = usePathname();
  const [lang, setLang] = useState<Lang>(initialLang);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("lang");
    const hash = window.location.hash;
    if (q === "zh" && pathname === enPath) {
      router.replace(zhPath + hash);
      return;
    }
    if (q === "en" && pathname === zhPath) {
      router.replace(enPath + hash);
    }
  }, [pathname, router, enPath, zhPath]);

  const onLangChange = (next: Lang) => {
    setLang(next);
    const target = next === "zh" ? zhPath : enPath;
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (pathname !== target) router.push(target + hash);
  };

  return { lang, onLangChange };
}
