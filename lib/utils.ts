import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import chroma from "chroma-js";
import { PROGRAM_DETAILS } from "@/app/(home)/programs/[category]/data";

export type Theme = {
  /** Full-opacity primary hex — use for buttons, icons, accents */
  primary: string;

  /** Very soft tinted background (8–10% opacity) */
  soft: string;

  /** Stronger soft background (16–18% opacity) — hover states */
  softStrong: string;

  /** Subtle border (22–25% opacity) */
  border: string;

  /** Darkened/saturated variant — for pressed states or deep accents */
  strong: string;

  /** Auto-contrast foreground: white or near-black */
  text: string;

  /** Radial mesh gradient string for section backgrounds */
  gradient: string;
};

/**
 * Generates a complete UI theme from a single primary color.
 * All values are pure CSS color strings — safe to use in `style={{}}` props.
 *
 * Usage:
 *   const theme = generateTheme(category.theme.primary);
 */
export function generateTheme(color: string, bg: string = "#0a2d87"): Theme {
  const base = chroma(color);
  const background = chroma(bg);

  const contrast = chroma.contrast(base, background);
  const isLowContrast = contrast < 2.8; // threshold (tweakable)

  const adjustedBase = isLowContrast
    ? base.brighten(1.2).saturate(0.8) // push away from bg
    : base;

  const isLight = adjustedBase.luminance() > 0.6;

  return {
    primary: adjustedBase.hex(),

    soft: adjustedBase.alpha(isLowContrast ? 0.18 : 0.09).css(),
    softStrong: adjustedBase.alpha(isLowContrast ? 0.28 : 0.19).css(),

    border: adjustedBase.alpha(isLowContrast ? 0.4 : 0.24).css(),

    strong: adjustedBase.saturate(0.6).darken(0.5).hex(),

    text: isLight ? "#111827" : "#ffffff",

    gradient: `
      radial-gradient(ellipse 80% 60% at 60% 0%, ${adjustedBase.alpha(0.18).css()} 0%, transparent 65%),
      radial-gradient(ellipse 50% 80% at 5% 100%, ${adjustedBase.alpha(0.12).css()} 0%, transparent 55%)
    `,
  };
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getProgramDetail(slug: string) {
  return PROGRAM_DETAILS[slug];
}
