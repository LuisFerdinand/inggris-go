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
import { generateTheme, type Theme } from "@/lib/utils";
import { Icon } from "@/components/Icon";

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

/* ─────────────────────────────────────────────────────────────
 * SHARED PRIMITIVES
 * ───────────────────────────────────────────────────────────── */
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
        color: "var(--color-brand-blue-navy)",
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
            borderBottom: "1px solid var(--color-brand-border-soft)",
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
                      active === s.id
                        ? theme.primary
                        : "var(--color-brand-text-faint)",
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

/* ─────────────────────────────────────────────────────────────
 * BATCH BANNER — fixed, sits directly below the navbar
 * ───────────────────────────────────────────────────────────── */
function BatchBanner({
  batches,
  theme,
}: {
  batches: NonNullable<ProgramDetail["batches"]>;
  theme: Theme;
}) {
  const open = batches.filter((b) => b.isOpen);
  if (open.length === 0) return null;
  const next = open[0];
  const pct =
    next.capacity && next.enrolled
      ? Math.round((next.enrolled / next.capacity) * 100)
      : null;

  return (
    <motion.div
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="fixed left-0 right-0 z-50 w-full"
      style={{
        /* always sits directly below the navbar */
        top: "var(--navbar-height, 56px)",
        background: theme.primary,
        height: "var(--batch-banner-height, 48px)",
      }}
    >
      <div className="h-full max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 px-4 sm:px-8">
        <div className="flex items-center gap-3 min-w-0">
          <motion.span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: "#4ade80" }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
          <span
            className="font-display font-bold text-white truncate"
            style={{ fontSize: "0.8125rem" }}
          >
            {next.label}
          </span>
          {next.schedule && (
            <span
              className="hidden sm:block text-white/70 flex-shrink-0"
              style={{ fontSize: "0.75rem" }}
            >
              • {next.schedule}
            </span>
          )}
          {pct !== null && (
            <span
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 flex-shrink-0"
              style={{ fontSize: "0.625rem", color: "white" }}
            >
              <span>
                {next.enrolled}/{next.capacity} terisi
              </span>
              <div className="w-16 h-1 rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </span>
          )}
        </div>
        <motion.a
          href="#pricing"
          className="font-display font-bold px-4 py-1.5 rounded-lg bg-white flex-shrink-0"
          style={{
            fontSize: "0.75rem",
            color: theme.primary,
            textDecoration: "none",
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          {next.ctaLabel ?? "Daftar Sekarang"}
        </motion.a>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * SECTION: BATCHES
 * Shows all available / upcoming batches with status, progress,
 * and a direct registration CTA per batch.
 * ───────────────────────────────────────────────────────────── */
function BatchesSection({
  batches,
  theme,
  ctaHref,
}: {
  batches: NonNullable<ProgramDetail["batches"]>;
  theme: Theme;
  ctaHref: string;
}) {
  const statusConfig = {
    open: {
      label: "Buka",
      dot: "#4ade80",
      bg: "rgba(74,222,128,0.1)",
      border: "rgba(74,222,128,0.3)",
      text: "#16a34a",
    },
    coming_soon: {
      label: "Segera",
      dot: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.3)",
      text: "#d97706",
    },
    full: {
      label: "Penuh",
      dot: "#ef4444",
      bg: "rgba(239,68,68,0.08)",
      border: "rgba(239,68,68,0.2)",
      text: "#dc2626",
    },
    closed: {
      label: "Ditutup",
      dot: "#94a3b8",
      bg: "rgba(148,163,184,0.1)",
      border: "rgba(148,163,184,0.25)",
      text: "#64748b",
    },
  };

  return (
    <section
      id="batches"
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ background: "var(--color-brand-bg)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse 60% 50% at 50% 0%, ${theme.soft} 0%, transparent 65%)`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center text-center mb-14">
          <Reveal>
            <SectionPill theme={theme}>
              <Icon
                name="calendar"
                className="w-3.5 h-3.5"
                style={{ color: theme.primary }}
              />
              Jadwal Batch
            </SectionPill>
          </Reveal>
          <Reveal delay={0.07} className="mt-5 mb-4">
            <SectionHeading
              tagline="Pilih Batch yang"
              taglineAccent="Sesuai Jadwalmu"
              theme={theme}
            />
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
              Batch buka secara rutin. Pilih sesi yang paling cocok, lalu
              daftarkan dirimu sebelum kuota habis.
            </p>
          </Reveal>
        </div>

        <div
          className={`grid gap-5 ${
            batches.length === 1
              ? "max-w-lg mx-auto"
              : batches.length === 2
                ? "sm:grid-cols-2 max-w-3xl mx-auto"
                : "sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {batches.map((batch, i) => {
            const cfg = statusConfig[batch.status];
            const pct =
              batch.capacity && batch.enrolled
                ? Math.round((batch.enrolled / batch.capacity) * 100)
                : null;
            const spotsLeft =
              batch.capacity && batch.enrolled
                ? batch.capacity - batch.enrolled
                : null;

            return (
              <Reveal key={batch.id} delay={i * 0.09}>
                <motion.div
                  whileHover={
                    batch.isOpen ? { y: -6, scale: 1.015 } : undefined
                  }
                  transition={{ duration: 0.28, ease: EASE }}
                  className="relative flex flex-col rounded-3xl overflow-hidden h-full"
                  style={{
                    background: "var(--color-brand-surface)",
                    border: `2px solid ${batch.isOpen ? theme.border : "var(--color-brand-border-soft)"}`,
                    boxShadow: batch.isOpen
                      ? `0 8px 32px ${theme.border}`
                      : "var(--shadow-badge)",
                    opacity: batch.status === "closed" ? 0.65 : 1,
                  }}
                >
                  {/* Top accent */}
                  <div
                    style={{
                      height: "4px",
                      background: batch.isOpen
                        ? `linear-gradient(90deg, ${theme.primary}, ${theme.strong})`
                        : "var(--color-brand-border-soft)",
                    }}
                  />

                  <div className="p-6 flex flex-col flex-1">
                    {/* Status badge + label */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p
                          className="font-display font-extrabold mb-1"
                          style={{
                            fontSize: "1.0625rem",
                            color: "var(--color-brand-blue-navy)",
                          }}
                        >
                          {batch.label}
                        </p>
                        {batch.schedule && (
                          <p
                            style={{
                              fontSize: "0.8125rem",
                              color: "var(--color-brand-text-faint)",
                            }}
                          >
                            {batch.schedule}
                          </p>
                        )}
                      </div>

                      <span
                        className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-display font-bold"
                        style={{
                          fontSize: "0.625rem",
                          letterSpacing: "0.06em",
                          background: cfg.bg,
                          border: `1px solid ${cfg.border}`,
                          color: cfg.text,
                        }}
                      >
                        <motion.span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: cfg.dot }}
                          animate={
                            batch.isOpen
                              ? { opacity: [1, 0.3, 1] }
                              : { opacity: 1 }
                          }
                          transition={{ duration: 1.8, repeat: Infinity }}
                        />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Date range */}
                    {(batch.startDate || batch.endDate) && (
                      <div
                        className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl"
                        style={{
                          background: theme.soft,
                          border: `1px solid ${theme.border}`,
                        }}
                      >
                        <Icon
                          name="calendar"
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: theme.primary }}
                        />
                        <p
                          className="font-display font-semibold"
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--color-brand-blue-navy)",
                          }}
                        >
                          {batch.startDate && batch.endDate
                            ? `${formatDate(batch.startDate)} – ${formatDate(batch.endDate)}`
                            : batch.startDate
                              ? `Mulai ${formatDate(batch.startDate)}`
                              : ""}
                        </p>
                      </div>
                    )}

                    {/* Capacity bar */}
                    {pct !== null && batch.capacity && batch.enrolled && (
                      <div className="mb-5">
                        <div className="flex items-center justify-between mb-1.5">
                          <p
                            style={{
                              fontSize: "0.6875rem",
                              color: "var(--color-brand-text-faint)",
                            }}
                          >
                            Kursi terisi
                          </p>
                          <p
                            className="font-display font-bold"
                            style={{
                              fontSize: "0.6875rem",
                              color:
                                pct >= 80
                                  ? "#dc2626"
                                  : "var(--color-brand-text-faint)",
                            }}
                          >
                            {batch.enrolled}/{batch.capacity} ({pct}%)
                          </p>
                        </div>
                        <div
                          className="w-full h-2 rounded-full overflow-hidden"
                          style={{
                            background: "var(--color-brand-border-soft)",
                          }}
                        >
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, delay: 0.3, ease: EASE }}
                            style={{
                              background:
                                pct >= 80
                                  ? `linear-gradient(90deg, #f59e0b, #ef4444)`
                                  : `linear-gradient(90deg, ${theme.primary}, ${theme.strong})`,
                            }}
                          />
                        </div>
                        {spotsLeft !== null && spotsLeft <= 10 && (
                          <p
                            className="mt-1.5 font-display font-bold"
                            style={{ fontSize: "0.6875rem", color: "#dc2626" }}
                          >
                            ⚡ Hanya {spotsLeft} kursi tersisa!
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex-1" />

                    {/* CTA */}
                    {batch.isOpen ? (
                      <motion.a
                        href={ctaHref}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-display font-bold text-white relative overflow-hidden group"
                        style={{
                          fontSize: "0.875rem",
                          background: theme.primary,
                          boxShadow: `0 6px 20px ${theme.border}`,
                          textDecoration: "none",
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <span className="relative z-10">
                          {batch.ctaLabel ?? "Daftar Batch Ini"}
                        </span>
                        <svg
                          viewBox="0 0 14 14"
                          className="w-3.5 h-3.5 relative z-10"
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
                    ) : (
                      <div
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-display font-semibold"
                        style={{
                          fontSize: "0.875rem",
                          background: "var(--color-brand-border-soft)",
                          color: "var(--color-brand-text-faint)",
                        }}
                      >
                        {batch.status === "coming_soon"
                          ? "Segera Dibuka"
                          : batch.status === "full"
                            ? "Kursi Penuh"
                            : "Ditutup"}
                      </div>
                    )}
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>

        {/* Note below grid */}
        <Reveal delay={0.2}>
          <div className="mt-8 flex items-center justify-center gap-2.5">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: theme.soft }}
            >
              <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
                <path
                  d="M5 2v4M5 7.5v.5"
                  stroke={theme.primary}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-brand-text-faint)",
              }}
            >
              Batch baru dibuka secara berkala. Hubungi admin untuk info batch
              berikutnya.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Simple date formatter: "2026-04-22" → "22 Apr 2026" */
function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/* ─────────────────────────────────────────────────────────────
 * HERO SECTION
 * ───────────────────────────────────────────────────────────── */
function HeroSection({
  content,
  theme,
}: {
  content: HeroContent;
  theme: Theme;
}) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -50]);

  return (
    <section
      id="hero"
      className="relative overflow-hidden"
      style={{
        background: "var(--color-brand-surface)",
        minHeight: "min(88vh, 780px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: theme.gradient }}
      />
      <GridTexture theme={theme} />
      <FloatingOrb
        theme={theme}
        size={520}
        top="-20%"
        right="0%"
        opacity={0.5}
      />
      <FloatingOrb
        theme={theme}
        size={320}
        bottom="-10%"
        left="-5%"
        opacity={0.35}
        delay={4}
      />

      <motion.div
        style={{ y }}
        className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 lg:py-24 flex items-center"
      >
        <div className="w-full max-w-3xl">
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
              fontSize: "clamp(2.6rem, 6vw, 4.5rem)",
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
                fontSize: "clamp(1rem, 1.5vw, 1.125rem)",
                color: "var(--color-brand-text-muted)",
                lineHeight: "1.78",
                maxWidth: "580px",
                marginBottom: "1.5rem",
              }}
            >
              {content.description}
            </motion.p>
          )}

          {/* Subtitle */}
          {content.subtitle && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22, ease: EASE }}
              className="flex items-start gap-2.5 mb-7"
              style={{ maxWidth: "560px" }}
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
                  color: "var(--color-brand-text-muted)",
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
                    color: "var(--color-brand-blue-navy)",
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

          {/* Social proof */}
          {content.socialProof && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.44 }}
              className="flex items-center gap-3 pt-6"
              style={{ borderTop: "1px solid var(--color-brand-border-soft)" }}
            >
              <div className="flex -space-x-2">
                {["A", "R", "S", "M", "B"].map((l, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold border-2"
                    style={{
                      background: theme.soft,
                      borderColor: "var(--color-brand-surface)",
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
                    color: "var(--color-brand-text-faint)",
                  }}
                >
                  {content.socialProof.text}
                </p>
              </div>
            </motion.div>
          )}
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
          transition={{ duration: 1.8, repeat: Infinity }}
          className="w-5 h-8 rounded-full border-2 flex items-start justify-center pt-1.5"
          style={{ borderColor: theme.border }}
        >
          <div
            className="w-1 h-2 rounded-full"
            style={{ background: theme.primary }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
 * SECTION: WHY / BENEFITS
 * ───────────────────────────────────────────────────────────── */
function WhyBenefitsSection({
  content,
  theme,
  id,
  variant = "benefits",
}: {
  content: {
    title: string;
    subtitle?: string;
    icon?: string;
    tagline: string;
    taglineAccent?: string;
    items: { title: string; description?: string; icon: string }[];
  };
  theme: Theme;
  id: string;
  variant?: "why" | "benefits" | "fit";
}) {
  const isProblem = variant === "why";
  const colCount =
    content.items.length <= 2 ? 2 : content.items.length === 3 ? 3 : 4;

  return (
    <section
      id={id}
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{
        background: isProblem
          ? "var(--color-brand-surface)"
          : "var(--color-brand-bg)",
      }}
    >
      {isProblem && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(ellipse 55% 45% at 0% 60%, ${theme.soft} 0%, transparent 55%)`,
          }}
        />
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center text-center mb-14">
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
                  color: "var(--color-brand-text-muted)",
                  maxWidth: "460px",
                  lineHeight: "1.75",
                }}
              >
                {content.subtitle}
              </p>
            </Reveal>
          )}
        </div>

        <div
          className={`grid gap-5 ${
            colCount <= 2
              ? "sm:grid-cols-2 max-w-2xl mx-auto"
              : colCount === 3
                ? "sm:grid-cols-2 lg:grid-cols-3"
                : "sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {content.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.07} y={28}>
              <motion.div
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="relative flex flex-col h-full rounded-2xl p-5 overflow-hidden"
                style={{
                  background: "var(--color-brand-surface)",
                  border: `1.5px solid var(--color-brand-border-soft)`,
                  boxShadow: "var(--shadow-badge)",
                }}
              >
                <div
                  className="absolute top-0 right-0 w-20 h-20 rounded-bl-full"
                  style={{ background: theme.soft, opacity: 0.6 }}
                />
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 relative z-10"
                  style={{
                    background: isProblem
                      ? "rgba(255,107,53,0.08)"
                      : theme.soft,
                    border: `1.5px solid ${isProblem ? "rgba(255,107,53,0.18)" : theme.border}`,
                  }}
                >
                  <Icon
                    name={item.icon as any}
                    className="w-5 h-5"
                    style={{ color: isProblem ? "#ff6b35" : theme.primary }}
                  />
                </div>
                <div
                  className="w-8 h-0.5 rounded-full mb-3 relative z-10"
                  style={{
                    background: isProblem ? "#ff6b35" : theme.primary,
                    opacity: 0.45,
                  }}
                />
                <p
                  className="font-display font-extrabold mb-2 relative z-10"
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--color-brand-blue-navy)",
                  }}
                >
                  {item.title}
                </p>
                {item.description && (
                  <p
                    className="relative z-10"
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--color-brand-text-muted)",
                      lineHeight: "1.65",
                    }}
                  >
                    {item.description}
                  </p>
                )}
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
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
      style={{ background: "var(--color-brand-surface)" }}
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
                  color: "var(--color-brand-text-muted)",
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
 * SECTION: TIMELINE
 * ───────────────────────────────────────────────────────────── */
