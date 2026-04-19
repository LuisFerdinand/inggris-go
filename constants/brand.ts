/**
 * brand.ts — Inggris Go semantic design token mapping
 *
 * Design principle:
 *   Blue  → drives most UI: icons, badges, shadows, cards, secondary buttons
 *   Gold  → primary CTA button + the "Tanpa Takut Salah" heading gradient
 *
 * Usage rule:
 *   - Prefer Tailwind utility classes (bg-blue-gradient, text-foreground…)
 *   - Use BRAND.* only when a raw CSS-variable string is needed as a JS value
 *     (Framer Motion style props, SVG fill, Canvas API, etc.)
 *
 * FIX: gold shadow values now reference CSS variables instead of hardcoded hex.
 * FIX: gradientGoldText moved to its own named export (GRADIENT_GOLD_TEXT) to
 *      avoid a heterogeneous record type — BRAND values are all strings now.
 */

export const BRAND = {
  /* ── Blue / Primary — most interactive UI ───────────── */
  blueAbyss: "var(--color-brand-blue-abyss)",
  blueNavy: "var(--color-brand-blue-navy)",
  blue: "var(--color-brand-blue)",
  blueVivid: "var(--color-brand-blue-vivid)",
  blueSky: "var(--color-brand-blue-sky)",
  blueIce: "var(--color-brand-blue-ice)",
  blueFrost: "var(--color-brand-blue-frost)",

  /* ── Gold — primary CTA button + heading highlight ───── */
  goldVivid: "var(--color-brand-gold-vivid)",
  goldMid: "var(--color-brand-gold-mid)",

  /* ── Surfaces ────────────────────────────────────────── */
  background: "var(--color-brand-bg)",
  surface: "var(--color-brand-surface)",
  surfaceSoft: "var(--color-brand-surface-soft)",
  surfaceFrost: "var(--color-brand-blue-frost)",

  /* ── Borders ─────────────────────────────────────────── */
  border: "var(--color-brand-border)",
  borderSoft: "var(--color-brand-border-soft)",

  /* ── Text ────────────────────────────────────────────── */
  text: "var(--color-brand-text)",
  textMuted: "var(--color-brand-text-muted)",
  textFaint: "var(--color-brand-text-faint)",

  /* ── Overlays / Blobs ────────────────────────────────── */
  overlayBlueBlob: "var(--color-brand-overlay-blue-blob)",
  overlayGoldBlob: "var(--color-brand-overlay-gold-blob)",
  overlayBlueCard: "var(--color-brand-overlay-blue-card)",
  overlayGoldIcon: "var(--color-brand-overlay-gold-icon)",
  overlayBlueIcon: "var(--color-brand-overlay-blue-icon)",
  overlayBlueIconStrong: "var(--color-brand-overlay-blue-icon-strong)",
  overlayBlueShadow: "var(--color-brand-overlay-blue-shadow)",
  overlayBlueShadowHover: "var(--color-brand-overlay-blue-shadow-hover)",
  overlayNavyShadow: "var(--color-brand-overlay-navy-shadow)",
  overlayNavyShadowHover: "var(--color-brand-overlay-navy-shadow-hover)",

  /* ── Shadows ─────────────────────────────────────────── */
  shadowSoft: "var(--shadow-badge)",
  shadowCard: "var(--shadow-card)",
  shadowTag: "var(--shadow-tag)",
  shadowBlueBtn: "var(--shadow-glow-blue-btn)",
  shadowBlueBtnHover: "var(--shadow-glow-blue-btn-hover)",
  shadowNavyBtn: "var(--shadow-glow-navy-btn)",
  shadowNavyBtnHover: "var(--shadow-glow-navy-btn-hover)",
  shadowBlue: "var(--shadow-glow-blue)",
  shadowBlueHover: "var(--shadow-glow-blue-hover)",

  /* FIX: was hardcoded rgba() — now references CSS variables */
  shadowGoldBtn: "var(--shadow-glow-gold-btn)",
  shadowGoldBtnHover: "var(--shadow-glow-gold-btn-hover)",

  /* ── Gradients ───────────────────────────────────────── */
  gradientBlue:
    "linear-gradient(135deg, var(--color-brand-blue) 0%, var(--color-brand-blue-vivid) 100%)",

  gradientGold:
    "linear-gradient(135deg, #E8940A 0%, var(--color-brand-gold-mid) 50%, var(--color-brand-gold-vivid) 100%)",

  gradientNavy:
    "linear-gradient(135deg, var(--color-brand-blue-navy) 0%, var(--color-brand-blue) 100%)",

  gradientSky:
    "linear-gradient(135deg, var(--color-brand-blue-sky) 0%, var(--color-brand-blue-vivid) 100%)",

  gradientPage:
    "linear-gradient(135deg, var(--color-brand-bg) 0%, var(--color-brand-blue-ice) 50%, var(--color-brand-bg) 100%)",

  gradientHeroCardWrap:
    "linear-gradient(135deg, var(--color-brand-overlay-blue-icon-strong) 0%, var(--color-brand-overlay-blue-card) 100%)",

  problem: {
    orange: {
      accent: "var(--color-support-orange)",
      bg: "var(--color-support-orange-soft)",
      border: "var(--color-support-orange-border)",
    },
    teal: {
      accent: "var(--color-support-teal)",
      bg: "var(--color-support-teal-soft)",
      border: "var(--color-support-teal-border)",
    },
    amber: {
      accent: "var(--color-brand-gold)",
      bg: "var(--color-brand-gold-soft)",
      border: "var(--color-brand-gold-border)",
    },
    purple: {
      accent: "var(--color-support-purple)",
      bg: "var(--color-support-purple-soft)",
      border: "var(--color-support-purple-border)",
    },
  },
} as const;

export type BrandToken = keyof typeof BRAND;

/**
 * GRADIENT_GOLD_TEXT — the gold clip-text style for heading highlights.
 *
 * Separated from BRAND so that BRAND values stay uniformly string-typed,
 * avoiding silent runtime errors when iterating tokens or using them
 * in style props that expect a string.
 *
 * @example
 * <span style={GRADIENT_GOLD_TEXT}>Tanpa Takut Salah</span>
 */
export const GRADIENT_GOLD_TEXT: React.CSSProperties = {
  background:
    "linear-gradient(135deg, var(--color-brand-gold-mid) 0%, var(--color-brand-gold-vivid) 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};
