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
  useReducedMotion,
} from "framer-motion";
import { CategoryMeta } from "./data";
import { Icon } from "@/components/Icon";
import { generateTheme } from "@/lib/utils";
import {
  ScrollToTopButton,
  SideProgressNav,
} from "@/components/PageFloatingUI";
import Image from "next/image";
import { SOCIAL_PROOF } from "@/constants";
import { buildWhatsAppUrl } from "@/lib/config";

/* ══════════════════════════════════════════════════════════════
 * TYPES & CONSTANTS
 * ══════════════════════════════════════════════════════════════ */
type Theme = ReturnType<typeof generateTheme>;
const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_OUT = [0, 0, 0.38, 1] as const;
const SPRING = { type: "spring", stiffness: 260, damping: 28 } as const;

/* ══════════════════════════════════════════════════════════════
 * SHARED PRIMITIVES
 * ══════════════════════════════════════════════════════════════ */
function Reveal({
  children,
  delay = 0,
  y = 28,
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
  const inView = useInView(ref, { once, margin: "-50px 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: EASE }}
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
        fontSize: "0.6rem",
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

/* Floating orb decoration */
function FloatingOrb({
  theme,
  size = 400,
  top,
  right,
  left,
  bottom,
  opacity = 0.7,
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
        filter: "blur(64px)",
        opacity,
      }}
      animate={{ scale: [1, 1.12, 1], rotate: [0, 8, 0] }}
      transition={{
        duration: 12 + delay * 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

/* Grid background texture */
function GridTexture({ theme }: { theme: Theme }) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(${theme.border} 1px, transparent 1px),
          linear-gradient(90deg, ${theme.border} 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
        opacity: 0.35,
        maskImage:
          "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)",
      }}
    />
  );
}

/* ══════════════════════════════════════════════════════════════
 * STICKY PROGRESS NAV
 * ══════════════════════════════════════════════════════════════ */
function StickyProgressNav({
  sections,
  theme,
}: {
  sections: { id: string; label: string }[];
  theme: Theme;
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(total > 0 ? (window.scrollY / total) * 100 : 0);

      for (const s of [...sections].reverse()) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActive(s.id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1, duration: 0.6, ease: EASE }}
      className="sticky z-50 w-full"
      style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--color-brand-border-soft)",
        top: "var(--navbar-height)",
      }}
    >
      {/* Progress bar */}
      <div
        className="absolute top-0 left-0 h-0.5 transition-all duration-150 "
        style={{
          width: `${scrollPct}%`,
          background: `linear-gradient(90deg, ${theme.primary}, ${theme.strong})`,
        }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: theme.soft,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div
              className="w-3 h-3 rounded-sm"
              style={{ background: theme.primary }}
            />
          </div>
          <span
            className="font-display font-bold hidden sm:block"
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-brand-blue-navy)",
            }}
          >
            InggrisGo
          </span>
        </div>

        {/* Section links */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                const el = document.getElementById(s.id);
                if (!el) return;

                const y =
                  el.getBoundingClientRect().top +
                  window.scrollY -
                  (parseInt(
                    getComputedStyle(document.documentElement).getPropertyValue(
                      "--navbar-height",
                    ),
                  ) +
                    56); // 56 = sticky nav height

                window.scrollTo({ top: y, behavior: "smooth" });
              }}
              className="relative px-3 py-1.5 rounded-lg font-display font-semibold transition-all whitespace-nowrap"
              style={{
                fontSize: "0.75rem",
                color:
                  active === s.id
                    ? theme.primary
                    : "var(--color-brand-text-faint)",
                background: active === s.id ? theme.soft : "transparent",
              }}
            >
              {s.label}
              {active === s.id && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: theme.soft,
                    border: `1px solid ${theme.border}`,
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{s.label}</span>
            </button>
          ))}
        </div>

        {/* CTA */}
        <motion.a
          href="#program-list"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-display font-bold text-white flex-shrink-0"
          style={{
            fontSize: "0.75rem",
            background: theme.primary,
            boxShadow: `0 4px 16px ${theme.border}`,
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Daftar Sekarang
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
  );
}

