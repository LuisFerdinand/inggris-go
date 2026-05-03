"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import { Icon } from "@/components/Icon";
import { Theme } from "@/lib/utils";

const EASE = [0.25, 0.1, 0.25, 1] as const;

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
} & HTMLMotionProps<"div">;

function Reveal({
  children,
  delay = 0,
  y = 18,
  className = "",
  ...props
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function SectionPill({
  theme,
  children,
}: {
  theme: Theme;
  children: React.ReactNode;
}) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-semibold"
      style={{
        fontSize: "0.6875rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        background: "rgba(255,107,53,0.08)",
        color: "#ff6b35",
        border: "1px solid rgba(255,107,53,0.18)",
      }}
    >
      {children}
    </div>
  );
}

/* ─── Types ───────────────────────────────────────────────── */

export type BenefitItem = {
  title: string;
  description?: string;
  icon: string;
};

export type WhySectionConclusion = {
  tagline: string;
  taglineAccent?: string;
};

export type WhySectionContent = {
  title: string;
  subtitle?: string;
  icon?: string;
  tagline: string;
  taglineAccent?: string;
  conclusion?: WhySectionConclusion;
  items: BenefitItem[];
};

/* ─── Problem Card with left border accent ────────────────── */

function ProblemCard({
  item,
  index,
  theme,
}: {
  item: BenefitItem;
  index: number;
  theme: Theme;
}) {
  const accentColor = "#ff6b35";

  return (
    <Reveal delay={index * 0.08} y={14}>
      <motion.div
        className="relative flex items-start gap-4"
        whileHover={{ x: 3 }}
        transition={{ duration: 0.22, ease: EASE }}
        style={{
          background: "var(--surface, #ffffff)",
          borderRadius: "14px",
          borderLeft: `3px solid ${accentColor}`,
          borderTop: "1px solid rgba(255,107,53,0.12)",
          borderRight: "1px solid rgba(255,107,53,0.08)",
          borderBottom: "1px solid rgba(255,107,53,0.08)",
          padding: "18px 20px 18px 22px",
          boxShadow:
            "0 2px 12px rgba(255,107,53,0.06), 0 1px 3px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        {/* Subtle glow in top-right */}
        <div
          className="absolute top-0 right-0 w-24 h-24 rounded-bl-full pointer-events-none"
          style={{ background: "rgba(255,107,53,0.04)" }}
        />

        {/* Icon */}
        <div
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5 relative z-10"
          style={{
            background: "rgba(255,107,53,0.07)",
            border: "1.5px solid rgba(255,107,53,0.16)",
          }}
        >
          <Icon
            name={item.icon}
            className="w-5 h-5"
            style={{ color: accentColor }}
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 relative z-10">
          <p
            className="font-display font-extrabold leading-snug mb-1"
            style={{
              fontSize: "0.9375rem",
              color: "var(--blue-navy, #0a1628)",
            }}
          >
            {item.title}
          </p>
          {item.description && (
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--text-muted, #64748b)",
                lineHeight: "1.6",
              }}
            >
              {item.description}
            </p>
          )}
        </div>

        {/* Number badge */}
        <div
          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center relative z-10"
          style={{
            background: "rgba(255,107,53,0.08)",
            fontSize: "0.625rem",
            fontWeight: 700,
            color: "rgba(255,107,53,0.5)",
            letterSpacing: "0.04em",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </div>
      </motion.div>
    </Reveal>
  );
}

/* ─── Conclusion Block ────────────────────────────────────── */

function ConclusionBlock({
  conclusion,
  theme,
  delay = 0,
}: {
  conclusion: WhySectionConclusion;
  theme: Theme;
  delay?: number;
}) {
  const accentColor = theme.primary;

  // Split tagline text: taglineAccent is the bold prefix
  const { tagline, taglineAccent } = conclusion;

  return (
    <Reveal delay={delay} y={12}>
      <motion.div
        whileHover={{ x: 3 }}
        transition={{ duration: 0.22, ease: EASE }}
        className="relative"
        style={{
          borderLeft: `3px solid ${accentColor}`,
          borderRadius: "14px",
          borderTop: "1px solid rgba(59,130,246,0.12)",
          borderRight: "1px solid rgba(59,130,246,0.08)",
          borderBottom: "1px solid rgba(59,130,246,0.08)",
          padding: "20px 24px 20px 24px",
          background: "var(--surface, #ffffff)",
          boxShadow: `0 4px 18px rgba(59,130,246,0.08), 0 1px 4px rgba(0,0,0,0.04)`,
          overflow: "hidden",
        }}
      >
        {/* Decorative top-right soft bloom */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-bl-full pointer-events-none"
          style={{ background: `${theme.soft}`, opacity: 0.7 }}
        />

        {/* Thin accent bar */}
        <div
          className="w-8 h-0.5 rounded-full mb-3 relative z-10"
          style={{ background: accentColor, opacity: 0.5 }}
        />

        <p
          className="relative z-10 leading-relaxed"
          style={{
            fontSize: "0.9375rem",
            color: "var(--text-muted, #64748b)",
            lineHeight: "1.75",
          }}
        >
          {taglineAccent && (
            <strong
              style={{
                color: "var(--blue-navy, #0a1628)",
                fontWeight: 800,
                marginRight: "0.25em",
              }}
            >
              {taglineAccent}
            </strong>
          )}
          {tagline}
        </p>
      </motion.div>
    </Reveal>
  );
}

/* ─── Heading (why variant) ───────────────────────────────── */

function WhyHeading({
  tagline,
  taglineAccent,
  align = "left",
}: {
  tagline: string;
  taglineAccent?: string;
  align?: "center" | "left";
}) {
  const parts = taglineAccent ? tagline.split(taglineAccent) : [tagline];

  return (
    <h2
      className="font-display font-extrabold leading-[1.07]"
      style={{
        fontSize: "clamp(1.6rem, 3vw, 2.5rem)",
        letterSpacing: "-0.025em",
        color: "var(--blue-navy, #0a1628)",
        textAlign: align,
      }}
    >
      {taglineAccent ? (
        <>
          {parts[0]}
          <span style={{ color: "#ff6b35" }}> {taglineAccent}</span>
          {parts[1]}
        </>
      ) : (
        tagline
      )}
    </h2>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT — WhySection
════════════════════════════════════════════════════════════ */

export function WhySection({
  content,
  theme,
  id,
}: {
  content: WhySectionContent;
  theme: Theme;
  id: string;
}) {
  const hasConclusion = !!content.conclusion;

  return (
    <section
      id={id}
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ background: "var(--surface, #ffffff)" }}
    >
      {/* Ambient radial glow — warm left side */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 55% 50% at 0% 55%, rgba(255,107,53,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* ── MOBILE layout ── */}
        <div className="lg:hidden flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <Reveal>
              <SectionPill theme={theme}>
                {content.icon && (
                  <Icon
                    name={content.icon}
                    className="w-3.5 h-3.5"
                    style={{ color: "#ff6b35" }}
                  />
                )}
                {content.title}
              </SectionPill>
            </Reveal>

            <Reveal delay={0.06} className="mt-4">
              <WhyHeading
                tagline={content.tagline}
                taglineAccent={content.taglineAccent}
                align="center"
              />
            </Reveal>

            {content.subtitle && (
              <Reveal delay={0.1}>
                <p
                  className="mt-3"
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-muted, #64748b)",
                    lineHeight: "1.75",
                    maxWidth: 380,
                  }}
                >
                  {content.subtitle}
                </p>
              </Reveal>
            )}
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-3">
            {content.items.map((item, i) => (
              <ProblemCard
                key={item.title}
                item={item}
                index={i}
                theme={theme}
              />
            ))}
          </div>

          {/* Conclusion */}
          {hasConclusion && (
            <ConclusionBlock
              conclusion={content.conclusion!}
              theme={theme}
              delay={content.items.length * 0.06}
            />
          )}
        </div>

        {/* ── DESKTOP layout ── */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_1.1fr] gap-16 xl:gap-24 items-start">
          {/* LEFT — sticky header */}
          <div className="flex flex-col lg:sticky lg:top-24">
            <Reveal>
              <SectionPill theme={theme}>
                {content.icon && (
                  <Icon
                    name={content.icon}
                    className="w-3.5 h-3.5"
                    style={{ color: "#ff6b35" }}
                  />
                )}
                {content.title}
              </SectionPill>
            </Reveal>

            <Reveal delay={0.07} className="mt-5 mb-4">
              <WhyHeading
                tagline={content.tagline}
                taglineAccent={content.taglineAccent}
                align="left"
              />
            </Reveal>

            {content.subtitle && (
              <Reveal delay={0.11}>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--text-muted, #64748b)",
                    lineHeight: "1.78",
                    maxWidth: 400,
                  }}
                >
                  {content.subtitle}
                </p>
              </Reveal>
            )}

            {/* Decorative dots */}
            <Reveal delay={0.16} className="mt-8">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: i === 0 ? 20 : 6,
                      height: 6,
                      background: i === 0 ? "#ff6b35" : "rgba(255,107,53,0.2)",
                      transition: "all 0.3s",
                    }}
                  />
                ))}
              </div>
            </Reveal>

            {/* Item count display */}
            <Reveal delay={0.18} className="mt-6">
              <div
                className="inline-flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{
                  background: "rgba(255,107,53,0.05)",
                  border: "1px solid rgba(255,107,53,0.12)",
                }}
              >
                <span
                  className="font-extrabold"
                  style={{
                    fontSize: "1.5rem",
                    color: "#ff6b35",
                    lineHeight: 1,
                  }}
                >
                  {content.items.length}
                </span>
                <span
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-muted, #64748b)",
                    lineHeight: "1.4",
                    maxWidth: 120,
                  }}
                >
                  masalah umum yang sering terjadi
                </span>
              </div>
            </Reveal>
          </div>

          {/* RIGHT — cards stack */}
          <div className="flex flex-col gap-3">
            {content.items.map((item, i) => (
              <ProblemCard
                key={item.title}
                item={item}
                index={i}
                theme={theme}
              />
            ))}

            {/* Conclusion block below cards */}
            {hasConclusion && (
              <div className="mt-2">
                <ConclusionBlock
                  conclusion={content.conclusion!}
                  theme={theme}
                  delay={content.items.length * 0.06 + 0.1}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhySection;
