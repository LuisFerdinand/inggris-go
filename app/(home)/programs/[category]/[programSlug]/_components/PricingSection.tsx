import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Theme } from "@/lib/utils";
import { Bonus, PricingGroup, PricingPackage } from "../../data";
import { Icon } from "@/components/Icon";

const EASE = [0.25, 0.1, 0.25, 1] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Reveal({
  children,
  delay = 0,
  y = 24,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-48px 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function SectionPill({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: Theme;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-display font-bold uppercase"
      style={{
        fontSize: "0.5875rem",
        letterSpacing: "0.18em",
        background: theme.soft,
        color: theme.primary,
        border: `1.5px solid ${theme.border}`,
        boxShadow: `0 2px 16px ${theme.border}`,
      }}
    >
      {children}
    </span>
  );
}

function SectionHeading({
  tagline,
  taglineAccent,
  theme,
  size = "md",
}: {
  tagline: string;
  taglineAccent?: string;
  theme: Theme;
  size?: "sm" | "md" | "lg";
}) {
  const fontSize =
    size === "lg"
      ? "clamp(2rem, 4vw, 3.25rem)"
      : size === "sm"
        ? "clamp(1.5rem, 2.5vw, 2rem)"
        : "clamp(1.75rem, 3.2vw, 2.625rem)";

  return (
    <h2
      className="font-display font-extrabold leading-[1.07]"
      style={{
        fontSize,
        letterSpacing: "-0.026em",
        color: "var(--blue-navy)",
      }}
    >
      {tagline}{" "}
      {taglineAccent && (
        <span style={{ color: theme.primary }}>{taglineAccent}</span>
      )}
    </h2>
  );
}

function FloatingOrb({
  theme,
  size = 400,
  top,
  right,
  left,
  bottom,
  opacity = 0.55,
  delay = 0,
}: {
  theme: Theme;
  size?: number;
  top?: string;
  right?: string;
  left?: string;
  bottom?: string;
  opacity?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full"
      style={{
        width: size,
        height: size,
        top,
        right,
        left,
        bottom,
        background: `radial-gradient(circle at 35% 35%, ${theme.softStrong} 0%, transparent 70%)`,
        filter: "blur(72px)",
        opacity,
      }}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{
        duration: 12 + delay * 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

function Check({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
      <path
        d="M2 5l2 2 4-4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Bonus: decorative assets ─────────────────────────────────────────────────

/** Animated star-burst for the section header pill */
function BonusStarIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none">
      <path
        d="M10 2l1.8 4.5L16.5 8l-4.5 1.8L10 14.5l-1.8-4.7L3.5 8l4.7-1.5z"
        fill={color}
      />
      <circle cx="16" cy="4" r="1.1" fill={color} opacity="0.5" />
      <circle cx="4" cy="16" r="0.8" fill={color} opacity="0.4" />
    </svg>
  );
}

/** 4-point star shape — used as a decorative accent on cards */
function StarAccent({
  size = 14,
  color,
  opacity = 0.35,
}: {
  size?: number;
  color: string;
  opacity?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      style={{ opacity, flexShrink: 0 }}
    >
      <path
        d="M7 0.5C7 0.5 7.6 4.4 9 5.8C10.4 7.2 13.5 7 13.5 7C13.5 7 10.4 6.8 9 8.2C7.6 9.6 7 13.5 7 13.5C7 13.5 6.4 9.6 5 8.2C3.6 6.8 0.5 7 0.5 7C0.5 7 3.6 7.2 5 5.8C6.4 4.4 7 0.5 7 0.5Z"
        fill={color}
      />
    </svg>
  );
}

/** Subtle diagonal grid pattern for the header — rendered as inline SVG data URI */
function headerPatternStyle(color: string): React.CSSProperties {
  const encoded = encodeURIComponent(
    `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="1" cy="1" r="1" fill="${color}" opacity="0.25"/></svg>`,
  );
  return {
    backgroundImage: `url("data:image/svg+xml,${encoded}")`,
    backgroundSize: "20px 20px",
  };
}

// ─── Bonus Card ───────────────────────────────────────────────────────────────

/**
 * Two variants driven by bonus count:
 *
 * "large"   (< 4 items) — centered icon tower, generous padding, value emphasis
 * "compact" (≥ 4 items) — horizontal row, tight, scannable
 *
 * Both share: left accent bar, star accent, highlight badge, description, hover lift.
 */
function BonusCard({
  bonus,
  index,
  theme,
  variant,
}: {
  bonus: Bonus;
  index: number;
  theme: Theme;
  variant: "large" | "compact";
}) {
  if (variant === "large") {
    return (
      <Reveal delay={0.06 + index * 0.08} y={20}>
        <motion.div
          className="relative flex flex-col rounded-2xl overflow-hidden h-full"
          style={{
            background: "var(--surface)",
            border: `1.5px solid ${theme.border}`,
            boxShadow: `0 4px 24px ${theme.border}, inset 0 1px 0 rgba(255,255,255,0.7)`,
          }}
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          {/* Top accent bar — full width gradient */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{
              background: `linear-gradient(90deg, ${theme.primary}00 0%, ${theme.primary} 40%, ${theme.primary}88 70%, ${theme.primary}00 100%)`,
            }}
          />

          {/* Icon region — tinted top half */}
          <div
            className="relative flex items-center justify-center pt-7 pb-5"
            style={{
              background: `linear-gradient(160deg, ${theme.soft} 0%, ${theme.softStrong} 100%)`,
            }}
          >
            {/* Corner star accents */}
            <div className="absolute top-3 left-3">
              <StarAccent size={10} color={theme.primary} opacity={0.4} />
            </div>
            <div className="absolute top-3 right-3">
              <StarAccent size={8} color={theme.primary} opacity={0.25} />
            </div>

            {/* Icon pill */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: theme.primary,
                boxShadow: `0 6px 20px ${theme.primary}50`,
              }}
            >
              <Icon
                name={bonus.icon}
                className="w-6 h-6"
                style={{ color: "white" }}
              />
            </div>
          </div>

          {/* Separator */}
          <div className="mx-5 h-px" style={{ background: theme.border }} />

          {/* Text region */}
          <div className="flex-1 flex flex-col px-5 pt-4 pb-5">
            {/* Title + badge row */}
            <div className="flex items-center gap-2 flex-col mb-2">
              <p
                className="font-display font-extrabold leading-snug text-center flex "
                style={{ fontSize: "0.9375rem", color: "var(--blue-navy)" }}
              >
                {bonus.title}
              </p>
              {bonus.highlight && (
                <span
                  className="inline-flex items-center shrink-0 px-2.5 py-0.5 rounded-full font-display font-bold"
                  style={{
                    fontSize: "0.5rem",
                    letterSpacing: "0.07em",
                    background: theme.primary,
                    color: "white",
                    boxShadow: `0 2px 8px ${theme.primary}50`,
                    marginTop: "2px",
                  }}
                >
                  {bonus.highlight}
                </span>
              )}
              {bonus.description && (
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-muted)",
                    lineHeight: "1.65",
                  }}
                >
                  {bonus.description}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </Reveal>
    );
  }

  // ── Compact variant ───────────────────────────────────────────────────────
  return (
    <Reveal delay={0.05 + index * 0.06} y={14}>
      <motion.div
        className="relative flex items-start gap-3.5 rounded-xl overflow-hidden"
        style={{
          padding: "0.875rem 1rem 0.875rem 1.125rem",
          background: "var(--surface)",
          border: `1.5px solid ${theme.border}`,
          boxShadow: `0 2px 12px ${theme.border}, inset 0 1px 0 rgba(255,255,255,0.6)`,
        }}
        whileHover={{ y: -3, x: 2 }}
        transition={{ duration: 0.25, ease: EASE }}
      >
        {/* Left accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full"
          style={{
            background: `linear-gradient(to bottom, ${theme.primary}, ${theme.primary}00)`,
          }}
        />

        {/* Icon */}
        <div
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${theme.softStrong} 0%, ${theme.soft} 100%)`,
            border: `1.5px solid ${theme.border}`,
            boxShadow: `0 2px 8px ${theme.border}`,
          }}
        >
          <Icon
            name={bonus.icon}
            className="w-[18px] h-[18px]"
            style={{ color: theme.primary }}
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className="font-display font-extrabold leading-snug"
              style={{ fontSize: "0.875rem", color: "var(--blue-navy)" }}
            >
              {bonus.title}
            </p>
            {bonus.highlight && (
              <span
                className="inline-flex items-center shrink-0 px-2 py-0.5 rounded-full font-display font-bold"
                style={{
                  fontSize: "0.5rem",
                  letterSpacing: "0.07em",
                  background: theme.primary,
                  color: "white",
                  boxShadow: `0 1px 6px ${theme.primary}44`,
                }}
              >
                {bonus.highlight}
              </span>
            )}
          </div>
          {bonus.description && (
            <p
              className="mt-0.5"
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                lineHeight: "1.6",
              }}
            >
              {bonus.description}
            </p>
          )}
        </div>

        {/* Top-right decorative star */}
        <div className="absolute top-2.5 right-2.5 pointer-events-none">
          <StarAccent size={8} color={theme.primary} opacity={0.2} />
        </div>
      </motion.div>
    </Reveal>
  );
}

// ─── Bonus Section ────────────────────────────────────────────────────────────

function BonusSection({
  bonus,
  bonusTitle,
  bonusNote,
  theme,
}: {
  bonus: Bonus[];
  bonusTitle?: string;
  bonusNote?: string;
  theme: Theme;
}) {
  const title = bonusTitle ?? "Bonus yang Kamu Dapat";

  // Large mode for ≤3 items (showcase each card), compact for 4+
  const isHighlightMode = bonus.length <= 3;

  const gridClass = isHighlightMode
    ? bonus.length === 1
      ? "grid-cols-1 max-w-xs mx-auto"
      : bonus.length === 2
        ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
        : "grid-cols-1 sm:grid-cols-3"
    : bonus.length <= 4
      ? "sm:grid-cols-2"
      : bonus.length <= 6
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <Reveal delay={0.12}>
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: "var(--surface)",
          border: `1.5px solid ${theme.border}`,
          boxShadow: `0 16px 56px ${theme.border}`,
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div
          className="relative flex items-center gap-3.5 px-6 py-4 overflow-hidden"
          style={{
            background: `linear-gradient(105deg, ${theme.soft} 0%, ${theme.softStrong} 60%, ${theme.soft} 100%)`,
            borderBottom: `1.5px solid ${theme.border}`,
            ...headerPatternStyle(theme.primary),
          }}
        >
          {/* Ambient glows */}
          <div
            className="absolute -right-8 -top-8 w-32 h-32 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${theme.primary}28 0%, transparent 70%)`,
              filter: "blur(16px)",
            }}
          />
          <div
            className="absolute left-1/2 bottom-0 w-20 h-10 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse, ${theme.primary}10 0%, transparent 70%)`,
              filter: "blur(10px)",
            }}
          />

          {/* Icon pill */}
          <motion.div
            className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: theme.primary,
              boxShadow: `0 4px 16px ${theme.primary}55`,
            }}
            animate={{ rotate: [0, 8, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <BonusStarIcon color="white" />
          </motion.div>

          {/* Title block */}
          <div className="relative min-w-0">
            <p
              className="font-display font-extrabold leading-tight"
              style={{
                fontSize: "1.0625rem",
                color: "var(--blue-navy)",
                letterSpacing: "-0.018em",
              }}
            >
              {title}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <StarAccent size={8} color={theme.primary} opacity={0.6} />
              <p
                style={{
                  fontSize: "0.6875rem",
                  color: "var(--text-faint)",
                }}
              >
                {bonus.length} bonus eksklusif sudah termasuk
              </p>
            </div>
          </div>

          {/* Count badge */}
          <div className="relative ml-auto shrink-0">
            <motion.div
              className="w-10 h-10 rounded-full flex items-center justify-center font-display font-black"
              style={{
                background: "var(--surface)",
                border: `2px solid ${theme.border}`,
                fontSize: "1rem",
                color: theme.primary,
                boxShadow: `0 4px 14px ${theme.border}`,
              }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {bonus.length}
            </motion.div>
          </div>
        </div>

        {/* ── Cards grid ─────────────────────────────────────────────────── */}
        <div className={`grid gap-3 p-5 ${gridClass}`}>
          {bonus.map((b, i) => (
            <BonusCard
              key={b.title}
              bonus={b}
              index={i}
              theme={theme}
              variant={isHighlightMode ? "large" : "compact"}
            />
          ))}
        </div>

        {/* ── Bonus note ─────────────────────────────────────────────────── */}
        {bonusNote && (
          <div className="px-5 pb-5">
            <motion.div
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
              style={{
                background: `linear-gradient(100deg, ${theme.soft} 0%, ${theme.softStrong}88 100%)`,
                border: `1px solid ${theme.border}`,
              }}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.3, ease: EASE }}
            >
              {/* Info circle icon */}
              <div
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
                style={{
                  background: theme.softStrong,
                  border: `1.5px solid ${theme.border}`,
                  boxShadow: `0 2px 8px ${theme.border}`,
                }}
              >
                <svg viewBox="0 0 12 12" className="w-3.5 h-3.5" fill="none">
                  <circle
                    cx="6"
                    cy="6"
                    r="5"
                    stroke={theme.primary}
                    strokeWidth="1.3"
                  />
                  <path
                    d="M6 5.5v3"
                    stroke={theme.primary}
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                  <circle cx="6" cy="3.75" r="0.65" fill={theme.primary} />
                </svg>
              </div>

              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-muted)",
                  lineHeight: "1.68",
                }}
              >
                {bonusNote}
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </Reveal>
  );
}