export function MarqueeTicker({ theme }: { theme: Theme }) {
  const items = [
    `${SOCIAL_PROOF.activeStudents}+ Siswa Aktif`,
    "Rating 4.9/5",
    "Mentor Berpengalaman",
    "Sertifikat Resmi",
    "Belajar Fleksibel",
    "Komunitas Suportif",
    "Materi Terupdate",
    "Garansi Kepuasan",
  ];

  const tickerItem = (item: string, key: string | number) => (
    <span
      key={key}
      className="inline-flex items-center gap-3 font-display font-semibold uppercase flex-shrink-0"
      style={{
        fontSize: "0.625rem",
        letterSpacing: "0.13em",
        color: theme.primary,
        padding: "0 1.5rem",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: theme.primary, opacity: 0.5 }}
      />
      {item}
    </span>
  );

  return (
    <>
      {/* CSS keyframe injected once */}
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-track {
          animation: ticker-scroll 28s linear infinite;
          will-change: transform;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div
        className="fixed left-0 right-0 z-30 overflow-hidden"
        style={{
          top: "var(--navbar-height)",
          height: "36px",
          background: theme.soft,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        {/* Fade edges */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10"
          style={{
            background: `linear-gradient(90deg, ${theme.soft} 30%, transparent)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10"
          style={{
            background: `linear-gradient(270deg, ${theme.soft} 30%, transparent)`,
          }}
        />

        {/*
         * One outer flex container holds TWO identical tracks.
         * The CSS animation shifts the whole thing left by 50%,
         * which is exactly one track width — perfect seamless loop.
         */}
        <div
          className="ticker-track flex items-center h-full"
          style={{ width: "max-content" }}
        >
          {/* Track A */}
          <div className="flex items-center h-full">
            {items.map((item, i) => tickerItem(item, `a-${i}`))}
          </div>
          {/* Track B — identical copy */}
          <div className="flex items-center h-full" aria-hidden="true">
            {items.map((item, i) => tickerItem(item, `b-${i}`))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
 * ANIMATED COUNTER
 * ══════════════════════════════════════════════════════════════ */
function AnimatedNumber({
  value,
  suffix = "",
  theme,
}: {
  value: number;
  suffix?: string;
  theme: Theme;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const duration = 1400;
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <span
      ref={ref}
      className="font-display font-black tabular-nums"
      style={{ color: theme.primary }}
    >
      {display.toLocaleString("id-ID")}
      {suffix}
    </span>
  );
}

export function HeroRightPanel({
  category,
  theme,
}: {
  category: CategoryMeta;
  theme: Theme;
}) {
  const experience = category.experience ?? [];
  const steps = category.steps ?? [];
  const benefits = category.benefits ?? [];

  if (experience.length > 0) {
    return (
      <div className="flex flex-col gap-2.5">
        <p
          className="font-display font-bold uppercase mb-1"
          style={{
            fontSize: "0.5625rem",
            letterSpacing: "0.18em",
            color: "var(--color-brand-text-faint)",
          }}
        >
          Apa yang kamu rasakan
        </p>
        {experience.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.1, duration: 0.5, ease: EASE }}
            whileHover={{ x: 5, scale: 1.015 }}
            className="flex items-start gap-3 p-3.5 rounded-2xl"
            style={{
              background:
                i % 2 === 0 ? theme.soft : "var(--color-brand-surface)",
              border: `1.5px solid ${theme.border}`,
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
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

  if (steps.length > 0) {
    return (
      <div className="flex flex-col gap-1">
        <p
          className="font-display font-bold uppercase mb-2"
          style={{
            fontSize: "0.5625rem",
            letterSpacing: "0.18em",
            color: "var(--color-brand-text-faint)",
          }}
        >
          Cara mulai
        </p>
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.1, duration: 0.5, ease: EASE }}
            className="flex items-start gap-3 relative"
          >
            {i < steps.length - 1 && (
              <div
                className="absolute left-[15px] top-8 w-px z-0"
                style={{ height: "calc(100% + 4px)", background: theme.border }}
              />
            )}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-black flex-shrink-0 relative z-10"
              style={{
                background: theme.primary,
                color: "white",
                fontSize: "0.6875rem",
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

  if (benefits.length > 0) {
    return (
      <div className="grid grid-cols-2 gap-2.5">
        {benefits.map((b, i) => (
          <motion.div
            key={b.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.09, duration: 0.5, ease: EASE }}
            whileHover={{ y: -3, scale: 1.02 }}
            className="p-3.5 rounded-2xl"
            style={{
              background:
                i % 2 === 0 ? theme.soft : "var(--color-brand-surface)",
              border: `1.5px solid ${theme.border}`,
            }}
          >
            {b.icon && (
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center mb-2"
                style={{ background: theme.softStrong }}
              >
                <Icon
                  name={b.icon as any}
                  className="w-3.5 h-3.5"
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
              {b.title}bbb
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

  return (
    <div className="flex flex-col gap-2.5">
      {category.programs.slice(0, 3).map((p, i) => (
        <motion.div
          key={p.slug}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 + i * 0.08 }}
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
  const heroY = useTransform(scrollY, [0, 500], [0, -60]);

  const heroImage = category.heroImage;

  return (
    <section
      id="hero"
      className="relative overflow-hidden lg:pt-20"
      style={{
        background: "var(--color-brand-surface)",
        minHeight: "min(92vh, 820px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
      }}
    >
      {/* Layered background */}
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
        opacity={0.6}
        delay={0}
      />
      <FloatingOrb
        theme={theme}
        size={380}
        bottom="-8%"
        left="-4%"
        opacity={0.45}
        delay={3}
      />
      <FloatingOrb
        theme={theme}
        size={240}
        top="40%"
        right="32%"
        opacity={0.25}
        delay={6}
      />

      <motion.div
        style={{ y: heroY }}
        className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-8 lg:py-12 flex items-center "
      >
        <div className="w-full grid lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_480px] gap-12 lg:gap-20 items-start">
          {/* LEFT */}
          <div>
            {/* Breadcrumb */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="flex items-start gap-2 mb-7"
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

            {/* Pill */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.06, ease: EASE }}
              className="mb-6"
            >
              <SectionPill theme={theme}>
                {category.icon && (
                  <Icon
                    name={category.icon as any}
                    className="w-3.5 h-3.5"
                    style={{ color: theme.primary }}
                  />
                )}
                {category.shortLabel ?? category.label}
              </SectionPill>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
              className="font-display font-extrabold leading-[1.03] mb-6"
              style={{
                fontSize: "clamp(2.4rem, 5.5vw, 4.25rem)",
                letterSpacing: "-0.035em",
                color: "black",
              }}
            >
              {category.tagline}{" "}
              {category.taglineAccent && (
                <span
                  style={{
                    color: theme.primary,
                    position: "relative",
                    display: "inline-block",
                  }}
                >
                  {category.taglineAccent}
                  {/* Underline accent */}
                  <motion.svg
                    viewBox="0 0 300 12"
                    className="absolute -bottom-2 left-0 w-full"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.8, ease: EASE }}
                  >
                    <motion.path
                      d="M4 8 Q75 2 150 8 Q225 14 296 6"
                      stroke={theme.primary}
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.8, duration: 0.9, ease: EASE }}
                    />
                  </motion.svg>
                </span>
              )}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.17, ease: EASE }}
              style={{
                fontSize: "clamp(0.9375rem, 1.5vw, 1.0625rem)",
                color: "var(--color-brand-text-muted)",
                lineHeight: "1.8",
                maxWidth: "520px",
                marginBottom: "2rem",
              }}
            >
              {category.description}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28, ease: EASE }}
              className="flex flex-wrap gap-3 mb-10"
            >
              <motion.a
                href={category.cta.primaryHref}
                className="group font-display font-bold px-7 py-4 rounded-2xl flex items-center gap-2.5 text-white relative overflow-hidden"
                style={{
                  fontSize: "0.9375rem",
                  background: theme.primary,
                  boxShadow: `0 8px 32px ${theme.border}`,
                  textDecoration: "none",
                }}
                whileHover={{
                  scale: 1.04,
                  boxShadow: `0 16px 48px ${theme.border}`,
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2, ease: EASE }}
              >
                {/* Shine effect */}
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
                  }}
                />
                <span className="relative z-10">
                  {category.cta.primaryLabel}
                </span>
                <svg
                  viewBox="0 0 16 16"
                  className="w-4 h-4 relative z-10"
                  fill="none"
                >
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
                  className="font-display font-semibold px-6 py-4 rounded-2xl flex items-center gap-2"
                  style={{
                    fontSize: "0.9375rem",
                    color: theme.primary,
                    background: theme.soft,
                    border: `1.5px solid ${theme.border}`,
                    textDecoration: "none",
                  }}
                  whileHover={{ scale: 1.02, background: theme.softStrong }}
                  whileTap={{ scale: 0.97 }}
                >
                  {category.cta.secondaryLabel}
                </motion.a>
              )}
            </motion.div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.42 }}
              className="pt-7"
              style={{ borderTop: "1px solid var(--color-brand-border-soft)" }}
            >
              {/* For who */}
              <div className="flex items-start gap-2.5 mb-6">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
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
                    lineHeight: 1.6,
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

              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { n: category.programs.length, suffix: "", label: "Program" },
                  {
                    n: SOCIAL_PROOF.activeStudents,
                    suffix: "+",
                    label: "Siswa",
                  },
                  { n: 49, suffix: "★", label: "Rating (dari 50)" },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.07 }}
                    className="rounded-xl p-3"
                    style={{
                      background: theme.soft,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <div className="flex items-baseline gap-0.5">
                      <AnimatedNumber
                        value={s.n}
                        suffix={s.suffix}
                        theme={theme}
                      />
                    </div>
                    <p
                      style={{
                        fontSize: "0.625rem",
                        color: "var(--color-brand-text-faint)",
                        marginTop: "2px",
                      }}
                    >
                      {s.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT — Visual Panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.22, ease: EASE }}
            className="hidden lg:block"
          >
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: "var(--color-brand-surface)",
                border: `1.5px solid ${theme.border}`,
                boxShadow: heroImage
                  ? `0 20px 48px ${theme.border}, 0 4px 16px rgba(10,45,135,0.06)`
                  : `0 40px 96px ${theme.border}, 0 8px 24px rgba(10,45,135,0.08)`,
              }}
            >
              {/* Accent bar */}
              <div
                style={{
                  height: "4px",
                  background: `linear-gradient(90deg, ${theme.primary} 0%, ${theme.strong} 100%)`,
                }}
              />

              {/* Panel header */}
              <div
                className="px-5 pt-4 pb-4 flex items-center justify-between"
                style={{ borderBottom: `1px solid ${theme.border}` }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{
                      background: theme.soft,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    {category.icon && (
                      <Icon
                        name={category.icon as any}
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
                      {category.shortLabel}
                    </p>
                    <p
                      style={{
                        fontSize: "0.5625rem",
                        color: "var(--color-brand-text-faint)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {category.programs.length} program tersedia
                    </p>
                  </div>
                </div>
                <span
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{
                    fontSize: "0.5875rem",
                    color: "#16a34a",
                    background: "rgba(22,163,74,0.08)",
                    border: "1px solid rgba(22,163,74,0.2)",
                  }}
                >
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#4ade80" }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                  Aktif
                </span>
              </div>

              <div className="p-5">
                <HeroRightPanel category={category} theme={theme} />
              </div>

              {/* Panel footer CTA */}
              <div className="px-5 pb-5">
                <motion.a
                  href={category.cta.primaryHref}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-display font-bold text-white"
                  style={{
                    fontSize: "0.875rem",
                    background: theme.primary,
                    textDecoration: "none",
                    boxShadow: `0 4px 20px ${theme.border}`,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {category.cta.primaryLabel}
                  <svg viewBox="0 0 14 14" className="w-3.5 h-3.5" fill="none">
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
            </div>
            {heroImage && (
              <motion.div
                className="relative mb-5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
              >
                <div>
                  {/* Image container */}

                  <div className="relative flex items-end justify-center pt-6 px-6">
                    {/* Decorative circles behind image */}

                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] h-[85%] rounded-full"
                      style={{
                        background: `radial-gradient(circle, ${theme.softStrong} 0%, transparent 70%)`,

                        opacity: 0.8,
                      }}
                    />

                    <Image
                      src={heroImage}
                      alt={`${category.shortLabel ?? category.label} - InggrisGo`}
                      width={400}
                      height={440}
                      className="relative z-10 object-contain"
                      style={{
                        maxHeight: "380px",

                        width: "auto",

                        filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.12))",
                      }}
                      priority
                    />

                    {/* ── Speech bubble with social proof ── */}

                    <motion.div
                      className="absolute top-6 left-2 z-20"
                      style={{
                        maxWidth: "190px",

                        background: "rgba(255,255,255,0.95)",

                        backdropFilter: "blur(12px)",

                        border: `1.5px solid ${theme.border}`,

                        borderRadius: "16px 16px 16px 4px",

                        padding: "11px 14px",

                        boxShadow: "0 4px 16px rgba(0,0,0,0.09)",
                      }}
                      initial={{ opacity: 0, scale: 0.85, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.95, duration: 0.5, ease: EASE }}
                    >
                      {/* Bubble tail */}

                      <div
                        style={{
                          position: "absolute",
                          bottom: -8,
                          right: 10,

                          width: 0,
                          height: 0,

                          borderLeft: "8px solid transparent",

                          borderRight: "4px solid transparent",

                          borderTop: "10px solid rgba(255,255,255,0.95)",
                        }}
                      />

                      <p
                        style={{
                          fontSize: "0.6875rem",

                          fontStyle: "italic",

                          color: "var(--color-brand-blue-navy)",

                          margin: "0 0 8px",

                          lineHeight: 1.5,
                        }}
                      >
                        "{category.socialProof?.[0]?.quote?.slice(0, 90)}..."
                      </p>

                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center font-display font-black flex-shrink-0"
                          style={{
                            background: theme.soft,

                            color: theme.primary,

                            fontSize: "0.625rem",

                            border: `1.5px solid ${theme.border}`,
                          }}
                        >
                          {category.socialProof?.[0]?.name?.[0]}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className="font-display font-bold truncate"
                            style={{
                              fontSize: "0.625rem",
                              color: "var(--color-brand-blue-navy)",
                            }}
                          >
                            {category.socialProof?.[0]?.name}
                          </p>

                          <p
                            className="truncate"
                            style={{
                              fontSize: "0.5625rem",
                              color: "var(--color-brand-text-faint)",
                            }}
                          >
                            {category.socialProof?.[0]?.role}
                          </p>
                        </div>

                        <div className="flex gap-px flex-shrink-0">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              viewBox="0 0 12 12"
                              className="w-2.5 h-2.5"
                              fill="#FBBF24"
                            >
                              <path d="M6 1l1.5 3 3.2.4-2.3 2.2.5 3.2L6 8.2l-2.9 1.6.5-3.2L1.3 4.4l3.2-.4z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </motion.div>

                    {/* Active programs badge — keep as-is */}

                    <motion.div
                      className="absolute bottom-6 right-2 z-20 flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{
                        background: "rgba(255,255,255,0.92)",

                        backdropFilter: "blur(12px)",

                        border: `1px solid ${theme.border}`,

                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8, duration: 0.5, ease: EASE }}
                    >
                      <motion.span
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#4ade80" }}
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                      />

                      <span
                        className="font-display font-bold"
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--color-brand-blue-navy)",
                        }}
                      >
                        {category.programs.length} Program Aktif
                      </span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
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
            color: "var(--color-brand-text-faint)",
            textTransform: "uppercase",
          }}
        >
          Scroll
        </span>
      </motion.div>

      {/* Marquee ticker */}
      <MarqueeTicker theme={theme} />
    </section>
  );
}

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
    <Reveal delay={index * 0.08} y={36}>
      <motion.a
        href={program.href}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ scale: 1.02, y: -8 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="flex flex-col rounded-3xl overflow-hidden h-full relative"
        style={{
          background: "var(--color-brand-surface)",
          border: `1.5px solid ${hovered ? theme.border : "var(--color-brand-border-soft)"}`,
          boxShadow: hovered
            ? `0 32px 72px ${theme.border}, 0 4px 24px rgba(10,45,135,0.08)`
            : "0 2px 16px rgba(10,45,135,0.05)",
          transition: "border-color 0.25s ease, box-shadow 0.3s ease",
          textDecoration: "none",
        }}
      >
        {/* Top gradient strip */}
        <div
          style={{
            height: "4px",
            background: hovered
              ? `linear-gradient(90deg, ${theme.primary}, ${theme.strong})`
              : `linear-gradient(90deg, ${theme.border}, transparent)`,
            transition: "background 0.3s ease",
          }}
        />

        {/* Hover glow bg */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
              style={{ background: theme.soft }}
            />
          )}
        </AnimatePresence>

        <div className="relative flex flex-col flex-1 p-5">
          {/* Icon + title */}
          <div className="flex items-start gap-4 mb-5">
            <motion.div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: hovered ? theme.softStrong : theme.soft,
                border: `1.5px solid ${theme.border}`,
                transition: "background 0.25s ease",
              }}
              animate={hovered ? { rotate: [0, -5, 5, 0] } : { rotate: 0 }}
              transition={{ duration: 0.4 }}
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
                  color: "black",
                }}
              >
                {program.title}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {program.badge && (
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full font-display font-bold"
                    style={{
                      fontSize: "0.5625rem",
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
                      fontSize: "0.5625rem",
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
              lineHeight: "1.7",
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
              <div
                className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: theme.softStrong }}
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
                  fontSize: "0.8125rem",
                  color: "var(--color-brand-text-muted)",
                  lineHeight: "1.55",
                }}
              >
                {program.highlight}
              </p>
            </div>
          )}

          {/* Meta chips */}
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

          {/* Price tiers */}
          {program.priceTiers && program.priceTiers.length > 0 && (
            <div className="mb-4">
              <p
                className="font-display font-bold uppercase mb-2"
                style={{
                  fontSize: "0.5625rem",
                  letterSpacing: "0.12em",
                  color: "var(--color-brand-text-faint)",
                }}
              >
                Pilih Paket
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {program.priceTiers.slice(0, 4).map((tier) => (
                  <div
                    key={tier.label}
                    className="rounded-xl p-2.5 transition-colors"
                    style={{
                      background: theme.soft,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <p
                      className="font-display font-semibold"
                      style={{
                        fontSize: "0.5625rem",
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

          {/* Footer */}
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
              className="flex items-center gap-2 font-display font-bold px-5 py-2.5 rounded-xl text-white"
              style={{
                fontSize: "0.875rem",
                background: theme.primary,
                boxShadow: `0 4px 16px ${theme.border}`,
              }}
              animate={hovered ? { x: 4 } : { x: 0 }}
              transition={{ duration: 0.2 }}
            >
              Daftar
              <svg viewBox="0 0 14 14" className="w-3.5 h-3.5" fill="none">
                <path
                  d="M2.5 7h9M7.5 3.5l3.5 3.5-3.5 3.5"
                  stroke="white"
                  strokeWidth={1.7}
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
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section
      id="program-list"
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ background: "var(--color-brand-bg)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse 55% 50% at 100% 0%, ${theme.soft} 0%, transparent 55%), radial-gradient(ellipse 45% 55% at 0% 100%, ${theme.soft} 0%, transparent 55%)`,
        }}
      />
      <GridTexture theme={theme} />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center text-center mb-14">
          <Reveal>
            <SectionPill theme={theme}>✦ Program Tersedia</SectionPill>
          </Reveal>
          <Reveal delay={0.07}>
            <h2
              className="font-display font-extrabold mt-5 mb-4 leading-[1.07]"
              style={{
                fontSize: "clamp(1.9rem, 3.5vw, 2.875rem)",
                letterSpacing: "-0.026em",
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
                maxWidth: "440px",
                lineHeight: "1.75",
              }}
            >
              Semua program dirancang khusus untuk kebutuhan{" "}
              {category.shortLabel}. Klik untuk detail dan pendaftaran.
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

        {/* Quick comparison hint */}
        <Reveal delay={0.2}>
          <div
            className="mt-10 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4"
            style={{
              background: theme.soft,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: theme.softStrong,
                border: `1px solid ${theme.border}`,
              }}
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                <circle
                  cx="8"
                  cy="8"
                  r="6.5"
                  stroke={theme.primary}
                  strokeWidth="1.4"
                />
                <path
                  d="M8 6v2.5L9.5 10"
                  stroke={theme.primary}
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p
                className="font-display font-bold"
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--color-brand-blue-navy)",
                }}
              >
                Tidak yakin program mana yang tepat?
              </p>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-brand-text-muted)",
                  marginTop: "2px",
                }}
              >
                Konsultasikan dengan tim kami — gratis, tanpa tekanan.
              </p>
            </div>
            <motion.a
              href={buildWhatsAppUrl({
                title: "Konsultasi",
                intent: "consultation",
              })}
              className="font-display font-bold px-5 py-2.5 rounded-xl whitespace-nowrap flex-shrink-0"
              style={{
                fontSize: "0.875rem",
                color: theme.primary,
                background: "var(--color-brand-surface)",
                border: `1.5px solid ${theme.border}`,
                textDecoration: "none",
              }}
              whileHover={{ scale: 1.03, background: theme.softStrong }}
              whileTap={{ scale: 0.98 }}
            >
              Konsultasi Gratis →
            </motion.a>
          </div>
        </Reveal>
      </div>
      <TrustBar theme={theme}></TrustBar>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
 * PAIN → SOLUTION (two-column narrative, enhanced)
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
      id="masalah"
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
        <div className="text-center mb-16">
          <Reveal>
            <SectionPill theme={theme}>✦ Kamu Tidak Sendirian</SectionPill>
          </Reveal>
          <Reveal delay={0.07}>
            <h2
              className="font-display font-extrabold mt-5 mb-4 leading-[1.07]"
              style={{
                fontSize: "clamp(1.9rem, 3.5vw, 2.875rem)",
                letterSpacing: "-0.026em",
                color: "var(--color-brand-blue-navy)",
              }}
            >
              Dari{" "}
              <span style={{ color: "rgba(255,107,53,0.9)" }}>hambatan</span> ke{" "}
              <span style={{ color: theme.primary }}>solusi nyata</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--color-brand-text-muted)",
                maxWidth: "430px",
                margin: "0 auto",
                lineHeight: "1.75",
              }}
            >
              Banyak yang mengalami hambatan yang sama. Program kami dirancang
              spesifik untuk mengatasinya.
            </p>
          </Reveal>
        </div>

        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-6 items-start">
          {/* PAIN */}
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
                  letterSpacing: "0.16em",
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
                          lineHeight: "1.6",
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

          {/* Arrow connector */}
          <div className="hidden lg:flex flex-col items-center justify-center pt-20 px-3">
            <div
              className="w-px"
              style={{
                height: 40,
                background: `linear-gradient(to bottom, transparent, ${theme.border})`,
              }}
            />
            <motion.div
              className="w-10 h-10 rounded-full flex items-center justify-center my-2"
              style={{ background: theme.primary }}
              animate={{ scale: [1, 1.12, 1] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <svg viewBox="0 0 14 14" className="w-4 h-4" fill="none">
                <path
                  d="M2.5 7h9M7.5 3.5l3.5 3.5-3.5 3.5"
                  stroke="white"
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
            <div
              className="w-px"
              style={{
                height: 40,
                background: `linear-gradient(to bottom, ${theme.border}, transparent)`,
              }}
            />
          </div>

          {/* SOLUTION */}
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
                  letterSpacing: "0.16em",
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
                          lineHeight: "1.6",
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
 * HOW IT WORKS — Steps with timeline connector
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
      id="cara-mulai"
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
                fontSize: "clamp(1.9rem, 3.5vw, 2.875rem)",
                letterSpacing: "-0.026em",
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
                maxWidth: "390px",
                lineHeight: "1.75",
              }}
            >
              Prosesnya sederhana dan jelas. Tidak ada yang perlu dikhawatirkan.
            </p>
          </Reveal>
        </div>

        <div className="relative">
          {/* Connector line */}
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

          <div
            className={`grid gap-8 ${
              steps.length <= 2
                ? "sm:grid-cols-2 max-w-2xl mx-auto"
                : "sm:grid-cols-3"
            }`}
          >
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.1} y={24}>
                <div className="flex flex-col items-center text-center relative z-10">
                  {/* Bubble */}
                  <motion.div
                    className="relative mb-6"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.22 }}
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-black"
                      style={{
                        background: theme.primary,
                        fontSize: "1.25rem",
                        color: "white",
                        letterSpacing: "-0.02em",
                        boxShadow: `0 8px 28px ${theme.border}`,
                      }}
                    >
                      {step.n ?? String(i + 1).padStart(2, "0")}
                    </div>
                    {i === 0 && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          border: `2px solid ${theme.primary}`,
                          opacity: 0.3,
                        }}
                        animate={{
                          scale: [1, 1.28, 1],
                          opacity: [0.3, 0, 0.3],
                        }}
                        transition={{
                          duration: 2.6,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </motion.div>

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
 * EXPERIENCE SECTION
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
      id="pengalaman"
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
                fontSize: "clamp(1.9rem, 3.5vw, 2.875rem)",
                letterSpacing: "-0.026em",
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
                lineHeight: "1.75",
              }}
            >
              Bukan sekadar kelas biasa — pengalaman yang mengubah caramu
              belajar.
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
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="relative overflow-hidden rounded-3xl p-6"
                style={{
                  background: theme.softStrong,
                  border: `1.5px solid ${theme.border}`,
                  boxShadow: `0 4px 24px ${theme.border}`,
                }}
              >
                {/* Decorative corner */}
                <div
                  className="absolute top-0 right-0 w-24 h-24 rounded-bl-full"
                  style={{ background: theme.soft, opacity: 0.9 }}
                />
                <div
                  className="absolute top-5 right-5 w-2 h-2 rounded-full"
                  style={{ background: theme.primary, opacity: 0.7 }}
                />

                <div className="relative z-10">
                  {item.icon && (
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                      style={{
                        background: theme.primary,
                        boxShadow: `0 8px 24px ${theme.border}`,
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
                      lineHeight: "1.68",
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
 * COMPARISON TABLE
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
      id="detail"
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
                letterSpacing: "-0.026em",
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
            className="rounded-3xl overflow-hidden"
            style={{
              border: `1.5px solid ${theme.border}`,
              boxShadow: `0 12px 48px ${theme.border}`,
            }}
          >
            <div
              className="px-6 py-5 flex items-center gap-3"
              style={{ background: theme.primary }}
            >
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                  <rect
                    x="2.5"
                    y="2.5"
                    width="11"
                    height="11"
                    rx="2"
                    stroke="white"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M5.5 8l2 2 3-3"
                    stroke="white"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                className="font-display font-bold text-white"
                style={{ fontSize: "1rem" }}
              >
                Detail Program {categoryLabel}
              </span>
            </div>

            {comparison.map((item, i) => (
              <motion.div
                key={item.label}
                whileHover={{ x: 5 }}
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
                <div className="flex items-center gap-3">
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
                  className="font-display font-bold px-3 py-1.5 rounded-xl"
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
 * TESTIMONIALS — Enhanced card carousel
 * ══════════════════════════════════════════════════════════════ */
function TestimonialsSection({
  socialProof,
  theme,
}: {
  socialProof: NonNullable<CategoryMeta["socialProof"]>;
  theme: Theme;
}) {
  const [active, setActive] = useState(0);
  const dragX = useMotionValue(0);

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x < -60 && active < socialProof.length - 1)
      setActive((a) => a + 1);
    if (info.offset.x > 60 && active > 0) setActive((a) => a - 1);
  };

  return (
    <section
      id="testimoni"
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
        <div className="flex flex-col items-center text-center mb-14">
          <Reveal>
            <SectionPill theme={theme}>✦ Cerita Nyata</SectionPill>
          </Reveal>
          <Reveal delay={0.07}>
            <h2
              className="font-display font-extrabold mt-5 mb-3 leading-[1.07]"
              style={{
                fontSize: "clamp(1.9rem, 3.5vw, 2.875rem)",
                letterSpacing: "-0.026em",
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
                lineHeight: "1.75",
              }}
            >
              Bukan janji — ini hasil nyata dari alumni yang pernah di posisimu
              sekarang.
            </p>
          </Reveal>
        </div>

        {/* All cards shown on desktop, stacked carousel on mobile */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {socialProof.map((proof, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <motion.div
                whileHover={{ y: -6, scale: 1.015 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="relative rounded-3xl p-6"
                style={{
                  background: "var(--color-brand-surface)",
                  border: `1.5px solid ${theme.border}`,
                  boxShadow: `0 4px 20px ${theme.border}`,
                  height: "100%",
                }}
              >
                {/* Quote accent */}
                <div
                  className="absolute top-5 left-5 font-display font-black select-none pointer-events-none"
                  style={{
                    fontSize: "5rem",
                    color: theme.primary,
                    opacity: 0.06,
                    lineHeight: 1,
                  }}
                >
                  "
                </div>
                <div
                  className="absolute top-0 left-8 right-8 h-0.5 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${theme.primary}, transparent)`,
                  }}
                />

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
                    color: "var(--color-brand-text-muted)",
                    lineHeight: "1.8",
                  }}
                >
                  "{proof.quote}"
                </p>

                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-display font-black"
                    style={{
                      background: theme.soft,
                      border: `2px solid ${theme.border}`,
                      fontSize: "1rem",
                      color: theme.primary,
                    }}
                  >
                    {proof.name?.[0] ?? "?"}
                  </div>
                  <div>
                    {proof.name && (
                      <p
                        className="font-display font-bold"
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--color-brand-blue-navy)",
                        }}
                      >
                        {proof.name}
                      </p>
                    )}
                    {proof.role && (
                      <p
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--color-brand-text-faint)",
                        }}
                      >
                        {proof.role}
                      </p>
                    )}
                  </div>
                  <span
                    className="ml-auto px-2.5 py-1 rounded-full font-display font-bold uppercase"
                    style={{
                      fontSize: "0.5625rem",
                      background: theme.soft,
                      color: theme.primary,
                      border: `1px solid ${theme.border}`,
                      letterSpacing: "0.08em",
                    }}
                  >
                    Alumni
                  </span>
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
              dragElastic={0.1}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, x: 50, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.97 }}
              transition={{ duration: 0.38, ease: EASE }}
              className="relative rounded-3xl p-6 cursor-grab active:cursor-grabbing"
              style={{
                background: "var(--color-brand-surface)",
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
                  color: "var(--color-brand-text-muted)",
                  lineHeight: "1.82",
                }}
              >
                "{socialProof[active].quote}"
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
              </div>
              <p
                className="text-center mt-4"
                style={{
                  fontSize: "0.6875rem",
                  color: "var(--color-brand-text-faint)",
                }}
              >
                Geser untuk selanjutnya →
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-5">
            {socialProof.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  width: active === i ? 24 : 8,
                  height: 8,
                  borderRadius: 9999,
                  background:
                    active === i ? theme.primary : "var(--color-brand-border)",
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

/* ══════════════════════════════════════════════════════════════
 * TRUST BAR — New component: logos / trust signals
 * ══════════════════════════════════════════════════════════════ */
function TrustBar({ theme }: { theme: Theme }) {
  const signals = [
    { icon: "shield", label: "Terjamin & Aman" },
    { icon: "award", label: "Sertifikat Resmi" },
    { icon: "clock", label: "Support 24/7" },
    { icon: "refresh-cw", label: "Jaminan Kepuasan" },
    { icon: "users", label: `${SOCIAL_PROOF.totalStudents}+ Alumni` },
    { icon: "trending-up", label: "Progress Terukur" },
  ];

  return (
    <section
      className="relative py-8 overflow-hidden"
      style={{ background: "var(--color-brand-bg)" }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <Reveal>
          <p
            className="text-center font-display font-bold uppercase mb-8"
            style={{
              fontSize: "0.625rem",
              letterSpacing: "0.2em",
              color: "var(--color-brand-text-faint)",
            }}
          >
            Kenapa Pilih InggrisGo
          </p>
        </Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {signals.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06}>
              <motion.div
                whileHover={{ y: -4, scale: 1.03 }}
                transition={{ duration: 0.22 }}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl text-center"
                style={{
                  background: "var(--color-brand-surface)",
                  border: "1px solid var(--color-brand-border-soft)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: theme.soft,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <Icon
                    name={s.icon as any}
                    className="w-5 h-5"
                    style={{ color: theme.primary }}
                  />
                </div>
                <p
                  className="font-display font-bold"
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-brand-blue-navy)",
                    lineHeight: 1.3,
                  }}
                >
                  {s.label}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
 * FAQ — Accordion component (NEW)
 * ══════════════════════════════════════════════════════════════ */
function FAQSection({
  theme,
  category,
}: {
  theme: Theme;
  category: CategoryMeta;
}) {
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    {
      q: "Apakah saya perlu pengalaman sebelumnya?",
      a: `Tidak! Program ${category.shortLabel ?? category.label} kami dirancang untuk berbagai level. Kami akan menyesuaikan dengan kemampuan awalmu.`,
    },
    {
      q: "Bagaimana cara pembayaran?",
      a: "Kami menerima transfer bank, e-wallet (GoPay, OVO, Dana), dan kartu kredit. Hubungi admin untuk opsi cicilan.",
    },
    {
      q: "Apakah ada garansi jika tidak puas?",
      a: "Ya! Kami memberikan garansi kepuasan. Jika dalam 3 hari pertama kamu merasa program tidak sesuai, kami akan refund penuh.",
    },
    {
      q: "Berapa lama akses materi berlaku?",
      a: "Semua materi bisa diakses selamanya setelah pembelian. Kamu bisa review kapan saja sesuai kebutuhan.",
    },
    {
      q: "Apakah ada sesi konsultasi dengan mentor?",
      a: "Tersedia sesi Q&A dan konsultasi di setiap program. Untuk kebutuhan lebih personal, kami menyediakan private class.",
    },
  ];

  return (
    <section
      id="faq"
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ background: "var(--color-brand-surface)" }}
    >
      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center text-center mb-12">
          <Reveal>
            <SectionPill theme={theme}>✦ FAQ</SectionPill>
          </Reveal>
          <Reveal delay={0.07}>
            <h2
              className="font-display font-extrabold mt-5 mb-3 leading-[1.07]"
              style={{
                fontSize: "clamp(1.9rem, 3.5vw, 2.5rem)",
                letterSpacing: "-0.026em",
                color: "var(--color-brand-blue-navy)",
              }}
            >
              Pertanyaan yang{" "}
              <span style={{ color: theme.primary }}>sering ditanyakan</span>
            </h2>
          </Reveal>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  border: `1.5px solid ${open === i ? theme.border : "var(--color-brand-border-soft)"}`,
                  transition: "border-color 0.25s ease",
                }}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  style={{
                    background:
                      open === i ? theme.soft : "var(--color-brand-surface)",
                  }}
                >
                  <p
                    className="font-display font-bold"
                    style={{
                      fontSize: "0.9375rem",
                      color: "var(--color-brand-blue-navy)",
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
                            color: "var(--color-brand-text-muted)",
                            lineHeight: "1.75",
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

        {/* Still have questions */}
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
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                <path
                  d="M12 10c0 1.1-.9 2-2 2H5l-3 3V5c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v5z"
                  stroke={theme.primary}
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p
                className="font-display font-bold"
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--color-brand-blue-navy)",
                }}
              >
                Masih ada pertanyaan lain?
              </p>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-brand-text-muted)",
                  marginTop: "2px",
                }}
              >
                Tim kami siap membantu kapan saja.
              </p>
            </div>
            <motion.a
              href="/contact"
              className="font-display font-bold px-4 py-2.5 rounded-xl whitespace-nowrap flex-shrink-0"
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

