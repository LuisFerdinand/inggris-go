"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import {
  motion,
  useInView,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { CategoryMeta } from "./data";
import { Icon } from "@/components/Icon";
import { generateTheme } from "@/lib/utils";

/* ══════════════════════════════════════════════════════════════
 * TYPES & CONSTANTS
 * ══════════════════════════════════════════════════════════════ */
type Theme = ReturnType<typeof generateTheme>;
const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_OUT = [0, 0, 0.38, 1] as const;

/* ══════════════════════════════════════════════════════════════
 * SHARED PRIMITIVES
 * ══════════════════════════════════════════════════════════════ */
function Reveal({
  children,
  delay = 0,
  y = 24,
  className = "",
  once = true,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-40px 0px" });
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
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-display font-bold uppercase"
      style={{
        fontSize: "0.625rem",
        letterSpacing: "0.14em",
        background: theme.soft,
        color: theme.primary,
        border: `1.5px solid ${theme.border}`,
        boxShadow: `0 2px 12px ${theme.border}`,
      }}
    >
      {children}
    </span>
  );
}

function SectionDivider({ theme }: { theme: Theme }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div
        className="flex-1 h-px"
        style={{ background: "var(--color-brand-border-soft)" }}
      />
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: theme.primary, opacity: 0.5 }}
      />
      <div
        className="flex-1 h-px"
        style={{ background: "var(--color-brand-border-soft)" }}
      />
    </div>
  );
}

