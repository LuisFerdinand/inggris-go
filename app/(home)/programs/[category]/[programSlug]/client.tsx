"use client";

import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  motion,
  useInView,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
} from "framer-motion";
import { HeroContent, ProgramDetail, ProgramSection } from "../data";
import { cn, generateTheme, type Theme } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import Image from "next/image";
import BenefitsSection from "./_components/BenefitsSection";
import { TimelineSection } from "./_components/TimelineSection";
import FacilitiesSection from "./_components/FacilitiesSection";
import PricingSection from "./_components/PricingSection";
import { ClassesSection } from "./_components/ClassesSection";
import MentorshipSection from "./_components/MentorshipSection";
import WhySection from "./_components/WhySection";
import { BatchBanner, BatchesSection } from "./_components/BatchesSection";

/* ─────────────────────────────────────────────────────────────
 * CONSTANTS
 * ───────────────────────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_OUT = [0, 0, 0.38, 1] as const;

/* ─────────────────────────────────────────────────────────────
 * BATCH BANNER HEIGHT INJECTION
 * Injects --batch-banner-height into :root so StickyNav and
 * page content can offset themselves automatically.
 * ───────────────────────────────────────────────────────────── */
function useBatchBannerHeight(hasBanner: boolean) {
  useEffect(() => {
    const height = hasBanner ? 48 : 0;
    document.documentElement.style.setProperty(
      "--batch-banner-height",
      `${height}px`,
    );
    return () => {
      document.documentElement.style.setProperty(
        "--batch-banner-height",
        "0px",
      );
    };
  }, [hasBanner]);
}
function GalleryReveal({
  children,
  delay = 0,
  y = 18,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.06, rootMargin: "-40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function GallerySectionPill({
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
const TrustIcons = [
  () => (
    <svg
      viewBox="0 0 14 14"
      className="w-3 h-3 flex-shrink-0"
      fill="currentColor"
    >
      <path d="M7 1l1.5 2.6 3 .4-2.2 2.1.5 3-2.8-1.5-2.8 1.5.5-3L2.5 4l3-.4z" />
    </svg>
  ),
  () => (
    <svg viewBox="0 0 14 14" className="w-3 h-3 flex-shrink-0" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M4.5 7l2 2 3-3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  () => (
    <svg viewBox="0 0 14 14" className="w-3 h-3 flex-shrink-0" fill="none">
      <rect
        x="1.5"
        y="4.5"
        width="11"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M4.5 4.5V3.5a2.5 2.5 0 015 0v1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
];

function TrustBar({ signals, theme }: { signals: string[]; theme: Theme }) {
  return (
    <div
      className="inline-flex items-center justify-center flex-wrap gap-x-3 gap-y-2 px-5 py-2.5 rounded-full"
      style={{
        background: theme.soft,
        border: `1.5px solid ${theme.border}`,
        maxWidth: "max-content",
        margin: "0 auto",
      }}
    >
      {signals.slice(0, 3).map((label, i) => {
        const TrustIcon = TrustIcons[i % TrustIcons.length];
        return (
          <React.Fragment key={label}>
            {i > 0 && (
              <div
                className="hidden sm:block w-1 h-1 rounded-full flex-shrink-0"
                style={{ background: theme.border }}
              />
            )}
            <span
              className="inline-flex items-center gap-1.5 font-display font-semibold"
              style={{
                fontSize: "0.6875rem",
                color: theme.primary,
                letterSpacing: "0.01em",
              }}
            >
              <TrustIcon />
              {label}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function Reveal({
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

export function SectionPill({
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

export function SectionHeading({
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

function GridTexture({ theme }: { theme: Theme }) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: `linear-gradient(${theme.border} 1px, transparent 1px), linear-gradient(90deg, ${theme.border} 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
        opacity: 0.28,
        maskImage:
          "radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 80% 60% at 50% 50%, black 20%, transparent 100%)",
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
 * STICKY NAV
 * Offsets itself by both --navbar-height and --batch-banner-height
 * ───────────────────────────────────────────────────────────── */
function StickyNav({
  sections,
  theme,
  ctaLabel,
  ctaHref,
}: {
  sections: { id: string; label: string }[];
  theme: Theme;
  ctaLabel: string;
  ctaHref: string;
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [scrollPct, setScrollPct] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 120);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(total > 0 ? (window.scrollY / total) * 100 : 0);
      for (const s of [...sections].reverse()) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 130) {
          setActive(s.id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const navbarH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--navbar-height",
      ) || "56",
    );
    const bannerH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--batch-banner-height",
      ) || "0",
    );
    const stickyH = 56;
    window.scrollTo({
      top:
        el.getBoundingClientRect().top +
        window.scrollY -
        navbarH -
        bannerH -
        stickyH,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -64, opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="sticky z-40 w-full"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--border-soft)",
            /* sits below navbar + batch banner */
            top: "calc(var(--navbar-height, 56px) + var(--batch-banner-height, 0px))",
          }}
        >
          {/* Progress bar */}
          <div
            className="absolute top-0 left-0 h-0.5"
            style={{
              width: `${scrollPct}%`,
              background: `linear-gradient(90deg, ${theme.primary}, ${theme.strong})`,
              transition: "width 100ms linear",
            }}
          />

          <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar flex-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className="relative px-3 py-2 rounded-lg font-display font-semibold whitespace-nowrap transition-colors"
                  style={{
                    fontSize: "0.75rem",
                    color:
                      active === s.id ? theme.primary : "var(--text-faint)",
                    background: active === s.id ? theme.soft : "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {active === s.id && (
                    <motion.div
                      layoutId="prog-nav-pill"
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: theme.soft,
                        border: `1px solid ${theme.border}`,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                    />
                  )}
                  <span className="relative z-10">{s.label}</span>
                </button>
              ))}
            </div>

            <motion.a
              href={ctaHref}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl font-display font-bold text-white flex-shrink-0"
              style={{
                fontSize: "0.75rem",
                background: theme.primary,
                boxShadow: `0 4px 16px ${theme.border}`,
                textDecoration: "none",
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              {ctaLabel}
              <svg viewBox="0 0 14 14" className="w-3 h-3" fill="none">
                <path
                  d="M2.5 7h9M7.5 3.5l3.5 3.5-3.5 3.5"
                  stroke="white"
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProgramDetailHeroSection — /programs/[category]/[programSlug]
//
// Design intent: "This specific program is real, proven, and guided by real people."
//
// Layout: 2-column on desktop, stacked on mobile
//
// RIGHT PANEL — 4 deliberate zones (no overlapping conflicts):
//   [ZONE A]  "Program at a glance" card  — structured, scannable
//   [ZONE B]  Human image                 — emotional center, idle float
//              Step orbs on left edge     — reinforce program structure
//   [ZONE C]  Testimonial strip           — grounded trust anchor
//   [ZONE D]  Active badge               — social proof, bottom right
//
// Mobile: image shown between CTA and social proof on left column
// ─────────────────────────────────────────────────────────────────────────────

function HeroSection({
  content,
  theme,
}: {
  content: HeroContent;
  theme: Theme;
}) {
  const { scrollY } = useScroll();
  // Parallax — left column scrolls slightly up
  const leftY = useTransform(scrollY, [0, 500], [0, -40]);
  // Right panel scrolls at a different rate — depth illusion
  const rightY = useTransform(scrollY, [0, 500], [0, -65]);

  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-10"
      style={{
        background: "var(--surface)",
        minHeight: "min(92vh, 840px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
      }}
    >
      {/* ── Background layers ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: theme.gradient }}
      />
      <GridTexture theme={theme} />
      <FloatingOrb
        theme={theme}
        size={560}
        top="-25%"
        right="2%"
        opacity={0.55}
        delay={0}
      />
      <FloatingOrb
        theme={theme}
        size={340}
        bottom="-10%"
        left="-5%"
        opacity={0.38}
        delay={3}
      />
      <FloatingOrb
        theme={theme}
        size={220}
        top="42%"
        right="34%"
        opacity={0.22}
        delay={6}
      />

      {/* ── Content ── */}
      <motion.div className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 lg:py-14 flex items-center">
        <div className="w-full grid lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_480px] gap-10 lg:gap-16 items-center">
          {/* ════════════════════════════════════
              LEFT — Existing content, preserved
              ════════════════════════════════════ */}
          <motion.div style={{ y: leftY }}>
            {/* Label badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mb-6"
            >
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-display font-bold"
                style={{
                  fontSize: "0.75rem",
                  background: theme.soft,
                  color: theme.primary,
                  border: `1.5px solid ${theme.border}`,
                  letterSpacing: "0.06em",
                }}
              >
                <motion.span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: theme.primary }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
                {content.label}
              </span>
            </motion.div>

            {/* Tagline */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
              className="font-display font-extrabold leading-[1.03] mb-5"
              style={{
                fontSize: "clamp(2.4rem, 5.5vw, 4.25rem)",
                letterSpacing: "-0.038em",
                color: "black",
              }}
            >
              {content.tagline}{" "}
              {content.taglineAccent && (
                <span
                  style={{
                    color: theme.primary,
                    position: "relative",
                    display: "inline-block",
                  }}
                >
                  {content.taglineAccent}
                  <motion.svg
                    viewBox="0 0 300 12"
                    className="absolute -bottom-2 left-0 w-full"
                    fill="none"
                    style={{ overflow: "visible" }}
                  >
                    <motion.path
                      d="M4 8 Q75 2 150 8 Q225 14 296 6"
                      stroke={theme.primary}
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ delay: 0.9, duration: 0.9, ease: EASE }}
                    />
                  </motion.svg>
                </span>
              )}
            </motion.h1>

            {/* Description */}
            {content.description && (
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.16, ease: EASE }}
                style={{
                  fontSize: "clamp(0.9375rem, 1.4vw, 1.0625rem)",
                  color: "var(--text-muted)",
                  lineHeight: "1.78",
                  maxWidth: "560px",
                  marginBottom: "1.5rem",
                }}
              >
                {content.description}
              </motion.p>
            )}

            {/* Subtitle with checkmark */}
            {content.subtitle && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.22, ease: EASE }}
                className="flex items-start gap-2.5 mb-7"
                style={{ maxWidth: "540px" }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: theme.soft,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
                    <path
                      d="M2 5l2 2 4-4"
                      stroke={theme.primary}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--text-muted)",
                    lineHeight: "1.65",
                  }}
                >
                  {content.subtitle}
                </p>
              </motion.div>
            )}

            {/* Tags */}
            {content.tags && content.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.28, ease: EASE }}
                className="flex flex-wrap gap-2 mb-8"
              >
                {content.tags.map((tag) => (
                  <span
                    key={tag.title}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-display font-semibold"
                    style={{
                      fontSize: "0.8125rem",
                      background: theme.soft,
                      color: "var(--blue-navy)",
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    {tag.icon && (
                      <Icon
                        name={tag.icon as any}
                        className="w-3.5 h-3.5"
                        style={{ color: theme.primary }}
                      />
                    )}
                    {tag.title}
                  </span>
                ))}
              </motion.div>
            )}

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.34, ease: EASE }}
              className="flex flex-wrap gap-3 mb-8"
            >
              {content.cta.map((btn, i) => (
                <motion.a
                  key={btn.label}
                  href={btn.href}
                  className="group font-display font-bold px-7 py-4 rounded-2xl flex items-center gap-2.5 relative overflow-hidden"
                  style={{
                    fontSize: "0.9375rem",
                    textDecoration: "none",
                    ...(i === 0
                      ? {
                          background: theme.primary,
                          color: "white",
                          boxShadow: `0 8px 32px ${theme.border}`,
                        }
                      : {
                          color: theme.primary,
                          background: theme.soft,
                          border: `1.5px solid ${theme.border}`,
                        }),
                  }}
                  whileHover={{
                    scale: 1.04,
                    boxShadow:
                      i === 0 ? `0 16px 48px ${theme.border}` : undefined,
                  }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2, ease: EASE }}
                >
                  {i === 0 && (
                    <span
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background:
                          "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
                      }}
                    />
                  )}
                  {btn.icon && (
                    <Icon
                      name={btn.icon as any}
                      className="w-4 h-4 relative z-10"
                      style={{ color: i === 0 ? "white" : theme.primary }}
                    />
                  )}
                  <span className="relative z-10">{btn.label}</span>
                  {i === 0 && (
                    <svg
                      viewBox="0 0 14 14"
                      className="w-4 h-4 relative z-10"
                      fill="none"
                    >
                      <path
                        d="M2.5 7h9M7.5 3.5l3.5 3.5-3.5 3.5"
                        stroke="white"
                        strokeWidth={1.7}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </motion.a>
              ))}
            </motion.div>

            {/* Mobile image — between CTA and social proof */}
            {content.image && (
              <motion.div
                className="lg:hidden mb-8"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
              >
                <ProgramImageMobile content={content} theme={theme} />
              </motion.div>
            )}

            {/* Social proof */}
            {content.socialProof && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.44 }}
                className="flex items-center gap-3 pt-6"
                style={{
                  borderTop: "1px solid var(--border-soft)",
                }}
              >
                <div className="flex -space-x-2">
                  {["A", "R", "S", "M", "B"].map((l, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold border-2"
                      style={{
                        background: theme.soft,
                        borderColor: "var(--surface)",
                        color: theme.primary,
                        fontSize: "0.6875rem",
                        zIndex: 5 - i,
                      }}
                    >
                      {l}
                    </div>
                  ))}
                </div>
                <div>
                  {content.socialProof.count && (
                    <p
                      className="font-display font-black"
                      style={{
                        fontSize: "1rem",
                        color: theme.primary,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {content.socialProof.count}
                    </p>
                  )}
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-faint)",
                    }}
                  >
                    {content.socialProof.text}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* ════════════════════════════════════
              RIGHT — Visual Panel (desktop only)
              ════════════════════════════════════ */}
          {content.image && (
            <motion.div
              className="hidden lg:block relative"
              style={{ y: rightY }}
              initial={{ opacity: 0, x: 36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.18, ease: EASE }}
            >
              <ProgramVisualPanel content={content} theme={theme} />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border-2 flex items-start justify-center pt-1.5"
          style={{ borderColor: theme.border }}
        >
          <div
            className="w-1 h-2 rounded-full"
            style={{ background: theme.primary }}
          />
        </motion.div>
        <span
          style={{
            fontSize: "0.5625rem",
            letterSpacing: "0.14em",
            color: "var(--text-faint)",
            textTransform: "uppercase",
          }}
        >
          Scroll
        </span>
      </motion.div>
    </section>
  );
}

function ProgramVisualPanel({
  content,
  theme,
}: {
  content: HeroContent;
  theme: Theme;
}) {
  return (
    <div
      className="flex flex-col"
      style={{ height: "640px", position: "relative" }}
    >
      {/* Ambient glow wash for entire panel */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 70% at 50% 52%, ${
            theme.softStrong ?? theme.soft
          } 0%, transparent 68%)`,
          opacity: 0.6,
        }}
      />

      {/* ══ ZONE A — Program at a glance (top 22%) ══ */}
      <div
        className="relative z-20 flex justify-center items-end"
        style={{ height: "22%", paddingBottom: "14px" }}
      >
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.93 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.45, duration: 0.55, ease: EASE }}
          className="w-full"
          style={{ maxWidth: "380px" }}
        >
          <ProgramGlanceCard content={content} theme={theme} />
        </motion.div>
      </div>

      {/* ══ ZONE B — Image + step orbs (middle 52%) ══ */}
      <div
        className="relative flex items-end justify-center"
        style={{ height: "52%", minHeight: 0 }}
      >
        {/* Radial glow centred behind figure */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "80%",
            height: "88%",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.softStrong ?? theme.soft} 0%, transparent 68%)`,
            opacity: 0.9,
          }}
        />
        {/* Floor shadow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "58%",
            height: "28px",
            borderRadius: "50%",
            background: "rgba(10,45,135,0.08)",
            filter: "blur(20px)",
          }}
        />

        {/* Step orbs — left edge, vertically distributed */}
        <ProgramStepOrbs content={content} theme={theme} />

        {/* Human image — idle float, z-king */}
        <motion.div
          className="relative"
          style={{ zIndex: 10 }}
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src={content.image!}
            alt={`${content.label} — InggrisGo`}
            width={340}
            height={400}
            className="object-contain"
            style={{
              maxHeight: "330px",
              width: "auto",
              filter: "drop-shadow(0 20px 44px rgba(0,0,0,0.13))",
            }}
            priority
          />
        </motion.div>
      </div>

      {/* ══ ZONE C — Testimonial + badge row (bottom 26%) ══ */}
      <div
        className="relative z-20 flex flex-col justify-center gap-3 px-2 pt-4"
        style={{ height: "26%" }}
      >
        {/* Testimonial strip */}
        {content.socialProof && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.5, ease: EASE }}
          >
            <TestimonialStrip content={content} theme={theme} />
          </motion.div>
        )}

        {/* Badge row */}
        <motion.div
          className="flex items-center justify-between gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.88, duration: 0.5, ease: EASE }}
        >
          {/* Active program badge */}
          <div
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(26,82,200,0.11)",
              boxShadow: "0 4px 18px rgba(10,45,135,0.08)",
            }}
          >
            <motion.span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: "#4ade80" }}
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <span
              className="font-display font-bold"
              style={{
                fontSize: "0.6875rem",
                color: "var(--blue-navy)",
              }}
            >
              Program Aktif
            </span>
          </div>

          {/* CTA count / mini stat */}
          {content.socialProof?.count && (
            <div
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl"
              style={{
                background: `${theme.soft}`,
                border: `1px solid ${theme.border}`,
                boxShadow: "0 4px 18px rgba(10,45,135,0.06)",
              }}
            >
              <span
                className="font-display font-black"
                style={{
                  fontSize: "0.9375rem",
                  color: theme.primary,
                  letterSpacing: "-0.02em",
                }}
              >
                {content.socialProof.count}
              </span>
              <span
                style={{
                  fontSize: "0.5875rem",
                  color: "var(--text-faint)",
                  lineHeight: 1.3,
                }}
              >
                siswa
                <br />
                bergabung
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function ProgramGlanceCard({
  content,
  theme,
}: {
  content: HeroContent;
  theme: Theme;
}) {
  const tags = content.tags?.slice(0, 3) ?? [];

  return (
    <div
      style={{
        background: "var(--surface)",
        border: `1.5px solid ${theme.border}`,
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: `0 16px 48px rgba(10,45,135,0.09), 0 4px 14px rgba(10,45,135,0.05)`,
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          height: "3px",
          background: `linear-gradient(90deg, ${theme.primary} 0%, ${theme.strong ?? theme.primary} 100%)`,
        }}
      />

      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        {/* Label */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: theme.soft,
              border: `1px solid ${theme.border}`,
              flexShrink: 0,
            }}
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: theme.primary }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          </div>
          <p
            style={{
              fontSize: "0.8125rem",
              fontWeight: 700,
              color: "var(--blue-navy)",
              fontFamily: "var(--font-display)",
            }}
          >
            {content.label}
          </p>
        </div>

        {/* "Aktif" chip */}
        <span
          style={{
            fontSize: "0.5625rem",
            color: "#16a34a",
            background: "rgba(22,163,74,0.08)",
            border: "1px solid rgba(22,163,74,0.2)",
            borderRadius: "99px",
            padding: "3px 10px",
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          Aktif
        </span>
      </div>

      {/* Tags row */}
      {tags.length > 0 && (
        <div
          style={{
            padding: "10px 16px",
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
          }}
        >
          {tags.map((tag, i) => (
            <motion.span
              key={tag.title}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.55 + i * 0.06,
                duration: 0.35,
                ease: EASE,
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 10px",
                borderRadius: "8px",
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: theme.primary,
                background: theme.soft,
                border: `1px solid ${theme.border}`,
                fontFamily: "var(--font-display)",
              }}
            >
              {tag.icon && (
                <Icon
                  name={tag.icon as any}
                  style={{
                    width: "11px",
                    height: "11px",
                    color: theme.primary,
                  }}
                />
              )}
              {tag.title}
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgramStepOrbs({
  content,
  theme,
}: {
  content: HeroContent;
  theme: Theme;
}) {
  // Use tags as steps if available, otherwise use generic 3-step labels
  const steps = content.tags?.slice(0, 3).map((t) => t.title) ?? [
    "Mulai",
    "Latihan",
    "Mahir",
  ];

  return (
    <div
      className="absolute flex flex-col items-center gap-2"
      style={{
        left: "4%",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 5,
      }}
    >
      {steps.map((label, i) => (
        <motion.div
          key={label}
          className="flex flex-col items-center"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 + i * 0.1, duration: 0.5, ease: EASE }}
        >
          {/* Connecting line above (except first) */}
          {i > 0 && (
            <div
              style={{
                width: "1.5px",
                height: "20px",
                background: `linear-gradient(to bottom, ${theme.border}, ${theme.primary}33)`,
                marginBottom: "2px",
              }}
            />
          )}

          {/* Orb */}
          <motion.div
            whileHover={{ scale: 1.15 }}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: i === 0 ? theme.primary : theme.soft,
              border: `1.5px solid ${i === 0 ? theme.primary : theme.border}`,
              boxShadow: i === 0 ? `0 4px 16px ${theme.border}` : "none",
              cursor: "default",
              position: "relative",
            }}
          >
            <span
              style={{
                fontSize: "0.5625rem",
                fontWeight: 900,
                color: i === 0 ? "white" : theme.primary,
                fontFamily: "var(--font-display)",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
          </motion.div>

          {/* Label */}
          <p
            style={{
              fontSize: "0.5rem",
              fontWeight: 600,
              color: i === 0 ? theme.primary : "var(--text-faint)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginTop: "3px",
              maxWidth: "40px",
              textAlign: "center",
              lineHeight: 1.2,
              fontFamily: "var(--font-display)",
            }}
          >
            {label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

function TestimonialStrip({
  content,
  theme,
}: {
  content: HeroContent;
  theme: Theme;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 14px",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1.5px solid rgba(26,82,200,0.10)",
        boxShadow:
          "0 6px 28px rgba(10,45,135,0.08), 0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* Avatar cluster */}
      <div style={{ display: "flex", flexShrink: 0 }}>
        {["A", "R", "S"].map((l, i) => (
          <div
            key={l}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "0.625rem",
              background: theme.soft,
              color: theme.primary,
              border: "2px solid rgba(255,255,255,0.95)",
              marginLeft: i > 0 ? "-8px" : 0,
              zIndex: 3 - i,
              position: "relative",
              fontFamily: "var(--font-display)",
            }}
          >
            {l}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div
        style={{
          width: "1px",
          height: "28px",
          background: "var(--border-soft)",
          flexShrink: 0,
        }}
      />

      {/* Quote + stars */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "2px",
          }}
        >
          {/* Stars */}
          <div style={{ display: "flex", gap: "1px" }}>
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                viewBox="0 0 12 12"
                style={{ width: "10px", height: "10px" }}
                fill="#FBBF24"
              >
                <path d="M6 1l1.5 3 3.2.4-2.3 2.2.5 3.2L6 8.2l-2.9 1.6.5-3.2L1.3 4.4l3.2-.4z" />
              </svg>
            ))}
          </div>
          <span
            style={{
              fontSize: "0.5625rem",
              color: "var(--text-faint)",
              fontWeight: 600,
            }}
          >
            5.0
          </span>
        </div>
        <p
          style={{
            fontSize: "0.6875rem",
            fontStyle: "italic",
            color: "var(--blue-navy)",
            lineHeight: 1.45,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          "
          {content.socialProof?.text ??
            "Program ini benar-benar mengubah cara saya berbicara!"}
          "
        </p>
      </div>
    </div>
  );
}

function ProgramImageMobile({
  content,
  theme,
}: {
  content: HeroContent;
  theme: Theme;
}) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        height: "240px",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "70%",
          height: "70%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.softStrong ?? theme.soft} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Image */}
      <motion.div
        style={{ position: "relative", zIndex: 10 }}
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src={content.image!}
          alt={content.label}
          width={180}
          height={240}
          className="object-contain"
          style={{
            maxHeight: "210px",
            width: "auto",
            filter: "drop-shadow(0 14px 32px rgba(0,0,0,0.12))",
          }}
          priority
        />
      </motion.div>

      {/* Active badge */}
      <motion.div
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          borderRadius: "12px",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(26,82,200,0.11)",
          boxShadow: "0 4px 14px rgba(10,45,135,0.08)",
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.4, ease: EASE }}
      >
        <motion.span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#4ade80",
            flexShrink: 0,
          }}
          animate={{ opacity: [1, 0.25, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        <span
          style={{
            fontSize: "0.625rem",
            fontWeight: 700,
            color: "var(--blue-navy)",
            fontFamily: "var(--font-display)",
          }}
        >
          Program Aktif
        </span>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * SECTION: STEPS
 * ───────────────────────────────────────────────────────────── */
function StepsSection({
  content,
  theme,
}: {
  content: {
    title: string;
    subtitle?: string;
    icon?: string;
    tagline: string;
    taglineAccent?: string;
    items: { n?: string; title: string; description: string; icon?: string }[];
  };
  theme: Theme;
}) {
  return (
    <section
      id="cara-kerja"
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ background: "var(--surface)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse 60% 45% at 50% 0%, ${theme.soft} 0%, transparent 60%)`,
        }}
      />
      <GridTexture theme={theme} />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center text-center mb-16">
          <Reveal>
            <SectionPill theme={theme}>
              {content.icon && (
                <Icon
                  name={content.icon as any}
                  className="w-3.5 h-3.5"
                  style={{ color: theme.primary }}
                />
              )}
              {content.title}
            </SectionPill>
          </Reveal>
          <Reveal delay={0.07} className="mt-5 mb-4">
            <SectionHeading
              tagline={content.tagline}
              taglineAccent={content.taglineAccent}
              theme={theme}
            />
          </Reveal>
          {content.subtitle && (
            <Reveal delay={0.13}>
              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--text-muted)",
                  maxWidth: "400px",
                  lineHeight: "1.72",
                }}
              >
                {content.subtitle}
              </p>
            </Reveal>
          )}
        </div>

        <div className="relative">
          {content.items.length > 1 && (
            <div
              className="hidden lg:block pointer-events-none absolute z-0"
              style={{
                top: "32px",
                left: `calc(100% / ${content.items.length * 2})`,
                right: `calc(100% / ${content.items.length * 2})`,
                height: "2px",
                background: `linear-gradient(90deg, transparent, ${theme.border}, ${theme.primary}, ${theme.border}, transparent)`,
              }}
            />
          )}

          <div
            className={`grid gap-8 ${
              content.items.length <= 2
                ? "sm:grid-cols-2 max-w-2xl mx-auto"
                : content.items.length === 3
                  ? "sm:grid-cols-3"
                  : "sm:grid-cols-2 lg:grid-cols-4"
            }`}
          >
            {content.items.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.1} y={24}>
                <div className="flex flex-col items-center text-center relative z-10">
                  <motion.div
                    className="relative mb-6"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-black relative z-10"
                      style={{
                        background: theme.primary,
                        color: "white",
                        fontSize: "1.25rem",
                        letterSpacing: "-0.02em",
                        boxShadow: `0 8px 28px ${theme.border}`,
                      }}
                    >
                      {step.icon ? (
                        <Icon
                          name={step.icon as any}
                          className="w-7 h-7"
                          style={{ color: "white" }}
                        />
                      ) : (
                        (step.n ?? String(i + 1).padStart(2, "0"))
                      )}
                    </div>
                    {i === 0 && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          border: `2px solid ${theme.primary}`,
                          opacity: 0.3,
                        }}
                        animate={{
                          scale: [1, 1.35, 1],
                          opacity: [0.3, 0, 0.3],
                        }}
                        transition={{ duration: 2.6, repeat: Infinity }}
                      />
                    )}
                  </motion.div>

                  <p
                    className="font-display font-extrabold mb-2"
                    style={{
                      fontSize: "1.0625rem",
                      color: "var(--blue-navy)",
                    }}
                  >
                    {step.title}
                  </p>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--text-muted)",
                      lineHeight: "1.68",
                      maxWidth: "200px",
                      margin: "0 auto",
                    }}
                  >
                    {step.description}
                  </p>
                  <div
                    className="mt-4 px-3 py-1 rounded-full font-display font-semibold"
                    style={{
                      fontSize: "0.5625rem",
                      background: theme.soft,
                      color: theme.primary,
                      border: `1px solid ${theme.border}`,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {step.n ?? `Step ${i + 1}`}
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

/* ─────────────────────────────────────────────────────────────
 * SECTION: TESTIMONIALS
 * ───────────────────────────────────────────────────────────── */
function TestimonialsSection({
  content,
  theme,
}: {
  content: {
    title?: string;
    items: { quote: string; name?: string; role?: string; meta?: string }[];
  };
  theme: Theme;
}) {
  const [active, setActive] = useState(0);
  const dragX = useMotionValue(0);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -60 && active < content.items.length - 1)
      setActive((a) => a + 1);
    if (info.offset.x > 60 && active > 0) setActive((a) => a - 1);
  };

  return (
    <section
      id="testimoni"
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ background: "var(--surface)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse 65% 50% at 50% 0%, ${theme.soft} 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center text-center mb-14">
          <Reveal>
            <SectionPill theme={theme}>✦ Testimoni</SectionPill>
          </Reveal>
          <Reveal delay={0.07} className="mt-5 mb-3">
            <SectionHeading
              tagline={content.title ?? "Mereka Sudah"}
              taglineAccent="Membuktikannya"
              theme={theme}
            />
          </Reveal>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {content.items.map((item, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -6, scale: 1.015 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="relative rounded-3xl p-6 h-full"
                style={{
                  background: "var(--surface)",
                  border: `1.5px solid ${theme.border}`,
                  boxShadow: `0 4px 20px ${theme.border}`,
                }}
              >
                <div
                  className="absolute top-0 left-8 right-8 h-0.5 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${theme.primary}, transparent)`,
                  }}
                />
                <div
                  className="absolute top-4 left-5 font-display font-black select-none pointer-events-none"
                  style={{
                    fontSize: "5rem",
                    color: theme.primary,
                    opacity: 0.06,
                    lineHeight: 1,
                  }}
                >
                  "
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg
                      key={j}
                      viewBox="0 0 12 12"
                      className="w-4 h-4"
                      fill="#FBBF24"
                    >
                      <path d="M6 1l1.5 3 3.2.4-2.3 2.2.5 3.2L6 8.2l-2.9 1.6.5-3.2L1.3 4.4l3.2-.4z" />
                    </svg>
                  ))}
                </div>

                <p
                  className="italic mb-5 relative z-10"
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--text-muted)",
                    lineHeight: "1.8",
                  }}
                >
                  "{item.quote}"
                </p>

                <div className="flex items-center gap-3 mt-auto">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-display font-black flex-shrink-0"
                    style={{
                      background: theme.soft,
                      border: `2px solid ${theme.border}`,
                      fontSize: "1rem",
                      color: theme.primary,
                    }}
                  >
                    {item.name?.[0] ?? "?"}
                  </div>
                  <div>
                    {item.name && (
                      <p
                        className="font-display font-bold"
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--blue-navy)",
                        }}
                      >
                        {item.name}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.role && (
                        <p
                          style={{
                            fontSize: "0.6875rem",
                            color: "var(--text-faint)",
                          }}
                        >
                          {item.role}
                        </p>
                      )}
                      {item.meta && (
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            color: "var(--text-faint)",
                          }}
                        >
                          • {item.meta}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, x: 40, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -40, scale: 0.97 }}
              transition={{ duration: 0.38, ease: EASE }}
              className="rounded-3xl p-6 cursor-grab active:cursor-grabbing"
              style={{
                x: dragX,
                background: "var(--surface)",
                border: `2px solid ${theme.border}`,
                boxShadow: `0 20px 56px ${theme.border}`,
              }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <svg
                    key={j}
                    viewBox="0 0 12 12"
                    className="w-4 h-4"
                    fill="#FBBF24"
                  >
                    <path d="M6 1l1.5 3 3.2.4-2.3 2.2.5 3.2L6 8.2l-2.9 1.6.5-3.2L1.3 4.4l3.2-.4z" />
                  </svg>
                ))}
              </div>
              <p
                className="italic mb-6"
                style={{
                  fontSize: "1.0625rem",
                  color: "var(--text-muted)",
                  lineHeight: "1.82",
                }}
              >
                "{content.items[active].quote}"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center font-display font-black"
                  style={{
                    background: theme.soft,
                    border: `2px solid ${theme.border}`,
                    fontSize: "1.0625rem",
                    color: theme.primary,
                  }}
                >
                  {content.items[active].name?.[0] ?? "?"}
                </div>
                <div>
                  {content.items[active].name && (
                    <p
                      className="font-display font-bold"
                      style={{
                        fontSize: "0.9375rem",
                        color: "var(--blue-navy)",
                      }}
                    >
                      {content.items[active].name}
                    </p>
                  )}
                  {content.items[active].role && (
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-faint)",
                      }}
                    >
                      {content.items[active].role}
                    </p>
                  )}
                </div>
              </div>
              <p
                className="text-center mt-4"
                style={{
                  fontSize: "0.6875rem",
                  color: "var(--text-faint)",
                }}
              >
                Geser untuk selanjutnya →
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-2 mt-5">
            {content.items.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  width: active === i ? 24 : 8,
                  height: 8,
                  borderRadius: 9999,
                  background: active === i ? theme.primary : "var(--border)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
 * SECTION: FAQ
 * ───────────────────────────────────────────────────────────── */
function FAQSection({
  content,
  theme,
}: {
  content: { q: string; a: string }[];
  theme: Theme;
}) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ background: "var(--bg-soft)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse 55% 45% at 0% 60%, ${theme.soft} 0%, transparent 55%)`,
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center text-center mb-12">
          <Reveal>
            <SectionPill theme={theme}>✦ FAQ</SectionPill>
          </Reveal>
          <Reveal delay={0.07} className="mt-5 mb-3">
            <SectionHeading
              tagline="Pertanyaan yang"
              taglineAccent="Sering Ditanyakan"
              theme={theme}
            />
          </Reveal>
        </div>

        <div className="space-y-3">
          {content.map((faq, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  border: `1.5px solid ${open === i ? theme.border : "var(--border-soft)"}`,
                  transition: "border-color 0.25s ease",
                }}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  style={{
                    background: open === i ? theme.soft : "var(--surface)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <p
                    className="font-display font-bold"
                    style={{
                      fontSize: "0.9375rem",
                      color: "var(--blue-navy)",
                    }}
                  >
                    {faq.q}
                  </p>
                  <motion.div
                    animate={{ rotate: open === i ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      background: open === i ? theme.primary : theme.soft,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <svg
                      viewBox="0 0 14 14"
                      className="w-3.5 h-3.5"
                      fill="none"
                    >
                      <path
                        d="M7 3v8M3 7h8"
                        stroke={open === i ? "white" : theme.primary}
                        strokeWidth={1.7}
                        strokeLinecap="round"
                      />
                    </svg>
                  </motion.div>
                </button>

                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE_OUT }}
                      style={{ overflow: "hidden" }}
                    >
                      <div
                        className="px-5 pb-5"
                        style={{
                          background: theme.soft,
                          borderTop: `1px solid ${theme.border}`,
                        }}
                      >
                        <p
                          className="pt-4"
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--text-muted)",
                            lineHeight: "1.78",
                          }}
                        >
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.3}>
          <div
            className="mt-8 p-5 rounded-2xl flex items-center gap-4"
            style={{
              background: theme.soft,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: theme.softStrong }}
            >
              <Icon
                name="message-circle"
                className="w-5 h-5"
                style={{ color: theme.primary }}
              />
            </div>
            <div className="flex-1">
              <p
                className="font-display font-bold"
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--blue-navy)",
                }}
              >
                Masih ada pertanyaan lain?
              </p>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-muted)",
                  marginTop: "2px",
                }}
              >
                Tim kami siap membantu kapan saja.
              </p>
            </div>
            <motion.a
              href="/contact"
              className="font-display font-bold px-4 py-2.5 rounded-xl whitespace-nowrap"
              style={{
                fontSize: "0.875rem",
                color: "white",
                background: theme.primary,
                textDecoration: "none",
                boxShadow: `0 4px 16px ${theme.border}`,
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Tanya Admin
            </motion.a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
 * SECTION: CTA
 * Uses a fixed deep-navy background (#060f2e = --blue-abyss)
 * so it never conflicts with the program's primary color.
 * ───────────────────────────────────────────────────────────── */
function CTASection({
  content,
  theme,
}: {
  content: {
    title: string;
    titleAccent?: string;
    subtitle?: string;
    highlight?: string;
    cta: { label: string; href: string; note?: string };
    urgency?: string;
  };
  theme: Theme;
}) {
  return (
    <section id="daftar" className="relative py-24 lg:py-36 overflow-hidden">
      {/*
       * Background: always deep navy abyss — no program color conflict.
       * A subtle dot grid + two muted blobs add depth without competing
       * with the content or the program's primary color.
       */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--blue-abyss)" }}
      />

      {/* Subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
        }}
      />

      {/* Program-color blobs — kept very soft so they don't dominate */}
      <motion.div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 640,
          height: 640,
          top: "-25%",
          right: "-5%",
          background: `radial-gradient(circle, ${theme.softStrong} 0%, transparent 70%)`,
          filter: "blur(100px)",
          opacity: 0.45,
        }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 480,
          height: 480,
          bottom: "-18%",
          left: "-5%",
          background: `radial-gradient(circle, ${theme.soft} 0%, transparent 70%)`,
          filter: "blur(100px)",
          opacity: 0.35,
        }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center">
        {/* Live badge */}
        <Reveal>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
            }}
          >
            <motion.span
              className="w-2 h-2 rounded-full"
              style={{ background: "#4ade80" }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <span
              style={{
                fontSize: "0.8125rem",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Admin siap membantu kamu sekarang
            </span>
          </div>
        </Reveal>

        {/* Headline */}
        <Reveal delay={0.07}>
          <h2
            className="font-display font-extrabold mb-5 leading-[1.04]"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.75rem)",
              letterSpacing: "-0.032em",
              color: "white",
            }}
          >
            {content.title}{" "}
            {content.titleAccent && (
              <span style={{ color: theme.primary }}>
                {content.titleAccent}
              </span>
            )}
          </h2>
        </Reveal>

        {content.subtitle && (
          <Reveal delay={0.13}>
            <p
              style={{
                fontSize: "clamp(0.9375rem, 1.5vw, 1.125rem)",
                color: "rgba(255,255,255,0.5)",
                maxWidth: "480px",
                margin: "0 auto 1.5rem",
                lineHeight: "1.78",
              }}
            >
              {content.subtitle}
            </p>
          </Reveal>
        )}

        {content.highlight && (
          <Reveal delay={0.18}>
            <div
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl mb-8"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1.5px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: theme.primary }}
              >
                <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
                  <path
                    d="M2 5l2 2 4-4"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "rgba(255,255,255,0.75)",
                  lineHeight: "1.55",
                }}
              >
                {content.highlight}
              </p>
            </div>
          </Reveal>
        )}

        {/* Primary CTA button */}
        <Reveal delay={0.22}>
          <div className="flex flex-col items-center gap-3 mb-10">
            <motion.a
              href={content.cta.href}
              className="group font-display font-bold px-10 py-5 rounded-2xl flex items-center gap-2.5 relative overflow-hidden"
              style={{
                fontSize: "1.0625rem",
                /* Use program primary for the button so brand color is prominent */
                background: theme.primary,
                boxShadow: `0 10px 40px ${theme.border}`,
                textDecoration: "none",
                color: "white",
              }}
              whileHover={{
                scale: 1.04,
                boxShadow: `0 18px 56px ${theme.border}`,
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2, ease: EASE }}
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
                }}
              />
              <span className="relative z-10">{content.cta.label}</span>
              <svg
                viewBox="0 0 14 14"
                className="w-4 h-4 relative z-10"
                fill="none"
              >
                <path
                  d="M2.5 7h9M7.5 3.5l3.5 3.5-3.5 3.5"
                  stroke="white"
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.a>
            {content.cta.note && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.35)",
                }}
              >
                {content.cta.note}
              </p>
            )}
          </div>
        </Reveal>

        {content.urgency && (
          <Reveal delay={0.28}>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-8"
              style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.22)",
              }}
            >
              <motion.span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#f87171" }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <p style={{ fontSize: "0.8125rem", color: "#fca5a5" }}>
                {content.urgency}
              </p>
            </div>
          </Reveal>
        )}

        {/* Trust badges */}
        <Reveal delay={0.34}>
          <div className="flex flex-wrap justify-center gap-x-7 gap-y-3">
            {[
              "Gratis konsultasi",
              "Tanpa komitmen",
              "Respon cepat",
              "Tim berpengalaman",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: `${theme.primary}30` }}
                >
                  <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
                    <path
                      d="M2 5l2 2 4-4"
                      stroke={theme.primary}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span
                  style={{
                    fontSize: "0.8125rem",
                    color: "rgba(255,255,255,0.4)",
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

export type GalleryContent = {
  icon?: string;
  tagline: string;
  taglineAccent?: string;
  title?: string;
  subtitle?: string;
  photos: GalleryPhoto[];
  trustSignals?: string[];
};

export type GalleryPhoto = {
  src: string;
  caption?: string;

  tag?: string;
  highlight?: boolean;
};

const MOSAIC_SHOW = 6;
const DEFAULT_TRUST_SIGNALS = [
  "Dokumentasi nyata",
  "Kelas asli, bukan stock photo",
  "Privasi siswa terjaga",
];

function ImgOverlay({ photo }: { photo: GalleryPhoto }) {
  return (
    <>
      <div
        className="absolute inset-0 flex items-center justify-center
                      group-hover:bg-black/[.18] transition-colors duration-300"
      >
        <div
          className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center
                     opacity-0 scale-75
                     group-hover:opacity-100 group-hover:scale-100
                     transition-all duration-300"
        >
          <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none">
            <circle cx="9" cy="9" r="5.5" stroke="#0a1628" strokeWidth="1.7" />
            <path
              d="M13.5 13.5l3 3"
              stroke="#0a1628"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            <path
              d="M9 7v4M7 9h4"
              stroke="#0a1628"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {(photo.caption || photo.tag) && (
        <div
          className="absolute bottom-0 left-0 right-0 px-3.5 pb-3 pt-10
                     bg-gradient-to-t from-black/70 to-transparent
                     opacity-0 translate-y-1.5
                     group-hover:opacity-100 group-hover:translate-y-0
                     transition-all duration-300"
        >
          {photo.tag && (
            <p
              className="mb-0.5 font-display font-semibold uppercase"
              style={{
                fontSize: "0.5625rem",
                color: "rgba(255,255,255,0.6)",
                letterSpacing: "0.12em",
              }}
            >
              {photo.tag}
            </p>
          )}
          {photo.caption && (
            <p
              className="text-white font-medium leading-snug"
              style={{ fontSize: "0.75rem" }}
            >
              {photo.caption}
            </p>
          )}
        </div>
      )}
    </>
  );
}

function FeaturedBadge() {
  return (
    <div
      className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(6px)",
      }}
    >
      <svg viewBox="0 0 14 14" className="w-3 h-3" fill="#f59e0b">
        <path d="M7 1l1.5 2.6 3 .4-2.2 2.1.5 3-2.8-1.5-2.8 1.5.5-3L2.5 4l3-.4z" />
      </svg>
      <span
        className="font-display font-bold"
        style={{
          fontSize: "0.5625rem",
          color: "#0a1628",
          letterSpacing: "0.06em",
        }}
      >
        FOTO PILIHAN
      </span>
    </div>
  );
}