/* ══════════════════════════════════════════════════════════════
 * FINAL CTA — Dark immersive conversion section
 * ══════════════════════════════════════════════════════════════ */
function CTASection({
  cta,
  theme,
}: {
  cta: CategoryMeta["cta"];
  theme: Theme;
}) {
  return (
    <section id="daftar" className="relative py-24 lg:py-36 overflow-hidden">
      {/* Dark base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(155deg, #060f2e 0%, #0a2d87 55%, #1346b0 100%)",
        }}
      />

      {/* Theme blobs */}
      <motion.div
        className="pointer-events-none absolute"
        style={{
          width: 640,
          height: 640,
          top: "-28%",
          right: "-6%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.soft} 0%, transparent 70%)`,
          filter: "blur(96px)",
          opacity: 0.65,
        }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute"
        style={{
          width: 480,
          height: 480,
          bottom: "-20%",
          left: "-5%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.soft} 0%, transparent 70%)`,
          filter: "blur(100px)",
          opacity: 0.5,
        }}
        animate={{ scale: [1, 1.14, 1] }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)`,
          backgroundSize: "36px 36px",
          opacity: 0.025,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 text-center">
        {/* Live badge */}
        <Reveal>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.14)",
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
              style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.65)" }}
            >
              Admin siap membantu kamu sekarang
            </span>
          </div>
        </Reveal>

        {/* Heading */}
        <Reveal delay={0.07}>
          <h2
            className="font-display font-extrabold mb-5 leading-[1.05]"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.75rem)",
              letterSpacing: "-0.03em",
              color: "white",
            }}
          >
            {cta.title}{" "}
            {cta.titleAccent && (
              <span style={{ color: theme.primary }}>{cta.titleAccent}</span>
            )}
          </h2>
        </Reveal>

        {/* Description */}
        <Reveal delay={0.13}>
          <p
            style={{
              fontSize: "clamp(0.9375rem, 1.5vw, 1.125rem)",
              color: "rgba(255,255,255,0.58)",
              maxWidth: "480px",
              margin: "0 auto 2.5rem",
              lineHeight: "1.78",
            }}
          >
            {cta.description}
          </p>
        </Reveal>

        {/* CTA Buttons */}
        <Reveal delay={0.19}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <motion.a
              href={cta.primaryHref}
              className="group font-display font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-2.5 text-white relative overflow-hidden"
              style={{
                fontSize: "1rem",
                background: theme.primary,
                boxShadow: `0 8px 36px ${theme.border}`,
                textDecoration: "none",
              }}
              whileHover={{
                scale: 1.04,
                boxShadow: `0 16px 52px ${theme.border}`,
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
              <span className="relative z-10">{cta.primaryLabel}</span>
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
            {cta.secondaryLabel && (
              <motion.a
                href={cta.secondaryHref ?? "/contact"}
                className="font-display font-semibold px-8 py-4 rounded-2xl flex items-center justify-center gap-2"
                style={{
                  fontSize: "1rem",
                  color: "white",
                  textDecoration: "none",
                  background: "rgba(255,255,255,0.08)",
                  border: "1.5px solid rgba(255,255,255,0.18)",
                  backdropFilter: "blur(8px)",
                }}
                whileHover={{
                  scale: 1.03,
                  background: "rgba(255,255,255,0.14)",
                }}
                whileTap={{ scale: 0.97 }}
              >
                {cta.secondaryLabel}
              </motion.a>
            )}
          </div>
        </Reveal>

        {/* Trust signals row */}
        <Reveal delay={0.26}>
          <div className="flex flex-wrap justify-center gap-x-7 gap-y-3">
            {[
              "Gratis konsultasi",
              "Tanpa komitmen",
              "Respon cepat",
              "Tim berpengalaman",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${theme.primary}28` }}
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
                    color: "rgba(255,255,255,0.48)",
                  }}
                >
                  {f}
                </span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Bottom social proof strip */}
        <Reveal delay={0.32}>
          <div
            className="mt-14 pt-8 flex flex-col sm:flex-row items-center justify-center gap-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
          >
            {/* Avatar stack */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["A", "R", "S", "M", "B"].map((letter, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold border-2"
                    style={{
                      background: theme.soft,
                      borderColor: "#0a2d87",
                      color: theme.primary,
                      fontSize: "0.6875rem",
                      zIndex: 5 - i,
                    }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      viewBox="0 0 10 10"
                      className="w-3 h-3"
                      fill="#FBBF24"
                    >
                      <path d="M5 1l1.2 2.4 2.7.4-1.95 1.9.46 2.7L5 7.1l-2.41 1.3.46-2.7L1.1 3.8l2.7-.4z" />
                    </svg>
                  ))}
                </div>
                <p
                  style={{
                    fontSize: "0.6875rem",
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  {SOCIAL_PROOF.totalStudents}+ siswa puas
                </p>
              </div>
            </div>

            <div
              className="hidden sm:block w-px h-8"
              style={{ background: "rgba(255,255,255,0.12)" }}
            />

            <p
              style={{
                fontSize: "0.875rem",
                color: "rgba(255,255,255,0.45)",
                maxWidth: "260px",
                lineHeight: 1.6,
              }}
            >
              Bergabung dengan ratusan siswa yang sudah merasakan manfaatnya
            </p>
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

  const navSections = useMemo(() => {
    const base: { id: string; label: string }[] = [
      { id: "hero", label: "Overview" },
      { id: "program-list", label: "Program" },
    ];
    if (hasBoth) base.push({ id: "masalah", label: "Solusi" });
    if (meta.steps?.length)
      base.push({ id: "cara-mulai", label: "Cara Mulai" });
    if (meta.experience?.length)
      base.push({ id: "pengalaman", label: "Pengalaman" });
    if (meta.comparison?.length) base.push({ id: "detail", label: "Detail" });
    if (meta.socialProof?.length)
      base.push({ id: "testimoni", label: "Testimoni" });
    base.push({ id: "faq", label: "FAQ" });
    base.push({ id: "daftar", label: "Daftar" });
    return base;
  }, [meta, hasBoth]);

  return (
    <main className="relative w-full overflow-x-hidden">
      <SideProgressNav sections={navSections} theme={theme} />
      <ScrollToTopButton theme={theme} />
      <CategoryHero category={meta} theme={theme} />

      {/* 2. Programs */}
      <ProgramList category={meta} theme={theme} />

      {/* 4. Pain → Solution */}
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
          id="masalah"
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
                            lineHeight: "1.6",
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

      {/* 5. Steps */}
      {meta.steps && meta.steps.length > 0 && (
        <StepsSection steps={meta.steps} theme={theme} />
      )}

      {/* 6. Experience */}
      {meta.experience && meta.experience.length > 0 && (
        <ExperienceSection experience={meta.experience} theme={theme} />
      )}

      {/* 7. Comparison */}
      {meta.comparison && meta.comparison.length > 0 && (
        <ComparisonSection
          comparison={meta.comparison}
          theme={theme}
          categoryLabel={meta.shortLabel ?? meta.label}
        />
      )}

      {/* 8. Testimonials */}
      {meta.socialProof && meta.socialProof.length > 0 && (
        <TestimonialsSection socialProof={meta.socialProof} theme={theme} />
      )}

      {/* 9. FAQ — NEW */}
      <FAQSection theme={theme} category={meta} />

      {/* 10. Final CTA */}
      <CTASection cta={meta.cta} theme={theme} />
    </main>
  );
}
