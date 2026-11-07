"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";

import { BRAND, GRADIENT_GOLD_TEXT } from "@/constants/brand";

const ease = [0.22, 1, 0.36, 1] as const;

type SectionHeadingProps = {
  /** Small label above the title, e.g. "Metode Kami". */
  eyebrow?: ReactNode;
  /** Main heading text. */
  title: ReactNode;
  /** Highlighted (gold) tail of the heading. */
  accent?: ReactNode;
  /** Text pushed after the accent, e.g. a trailing "?". */
  titleSuffix?: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  /** "dark" = for navy / photo backgrounds. */
  tone?: "light" | "dark";
  as?: "h1" | "h2" | "h3";
  className?: string;
};

/**
 * The one section header used across the public pages: label pill, big bold
 * title, gold underline bar, readable lead text.
 *
 * Built phone-first. On a phone the old headers (a faint 12px label, a
 * 17–28px title in the same weight as the body) read as just more text, so
 * visitors scrolled straight past them. Here the label is a filled pill, the
 * title never drops below 30px, and the gold bar gives the eye a place to
 * land when scrolling.
 */
export default function SectionHeading({
  eyebrow,
  title,
  accent,
  titleSuffix,
  description,
  align = "center",
  tone = "light",
  as: Tag = "h2",
  className = "",
}: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px 0px" });
  const dark = tone === "dark";
  const center = align === "center";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease }}
      className={`flex w-full flex-col ${
        center ? "items-center text-center" : "items-start text-left"
      } ${className}`}
    >
      {eyebrow && (
        <span
          className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.1em] sm:text-[0.8125rem]"
          style={
            dark
              ? {
                  background: "rgba(255,255,255,0.14)",
                  color: "#ffffff",
                  border: "1px solid rgba(255,255,255,0.3)",
                }
              : {
                  background: BRAND.gradientNavy,
                  color: "#ffffff",
                  boxShadow: BRAND.shadowBlueBtn,
                }
          }
        >
          <span
            aria-hidden
            className="size-1.5 flex-shrink-0 rounded-full"
            style={{ background: "var(--gold-vivid)" }}
          />
          <span className="min-w-0">{eyebrow}</span>
        </span>
      )}

      <Tag
        className="text-balance font-display font-extrabold leading-[1.12]"
        style={{
          fontSize: "clamp(1.875rem, 1.25rem + 3vw, 3rem)",
          letterSpacing: "-0.025em",
          color: dark ? "#ffffff" : BRAND.blueNavy,
        }}
      >
        {title}
        {accent ? (
          <>
            {" "}
            <span style={dark ? { color: "var(--gold-vivid)" } : GRADIENT_GOLD_TEXT}>
              {accent}
            </span>
          </>
        ) : null}
        {titleSuffix}
      </Tag>

      <span
        aria-hidden
        className="mt-4 block h-1.5 w-14 rounded-full"
        style={{ background: BRAND.gradientGold }}
      />

      {description && (
        <p
          className={`mt-4 max-w-xl text-pretty text-base leading-relaxed sm:text-lg ${
            center ? "mx-auto" : ""
          }`}
          style={{ color: dark ? "rgba(255,255,255,0.88)" : BRAND.textMuted }}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}