function EmptyState({ theme }: { theme: Theme }) {
  return (
    <Reveal>
      <div
        className="rounded-2xl py-14 px-8 flex flex-col items-center gap-4 text-center"
        style={{
          border: `1.5px dashed ${theme.border}`,
          background: theme.soft,
        }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: theme.softStrong }}
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
            <rect
              x="3"
              y="5"
              width="18"
              height="14"
              rx="3"
              stroke={theme.primary}
              strokeWidth="1.5"
            />
            <circle
              cx="8.5"
              cy="10.5"
              r="1.5"
              stroke={theme.primary}
              strokeWidth="1.3"
            />
            <path
              d="M21 15l-6-5-4 4-2-2-4 3"
              stroke={theme.primary}
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p
            className="font-display font-bold mb-2"
            style={{ fontSize: "1rem", color: "var(--blue-navy)" }}
          >
            Foto dokumentasi segera hadir
          </p>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-muted)",
              maxWidth: "300px",
              lineHeight: "1.68",
            }}
          >
            Kami sedang menyiapkan dokumentasi kelas agar kamu bisa melihat
            langsung suasananya sebelum mendaftar.
          </p>
        </div>
        <motion.a
          href="#batches"
          className="inline-flex items-center gap-2 font-display font-bold rounded-xl"
          style={{
            padding: "0.625rem 1.25rem",
            fontSize: "0.8125rem",
            color: theme.primary,
            background: "var(--surface)",
            border: `1.5px solid ${theme.border}`,
            textDecoration: "none",
          }}
          whileHover={{ y: -2, boxShadow: `0 6px 20px ${theme.border}` }}
          whileTap={{ scale: 0.97 }}
        >
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none">
            <path
              d="M2 4.5A1.5 1.5 0 013.5 3h9A1.5 1.5 0 0114 4.5v7A1.5 1.5 0 0112.5 13H9l-3 2v-2H3.5A1.5 1.5 0 012 11.5v-7z"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
          Tanya admin soal kelas
        </motion.a>
      </div>
    </Reveal>
  );
}