function StatCard({
  value,
  label,
  theme,
  delay = 0,
}: {
  value: string;
  label: string;
  theme: Theme;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <div
        className="rounded-2xl p-4 flex flex-col"
        style={{
          background: theme.soft,
          border: `1.5px solid ${theme.border}`,
        }}
      >
        <span
          className="font-display font-black leading-none"
          style={{
            fontSize: "1.5rem",
            color: theme.primary,
            letterSpacing: "-0.03em",
          }}
        >
          {value}
        </span>
        <span
          className="mt-1"
          style={{
            fontSize: "0.6875rem",
            color: "var(--color-brand-text-faint)",
          }}
        >
          {label}
        </span>
      </div>
    </Reveal>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 1. HERO — Split Layout with Dynamic Right Panel
 * ══════════════════════════════════════════════════════════════ */

/** Adaptive right panel: priority — experience > steps > benefits */
function HeroRightPanel({
  category,
  theme,
}: {
  category: CategoryMeta;
  theme: Theme;
}) {
  const experience = category.experience ?? [];
  const steps = category.steps ?? [];
  const benefits = category.benefits ?? [];

  // Panel: Experience cards
  if (experience.length > 0) {
    return (
      <div className="flex flex-col gap-3">
        <p
          className="font-display font-bold uppercase"
          style={{
            fontSize: "0.5875rem",
            letterSpacing: "0.16em",
            color: "var(--color-brand-text-faint)",
            marginBottom: "0.25rem",
          }}
        >
          Apa yang kamu rasakan
        </p>
        {experience.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.1, duration: 0.55, ease: EASE }}
            whileHover={{ x: 4, scale: 1.015 }}
            className="flex items-start gap-3 p-4 rounded-2xl"
            style={{
              background:
                i % 2 === 0 ? theme.soft : "var(--color-brand-surface)",
              border: `1.5px solid ${theme.border}`,
              boxShadow: "var(--shadow-badge)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: theme.softStrong,
                border: `1px solid ${theme.border}`,
              }}
            >
              {item.icon && (
                <Icon
                  name={item.icon as any}
                  className="w-4 h-4"
                  style={{ color: theme.primary }}
                />
              )}
            </div>
            <div>
              <p
                className="font-display font-bold"
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-brand-blue-navy)",
                }}
              >
                {item.title}
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-brand-text-muted)",
                  lineHeight: "1.5",
                  marginTop: "2px",
                }}
              >
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Panel: Mini step flow
  if (steps.length > 0) {
    return (
      <div className="flex flex-col gap-1">
        <p
          className="font-display font-bold uppercase"
          style={{
            fontSize: "0.5875rem",
            letterSpacing: "0.16em",
            color: "var(--color-brand-text-faint)",
            marginBottom: "0.5rem",
          }}
        >
          Cara mulai
        </p>
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: EASE }}
            className="flex items-start gap-3 relative"
          >
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className="absolute left-[17px] top-9 w-px z-0"
                style={{ height: "calc(100% + 4px)", background: theme.border }}
              />
            )}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black flex-shrink-0 relative z-10"
              style={{
                background: theme.primary,
                color: "white",
                fontSize: "0.75rem",
                letterSpacing: "-0.01em",
              }}
            >
              {step.n ?? String(i + 1).padStart(2, "0")}
            </div>
            <div className="pb-4 flex-1">
              <p
                className="font-display font-bold"
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-brand-blue-navy)",
                }}
              >
                {step.title}
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-brand-text-muted)",
                  lineHeight: "1.5",
                  marginTop: "2px",
                }}
              >
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Panel: Benefits grid
  if (benefits.length > 0) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {benefits.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.09, duration: 0.5, ease: EASE }}
            whileHover={{ y: -3, scale: 1.02 }}
            className="p-4 rounded-2xl"
            style={{
              background:
                i % 2 === 0 ? theme.soft : "var(--color-brand-surface)",
              border: `1.5px solid ${theme.border}`,
              boxShadow: "var(--shadow-badge)",
            }}
          >
            {b.icon && (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5"
                style={{ background: theme.softStrong }}
              >
                <Icon
                  name={b.icon as any}
                  className="w-4 h-4"
                  style={{ color: theme.primary }}
                />
              </div>
            )}
            <p
              className="font-display font-bold"
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-brand-blue-navy)",
                lineHeight: 1.3,
              }}
            >
              {b.title}
            </p>
            <p
              style={{
                fontSize: "0.6875rem",
                color: "var(--color-brand-text-muted)",
                lineHeight: 1.5,
                marginTop: "3px",
              }}
            >
              {b.description}
            </p>
          </motion.div>
        ))}
      </div>
    );
  }

  // Fallback: program mini-list
  return (
    <div className="flex flex-col gap-3">
      <p
        className="font-display font-bold uppercase"
        style={{
          fontSize: "0.5875rem",
          letterSpacing: "0.16em",
          color: "var(--color-brand-text-faint)",
        }}
      >
        Program tersedia
      </p>
      {category.programs.slice(0, 3).map((p, i) => (
        <motion.div
          key={p.slug}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.08 }}
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{
            background: theme.soft,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: theme.softStrong }}
          >
            <Icon
              name={p.icon as any}
              className="w-4 h-4"
              style={{ color: theme.primary }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="font-display font-bold truncate"
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-brand-blue-navy)",
              }}
            >
              {p.title}
            </p>
            <p
              style={{
                fontSize: "0.625rem",
                color: theme.primary,
                fontWeight: 600,
              }}
            >
              {p.price}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function CategoryHero({
  category,
  theme,
}: {
  category: CategoryMeta;
  theme: Theme;
}) {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, -40]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.6]);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "var(--color-brand-surface)",
        minHeight: "min(90vh, 760px)",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Multi-layer background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: theme.gradient }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(${theme.primary} 0.7px, transparent 0.7px)`,
          backgroundSize: "24px 24px",
          opacity: 0.025,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${theme.primary} 0px, ${theme.primary} 0.4px, transparent 0.4px, transparent 22px)`,
          opacity: 0.018,
        }}
      />

      {/* Animated blobs */}
      <motion.div
        className="pointer-events-none absolute"
        style={{
          width: 560,
          height: 560,
          top: "-24%",
          right: "5%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.soft} 0%, transparent 70%)`,
          filter: "blur(70px)",
        }}
        animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute"
        style={{
          width: 340,
          height: 340,
          bottom: "-5%",
          left: "-4%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.soft} 0%, transparent 70%)`,
          filter: "blur(80px)",
        }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />

      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-20 lg:py-28"
      >
        <div className="grid lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] gap-12 lg:gap-16 items-start">
          {/* LEFT COLUMN */}
          <div>
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="flex items-center gap-2 mb-6"
            >
              <a
                href="/programs"
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-brand-text-faint)",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
                className="hover:opacity-70 transition-opacity font-display"
              >
                Program
              </a>
              <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none">
                <path
                  d="M6 4l4 4-4 4"
                  stroke="var(--color-brand-text-faint)"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                className="font-display font-semibold"
                style={{ fontSize: "0.8125rem", color: theme.primary }}
              >
                {category.shortLabel ?? category.label}
              </span>
            </motion.div>

            {/* Category pill */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.06, ease: EASE }}
              className="mb-5"
            >
              <SectionPill theme={theme}>
                <Icon
                  name={category.icon as any}
                  className="w-3.5 h-3.5"
                  style={{ color: theme.primary }}
                />
                {category.shortLabel ?? category.label}
              </SectionPill>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12, ease: EASE }}
              className="font-display font-extrabold leading-[1.04] mb-5"
              style={{
                fontSize: "clamp(2.3rem, 5.5vw, 4rem)",
                letterSpacing: "-0.03em",
                color: "var(--color-brand-blue-navy)",
              }}
            >
              {category.tagline}{" "}
              {category.taglineAccent && (
                <span style={{ color: theme.primary }}>
                  {category.taglineAccent}
                </span>
              )}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
              style={{
                fontSize: "clamp(0.9375rem, 1.5vw, 1.0625rem)",
                color: "var(--color-brand-text-muted)",
                lineHeight: "1.78",
                maxWidth: "540px",
                marginBottom: "2rem",
              }}
            >
              {category.description}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
              className="flex flex-wrap gap-3"
            >
              <motion.a
                href={category.cta.primaryHref}
                className="font-display font-bold px-7 py-3.5 rounded-xl flex items-center gap-2 text-white"
                style={{
                  fontSize: "0.9375rem",
                  background: theme.primary,
                  boxShadow: `0 6px 28px ${theme.border}`,
                  textDecoration: "none",
                  border: "none",
                }}
                whileHover={{
                  scale: 1.04,
                  boxShadow: `0 12px 40px ${theme.border}`,
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2, ease: EASE }}
              >
                {category.cta.primaryLabel}
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="white"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.a>
              {category.cta.secondaryLabel && (
                <motion.a
                  href={category.cta.secondaryHref ?? "/contact"}
                  className="font-display font-semibold px-6 py-3.5 rounded-xl flex items-center gap-2"
                  style={{
                    fontSize: "0.9375rem",
                    color: theme.primary,
                    background: theme.soft,
                    border: `1.5px solid ${theme.border}`,
                    textDecoration: "none",
                  }}
                  whileHover={{ scale: 1.02, background: theme.softStrong }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                >
                  {category.cta.secondaryLabel}
                </motion.a>
              )}
            </motion.div>

            {/* For who + stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.38 }}
              className="mt-8 pt-7"
              style={{ borderTop: "1px solid var(--color-brand-border-soft)" }}
            >
              <div className="flex items-center gap-2.5 mb-5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: theme.soft,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none">
                    <circle
                      cx="8"
                      cy="5"
                      r="2.5"
                      stroke={theme.primary}
                      strokeWidth="1.4"
                    />
                    <path
                      d="M3 13c0-2.76 2.24-5 5-5s5 2.24 5 5"
                      stroke={theme.primary}
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--color-brand-text-muted)",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: "var(--color-brand-blue-navy)",
                    }}
                  >
                    Untuk:{" "}
                  </span>
                  {category.forWho}
                </p>
              </div>

              {/* Inline mini-stats */}
              <div className="flex flex-wrap gap-4">
                {[
                  { v: `${category.programs.length}`, l: "Program" },
                  { v: "500+", l: "Siswa" },
                  { v: "4.9★", l: "Rating" },
                ].map((s) => (
                  <div key={s.l} className="flex items-baseline gap-1.5">
                    <span
                      className="font-display font-black"
                      style={{
                        fontSize: "1.25rem",
                        color: theme.primary,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {s.v}
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-brand-text-faint)",
                      }}
                    >
                      {s.l}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN — Context Visual Panel */}
          <motion.div
            initial={{ opacity: 0, x: 36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease: EASE }}
            className="hidden lg:block"
          >
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: "var(--color-brand-surface)",
                border: `1.5px solid ${theme.border}`,
                boxShadow: `0 32px 80px ${theme.border}, 0 4px 20px rgba(10,45,135,0.08)`,
              }}
            >
              {/* Panel accent top bar */}
              <div
                style={{
                  height: "3px",
                  background: `linear-gradient(90deg, ${theme.primary} 0%, ${theme.strong} 100%)`,
                }}
              />

              {/* Panel header */}
              <div
                className="px-5 pt-4 pb-4 flex items-center justify-between"
                style={{ borderBottom: `1px solid ${theme.border}` }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: theme.soft }}
                  >
                    <Icon
                      name={category.icon as any}
                      className="w-3.5 h-3.5"
                      style={{ color: theme.primary }}
                    />
                  </div>
                  <span
                    className="font-display font-bold"
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--color-brand-blue-navy)",
                    }}
                  >
                    {category.shortLabel}
                  </span>
                </div>
                <span
                  className="flex items-center gap-1.5"
                  style={{
                    fontSize: "0.625rem",
                    color: "var(--color-brand-text-faint)",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#4ade80" }}
                  />
                  Aktif
                </span>
              </div>

              <div className="p-5">
                <HeroRightPanel category={category} theme={theme} />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 2. PROGRAM LIST — Rich Cards
 * ══════════════════════════════════════════════════════════════ */
function ProgramCard({
  program,
  theme,
  index,
}: {
  program: CategoryMeta["programs"][number];
  theme: Theme;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  const startingPrice = program.priceTiers
    ? (() => {
        const nums = program.priceTiers
          .map((t) => parseInt(t.price.replace(/[^0-9]/g, ""), 10))
          .filter((n) => !isNaN(n));
        return nums.length > 0
          ? `Rp ${Math.min(...nums).toLocaleString("id-ID")}`
          : program.priceTiers[0].price;
      })()
    : null;

  return (
    <Reveal delay={index * 0.08} y={32}>
      <motion.a
        href={program.href}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ scale: 1.018, y: -7 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.28, ease: EASE }}
        className="flex flex-col rounded-2xl overflow-hidden h-full"
        style={{
          background: "var(--color-brand-surface)",
          border: `1.5px solid ${hovered ? theme.border : "var(--color-brand-border-soft)"}`,
          boxShadow: hovered
            ? `0 24px 64px ${theme.border}, 0 4px 20px rgba(10,45,135,0.08)`
            : "var(--shadow-badge)",
          transition: "border-color 0.25s ease, box-shadow 0.25s ease",
          textDecoration: "none",
        }}
      >
        {/* Theme accent top strip */}
        <div
          style={{
            height: "3px",
            background: hovered
              ? `linear-gradient(90deg, ${theme.primary} 0%, ${theme.strong} 100%)`
              : `linear-gradient(90deg, ${theme.border} 0%, transparent 100%)`,
            transition: "background 0.3s ease",
          }}
        />

        <div className="flex flex-col flex-1 p-5">
          {/* Icon + title */}
          <div className="flex items-start gap-3.5 mb-4">
            <motion.div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: hovered ? theme.softStrong : theme.soft,
                border: `1.5px solid ${theme.border}`,
                transition: "background 0.25s ease",
              }}
            >
              <Icon
                name={program.icon as any}
                className="w-6 h-6"
                style={{ color: theme.primary }}
              />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p
                className="font-display font-bold leading-snug"
                style={{
                  fontSize: "1.0625rem",
                  color: "var(--color-brand-blue-navy)",
                }}
              >
                {program.title}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {program.badge && (
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full font-display font-bold"
                    style={{
                      fontSize: "0.5875rem",
                      background: theme.primary,
                      color: "white",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    {program.badge}
                  </span>
                )}
                {program.level && (
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full font-display font-semibold"
                    style={{
                      fontSize: "0.5875rem",
                      background: theme.soft,
                      color: theme.primary,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    {program.level}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <p
            className="mb-4"
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-brand-text-muted)",
              lineHeight: "1.68",
            }}
          >
            {program.description}
          </p>

          {/* Highlight block */}
          {program.highlight && (
            <div
              className="flex items-start gap-2.5 mb-4 p-3.5 rounded-xl"
              style={{
                background: theme.soft,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div className="mt-0.5 flex-shrink-0">
                <svg viewBox="0 0 14 14" className="w-4 h-4" fill="none">
                  <circle
                    cx="7"
                    cy="7"
                    r="6"
                    fill={theme.primary}
                    opacity="0.18"
                  />
                  <path
                    d="M4.5 7l2 2 3.5-3.5"
                    stroke={theme.primary}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-brand-text-muted)",
                  lineHeight: "1.5",
                }}
              >
                {program.highlight}
              </p>
            </div>
          )}

          {/* Meta chips: duration, format */}
          {(program.duration || program.format) && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[program.duration, program.format].filter(Boolean).map((v) => (
                <span
                  key={v}
                  className="px-2.5 py-1 rounded-full font-display font-semibold"
                  style={{
                    fontSize: "0.625rem",
                    background: theme.softStrong,
                    color: theme.primary,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  {v}
                </span>
              ))}
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {program.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full"
                style={{
                  fontSize: "0.5875rem",
                  background: "var(--color-brand-surface-soft)",
                  color: "var(--color-brand-text-muted)",
                  border: "1px solid var(--color-brand-border-soft)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Price tiers grid */}
          {program.priceTiers && program.priceTiers.length > 0 && (
            <div className="mb-4">
              <p
                className="font-display font-bold uppercase mb-2"
                style={{
                  fontSize: "0.5875rem",
                  letterSpacing: "0.1em",
                  color: "var(--color-brand-text-faint)",
                }}
              >
                Pilih Paket
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {program.priceTiers.slice(0, 4).map((tier) => (
                  <div
                    key={tier.label}
                    className="rounded-xl p-2.5"
                    style={{
                      background: theme.soft,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <p
                      className="font-display font-semibold"
                      style={{
                        fontSize: "0.5875rem",
                        color: "var(--color-brand-text-faint)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {tier.label}
                    </p>
                    <p
                      className="font-display font-black"
                      style={{
                        fontSize: "0.9375rem",
                        color: theme.primary,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {tier.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1" />

          {/* Price + CTA footer */}
          <div
            className="flex items-center justify-between pt-4"
            style={{ borderTop: "1px solid var(--color-brand-border-soft)" }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.5875rem",
                  color: "var(--color-brand-text-faint)",
                }}
              >
                {startingPrice ? "Mulai dari" : "Harga"}
              </p>
              <p
                className="font-display font-black"
                style={{
                  fontSize: "1.125rem",
                  color: theme.primary,
                  letterSpacing: "-0.025em",
                }}
              >
                {startingPrice ?? program.price}
              </p>
            </div>
            <motion.div
              className="flex items-center gap-1.5 font-display font-bold px-4 py-2.5 rounded-xl text-white"
              style={{
                fontSize: "0.875rem",
                background: theme.primary,
                boxShadow: `0 4px 16px ${theme.border}`,
              }}
              animate={hovered ? { x: 3 } : { x: 0 }}
              transition={{ duration: 0.2 }}
              whileHover={{
                scale: 1.04,
                boxShadow: `0 8px 28px ${theme.border}`,
              }}
            >
              Daftar
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="white"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </div>
        </div>
      </motion.a>
    </Reveal>
  );
}

function ProgramList({
  category,
  theme,
}: {
  category: CategoryMeta;
  theme: Theme;
}) {
  const colClass =
    category.programs.length === 1
      ? "max-w-md mx-auto"
      : category.programs.length === 2
        ? "sm:grid-cols-2 max-w-2xl mx-auto"
        : category.programs.length >= 4
          ? "sm:grid-cols-2 lg:grid-cols-3"
          : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section
      id="program-list"
      className="relative py-20 lg:py-28"
      style={{ background: "var(--color-brand-bg)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse 50% 40% at 100% 0%, ${theme.soft} 0%, transparent 55%), radial-gradient(ellipse 40% 50% at 0% 100%, ${theme.soft} 0%, transparent 55%)`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center text-center mb-14">
          <Reveal>
            <SectionPill theme={theme}>✦ Program Tersedia</SectionPill>
          </Reveal>
          <Reveal delay={0.07}>
            <h2
              className="font-display font-extrabold mt-5 mb-4 leading-[1.07]"
              style={{
                fontSize: "clamp(1.9rem, 3.5vw, 2.75rem)",
                letterSpacing: "-0.024em",
                color: "var(--color-brand-blue-navy)",
              }}
            >
              Pilih program yang{" "}
              <span style={{ color: theme.primary }}>paling cocok untukmu</span>
            </h2>
          </Reveal>
          <Reveal delay={0.13}>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--color-brand-text-muted)",
                maxWidth: "450px",
                lineHeight: "1.72",
              }}
            >
              Semua program dirancang khusus untuk kebutuhan{" "}
              {category.shortLabel}. Klik untuk detail lengkap dan pendaftaran.
            </p>
          </Reveal>
        </div>

        <div className={`grid gap-6 ${colClass}`}>
          {category.programs.map((prog, i) => (
            <ProgramCard
              key={prog.slug}
              program={prog}
              theme={theme}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 3. PAIN → SOLUTION FLOW (redesigned as two-column narrative)
 * ══════════════════════════════════════════════════════════════ */
function PainSolutionSection({
  painPoints,
  benefits,
  theme,
}: {
  painPoints: NonNullable<CategoryMeta["painPoints"]>;
  benefits: NonNullable<CategoryMeta["benefits"]>;
  theme: Theme;
}) {
  return (
    <section
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ background: "var(--color-brand-surface)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse 55% 55% at 0% 60%, ${theme.soft} 0%, transparent 55%), radial-gradient(ellipse 45% 45% at 100% 40%, rgba(255,107,53,0.04) 0%, transparent 55%)`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <Reveal>
            <SectionPill theme={theme}>✦ Kamu Tidak Sendirian</SectionPill>
          </Reveal>
          <Reveal delay={0.07}>
            <h2
              className="font-display font-extrabold mt-5 mb-4 leading-[1.07]"
              style={{
                fontSize: "clamp(1.9rem, 3.5vw, 2.75rem)",
                letterSpacing: "-0.024em",
                color: "var(--color-brand-blue-navy)",
              }}
            >
              Dari{" "}
              <span style={{ color: "rgba(255,107,53,0.9)" }}>masalah</span> ke{" "}
              <span style={{ color: theme.primary }}>solusi</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--color-brand-text-muted)",
                maxWidth: "440px",
                margin: "0 auto",
                lineHeight: "1.72",
              }}
            >
              Banyak yang mengalami hambatan yang sama. Program kami dirancang
              spesifik untuk mengatasinya.
            </p>
          </Reveal>
        </div>

        {/* Two-column flow */}
        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-6 items-start">
          {/* PAIN column */}
          <div>
            <div
              className="flex items-center gap-2.5 mb-5 pb-3"
              style={{ borderBottom: "1.5px solid rgba(255,107,53,0.15)" }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(255,107,53,0.1)" }}
              >
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none">
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="#ff6b35"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 5v3M8 10v.5"
                    stroke="#ff6b35"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span
                className="font-display font-bold uppercase"
                style={{
                  fontSize: "0.625rem",
                  letterSpacing: "0.14em",
                  color: "#ff6b35",
                }}
              >
                Hambatan umum
              </span>
            </div>
            <div className="space-y-3">
              {painPoints.map((point, i) => (
                <Reveal key={point.title} delay={i * 0.08} y={20}>
                  <motion.div
                    whileHover={{ x: 5, scale: 1.01 }}
                    transition={{ duration: 0.22, ease: EASE }}
                    className="flex items-start gap-3.5 p-4 rounded-2xl"
                    style={{
                      background: "rgba(255,107,53,0.05)",
                      border: "1.5px solid rgba(255,107,53,0.15)",
                    }}
                  >
                    {point.icon && (
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "rgba(255,107,53,0.1)",
                          border: "1px solid rgba(255,107,53,0.2)",
                        }}
                      >
                        <Icon
                          name={point.icon as any}
                          className="w-4 h-4"
                          style={{ color: "#ff6b35" }}
                        />
                      </div>
                    )}
                    <div>
                      <p
                        className="font-display font-bold mb-0.5"
                        style={{
                          fontSize: "0.9375rem",
                          color: "var(--color-brand-blue-navy)",
                        }}
                      >
                        {point.title}
                      </p>
                      <p
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--color-brand-text-muted)",
                          lineHeight: "1.55",
                        }}
                      >
                        {point.description}
                      </p>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Middle arrow connector */}
          <div className="hidden lg:flex flex-col items-center justify-center pt-16 px-2">
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-px flex-1 min-h-8"
                style={{
                  background: `linear-gradient(to bottom, transparent, ${theme.border})`,
                }}
              />
              <motion.div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: theme.primary }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="white"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
              <div
                className="w-px flex-1 min-h-8"
                style={{
                  background: `linear-gradient(to bottom, ${theme.border}, transparent)`,
                }}
              />
            </div>
          </div>

          {/* SOLUTION column */}
          <div>
            <div
              className="flex items-center gap-2.5 mb-5 pb-3"
              style={{ borderBottom: `1.5px solid ${theme.border}` }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: theme.soft }}
              >
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none">
                  <path
                    d="M3 8l4 4 6-7"
                    stroke={theme.primary}
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                className="font-display font-bold uppercase"
                style={{
                  fontSize: "0.625rem",
                  letterSpacing: "0.14em",
                  color: theme.primary,
                }}
              >
                Solusi kami
              </span>
            </div>
            <div className="space-y-3">
              {benefits.map((b, i) => (
                <Reveal key={b.title} delay={i * 0.08} y={20}>
                  <motion.div
                    whileHover={{ x: 5, scale: 1.01 }}
                    transition={{ duration: 0.22, ease: EASE }}
                    className="flex items-start gap-3.5 p-4 rounded-2xl"
                    style={{
                      background: theme.soft,
                      border: `1.5px solid ${theme.border}`,
                    }}
                  >
                    {b.icon && (
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: theme.softStrong,
                          border: `1px solid ${theme.border}`,
                        }}
                      >
                        <Icon
                          name={b.icon as any}
                          className="w-4 h-4"
                          style={{ color: theme.primary }}
                        />
                      </div>
                    )}
                    <div>
                      <p
                        className="font-display font-bold mb-0.5"
                        style={{
                          fontSize: "0.9375rem",
                          color: "var(--color-brand-blue-navy)",
                        }}
                      >
                        {b.title}
                      </p>
                      <p
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--color-brand-text-muted)",
                          lineHeight: "1.55",
                        }}
                      >
                        {b.description}
                      </p>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 4. HOW IT WORKS — Enhanced Steps with connected flow
 * ══════════════════════════════════════════════════════════════ */
function StepsSection({
  steps,
  theme,
}: {
  steps: NonNullable<CategoryMeta["steps"]>;
  theme: Theme;
}) {
  return (
    <section
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ background: "var(--color-brand-bg)" }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center text-center mb-16">
          <Reveal>
            <SectionPill theme={theme}>✦ Cara Mulai</SectionPill>
          </Reveal>
          <Reveal delay={0.07}>
            <h2
              className="font-display font-extrabold mt-5 mb-4 leading-[1.07]"
              style={{
                fontSize: "clamp(1.9rem, 3.5vw, 2.75rem)",
                letterSpacing: "-0.024em",
                color: "var(--color-brand-blue-navy)",
              }}
            >
              Mulai dalam{" "}
              <span style={{ color: theme.primary }}>
                {steps.length} langkah mudah
              </span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--color-brand-text-muted)",
                maxWidth: "400px",
                lineHeight: "1.72",
              }}
            >
              Prosesnya sederhana dan jelas. Tidak ada yang perlu dikhawatirkan.
            </p>
          </Reveal>
        </div>

        <div className="relative ">
          {/* Horizontal connector line (desktop) */}
          <div
            className={`grid gap-8 ${
              steps.length <= 2
                ? "sm:grid-cols-2 max-w-2xl mx-auto"
                : "sm:grid-cols-3"
            }`}
          >
            {steps.length > 1 && (
              <div
                className="hidden lg:block pointer-events-none absolute z-0"
                style={{
                  top: "32px",
                  left: `calc(100% / ${steps.length * 2})`,
                  right: `calc(100% / ${steps.length * 2})`,
                  height: "2px",
                  background: `linear-gradient(90deg, transparent, ${theme.border}, ${theme.primary}, ${theme.border}, transparent)`,
                }}
              />
            )}

            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.1} y={24}>
                <div className="flex flex-col items-center text-center z-100">
                  {/* Step number bubble */}
                  <motion.div
                    className="relative mb-5"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.22 }}
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-black relative "
                      style={{
                        background: i === 0 ? theme.primary : theme.primary,
                        border: `2px solid ${i === 0 ? theme.primary : theme.border}`,
                        fontSize: "1.25rem",
                        color: "white",
                        letterSpacing: "-0.02em",
                        boxShadow:
                          i === 0 ? `0 8px 28px ${theme.border}` : "none",
                      }}
                    >
                      {step.n ?? String(i + 1).padStart(2, "0")}
                    </div>
                    {/* Glow ring */}
                    {i === 0 && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          border: `2px solid ${theme.primary}`,
                          opacity: 0.3,
                        }}
                        animate={{
                          scale: [1, 1.25, 1],
                          opacity: [0.3, 0, 0.3],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </motion.div>

                  {/* Step content */}
                  <p
                    className="font-display font-extrabold mb-2"
                    style={{
                      fontSize: "1.0625rem",
                      color: "var(--color-brand-blue-navy)",
                    }}
                  >
                    {step.title}
                  </p>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--color-brand-text-muted)",
                      lineHeight: "1.65",
                      maxWidth: "210px",
                      margin: "0 auto",
                    }}
                  >
                    {step.description}
                  </p>

                  {/* Progress indicator */}
                  <div
                    className="mt-4 px-3 py-1 rounded-full font-display font-semibold"
                    style={{
                      fontSize: "0.5875rem",
                      background: theme.soft,
                      color: theme.primary,
                      border: `1px solid ${theme.border}`,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Langkah {i + 1}/{steps.length}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 5. EXPERIENCE SECTION — Immersive card highlights
 * ══════════════════════════════════════════════════════════════ */
function ExperienceSection({
  experience,
  theme,
}: {
  experience: NonNullable<CategoryMeta["experience"]>;
  theme: Theme;
}) {
  return (
    <section
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ background: "var(--color-brand-surface)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse 70% 50% at 50% 0%, ${theme.soft} 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center text-center mb-14">
          <Reveal>
            <SectionPill theme={theme}>✦ Pengalaman Belajar</SectionPill>
          </Reveal>
          <Reveal delay={0.07}>
            <h2
              className="font-display font-extrabold mt-5 mb-3 leading-[1.07]"
              style={{
                fontSize: "clamp(1.9rem, 3.5vw, 2.75rem)",
                letterSpacing: "-0.024em",
                color: "var(--color-brand-blue-navy)",
              }}
            >
              Apa yang kamu rasakan{" "}
              <span style={{ color: theme.primary }}>di sini</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--color-brand-text-muted)",
                maxWidth: "420px",
                lineHeight: "1.72",
              }}
            >
              Bukan sekadar kelas biasa — ini adalah pengalaman yang akan
              mengubah caramu belajar.
            </p>
          </Reveal>
        </div>

        <div
          className={`grid gap-6 ${
            experience.length <= 2
              ? "sm:grid-cols-2 max-w-2xl mx-auto"
              : "sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {experience.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.09}>
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="relative overflow-hidden rounded-2xl p-6"
                style={{
                  background: theme.softStrong,
                  border: `1.5px solid ${theme.border}`,
                  boxShadow: `0 4px 20px ${theme.border}`,
                }}
              >
                {/* Corner accent */}
                <div
                  className="absolute top-0 right-0 w-20 h-20 rounded-bl-full"
                  style={{ background: theme.soft, opacity: 0.8 }}
                />
                {/* Corner dot */}
                <div
                  className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full"
                  style={{ background: theme.primary, opacity: 0.6 }}
                />

                <div className="relative z-10">
                  {item.icon && (
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{
                        background: theme.primary,
                        boxShadow: `0 6px 20px ${theme.border}`,
                      }}
                    >
                      <Icon
                        name={item.icon as any}
                        className="w-6 h-6"
                        style={{ color: "white" }}
                      />
                    </div>
                  )}
                  <p
                    className="font-display font-extrabold mb-2"
                    style={{
                      fontSize: "1rem",
                      color: "var(--color-brand-blue-navy)",
                    }}
                  >
                    {item.title}
                  </p>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--color-brand-text-muted)",
                      lineHeight: "1.65",
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 6. COMPARISON — Visual table-card layout
 * ══════════════════════════════════════════════════════════════ */
function ComparisonSection({
  comparison,
  theme,
  categoryLabel,
}: {
  comparison: NonNullable<CategoryMeta["comparison"]>;
  theme: Theme;
  categoryLabel: string;
}) {
  return (
    <section
      className="relative py-20 lg:py-24"
      style={{ background: "var(--color-brand-bg)" }}
    >
      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <Reveal>
            <SectionPill theme={theme}>✦ Apa yang Termasuk</SectionPill>
          </Reveal>
          <Reveal delay={0.07}>
            <h2
              className="font-display font-extrabold mt-5 mb-4 leading-[1.07]"
              style={{
                fontSize: "clamp(1.9rem, 3.5vw, 2.5rem)",
                letterSpacing: "-0.024em",
                color: "var(--color-brand-blue-navy)",
              }}
            >
              Ringkasan{" "}
              <span style={{ color: theme.primary }}>{categoryLabel}</span>
            </h2>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: `1.5px solid ${theme.border}`,
              boxShadow: `0 8px 36px ${theme.border}`,
            }}
          >
            {/* Header row */}
            <div
              className="px-6 py-4 flex items-center gap-3"
              style={{ background: theme.primary }}
            >
              <Icon
                name={(comparison as any).icon ?? "list"}
                className="w-5 h-5"
                style={{ color: "white" }}
              />
              <span
                className="font-display font-bold text-white"
                style={{ fontSize: "0.9375rem" }}
              >
                Detail Program
              </span>
            </div>

            {comparison.map((item, i) => (
              <motion.div
                key={item.label}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.18 }}
                className="flex items-center justify-between px-6 py-4"
                style={{
                  background:
                    i % 2 === 0 ? theme.soft : "var(--color-brand-surface)",
                  borderBottom:
                    i < comparison.length - 1
                      ? `1px solid ${theme.border}`
                      : undefined,
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: theme.primary }}
                  />
                  <span
                    className="font-display font-semibold"
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--color-brand-text-muted)",
                    }}
                  >
                    {item.label}
                  </span>
                </div>
                <span
                  className="font-display font-bold px-3 py-1 rounded-xl"
                  style={{
                    fontSize: "0.875rem",
                    color: theme.primary,
                    background: theme.soft,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  {item.value}
                </span>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 7. TESTIMONIALS — Featured card + carousel
 * ══════════════════════════════════════════════════════════════ */
function TestimonialsSection({
  socialProof,
  theme,
}: {
  socialProof: NonNullable<CategoryMeta["socialProof"]>;
  theme: Theme;
}) {
  const [active, setActive] = useState(0);

  return (
    <section
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ background: "var(--color-brand-surface)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse 65% 50% at 50% 0%, ${theme.soft} 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center text-center mb-12">
          <Reveal>
            <SectionPill theme={theme}>✦ Cerita Nyata</SectionPill>
          </Reveal>
          <Reveal delay={0.07}>
            <h2
              className="font-display font-extrabold mt-5 mb-3 leading-[1.07]"
              style={{
                fontSize: "clamp(1.9rem, 3.5vw, 2.75rem)",
                letterSpacing: "-0.024em",
                color: "var(--color-brand-blue-navy)",
              }}
            >
              Mereka sudah{" "}
              <span style={{ color: theme.primary }}>membuktikannya</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--color-brand-text-muted)",
                maxWidth: "360px",
                lineHeight: "1.72",
              }}
            >
              Bukan janji — ini hasil nyata dari alumni yang pernah ada di
              posisimu sekarang.
            </p>
          </Reveal>
        </div>

        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.42, ease: EASE }}
              className="relative rounded-3xl p-8 sm:p-10"
              style={{
                background: "var(--color-brand-surface)",
                border: `2px solid ${theme.border}`,
                boxShadow: `0 32px 80px ${theme.border}, 0 4px 24px rgba(10,45,135,0.07)`,
              }}
            >
              {/* Decorative quote mark */}
              <div
                className="absolute top-6 left-7 font-display font-black leading-none select-none pointer-events-none"
                style={{
                  fontSize: "6rem",
                  color: theme.primary,
                  opacity: 0.06,
                  lineHeight: 1,
                }}
              >
                "
              </div>

              {/* Category accent line */}
              <div
                className="absolute top-0 left-8 right-8 h-0.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${theme.primary}, transparent)`,
                }}
              />

              {/* Stars */}
              <div className="flex gap-1.5 mb-6">
                {[...Array(5)].map((_, i) => (
                  <motion.svg
                    key={i}
                    viewBox="0 0 14 14"
                    className="w-5 h-5"
                    fill="#FBBF24"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.06, duration: 0.3, ease: EASE }}
                  >
                    <path d="M7 1l1.8 3.6 3.8.5-2.7 2.6.6 3.8L7 9.6l-3.5 1.9.6-3.8L1.4 5.1l3.8-.5z" />
                  </motion.svg>
                ))}
              </div>

              <p
                className="italic mb-7 relative z-10"
                style={{
                  fontSize: "clamp(1rem, 1.5vw, 1.1875rem)",
                  color: "var(--color-brand-text-muted)",
                  lineHeight: "1.8",
                }}
              >
                "{socialProof[active].quote}"
              </p>

              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-display font-black"
                  style={{
                    background: theme.soft,
                    border: `2px solid ${theme.border}`,
                    fontSize: "1.125rem",
                    color: theme.primary,
                  }}
                >
                  {socialProof[active].name?.[0] ?? "?"}
                </div>
                <div>
                  {socialProof[active].name && (
                    <p
                      className="font-display font-bold"
                      style={{
                        fontSize: "0.9375rem",
                        color: "var(--color-brand-blue-navy)",
                      }}
                    >
                      {socialProof[active].name}
                    </p>
                  )}
                  {socialProof[active].role && (
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-brand-text-faint)",
                      }}
                    >
                      {socialProof[active].role}
                    </p>
                  )}
                </div>
                <div className="ml-auto">
                  <span
                    className="px-2.5 py-1 rounded-full font-display font-bold uppercase"
                    style={{
                      fontSize: "0.5875rem",
                      background: theme.soft,
                      color: theme.primary,
                      border: `1px solid ${theme.border}`,
                      letterSpacing: "0.08em",
                    }}
                  >
                    Alumni
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {socialProof.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <motion.button
                onClick={() => setActive((a) => Math.max(0, a - 1))}
                disabled={active === 0}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background:
                    active > 0 ? theme.soft : "var(--color-brand-surface-soft)",
                  border: `1.5px solid ${active > 0 ? theme.border : "var(--color-brand-border-soft)"}`,
                  cursor: active > 0 ? "pointer" : "not-allowed",
                  opacity: active > 0 ? 1 : 0.38,
                }}
                whileHover={active > 0 ? { scale: 1.08 } : {}}
                whileTap={active > 0 ? { scale: 0.95 } : {}}
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                  <path
                    d="M10 4L6 8l4 4"
                    stroke={
                      active > 0
                        ? theme.primary
                        : "var(--color-brand-text-faint)"
                    }
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>

              <div className="flex items-center gap-2">
                {socialProof.map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setActive(i)}
                    style={{
                      width: active === i ? "24px" : "8px",
                      height: "8px",
                      borderRadius: "9999px",
                      background:
                        active === i
                          ? theme.primary
                          : "var(--color-brand-border)",
                      cursor: "pointer",
                      border: "none",
                      transition: "all 0.25s ease",
                    }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>

              <motion.button
                onClick={() =>
                  setActive((a) => Math.min(socialProof.length - 1, a + 1))
                }
                disabled={active === socialProof.length - 1}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background:
                    active < socialProof.length - 1
                      ? theme.soft
                      : "var(--color-brand-surface-soft)",
                  border: `1.5px solid ${active < socialProof.length - 1 ? theme.border : "var(--color-brand-border-soft)"}`,
                  cursor:
                    active < socialProof.length - 1 ? "pointer" : "not-allowed",
                  opacity: active < socialProof.length - 1 ? 1 : 0.38,
                }}
                whileHover={
                  active < socialProof.length - 1 ? { scale: 1.08 } : {}
                }
                whileTap={
                  active < socialProof.length - 1 ? { scale: 0.95 } : {}
                }
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                  <path
                    d="M6 4l4 4-4 4"
                    stroke={
                      active < socialProof.length - 1
                        ? theme.primary
                        : "var(--color-brand-text-faint)"
                    }
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
            </div>
          )}

          {/* Counter */}
          <p
            className="text-center mt-3"
            style={{
              fontSize: "0.75rem",
              color: "var(--color-brand-text-faint)",
            }}
          >
            {active + 1} dari {socialProof.length} testimoni
          </p>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
 * 8. FINAL CTA — Strong conversion section
 * ══════════════════════════════════════════════════════════════ */
