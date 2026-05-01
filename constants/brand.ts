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
  blueAbyss: "var(--blue-abyss)",
  blueNavy: "var(--blue-navy)",
  blue: "var(--blue)",
  blueVivid: "var(--blue-vivid)",
  blueSky: "var(--blue-sky)",
  blueIce: "var(--blue-ice)",
  blueFrost: "var(--blue-frost)",

  /* ── Gold — primary CTA button + heading highlight ───── */
  goldVivid: "var(--gold-vivid)",
  goldMid: "var(--gold-mid)",

  /* ── Surfaces ────────────────────────────────────────── */
  background: "var(--bg-soft)",
  surface: "var(--surface)",
  surfaceSoft: "var(--surface-soft)",
  surfaceFrost: "var(--blue-frost)",

  /* ── Borders ─────────────────────────────────────────── */
  border: "var(--border)",
  borderSoft: "var(--border-soft)",

  /* ── Text ────────────────────────────────────────────── */
  text: "var(--text-main)",
  textMuted: "var(--text-muted)",
  textFaint: "var(--text-faint)",

  /* ── Overlays / Blobs ────────────────────────────────── */
  overlayBlueBlob: "var(--overlay-blue-blob)",
  overlayGoldBlob: "var(--overlay-gold-blob)",
  overlayBlueCard: "var(--overlay-blue-card)",
  overlayGoldIcon: "var(--overlay-gold-icon)",
  overlayBlueIcon: "var(--overlay-blue-icon)",
  overlayBlueIconStrong: "var(--overlay-blue-icon-strong)",
  overlayBlueShadow: "var(--overlay-blue-shadow)",
  overlayBlueShadowHover: "var(--overlay-blue-shadow-hover)",
  overlayNavyShadow: "var(--overlay-navy-shadow)",
  overlayNavyShadowHover: "var(--overlay-navy-shadow-hover)",

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
    "linear-gradient(135deg, var(--blue) 0%, var(--blue-vivid) 100%)",

  gradientGold:
    "linear-gradient(135deg, #E8940A 0%, var(--gold-mid) 50%, var(--gold-vivid) 100%)",

  gradientNavy:
    "linear-gradient(135deg, var(--blue-navy) 0%, var(--blue) 100%)",

  gradientSky:
    "linear-gradient(135deg, var(--blue-sky) 0%, var(--blue-vivid) 100%)",

  gradientPage:
    "linear-gradient(135deg, var(--bg-soft) 0%, var(--blue-ice) 50%, var(--bg-soft) 100%)",

  gradientHeroCardWrap:
    "linear-gradient(135deg, var(--overlay-blue-icon-strong) 0%, var(--overlay-blue-card) 100%)",

  problem: {
    orange: {
      accent: "var(--orange)",
      bg: "var(--orange-soft)",
      border: "var(--orange-border)",
    },
    teal: {
      accent: "var(--teal)",
      bg: "var(--teal-soft)",
      border: "var(--teal-border)",
    },
    amber: {
      accent: "var(--gold)",
      bg: "var(--gold-soft)",
      border: "var(--gold-border)",
    },
    purple: {
      accent: "var(--purple)",
      bg: "var(--purple-soft)",
      border: "var(--purple-border)",
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
    "linear-gradient(135deg, var(--gold-mid) 0%, var(--gold-vivid) 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};