// ─── Package card ─────────────────────────────────────────────────────────────

function PackageCard({ pkg, theme }: { pkg: PricingPackage; theme: Theme }) {
  const isHighlighted = !!pkg.highlight;

  return (
    <motion.div
      whileHover={{ scale: 1.025, x: isHighlighted ? 0 : 4 }}
      transition={{ duration: 0.22, ease: EASE }}
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: isHighlighted ? theme.primary : theme.soft,
        border: `1.5px solid ${isHighlighted ? theme.primary : theme.border}`,
        boxShadow: isHighlighted
          ? `0 8px 28px ${theme.primary}40`
          : `0 2px 10px ${theme.border}`,
      }}
    >
      {isHighlighted && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(255,255,255,0.04) 100%)",
          }}
        />
      )}

      {pkg.highlight && (
        <span
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full font-display font-bold bg-white"
          style={{
            fontSize: "0.5625rem",
            color: theme.primary,
            letterSpacing: "0.06em",
            boxShadow: `0 2px 8px rgba(0,0,0,0.12)`,
          }}
        >
          {pkg.highlight}
        </span>
      )}

      <div className="flex items-end gap-2 mb-1">
        <p
          className="font-display font-black"
          style={{
            fontSize: "1.5rem",
            color: isHighlighted ? "white" : theme.primary,
            letterSpacing: "-0.025em",
            lineHeight: 1,
          }}
        >
          {pkg.price}
        </p>
        {pkg.originalPrice && (
          <p
            className="line-through mb-0.5"
            style={{
              fontSize: "0.875rem",
              color: isHighlighted
                ? "rgba(255,255,255,0.5)"
                : "var(--text-faint)",
            }}
          >
            {pkg.originalPrice}
          </p>
        )}
      </div>

      <p
        className="font-display font-semibold"
        style={{
          fontSize: "0.8125rem",
          color: isHighlighted ? "rgba(255,255,255,0.85)" : "var(--text-muted)",
        }}
      >
        {pkg.label}
      </p>

      {pkg.note && (
        <p
          style={{
            fontSize: "0.6875rem",
            color: isHighlighted
              ? "rgba(255,255,255,0.6)"
              : "var(--text-faint)",
            marginTop: "3px",
            lineHeight: "1.5",
          }}
        >
          {pkg.note}
        </p>
      )}
    </motion.div>
  );
}