function SingleLayout({
  photos,
  theme,
  onOpen,
}: {
  photos: GalleryPhoto[];
  theme: Theme;
  onOpen: (idx: number) => void;
}) {
  return (
    <Reveal>
      <div className="max-w-2xl mx-auto">
        <motion.div
          whileHover={{ scale: 1.012 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="relative group aspect-video rounded-2xl overflow-hidden cursor-pointer"
          style={{
            border: `1.5px solid ${theme.border}`,
            boxShadow: `0 10px 40px ${theme.border}`,
          }}
          onClick={() => onOpen(0)}
        >
          <img
            src={photos[0].src}
            alt={photos[0].caption ?? "Dokumentasi kelas"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
          <ImgOverlay photo={photos[0]} />
        </motion.div>
      </div>
    </Reveal>
  );
}

function FewLayout({
  photos,
  theme,
  onOpen,
}: {
  photos: GalleryPhoto[];
  theme: Theme;
  onOpen: (idx: number) => void;
}) {
  const colClass =
    photos.length === 2 ? "sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-3";

  return (
    <div className={`grid gap-3 ${colClass}`}>
      {photos.map((photo, i) => (
        <Reveal key={i} delay={i * 0.09}>
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="relative group aspect-[4/3] rounded-xl overflow-hidden cursor-pointer"
            style={{
              border: `1.5px solid ${theme.border}`,
              boxShadow: `0 4px 18px ${theme.border}`,
            }}
            onClick={() => onOpen(i)}
          >
            <img
              src={photo.src}
              alt={photo.caption ?? `Dokumentasi kelas ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              loading="lazy"
            />
            <ImgOverlay photo={photo} />
          </motion.div>
        </Reveal>
      ))}
    </div>
  );
}

function MosaicLayout({
  photos,
  theme,
  onOpen,
}: {
  photos: GalleryPhoto[];
  theme: Theme;
  onOpen: (idx: number) => void;
}) {
  const remaining = photos.length - MOSAIC_SHOW;

  // Move highlighted photo to index 0 (featured slot)
  const highlightIdx = photos.findIndex((p) => p.highlight);
  const ordered =
    highlightIdx > 0
      ? [photos[highlightIdx], ...photos.filter((_, i) => i !== highlightIdx)]
      : photos;

  const visible = ordered.slice(0, MOSAIC_SHOW);

  return (
    <div className="space-y-3">
      {/* Meta row */}
      <GalleryReveal>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span
            className="inline-flex items-center gap-1.5 font-display font-semibold rounded-full px-3.5 py-1.5"
            style={{
              fontSize: "0.75rem",
              background: theme.soft,
              color: theme.primary,
              border: `1px solid ${theme.border}`,
            }}
          >
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none">
              <rect
                x="1.5"
                y="3.5"
                width="13"
                height="10"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <circle
                cx="8"
                cy="8.5"
                r="1.8"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
            {photos.length} foto dokumentasi kelas
          </span>

          <motion.button
            onClick={() => onOpen(0)}
            whileHover={{ y: -2, boxShadow: `0 6px 20px ${theme.border}` }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="inline-flex items-center gap-2 font-display font-semibold rounded-xl"
            style={{
              fontSize: "0.8125rem",
              padding: "0.5rem 1.25rem",
              color: theme.primary,
              background: theme.soft,
              border: `1.5px solid ${theme.border}`,
            }}
          >
            Lihat semua foto
            <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>
        </div>
      </GalleryReveal>

      {/* Mosaic grid */}
      <div
        className="grid gap-2.5"
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
        {visible.map((photo, i) => {
          const isFeatured = false;
          const isLast = i === MOSAIC_SHOW - 1 && remaining > 0;
          const originalIdx = ordered.indexOf(photo);

          return (
            <GalleryReveal key={i} delay={0.06 + i * 0.075}>
              <motion.div
                whileHover={{ scale: 1.022 }}
                transition={{ duration: 0.3, ease: EASE }}
                className={`relative group rounded-2xl overflow-hidden cursor-pointer ${
                  isFeatured ? "col-span-2 row-span-2" : ""
                }`}
                style={{
                  border: `1.5px solid ${theme.border}`,
                  boxShadow: isFeatured
                    ? `0 12px 40px ${theme.border}`
                    : `0 4px 14px ${theme.border}`,
                  aspectRatio: isFeatured ? "auto" : "4/3",
                  minHeight: isFeatured ? "300px" : undefined,
                }}
                onClick={() => onOpen(originalIdx)}
              >
                <img
                  src={photo.src}
                  alt={photo.caption ?? `Dokumentasi kelas ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  loading={i < 2 ? "eager" : "lazy"}
                />
                {isFeatured && <FeaturedBadge />}
                {isLast ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60">
                    <span
                      className="font-display font-black text-white leading-none"
                      style={{
                        fontSize: "clamp(1.4rem, 3vw, 1.875rem)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      +{remaining + 1}
                    </span>
                    <span
                      className="font-display font-semibold text-white/65 uppercase tracking-widest"
                      style={{ fontSize: "0.5rem" }}
                    >
                      foto lagi
                    </span>
                  </div>
                ) : (
                  <ImgOverlay photo={photo} />
                )}
              </motion.div>
            </GalleryReveal>
          );
        })}
      </div>
    </div>
  );
}

function ConversionNudge({ theme }: { theme: Theme }) {
  const items = [
    { icon: "clock", text: "Sesi berlangsung setiap hari" },
    { icon: "shield-check", text: "Lingkungan belajar yang nyaman" },
    { icon: "users", text: "Tutor berpengalaman & supportif" },
  ];

  return (
    <GalleryReveal delay={0.3}>
      <div className="flex items-center justify-center flex-wrap gap-x-6 gap-y-2 mt-7">
        {items.map((item, i) => (
          <React.Fragment key={item.text}>
            {i > 0 && (
              <div
                className="hidden sm:block w-1 h-1 rounded-full"
                style={{ background: theme.border }}
              />
            )}
            <div className="flex items-center gap-1.5">
              <Icon
                name={item.icon as any}
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: theme.primary }}
              />
              <span
                className="font-display font-medium"
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-muted)",
                }}
              >
                {item.text}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </GalleryReveal>
  );
}

function Lightbox({
  photos,
  initialIdx,
  onClose,
  theme,
}: {
  photos: GalleryPhoto[];
  initialIdx: number;
  onClose: () => void;
  theme: Theme;
}) {
  const [idx, setIdx] = useState(initialIdx);
  const touchStartX = useRef(0);

  const nav = useCallback(
    (dir: number) =>
      setIdx((i) => Math.max(0, Math.min(photos.length - 1, i + dir))),
    [photos.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") nav(-1);
      if (e.key === "ArrowRight") nav(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nav, onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const current = photos[idx];

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center px-4 "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{ background: "rgba(4,10,28,0.93)" }}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 50) nav(dx < 0 ? 1 : -1);
      }}
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 flex flex-col items-center max-w-[94vw] w-full">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors"
          style={{
            background: "rgba(255,255,255,0.09)",
            border: "1px solid rgba(255,255,255,0.14)",
          }}
          aria-label="Tutup"
        >
          ✕
        </button>

        {/* Image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.97, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}
          >
            <img
              src={current.src}
              alt={current.caption ?? `Foto ${idx + 1}`}
              className="block max-w-[88vw] max-h-[68vh] object-contain"
            />
          </motion.div>
        </AnimatePresence>

        {/* Caption */}
        <div className="text-center mt-4 min-h-10 px-4">
          {current.tag && (
            <p
              className="font-display font-semibold uppercase mb-1"
              style={{
                fontSize: "0.5625rem",
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.14em",
              }}
            >
              {current.tag}
            </p>
          )}
          {current.caption && (
            <p
              className="font-medium"
              style={{
                fontSize: "0.9375rem",
                color: "rgba(255,255,255,0.72)",
                lineHeight: "1.5",
              }}
            >
              {current.caption}
            </p>
          )}
        </div>

        {/* Nav arrows + counter */}
        <div className="flex items-center gap-5 mt-4">
          {[
            [-1, "←", "Foto sebelumnya"],
            [1, "→", "Foto berikutnya"],
          ].map(([dir, arrow, label], ki) => {
            const disabled = ki === 0 ? idx === 0 : idx === photos.length - 1;
            return ki === 0 ? (
              <React.Fragment key={ki}>
                <button
                  onClick={() => nav(dir as number)}
                  disabled={!!disabled}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg transition-all hover:scale-110"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    opacity: disabled ? 0.2 : 1,
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                  aria-label={label as string}
                >
                  {arrow}
                </button>
                <span
                  className="font-display font-semibold"
                  style={{
                    fontSize: "0.8125rem",
                    color: "rgba(255,255,255,0.4)",
                    minWidth: 56,
                    textAlign: "center",
                  }}
                >
                  {idx + 1} / {photos.length}
                </span>
              </React.Fragment>
            ) : (
              <button
                key={ki}
                onClick={() => nav(dir as number)}
                disabled={!!disabled}
                className="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg transition-all hover:scale-110"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  opacity: disabled ? 0.2 : 1,
                  cursor: disabled ? "not-allowed" : "pointer",
                }}
                aria-label={label as string}
              >
                {arrow}
              </button>
            );
          })}
        </div>

        {/* Dot scrubber */}
        <div className="flex items-center gap-1.5 mt-3">
          {photos.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setIdx(i)}
              className="h-1.5 rounded-full border-none cursor-pointer"
              animate={{ width: i === idx ? 18 : 5 }}
              style={{
                background:
                  i === idx ? theme.primary : "rgba(255,255,255,0.22)",
              }}
              transition={{ duration: 0.25, ease: EASE }}
              aria-label={`Foto ${i + 1}`}
            />
          ))}
        </div>

        <p
          className="sm:hidden mt-3 font-display"
          style={{
            fontSize: "0.6875rem",
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.04em",
          }}
        >
          Geser kiri/kanan untuk navigasi
        </p>
      </div>
    </motion.div>
  );
}

