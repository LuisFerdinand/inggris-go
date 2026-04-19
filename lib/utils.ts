import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import chroma from "chroma-js";

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
export function generateTheme(color: string): Theme {
  const base = chroma(color);
  const isLight = base.luminance() > 0.6;

  return {
    primary: base.hex(),

    // Backgrounds
    soft: base.alpha(0.09).css(),
    softStrong: base.alpha(0.17).css(),

    // Border
    border: base.alpha(0.24).css(),

    // Pressed / deep accent
    strong: base.saturate(0.5).darken(0.6).hex(),

    // Auto foreground contrast
    text: isLight ? "#111827" : "#ffffff",

    // Hero / section background gradient
    gradient: `
      radial-gradient(ellipse 80% 60% at 60% 0%, ${base.alpha(0.14).css()} 0%, transparent 65%),
      radial-gradient(ellipse 50% 80% at 5% 100%, ${base.alpha(0.09).css()} 0%, transparent 55%)
    `,
  };
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