function CTASection({
  cta,
  theme,
}: {
  cta: CategoryMeta["cta"];
  theme: Theme;
}) {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Dark navy base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(155deg, #060f2e 0%, #0a2d87 55%, #1346b0 100%)",
        }}
      />

      {/* Theme-colored ambient blobs */}
      <motion.div
        className="pointer-events-none absolute"
        style={{
          width: 600,
          height: 600,
          top: "-28%",
          right: "-8%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.soft} 0%, transparent 70%)`,
          filter: "blur(80px)",
          opacity: 0.7,
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute"
        style={{
          width: 440,
          height: 440,
          bottom: "-22%",
          left: "-5%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.soft} 0%, transparent 70%)`,
          filter: "blur(90px)",
          opacity: 0.55,
        }}
        animate={{ scale: [1, 1.14, 1] }}
        transition={{
          duration: 13,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.65) 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
          opacity: 0.03,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 text-center">
        <Reveal>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.14)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: "#4ade80",
                animation: "pulseSoft 2s ease-in-out infinite",
              }}
            />
            <span
              style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.65)" }}
            >
              Admin siap membantu kamu sekarang
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.07}>
          <h2
            className="font-display font-extrabold mb-5 leading-[1.07]"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              letterSpacing: "-0.027em",
              color: "white",
            }}
          >
            {cta.title}{" "}
            {cta.titleAccent && (
              <span style={{ color: theme.primary }}>{cta.titleAccent}</span>
            )}
          </h2>
        </Reveal>

        <Reveal delay={0.13}>
          <p
            style={{
              fontSize: "clamp(0.9375rem, 1.5vw, 1.125rem)",
              color: "rgba(255,255,255,0.6)",
              maxWidth: "480px",
              margin: "0 auto 2.5rem",
              lineHeight: "1.75",
            }}
          >
            {cta.description}
          </p>
        </Reveal>

        <Reveal delay={0.19}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <motion.a
              href={cta.primaryHref}
              className="font-display font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 text-white"
              style={{
                fontSize: "1rem",
                background: theme.primary,
                boxShadow: `0 6px 32px ${theme.border}`,
                textDecoration: "none",
              }}
              whileHover={{
                scale: 1.04,
                boxShadow: `0 14px 44px ${theme.border}`,
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2, ease: EASE }}
            >
              {cta.primaryLabel}
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="white"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.a>

            {cta.secondaryLabel && (
              <motion.a
                href={cta.secondaryHref ?? "/contact"}
                className="font-display font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2"
                style={{
                  fontSize: "1rem",
                  color: "white",
                  textDecoration: "none",
                  background: "rgba(255,255,255,0.09)",
                  border: "1.5px solid rgba(255,255,255,0.18)",
                  backdropFilter: "blur(8px)",
                }}
                whileHover={{
                  scale: 1.03,
                  background: "rgba(255,255,255,0.14)",
                  borderColor: "rgba(255,255,255,0.32)",
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                {cta.secondaryLabel}
              </motion.a>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.26}>
          <div className="flex flex-wrap justify-center gap-x-7 gap-y-2">
            {[
              "Gratis konsultasi",
              "Tanpa komitmen",
              "Respon cepat",
              "Tim berpengalaman",
            ].map((f) => (
              <div key={f} className="flex items-center gap-1.5">
                <svg
                  viewBox="0 0 16 16"
                  className="w-3.5 h-3.5 flex-shrink-0"
                  fill="none"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke={theme.primary}
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                  <path
                    d="M5 8l2 2 4-4"
                    stroke={theme.primary}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  style={{
                    fontSize: "0.8125rem",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {f}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
 * ROOT EXPORT
 * ══════════════════════════════════════════════════════════════ */
export default function CategoryPageClient({ meta }: { meta: CategoryMeta }) {
  const theme = useMemo(
    () => generateTheme(meta.theme.primary),
    [meta.theme.primary],
  );

  const hasBoth = !!(meta.painPoints?.length && meta.benefits?.length);

  return (
    <main className="relative w-full overflow-x-hidden">
      {/* 1. Hero */}
      <CategoryHero category={meta} theme={theme} />

      {/* 2. Programs */}
      <ProgramList category={meta} theme={theme} />

      {/* 3. Pain → Solution (combined if both exist) */}
      {hasBoth && (
        <PainSolutionSection
          painPoints={meta.painPoints!}
          benefits={meta.benefits!}
          theme={theme}
        />
      )}

      {/* Fallback: only pain points */}
      {!hasBoth && meta.painPoints && meta.painPoints.length > 0 && (
        <section
          className="relative py-20 lg:py-24 overflow-hidden"
          style={{ background: "var(--color-brand-surface)" }}
        >
          <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-start">
              <div>
                <Reveal>
                  <SectionPill theme={theme}>
                    ✦ Kamu Tidak Sendirian
                  </SectionPill>
                </Reveal>
                <Reveal delay={0.07}>
                  <h2
                    className="font-display font-extrabold mt-5 mb-4"
                    style={{
                      fontSize: "clamp(1.9rem, 3vw, 2.5rem)",
                      letterSpacing: "-0.022em",
                      color: "var(--color-brand-blue-navy)",
                    }}
                  >
                    Masalah yang sering bikin{" "}
                    <span style={{ color: theme.primary }}>stuck belajar</span>
                  </h2>
                </Reveal>
              </div>
              <div className="space-y-4">
                {meta.painPoints.map((point, i) => (
                  <Reveal key={point.title} delay={i * 0.09} y={20}>
                    <motion.div
                      whileHover={{ x: 6, scale: 1.01 }}
                      className="flex items-start gap-4 p-4 rounded-2xl"
                      style={{
                        background: theme.soft,
                        border: `1.5px solid ${theme.border}`,
                      }}
                    >
                      {point.icon && (
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: theme.softStrong,
                            border: `1.5px solid ${theme.border}`,
                          }}
                        >
                          <Icon
                            name={point.icon as any}
                            className="w-5 h-5"
                            style={{ color: theme.primary }}
                          />
                        </div>
                      )}
                      <div>
                        <p
                          className="font-display font-bold mb-1"
                          style={{
                            fontSize: "0.9375rem",
                            color: "var(--color-brand-blue-navy)",
                          }}
                        >
                          {point.title}
                        </p>
                        <p
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--color-brand-text-muted)",
                            lineHeight: "1.55",
                          }}
                        >
                          {point.description}
                        </p>
                      </div>
                    </motion.div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Steps */}
      {meta.steps && meta.steps.length > 0 && (
        <StepsSection steps={meta.steps} theme={theme} />
      )}

      {/* 5. Experience */}
      {meta.experience && meta.experience.length > 0 && (
        <ExperienceSection experience={meta.experience} theme={theme} />
      )}

      {/* 6. Comparison */}
      {meta.comparison && meta.comparison.length > 0 && (
        <ComparisonSection
          comparison={meta.comparison}
          theme={theme}
          categoryLabel={meta.shortLabel ?? meta.label}
        />
      )}

      {/* 7. Testimonials */}
      {meta.socialProof && meta.socialProof.length > 0 && (
        <TestimonialsSection socialProof={meta.socialProof} theme={theme} />
      )}

      {/* 8. Final CTA */}
      <CTASection cta={meta.cta} theme={theme} />
    </main>
  );
}
