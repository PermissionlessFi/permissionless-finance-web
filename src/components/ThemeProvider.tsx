"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ThemeContext, THEMES, ThemeId } from "@/lib/theme";

// Read the theme already applied to <html> by the pre-paint script (see
// layout.tsx) so we don't overwrite it with "light" on the first render.
// Falls back to localStorage, then "light". Returns "light" on the server.
function getInitialThemeId(): ThemeId {
  if (typeof document === "undefined") return "light";
  const attr = document.documentElement.getAttribute("data-theme") as ThemeId | null;
  if (attr && THEMES[attr]) return attr;
  try {
    const saved = localStorage.getItem("book-theme") as ThemeId | null;
    if (saved && THEMES[saved]) return saved;
  } catch {
    /* localStorage unavailable */
  }
  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(getInitialThemeId);
  const pathname = usePathname();

  // Apply + persist the theme whenever it changes. This also runs on mount,
  // where it re-affirms the value the pre-paint script already set (idempotent,
  // so no flash). globals.css turns `data-theme` into the actual CSS variables.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeId);
    try {
      localStorage.setItem("book-theme", themeId);
    } catch {
      /* localStorage unavailable */
    }
  }, [themeId]);

  // Keep <html lang> in sync with the current route language. The server
  // renders a sensible default ("en"); this corrects it for /zh routes and
  // updates on client-side navigation.
  useEffect(() => {
    document.documentElement.lang = pathname?.startsWith("/zh") ? "zh" : "en";
  }, [pathname]);

  const theme = THEMES[themeId];

  return (
    <ThemeContext.Provider value={{ theme, themeId, setThemeId }}>
      <div
        style={{
          backgroundColor: "var(--theme-bg)",
          color: "var(--theme-text)",
          minHeight: "100vh",
          transition: "background-color 0.3s ease, color 0.3s ease",
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