function TimelineSection({
  content,
  theme,
}: {
  content: {
    icon?: string;
    tagline: string;
    taglineAccent?: string;
    title: string;
    subtitle?: string;
    meta?: { icon: string; title: string; description?: string }[];
    weeks: {
      icon: string;
      week: string;
      title: string;
      points?: string[];
      days?: { range: string; title: string; highlight?: boolean }[];
    }[];
  };
  theme: Theme;
}) {
  return (
    <section
      id="timeline"
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ background: "var(--color-brand-bg)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse 50% 60% at 100% 50%, ${theme.soft} 0%, transparent 55%)`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center text-center mb-12">
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
                  color: "var(--color-brand-text-muted)",
                  maxWidth: "420px",
                  lineHeight: "1.72",
                }}
              >
                {content.subtitle}
              </p>
            </Reveal>
          )}
        </div>

        {content.meta && content.meta.length > 0 && (
          <Reveal delay={0.1}>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {content.meta.map((m) => (
                <div
                  key={m.title}
                  className="inline-flex items-center gap-2.5 px-4 py-3 rounded-2xl"
                  style={{
                    background: "var(--color-brand-surface)",
                    border: `1.5px solid ${theme.border}`,
                    boxShadow: "var(--shadow-badge)",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: theme.soft }}
                  >
                    <Icon
                      name={m.icon as any}
                      className="w-4 h-4"
                      style={{ color: theme.primary }}
                    />
                  </div>
                  <div>
                    <p
                      className="font-display font-bold"
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--color-brand-blue-navy)",
                      }}
                    >
                      {m.title}
                    </p>
                    {m.description && (
                      <p
                        style={{
                          fontSize: "0.625rem",
                          color: "var(--color-brand-text-faint)",
                        }}
                      >
                        {m.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {content.weeks.length > 0 && (
          <div
            className={`grid gap-6 ${content.weeks.length === 1 ? "max-w-2xl mx-auto" : "lg:grid-cols-2"}`}
          >
            {content.weeks.map((week, i) => (
              <Reveal key={week.week} delay={i * 0.1}>
                <div
                  className="rounded-3xl overflow-hidden"
                  style={{
                    background: "var(--color-brand-surface)",
                    border: `1.5px solid ${theme.border}`,
                    boxShadow: `0 8px 36px ${theme.border}`,
                  }}
                >
                  <div
                    className="px-6 py-4 flex items-center gap-3"
                    style={{
                      background: i === 0 ? theme.soft : theme.softStrong,
                      borderBottom: `1px solid ${theme.border}`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: theme.primary,
                        boxShadow: `0 4px 16px ${theme.border}`,
                      }}
                    >
                      <Icon
                        name={week.icon as any}
                        className="w-5 h-5"
                        style={{ color: "white" }}
                      />
                    </div>
                    <div>
                      <p
                        className="font-display font-bold uppercase"
                        style={{
                          fontSize: "0.625rem",
                          letterSpacing: "0.14em",
                          color: theme.primary,
                        }}
                      >
                        {week.week}
                      </p>
                      <p
                        className="font-display font-extrabold"
                        style={{
                          fontSize: "1rem",
                          color: "var(--color-brand-blue-navy)",
                        }}
                      >
                        {week.title}
                      </p>
                    </div>
                  </div>

                  {week.points && (
                    <div className="px-6 py-4 space-y-2.5">
                      {week.points.map((pt) => (
                        <div key={pt} className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              background: theme.soft,
                              border: `1px solid ${theme.border}`,
                            }}
                          >
                            <svg
                              viewBox="0 0 10 10"
                              className="w-2.5 h-2.5"
                              fill="none"
                            >
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
                              fontSize: "0.875rem",
                              color: "var(--color-brand-text-muted)",
                            }}
                          >
                            {pt}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {week.days && (
                    <div
                      className="divide-y"
                      style={{ borderColor: theme.border }}
                    >
                      {week.days.map((day) => (
                        <div
                          key={day.range}
                          className="flex items-center gap-4 px-6 py-3.5"
                          style={{
                            background: day.highlight ? theme.soft : undefined,
                          }}
                        >
                          <span
                            className="font-display font-bold flex-shrink-0"
                            style={{
                              fontSize: "0.75rem",
                              color: theme.primary,
                              minWidth: "72px",
                            }}
                          >
                            {day.range}
                          </span>
                          <p
                            className="font-display font-semibold"
                            style={{
                              fontSize: "0.875rem",
                              color: day.highlight
                                ? theme.primary
                                : "var(--color-brand-text-muted)",
                              fontWeight: day.highlight ? 700 : 500,
                            }}
                          >
                            {day.title}
                          </p>
                          {day.highlight && (
                            <span
                              className="ml-auto px-2 py-0.5 rounded-full font-display font-bold"
                              style={{
                                fontSize: "0.5625rem",
                                background: theme.primary,
                                color: "white",
                              }}
                            >
                              Final
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
 * SECTION: CLASSES
 * ───────────────────────────────────────────────────────────── */
function ClassesSection({
  content,
  theme,
}: {
  content: {
    title: string;
    subtitle?: string;
    tagline?: string;
    taglineAccent?: string;
    layout?: "grid" | "timeline" | "card";
    items: {
      title: string;
      description?: string;
      highlight?: string;
      icon?: string;
      meta?: { label: string; value: string }[];
      tag?: string;
    }[];
  };
  theme: Theme;
}) {
  return (
    <section
      id="kelas"
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ background: "var(--color-brand-surface)" }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center text-center mb-14">
          <Reveal>
            <SectionPill theme={theme}>✦ {content.title}</SectionPill>
          </Reveal>
          {content.tagline && (
            <Reveal delay={0.07} className="mt-5 mb-3">
              <SectionHeading
                tagline={content.tagline}
                taglineAccent={content.taglineAccent}
                theme={theme}
              />
            </Reveal>
          )}
          {content.subtitle && (
            <Reveal delay={0.13}>
              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--color-brand-text-muted)",
                  maxWidth: "440px",
                  lineHeight: "1.72",
                }}
              >
                {content.subtitle}
              </p>
            </Reveal>
          )}
        </div>

        <div
          className={`grid gap-5 ${
            content.items.length <= 2
              ? "sm:grid-cols-2 max-w-2xl mx-auto"
              : "sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {content.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.09}>
              <motion.div
                whileHover={{ y: -7, scale: 1.02 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="relative rounded-3xl overflow-hidden h-full"
                style={{
                  background: "var(--color-brand-surface)",
                  border: `2px solid ${item.tag ? theme.border : "var(--color-brand-border-soft)"}`,
                  boxShadow: item.tag
                    ? `0 16px 48px ${theme.border}`
                    : "var(--shadow-badge)",
                }}
              >
                {item.tag && (
                  <div
                    className="absolute top-4 right-4 px-2.5 py-1 rounded-full font-display font-bold z-10"
                    style={{
                      fontSize: "0.5625rem",
                      background: theme.primary,
                      color: "white",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {item.tag}
                  </div>
                )}
                <div
                  style={{
                    height: "4px",
                    background: item.tag
                      ? `linear-gradient(90deg, ${theme.primary}, ${theme.strong})`
                      : `linear-gradient(90deg, ${theme.border}, transparent)`,
                  }}
                />
                <div className="p-6">
                  {item.icon && (
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                      style={{
                        background: theme.soft,
                        border: `1.5px solid ${theme.border}`,
                      }}
                    >
                      <Icon
                        name={item.icon as any}
                        className="w-6 h-6"
                        style={{ color: theme.primary }}
                      />
                    </div>
                  )}
                  <p
                    className="font-display font-extrabold mb-2"
                    style={{
                      fontSize: "1.125rem",
                      color: "var(--color-brand-blue-navy)",
                    }}
                  >
                    {item.title}
                  </p>
                  {item.highlight && (
                    <span
                      className="inline-block px-3 py-1 rounded-full font-display font-bold mb-3"
                      style={{
                        fontSize: "0.6875rem",
                        background: theme.soft,
                        color: theme.primary,
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      {item.highlight}
                    </span>
                  )}
                  {item.description && (
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--color-brand-text-muted)",
                        lineHeight: "1.65",
                        marginBottom: "1rem",
                      }}
                    >
                      {item.description}
                    </p>
                  )}
                  {item.meta && item.meta.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {item.meta.map((m) => (
                        <div
                          key={m.label}
                          className="rounded-xl p-2.5"
                          style={{
                            background: theme.soft,
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          <p
                            style={{
                              fontSize: "0.5875rem",
                              color: "var(--color-brand-text-faint)",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            {m.label}
                          </p>
                          <p
                            className="font-display font-bold"
                            style={{
                              fontSize: "0.8125rem",
                              color: "var(--color-brand-blue-navy)",
                            }}
                          >
                            {m.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
 * SECTION: PRICING
 * ───────────────────────────────────────────────────────────── */
function PricingSection({
  content,
  theme,
}: {
  content: {
    globalNote?: string;
    title?: string;
    description?: string;
    groups: {
      title: string;
      subtitle?: string;
      icon?: string;
      features: string[];
      packages: {
        label: string;
        price: string;
        originalPrice?: string;
        highlight?: string;
        note?: string;
      }[];
    }[];
    bonus?: {
      title: string;
      description?: string;
      highlight?: string;
      icon: string;
    }[];
    urgency?: string;
  };
  theme: Theme;
}) {
  return (
    <section
      id="pricing"
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ background: "var(--color-brand-bg)" }}
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
        <div className="flex flex-col items-center text-center mb-14">
          <Reveal>
            <SectionPill theme={theme}>✦ Investasi</SectionPill>
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
                  color: "var(--color-brand-text-muted)",
                  maxWidth: "440px",
                  lineHeight: "1.72",
                }}
              >
                {content.description}
              </p>
            </Reveal>
          )}
        </div>

        <div
          className={`grid gap-8 mb-10 ${
            content.groups.length === 1 ? "max-w-2xl mx-auto" : "lg:grid-cols-2"
          }`}
        >
          {content.groups.map((group, gi) => (
            <Reveal key={group.title} delay={gi * 0.1}>
              <div
                className="rounded-3xl overflow-hidden h-full flex flex-col"
                style={{
                  background: "var(--color-brand-surface)",
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
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: theme.primary, flexShrink: 0 }}
                    >
                      <Icon
                        name={group.icon as any}
                        className="w-5 h-5"
                        style={{ color: "white" }}
                      />
                    </div>
                  )}
                  <div>
                    <p
                      className="font-display font-extrabold"
                      style={{
                        fontSize: "1.0625rem",
                        color: "var(--color-brand-blue-navy)",
                      }}
                    >
                      {group.title}
                    </p>
                    {group.subtitle && (
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-brand-text-faint)",
                        }}
                      >
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
                          <svg
                            viewBox="0 0 10 10"
                            className="w-2.5 h-2.5"
                            fill="none"
                          >
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
                            fontSize: "0.875rem",
                            color: "var(--color-brand-text-muted)",
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
                      <motion.div
                        key={pkg.label}
                        whileHover={{ scale: 1.02, x: 4 }}
                        transition={{ duration: 0.22, ease: EASE }}
                        className="rounded-2xl p-4 relative"
                        style={{
                          background: pkg.highlight
                            ? theme.primary
                            : theme.soft,
                          border: `1.5px solid ${pkg.highlight ? theme.primary : theme.border}`,
                        }}
                      >
                        {pkg.highlight && (
                          <span
                            className="absolute top-3 right-3 px-2.5 py-1 rounded-full font-display font-bold bg-white"
                            style={{
                              fontSize: "0.5625rem",
                              color: theme.primary,
                              letterSpacing: "0.06em",
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
                              color: pkg.highlight ? "white" : theme.primary,
                              letterSpacing: "-0.025em",
                            }}
                          >
                            {pkg.price}
                          </p>
                          {pkg.originalPrice && (
                            <p
                              className="line-through mb-1"
                              style={{
                                fontSize: "0.875rem",
                                color: pkg.highlight
                                  ? "rgba(255,255,255,0.55)"
                                  : "var(--color-brand-text-faint)",
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
                            color: pkg.highlight
                              ? "rgba(255,255,255,0.85)"
                              : "var(--color-brand-text-muted)",
                          }}
                        >
                          {pkg.label}
                        </p>
                        {pkg.note && (
                          <p
                            style={{
                              fontSize: "0.6875rem",
                              color: pkg.highlight
                                ? "rgba(255,255,255,0.65)"
                                : "var(--color-brand-text-faint)",
                              marginTop: "3px",
                            }}
                          >
                            {pkg.note}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {content.bonus && content.bonus.length > 0 && (
          <Reveal delay={0.15}>
            <div
              className="rounded-3xl p-6 mb-8"
              style={{
                background: "var(--color-brand-surface)",
                border: `1.5px solid ${theme.border}`,
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: theme.soft }}
                >
                  <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                    <path
                      d="M8 2l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2.2 6.2l4-.6z"
                      fill={theme.primary}
                    />
                  </svg>
                </div>
                <p
                  className="font-display font-extrabold"
                  style={{
                    fontSize: "1rem",
                    color: "var(--color-brand-blue-navy)",
                  }}
                >
                  Bonus yang Kamu Dapat
                </p>
              </div>
              <div
                className={`grid gap-4 ${content.bonus.length === 1 ? "" : "sm:grid-cols-2"}`}
              >
                {content.bonus.map((b) => (
                  <div
                    key={b.title}
                    className="flex items-start gap-3.5 p-4 rounded-2xl"
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
                        name={b.icon as any}
                        className="w-5 h-5"
                        style={{ color: theme.primary }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className="font-display font-bold"
                          style={{
                            fontSize: "0.9375rem",
                            color: "var(--color-brand-blue-navy)",
                          }}
                        >
                          {b.title}
                        </p>
                        {b.highlight && (
                          <span
                            className="px-2.5 py-0.5 rounded-full font-display font-bold"
                            style={{
                              fontSize: "0.5625rem",
                              background: theme.primary,
                              color: "white",
                            }}
                          >
                            {b.highlight}
                          </span>
                        )}
                      </div>
                      {b.description && (
                        <p
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--color-brand-text-muted)",
                            lineHeight: "1.55",
                            marginTop: "3px",
                          }}
                        >
                          {b.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {content.globalNote && (
            <Reveal>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: theme.soft }}
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
                  }}
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
                  className="w-2 h-2 rounded-full"
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
                  background: "var(--color-brand-surface)",
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
                    color: "var(--color-brand-text-muted)",
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
                          color: "var(--color-brand-blue-navy)",
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
                            color: "var(--color-brand-text-faint)",
                          }}
                        >
                          {item.role}
                        </p>
                      )}
                      {item.meta && (
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            color: "var(--color-brand-text-faint)",
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
                        color: "var(--color-brand-blue-navy)",
                      }}
                    >
                      {content.items[active].name}
                    </p>
                  )}
                  {content.items[active].role && (
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-brand-text-faint)",
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
                  color: "var(--color-brand-text-faint)",
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
      style={{ background: "var(--color-brand-bg)" }}
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
                    border: "none",
                    cursor: "pointer",
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
 * Uses a fixed deep-navy background (#060f2e = --color-brand-blue-abyss)
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
        style={{ background: "var(--color-brand-blue-abyss)" }}
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

    case "why":
      return (
        <WhyBenefitsSection
          content={section.content}
          theme={theme}
          id={`why-${section.id}`}
          variant="why"
        />
      );

    case "benefits":
      return (
        <WhyBenefitsSection
          content={section.content}
          theme={theme}
          id={section.id}
          variant={section.id === "fit" ? "fit" : "benefits"}
        />
      );

    case "steps":
      return <StepsSection content={section.content} theme={theme} />;

    case "timeline":
      return <TimelineSection content={section.content} theme={theme} />;

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

    case "gallery":
      if (!section.content.images?.length) return null;
      return (
        <section
          className="py-16 lg:py-20"
          style={{ background: "var(--color-brand-surface)" }}
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            {section.content.title && (
              <Reveal className="mb-8 text-center">
                <SectionPill theme={theme}>
                  ✦ {section.content.title}
                </SectionPill>
              </Reveal>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {section.content.images.map((src, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="aspect-video rounded-2xl overflow-hidden"
                    style={{
                      background: theme.soft,
                      border: `1.5px solid ${theme.border}`,
                    }}
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      );

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

        {/* Sticky secondary nav */}
        <StickyNav
          sections={navSections}
          theme={theme}
          ctaLabel={ctaLabel}
          ctaHref={ctaHref}
        />

        {/* Batch section (if program has batches) */}
        {details.hasBatch && details.batches && details.batches.length > 0 && (
          <>
            {/* Inject batches section between hero and the first non-hero section */}
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