// ─── Pricing Group Card ────────────────────────────────────────────────────────

function PricingGroupCard({
  group,
  index,
  theme,
}: {
  group: PricingGroup;
  index: number;
  theme: Theme;
}) {
  return (
    <Reveal delay={index * 0.1}>
      <div
        className="rounded-3xl overflow-hidden h-full flex flex-col"
        style={{
          background: "var(--surface)",
          border: `2px solid ${theme.border}`,
          boxShadow: `0 20px 60px ${theme.border}`,
        }}
      >
        <div
          className="px-6 py-5 flex items-center gap-3"
          style={{
            background: theme.soft,
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          {group.icon && (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: theme.primary,
                boxShadow: `0 4px 14px ${theme.primary}44`,
              }}
            >
              <Icon
                name={group.icon}
                className="w-5 h-5"
                style={{ color: "white" }}
              />
            </div>
          )}
          <div>
            <p
              className="font-display font-extrabold"
              style={{ fontSize: "1.0625rem", color: "var(--blue-navy)" }}
            >
              {group.title}
            </p>
            {group.subtitle && (
              <p style={{ fontSize: "0.75rem", color: "var(--text-faint)" }}>
                {group.subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="p-6 flex flex-col flex-1">
          <div className="space-y-2.5 mb-7">
            {group.features.map((f) => (
              <div key={f} className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: theme.soft,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <Check color={theme.primary} />
                </div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-muted)",
                    lineHeight: "1.6",
                  }}
                >
                  {f}
                </p>
              </div>
            ))}
          </div>

          <div className="flex-1" />

          <div className="space-y-3">
            {group.packages.map((pkg) => (
              <PackageCard key={pkg.label} pkg={pkg} theme={theme} />
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type PricingSectionContent = {
  globalNote?: string;
  title?: string;
  description?: string;
  groups: PricingGroup[];
  bonusTitle?: string;
  bonusNote?: string;
  bonus?: Bonus[];
  urgency?: string;
};

// ─── Main export ──────────────────────────────────────────────────────────────

export function PricingSection({
  content,
  theme,
}: {
  content: PricingSectionContent;
  theme: Theme;
}) {
  const hasBonus = content.bonus && content.bonus.length > 0;

  return (
    <section
      id="pricing"
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ background: "var(--bg-soft)" }}
    >
      <FloatingOrb
        theme={theme}
        size={480}
        top="-15%"
        right="-5%"
        opacity={0.4}
      />
      <FloatingOrb
        theme={theme}
        size={360}
        bottom="-10%"
        left="-5%"
        opacity={0.3}
        delay={5}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* ── Section Header ── */}
        <div className="flex flex-col items-center text-center mb-14">
          <Reveal>
            <SectionPill theme={theme}>✦ Pricing</SectionPill>
          </Reveal>
          {content.title && (
            <Reveal delay={0.07} className="mt-5 mb-3">
              <SectionHeading tagline={content.title} theme={theme} />
            </Reveal>
          )}
          {content.description && (
            <Reveal delay={0.13}>
              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--text-muted)",
                  maxWidth: "440px",
                  lineHeight: "1.72",
                }}
              >
                {content.description}
              </p>
            </Reveal>
          )}
        </div>

        {/* ── Pricing Groups ── */}
        <div
          className={`grid gap-8 mb-10 ${
            content.groups.length === 1 ? "max-w-2xl mx-auto" : "lg:grid-cols-2"
          }`}
        >
          {content.groups.map((group, gi) => (
            <PricingGroupCard
              key={group.title}
              group={group}
              index={gi}
              theme={theme}
            />
          ))}
        </div>

        {/* ── Bonus Section ── */}
        {hasBonus && (
          <div className="mb-8">
            <BonusSection
              bonus={content.bonus!}
              bonusTitle={content.bonusTitle}
              bonusNote={content.bonusNote}
              theme={theme}
            />
          </div>
        )}

        {/* ── Footer: globalNote + urgency ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {content.globalNote && (
            <Reveal>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: theme.soft,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <Check color={theme.primary} />
                </div>
                <p
                  style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}
                >
                  {content.globalNote}
                </p>
              </div>
            </Reveal>
          )}
          {content.urgency && (
            <Reveal>
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.15)",
                }}
              >
                <motion.span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: "#ef4444" }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "#dc2626",
                    fontWeight: 600,
                  }}
                >
                  {content.urgency}
                </p>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