export function GallerySection({
  content,
  theme,
}: {
  content: GalleryContent;
  theme: Theme;
}) {
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIdx, setLbIdx] = useState(0);

  const openLb = useCallback((idx: number) => {
    setLbIdx(idx);
    setLbOpen(true);
  }, []);

  const closeLb = useCallback(() => setLbOpen(false), []);

  const n = content.photos.length;
  const trustSignals = content.trustSignals ?? DEFAULT_TRUST_SIGNALS;

  return (
    <>
      <section
        id="gallery"
        className="relative py-20 lg:py-28 overflow-hidden"
        style={{ background: "var(--surface)" }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(ellipse 70% 40% at 50% -5%, ${theme.soft} 0%, transparent 55%)`,
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <GalleryReveal>
              <GallerySectionPill theme={theme}>
                {content.icon ? (
                  <Icon
                    name={content.icon as any}
                    className="w-3.5 h-3.5"
                    style={{ color: theme.primary }}
                  />
                ) : (
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none">
                    <rect
                      x="1.5"
                      y="3.5"
                      width="13"
                      height="10"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="8"
                      cy="8.5"
                      r="2"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M5.5 3.5V3a1 1 0 011-1h3a1 1 0 011 1v.5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                  </svg>
                )}
                {content.tagline}
                {content.taglineAccent && (
                  <span style={{ color: theme.primary }}>
                    {content.taglineAccent}
                  </span>
                )}
              </GallerySectionPill>
            </GalleryReveal>

            {content.title && (
              <GalleryReveal delay={0.07} className="mt-5 mb-3">
                <h2
                  className="font-display font-extrabold leading-[1.07]"
                  style={{
                    fontSize: "clamp(1.75rem, 3.2vw, 2.625rem)",
                    letterSpacing: "-0.026em",
                    color: "var(--blue-navy)",
                  }}
                >
                  {content.title}
                </h2>
              </GalleryReveal>
            )}

            {content.subtitle && (
              <GalleryReveal delay={0.12}>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--text-muted)",
                    maxWidth: "440px",
                    lineHeight: "1.75",
                    marginBottom: "1.25rem",
                  }}
                >
                  {content.subtitle}
                </p>
              </GalleryReveal>
            )}

            <GalleryReveal delay={0.16}>
              <TrustBar signals={trustSignals} theme={theme} />
            </GalleryReveal>
          </div>

          {/* Adaptive body */}
          {n === 0 && <EmptyState theme={theme} />}
          {n === 1 && (
            <SingleLayout
              photos={content.photos}
              theme={theme}
              onOpen={openLb}
            />
          )}
          {n >= 2 && n <= 3 && (
            <FewLayout photos={content.photos} theme={theme} onOpen={openLb} />
          )}
          {n >= 4 && (
            <MosaicLayout
              photos={content.photos}
              theme={theme}
              onOpen={openLb}
            />
          )}

          {n > 0 && <ConversionNudge theme={theme} />}
        </div>
      </section>

      <AnimatePresence>
        {lbOpen && (
          <Lightbox
            photos={content.photos}
            initialIdx={lbIdx}
            onClose={closeLb}
            theme={theme}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
 * SECTION DISPATCHER
 * ───────────────────────────────────────────────────────────── */
function SectionRenderer({
  section,
  theme,
}: {
  section: ProgramSection;
  theme: Theme;
}) {
  if (section.visible === false) return null;

  switch (section.type) {
    case "hero":
      return <HeroSection content={section.content} theme={theme} />;
    case "gallery":
      return <GallerySection content={section.content} theme={theme} />;

    case "why":
      return (
        <WhySection
          content={section.content}
          theme={theme}
          id={`why-${section.id}`}
        />
      );

    case "benefits":
      return (
        <BenefitsSection
          content={section.content}
          theme={theme}
          id={section.id}
        />
      );

    case "steps":
      return <StepsSection content={section.content} theme={theme} />;

    case "timeline":
      return <TimelineSection content={section.content} theme={theme} />;
    case "facilities":
      return <FacilitiesSection content={section.content} theme={theme} />;
    case "mentorship":
      return <MentorshipSection content={section.content} theme={theme} />;

    case "classes":
      return <ClassesSection content={section.content} theme={theme} />;

    case "pricing":
      return <PricingSection content={section.content} theme={theme} />;

    case "testimonials":
      return <TestimonialsSection content={section.content} theme={theme} />;

    case "faq":
      return <FAQSection content={section.content} theme={theme} />;

    case "cta":
      return <CTASection content={section.content} theme={theme} />;

    default:
      return null;
  }
}

/* ─────────────────────────────────────────────────────────────
 * ROOT: ProgramDetailPageClient
 * ───────────────────────────────────────────────────────────── */
const ProgramDetailPageClient = ({ details }: { details: ProgramDetail }) => {
  const theme = useMemo(
    () => generateTheme(details.theme?.primary ?? "#1a52c8"),
    [details.theme?.primary],
  );

  const hasBanner = !!(
    details.hasBatch &&
    details.batches &&
    details.batches.some((b) => b.isOpen)
  );

  /* Inject --batch-banner-height CSS variable for layout offsets */
  useBatchBannerHeight(hasBanner);

  /* Build nav items from section types */
  const NAV_LABELS: Partial<Record<string, string>> = {
    hero: "Overview",
    why: "Masalah",
    steps: "Cara Kerja",
    benefits: "Keuntungan",
    fit: "Untuk Siapa",
    timeline: "Timeline",
    classes: "Kelas",
    pricing: "Harga",
    testimonials: "Testimoni",
    faq: "FAQ",
    cta: "Daftar",
  };

  const NAV_IDS: Partial<Record<string, string>> = {
    hero: "hero",
    why: "why-why",
    steps: "cara-kerja",
    benefits: "benefits",
    fit: "fit",
    timeline: "timeline",
    classes: "kelas",
    pricing: "pricing",
    testimonials: "testimoni",
    faq: "faq",
    cta: "daftar",
  };

  const navSections = useMemo(() => {
    const seen = new Set<string>();
    return details.sections
      .filter((s) => s.visible !== false && NAV_LABELS[s.type])
      .filter((s) => {
        const key = s.type === "benefits" ? s.id : s.type;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((s) => ({
        id: s.type === "benefits" ? s.id : (NAV_IDS[s.type] ?? s.id),
        label:
          s.type === "benefits" && s.id === "fit"
            ? "Untuk Siapa"
            : (NAV_LABELS[s.type] ?? s.type),
      }));
  }, [details.sections]);

  const ctaSection = details.sections.find((s) => s.type === "cta");
  const ctaHref =
    ctaSection?.type === "cta" ? ctaSection.content.cta.href : "/contact";
  const ctaLabel =
    ctaSection?.type === "cta"
      ? ctaSection.content.cta.label
      : "Daftar Sekarang";

  return (
    <>
      {/*
       * Push page content down so it's not hidden behind the fixed
       * navbar + fixed batch banner (both stacked at the top).
       */}
      <div
        style={{
          paddingTop: hasBanner
            ? "var(--batch-banner-height, 48px)"
            : undefined,
        }}
      />

      <main className="relative w-full overflow-x-hidden">
        {/* Fixed batch banner — rendered outside section flow */}
        {hasBanner && details.batches && details.batches.length > 0 && (
          <BatchBanner batches={details.batches} theme={theme} />
        )}

        {/* Batch section (if program has batches) */}
        {details.hasBatch && details.batches && details.batches.length > 0 && (
          <>
            {details.sections.map((section) => {
              if (section.type === "hero") {
                return (
                  <React.Fragment key={section.id}>
                    <SectionRenderer section={section} theme={theme} />
                    <BatchesSection
                      batches={details.batches!}
                      theme={theme}
                      ctaHref={ctaHref}
                    />
                  </React.Fragment>
                );
              }
              return (
                <SectionRenderer
                  key={section.id}
                  section={section}
                  theme={theme}
                />
              );
            })}
          </>
        )}

        {/* Non-batch programs render sections directly */}
        {!details.hasBatch &&
          details.sections.map((section) => (
            <SectionRenderer key={section.id} section={section} theme={theme} />
          ))}
      </main>
    </>
  );
};

export default ProgramDetailPageClient;
