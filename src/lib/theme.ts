"use client";

import { createContext, useContext } from "react";

export type ThemeId = "light" | "parchment" | "dark";

export interface Theme {
  id: ThemeId;
  label: { zh: string; en: string };
  bg: string;
  bgSecondary: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  accent: string;
  headingColor: string;
  chapterLabel: string;
  spineBg: string;
  spineText: string;
  spineTextSecondary: string;
  headerBg: string;
  sidebarBg: string;
  cardBg: string;
  inputBg: string;
  inputBorder: string;
  buttonBg: string;
  buttonText: string;
}

export const THEMES: Record<ThemeId, Theme> = {
  light: {
    id: "light",
    label: { zh: "默认", en: "Light" },
    bg: "#ffffff",
    bgSecondary: "#fafafa",
    text: "#1a202c",
    textSecondary: "#4a5568",
    textMuted: "#a0aec0",
    border: "#e2e8f0",
    accent: "#4a5568",
    headingColor: "#5C3D2E",
    chapterLabel: "#6b7280",
    spineBg: "#ffffff",
    spineText: "#374151",
    spineTextSecondary: "#6b7280",
    headerBg: "rgba(255,255,255,0.9)",
    sidebarBg: "#ffffff",
    cardBg: "#f9fafb",
    inputBg: "#ffffff",
    inputBorder: "#e5e7eb",
    buttonBg: "#111827",
    buttonText: "#ffffff",
  },
  parchment: {
    id: "parchment",
    label: { zh: "羊皮纸", en: "Parchment" },
    bg: "#f5f0e8",
    bgSecondary: "#ede7db",
    text: "#3d3229",
    textSecondary: "#5c4f3d",
    textMuted: "#8a7e6b",
    border: "#d4c9b5",
    accent: "#7c6a4f",
    headingColor: "#4a3728",
    chapterLabel: "#7c6a4f",
    spineBg: "#ede7db",
    spineText: "#4a3728",
    spineTextSecondary: "#7c6a4f",
    headerBg: "rgba(245,240,232,0.9)",
    sidebarBg: "#f0ebe3",
    cardBg: "#ede7db",
    inputBg: "#f5f0e8",
    inputBorder: "#d4c9b5",
    buttonBg: "#4a3728",
    buttonText: "#f5f0e8",
  },
  dark: {
    id: "dark",
    label: { zh: "深蓝", en: "Dark Blue" },
    bg: "#0f1729",
    bgSecondary: "#162040",
    text: "#d1d5db",
    textSecondary: "#9ca3af",
    textMuted: "#6b7280",
    border: "#1e2d4a",
    accent: "#60a5fa",
    headingColor: "#e5c07b",
    chapterLabel: "#9ca3af",
    spineBg: "#0c1322",
    spineText: "#d1d5db",
    spineTextSecondary: "#6b7280",
    headerBg: "rgba(15,23,41,0.9)",
    sidebarBg: "#0f1729",
    cardBg: "#162040",
    inputBg: "#162040",
    inputBorder: "#1e2d4a",
    buttonBg: "#60a5fa",
    buttonText: "#0f1729",
  },
};

interface ThemeContextType {
  theme: Theme;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES.light,
  themeId: "light",
  setThemeId: () => {},
});

export const useTheme = () => useContext(ThemeContext);
