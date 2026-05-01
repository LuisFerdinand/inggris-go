"use client";

import { useRef, useState, useEffect, useCallback, useMemo, act } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { CATEGORIES, CategoryMeta, ProgramMeta } from "./[category]/data";
import { Icon } from "@/components/Icon";
import { generateTheme } from "@/lib/utils";
import { SOCIAL_PROOF } from "@/constants";
import { buildWhatsAppUrl } from "@/lib/config";
import Image from "next/image";

/* ─── Utils ───────────────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const;

function getStartingPrice(programs: ProgramMeta[]): string {
  const nums = programs
    .map((p) => p.price)
    .filter((p) => p.startsWith("Rp"))
    .map((p) => parseInt(p.replace(/[^0-9]/g, ""), 10))
    .filter((n) => !isNaN(n));
  if (nums.length === 0) return programs[0]?.price ?? "—";
  return `Rp ${Math.min(...nums).toLocaleString("id-ID")}`;
}

/* ─── Shared Components ───────────────────────────────────────── */
function Reveal({
  children,
  delay = 0,
  className = "",
  y = 30,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-56px 0px" });
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

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-display font-bold uppercase"
      style={{
        background: "var(--surface)",
        color: "var(--blue-navy)",
        border: "1.5px solid var(--border-soft)",
        boxShadow: "var(--shadow-badge)",
        letterSpacing: "0.1em",
      }}
    >
      {children}
    </span>
  );
}

function GoldText({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="bg-gold-gradient bg-clip-text"
      style={{
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {children}
    </span>
  );
}

function IconBox({
  name,
  accent,
  accentLight,
  accentBorder,
  size = "md",
}: {
  name?: string;
  accent: string;
  accentLight: string;
  accentBorder: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims =
    size === "sm" ? "w-8 h-8" : size === "lg" ? "w-14 h-14" : "w-10 h-10";
  const iconDims =
    size === "sm" ? "w-4 h-4" : size === "lg" ? "w-7 h-7" : "w-5 h-5";
  return (
    <div
      className={`${dims} rounded-xl flex items-center justify-center flex-shrink-0`}
      style={{ background: accentLight, border: `1.5px solid ${accentBorder}` }}
    >
      <Icon
        name={name as any}
        className={iconDims}
        style={{ color: accent } as any}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * SECTION 1: HERO
 * ══════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────────────────────
// HeroSection — /programs page
//
// Desktop RIGHT panel — 3 deliberate non-overlapping zones:
//   [ZONE A]  Social proof bubble, centred, with downward tail → image
//   [ZONE B]  Student image — fills middle, z:10 king of the column
//             Cards peek from left/right edges BEHIND image (z:1, clipped)
//   [ZONE C]  Journey pill (left) + Active badge (right), row at bottom
//
// Mobile:
//   Image + one badge only, rendered inline between CTAs and stats
//   NO cards, NO floating overlays — clean emotional anchor
// ─────────────────────────────────────────────────────────────────────────────

function HeroSection({
  onScrollToPrograms,
}: {
  onScrollToPrograms: () => void;
}) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const categories = useMemo(() => Object.values(CATEGORIES), []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({
      x: (e.clientX - rect.left - rect.width / 2) / rect.width,
      y: (e.clientY - rect.top - rect.height / 2) / rect.height,
    });
  }, []);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full overflow-hidden bg-background flex items-center"
      style={{ minHeight: "min(calc(100svh - var(--navbar-height)), 840px)" }}
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 bg-hero-mesh" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.016]"
        style={{
          backgroundImage: `linear-gradient(var(--blue) 1px, transparent 1px),
            linear-gradient(90deg, var(--blue) 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
        }}
      />

      {/* Ambient blobs */}
      <motion.div
        className="pointer-events-none absolute"
        style={{
          width: 700,
          height: 700,
          top: "-30%",
          right: "-5%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(26,82,200,0.08) 0%, transparent 65%)",
          filter: "blur(60px)",
        }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute"
        style={{
          width: 400,
          height: 400,
          bottom: "0%",
          left: "-4%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,107,53,0.05) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14 lg:py-0">
        <div className="grid lg:grid-cols-[1fr_500px] xl:grid-cols-[1fr_540px] gap-8 lg:gap-12 items-center">
          {/* ══ LEFT — Text ══ */}
          <div className="flex flex-col">
            <Reveal delay={0}>
              <Pill>✦ Temukan Jalur Belajarmu</Pill>
            </Reveal>

            <Reveal delay={0.07}>
              <h1
                className="font-display font-extrabold mt-5 mb-5 leading-[1.04]"
                style={{
                  fontSize: "clamp(2.05rem, 4.6vw, 3.6rem)",
                  letterSpacing: "-0.027em",
                  color: "var(--blue-navy)",
                }}
              >
                Masih bingung mulai belajar <GoldText>Bahasa Inggris</GoldText>{" "}
                dari mana?
              </h1>
            </Reveal>

            <Reveal delay={0.13}>
              <p
                style={{
                  fontSize: "clamp(0.9375rem, 1.35vw, 1.0625rem)",
                  color: "var(--text-muted)",
                  maxWidth: "480px",
                  lineHeight: "1.74",
                  marginBottom: "2rem",
                }}
              >
                Tenang — kamu tidak sendirian. Dalam 30 detik, temukan program
                yang paling cocok dengan kondisi dan tujuanmu sekarang.
              </p>
            </Reveal>

            <Reveal delay={0.19}>
              <div className="flex flex-wrap gap-3">
                <motion.button
                  onClick={onScrollToPrograms}
                  className="bg-navy-gradient text-white font-display font-bold px-7 py-3.5 rounded-xl flex items-center gap-2 cursor-pointer"
                  style={{
                    fontSize: "0.9375rem",
                    boxShadow: "var(--shadow-glow-navy-btn)",
                    border: "none",
                  }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "var(--shadow-glow-navy-btn-hover)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2, ease: EASE }}
                >
                  Temukan Program Kamu
                  <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="white"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>

                <motion.a
                  href={buildWhatsAppUrl({
                    title: "Konsultasi",
                    intent: "consultation",
                  })}
                  className="font-display font-semibold px-6 py-3.5 rounded-xl flex items-center gap-2"
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--blue-navy)",
                    background: "var(--surface)",
                    border: "1.5px solid var(--border)",
                    boxShadow: "var(--shadow-badge)",
                    textDecoration: "none",
                  }}
                  whileHover={{
                    scale: 1.02,
                    borderColor: "var(--blue)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                >
                  Tanya Admin
                </motion.a>
              </div>
            </Reveal>

            {/* Mobile visual — between CTA and stats, desktop hidden */}
            {/* <Reveal delay={0.22}>
              <div className="lg:hidden mt-8">
                <HeroMobileVisual />
              </div>
            </Reveal> */}

            {/* Stats */}
            <Reveal delay={0.26}>
              <div
                className="flex flex-wrap items-center gap-6 mt-8 pt-8"
                style={{
                  borderTop: "1px solid var(--border-soft)",
                }}
              >
                {[
                  { n: SOCIAL_PROOF.activeStudents, label: "Siswa Aktif" },
                  { n: "3", label: "Jalur Belajar" },
                  { n: "98%", label: "Puas Belajar" },
                ].map((item) => (
                  <div
                    key={String(item.n)}
                    className="flex items-baseline gap-2"
                  >
                    <span
                      className="font-display font-black"
                      style={{
                        fontSize: "1.5rem",
                        color: "var(--blue-navy)",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {item.n}
                    </span>
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--text-faint)",
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* ══ RIGHT — Desktop 3-zone panel (hidden on mobile) ══ */}
          <HeroDesktopPanel categories={categories} mouse={mouse} />
        </div>
      </div>

      {/* Scroll nudge */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 cursor-pointer"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        onClick={onScrollToPrograms}
        style={{ opacity: 0.35 }}
      >
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
        <svg viewBox="0 0 14 22" className="w-3 h-5" fill="none">
          <rect
            x="1"
            y="1"
            width="12"
            height="20"
            rx="6"
            stroke="var(--blue-navy)"
            strokeWidth="1.4"
          />
          <motion.circle
            cx="7"
            cy="6"
            r="2.2"
            fill="var(--blue)"
            animate={{ cy: [6, 13, 6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>
    </section>
  );
}

function HeroDesktopPanel({
  categories,
  mouse,
}: {
  categories: CategoryMeta[];
  mouse: { x: number; y: number };
}) {
  // Cards anchored to left/right edges — never in centre where image sits
  // offset is how far they peek out from the panel edge (negative = outside)
  const CARD_CFG = [
    {
      side: "left" as const,
      top: "40%",
      edgeOffset: "-15%",
      rotate: -7,
      delay: 0.2,
      px: -10,
      py: 7,
    },
    {
      side: "right" as const,
      top: "36%",
      edgeOffset: "-10%",
      rotate: 8,
      delay: 0.28,
      px: 10,
      py: -6,
    },
    {
      side: "left" as const,
      top: "65%",
      edgeOffset: "-20%",
      rotate: -5,
      delay: 0.36,
      px: -8,
      py: 8,
    },
  ];

  return (
    <div
      className="hidden lg:flex flex-col"
      style={{ height: "680px", position: "relative" }}
    >
      {/* Panel-wide background radial */}
      <div
        className="pointer-events-none absolute inset-0 "
        style={{
          background:
            "radial-gradient(ellipse 80% 65% at 50% 56%, rgba(26,82,200,0.065) 0%, transparent 70%)",
        }}
      />

      {/* ══ ZONE A — Social proof bubble (top 15%) ══ */}
      <div
        className=" z-20 flex justify-center items-end absolute top-30 left-30"
        style={{ height: "15%", paddingBottom: "12px" }}
      >
        <motion.div
          initial={{ opacity: 0, y: -14, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.55, duration: 0.55, ease: EASE }}
        >
          <SocialProofBubble />
        </motion.div>
      </div>

      {/* ══ ZONE B — Image + side cards (middle 70%) ══ */}
      <div
        className="relative flex-1 flex items-end justify-center overflow-visible"
        style={{ minHeight: 0 }}
      >
        {/* Side-peeking category cards — behind image */}
        {categories.slice(0, 3).map((cat, i) => {
          const cfg = CARD_CFG[i];
          const isLeft = cfg.side === "left";
          return (
            <motion.div
              key={cat.key}
              className="absolute"
              style={{
                top: cfg.top,
                ...(isLeft
                  ? { left: cfg.edgeOffset }
                  : { right: cfg.edgeOffset }),
                zIndex: 1,
              }}
              initial={{ opacity: 0, x: isLeft ? -24 : 24 }}
              animate={{
                opacity: 0.78,
                x: mouse.x * cfg.px,
                y: mouse.y * cfg.py,
                rotate: cfg.rotate,
              }}
              transition={{
                opacity: { duration: 0.6, delay: cfg.delay, ease: EASE },
                x: { duration: 0.55, ease: EASE },
                y: { duration: 0.55, ease: EASE },
              }}
            >
              <HeroFloatCard category={cat} />
            </motion.div>
          );
        })}

        {/* Radial glow centred behind student */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "72%",
            height: "82%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(26,82,200,0.13) 0%, transparent 68%)",
          }}
        />

        {/* Floor shadow ellipse */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "54%",
            height: "28px",
            borderRadius: "50%",
            background: "rgba(10,45,135,0.08)",
            filter: "blur(20px)",
          }}
        />

        {/* Student image — z-king, idle float */}
        <motion.div
          className="relative"
          style={{ zIndex: 10 }}
          // animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/images/home-hero.png"
            alt="Siswa belajar Bahasa Inggris dengan percaya diri — InggrisGo"
            width={340}
            height={400}
            className="object-contain"
            style={{
              maxHeight: "400px",
              width: "auto",
              filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.13))",
            }}
            priority
          />
        </motion.div>
      </div>

      {/* ══ ZONE C — Journey pill + badge row (bottom 12%) ══ */}
      <div
        className="relative z-20 flex items-center justify-between px-3"
        style={{ height: "12%", gap: "12px" }}
      >
        {/* Journey progression */}
        <motion.div
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(26,82,200,0.11)",
            boxShadow: "0 4px 20px rgba(10,45,135,0.08)",
          }}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9, duration: 0.5, ease: EASE }}
        >
          {["Pemula", "Menengah", "Mahir"].map((step, i) => (
            <div key={step} className="flex items-center gap-1.5">
              {i > 0 && (
                <svg
                  viewBox="0 0 10 10"
                  className="w-2.5 h-2.5 flex-shrink-0"
                  fill="none"
                >
                  <path
                    d="M2 5h6M5.5 2.5l2.5 2.5-2.5 2.5"
                    stroke="var(--text-faint)"
                    strokeWidth={1.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <span
                className="font-display font-semibold"
                style={{
                  fontSize: "0.625rem",
                  letterSpacing: "0.05em",
                  color: i === 0 ? "var(--blue)" : "var(--text-faint)",
                  fontWeight: i === 0 ? 700 : 500,
                }}
              >
                {step}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Active students badge */}
        <motion.div
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(26,82,200,0.11)",
            boxShadow: "0 4px 20px rgba(10,45,135,0.08)",
          }}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.95, duration: 0.5, ease: EASE }}
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
            {SOCIAL_PROOF.activeStudents}+ siswa aktif
          </span>
        </motion.div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HeroMobileVisual — mobile only, shown inline between CTAs and stats
// ─────────────────────────────────────────────────────────────────────────────
function HeroMobileVisual() {
  return (
    <div
      className="relative flex justify-center items-end"
      style={{ height: "260px" }}
    >
      {/* Glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: "76%",
          height: "76%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(26,82,200,0.10) 0%, transparent 70%)",
        }}
      />

      {/* Image */}
      <motion.div
        className="relative z-10"
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/images/home-hero.png"
          alt="Siswa belajar Bahasa Inggris — InggrisGo"
          width={200}
          height={260}
          className="object-contain"
          style={{
            maxHeight: "230px",
            width: "auto",
            filter: "drop-shadow(0 16px 36px rgba(0,0,0,0.12))",
          }}
          priority
        />
      </motion.div>

      {/* Single badge bottom-right */}
      <motion.div
        className="absolute bottom-3 right-3 z-20 flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(26,82,200,0.11)",
          boxShadow: "0 4px 16px rgba(10,45,135,0.08)",
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.4, ease: EASE }}
      >
        <motion.span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "#4ade80" }}
          animate={{ opacity: [1, 0.25, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        <span
          className="font-display font-bold"
          style={{
            fontSize: "0.625rem",
            color: "var(--blue-navy)",
          }}
        >
          {SOCIAL_PROOF.activeStudents}+ siswa aktif
        </span>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SocialProofBubble — lives in Zone A, tail points down toward image
// ─────────────────────────────────────────────────────────────────────────────
function SocialProofBubble() {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "14px 16px",
        borderRadius: "20px",
        maxWidth: "320px",
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1.5px solid rgba(26,82,200,0.11)",
        boxShadow:
          "0 8px 32px rgba(10,45,135,0.09), 0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* Downward tail */}
      <div
        style={{
          position: "absolute",
          bottom: -10,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "10px solid transparent",
          borderRight: "10px solid transparent",
          borderTop: "11px solid rgba(255,255,255,0.94)",
        }}
      />

      {/* Avatar initial */}
      <div
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(26,82,200,0.09)",
          color: "var(--blue)",
          fontSize: "0.75rem",
          fontWeight: 800,
          border: "1.5px solid rgba(26,82,200,0.18)",
          fontFamily: "var(--font-display)",
        }}
      >
        A
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "0.75rem",
            fontStyle: "italic",
            color: "var(--blue-navy)",
            lineHeight: 1.55,
            margin: "0 0 8px",
          }}
        >
          "Akhirnya berani ngomong Inggris dengan percaya diri!"
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.625rem",
                fontWeight: 700,
                color: "var(--blue-navy)",
                fontFamily: "var(--font-display)",
              }}
            >
              Andi R.
            </p>
            <p
              style={{
                fontSize: "0.5625rem",
                color: "var(--text-faint)",
              }}
            >
              Mahasiswa, Surabaya
            </p>
          </div>
          <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
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
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HeroFloatCard — compact card for side-peek positions
// ─────────────────────────────────────────────────────────────────────────────
function HeroFloatCard({ category }: { category: CategoryMeta }) {
  const price = getStartingPrice(category.programs);
  const theme = generateTheme(category.theme.primary);

  return (
    <div
      style={{
        width: "196px",
        background: "var(--surface)",
        border: `1.5px solid ${theme.border}`,
        boxShadow: `0 14px 40px rgba(10,45,135,0.09), 0 4px 12px rgba(10,45,135,0.05)`,
        padding: "0.875rem",
        borderRadius: "16px",
      }}
    >
      {/* Accent strip */}
      <div
        style={{
          height: "2px",
          background: theme.gradient,
          marginBottom: "0.625rem",
          borderRadius: "2px",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            background: theme.soft,
            border: `1px solid ${theme.border}`,
          }}
        >
          <Icon
            name={category.icon as any}
            className="w-4 h-4"
            style={{ color: theme.primary } as any}
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontSize: "0.8125rem",
              fontWeight: 700,
              color: theme.primary,
              fontFamily: "var(--font-display)",
            }}
          >
            {category.shortLabel}
          </p>
          <p
            style={{
              fontSize: "0.5625rem",
              color: "var(--text-faint)",
            }}
          >
            {category.programs.length} program tersedia
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "8px",
          borderTop: "1px solid var(--border-soft)",
        }}
      >
        <div style={{ display: "flex", gap: "3px" }}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: i < 4 ? theme.soft : "var(--border-soft)",
                opacity: i < 4 ? 1 : 0.4,
              }}
            />
          ))}
        </div>
        <span
          style={{
            fontSize: "0.875rem",
            fontWeight: 900,
            color: theme.primary,
            fontFamily: "var(--font-display)",
          }}
        >
          {price}
        </span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * SECTION 2: QUICK DECISION
 * ══════════════════════════════════════════════════════════════ */
function QuickDecisionSection({
  onSelect,
}: {
  onSelect: (key: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const categories = useMemo(() => Object.values(CATEGORIES), []);

  return (
    <section
      className="relative py-16 lg:py-24 overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #060f2e 0%, #0a2d87 60%, #0f3aa0 100%)",
      }}
    >
      {/* Radial overlays */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 15% 50%, rgba(26,82,200,0.4) 0%, transparent 55%), radial-gradient(circle at 85% 50%, rgba(58,143,245,0.22) 0%, transparent 55%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
      />
      <div>
        <div></div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <Reveal>
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#4ade80" }}
              />
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: "0.05em",
                }}
              >
                Pilih kondisi kamu
              </span>
            </div>
            <p
              className="font-display font-black mb-2 leading-tight"
              style={{
                fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)",
                color: "white",
                letterSpacing: "-0.022em",
              }}
            >
              Masih bingung? Jawab ini:
            </p>
            <p
              style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.45)" }}
            >
              Klik yang paling mencerminkan situasimu sekarang
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-3 gap-5">
          {categories.map((cat, i) => {
            const theme = generateTheme(cat.theme.primary);
            return (
              <Reveal key={cat.key} delay={i * 0.08}>
                <motion.button
                  onClick={() => onSelect(cat.key)}
                  onHoverStart={() => setHovered(cat.key)}
                  onHoverEnd={() => setHovered(null)}
                  whileHover={{ scale: 1.035, y: -6 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.26, ease: EASE }}
                  className="w-full text-left rounded-2xl relative overflow-hidden"
                  style={{
                    background:
                      hovered === cat.key
                        ? "rgba(255,255,255,0.13)"
                        : "rgba(255,255,255,0.065)",
                    border: `1.5px solid ${hovered === cat.key ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"}`,
                    backdropFilter: "blur(10px)",
                    cursor: "pointer",
                    transition:
                      "background 0.22s ease, border-color 0.22s ease",
                    padding: 0,
                  }}
                >
                  {/* Glow on hover */}
                  <AnimatePresence>
                    {hovered === cat.key && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `radial-gradient(ellipse 90% 80% at 50% 115%, ${theme.soft} 0%, transparent 70%)`,
                        }}
                      />
                    )}
                  </AnimatePresence>

                  <div className="relative z-10 p-5">
                    {/* Large icon */}
                    <div className="mb-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{
                          background: theme.soft,
                          border: `1.5px solid ${theme.border}`,
                        }}
                      >
                        <Icon
                          name={cat.icon as any}
                          className="w-7 h-7"
                          style={{ color: theme.primary } as any}
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between mb-3">
                      <p
                        className="font-display font-bold leading-snug"
                        style={{
                          fontSize: "1rem",
                          color: "white",
                          flex: 1,
                          paddingRight: "0.5rem",
                        }}
                      >
                        "{cat.quickDecisionLabel}"
                      </p>
                      <span
                        className="font-display font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{
                          background: theme.soft,
                          color: theme.primary,
                          border: `1px solid ${theme.border}`,
                          fontSize: "0.5875rem",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        {cat.shortLabel}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "rgba(255,255,255,0.5)",
                        lineHeight: "1.55",
                        marginBottom: "1.25rem",
                      }}
                    >
                      {cat.quickDecisionDesc}
                    </p>

                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200"
                      style={{
                        border: "1px solid rgba(255,255,255,0.14)",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: theme.primary,
                          fontWeight: 600,
                        }}
                      >
                        Lihat Program
                      </span>

                      <motion.svg
                        viewBox="0 0 16 16"
                        className="w-3.5 h-3.5"
                        fill="none"
                        animate={hovered === cat.key ? { x: 4 } : { x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <path
                          d="M3 8h10M9 4l4 4-4 4"
                          stroke={theme.primary}
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </motion.svg>
                    </div>
                  </div>
                </motion.button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
 * SECTION 3: CATEGORY CARDS (no emoji)
 * ══════════════════════════════════════════════════════════════ */
function CategoryCard({
  category,
  isSelected,
  onSelect,
  index,
}: {
  category: CategoryMeta;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const price = getStartingPrice(category.programs);
  const highlights = (category.benefits || []).slice(0, 3);
  const forWhoItems = (category as any).forWhoItems || [category.forWho];
  const theme = generateTheme(category.theme.primary);

  return (
    <Reveal delay={index * 0.1} y={40}>
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={onSelect}
        whileHover={{ scale: 1.022, y: -8 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="flex flex-col h-full rounded-3xl overflow-hidden cursor-pointer"
        style={{
          background: isSelected
            ? "linear-gradient(150deg, var(--surface) 0%, var(--surface-soft) 100%)"
            : "var(--surface)",
          border: `2px solid ${isSelected || hovered ? theme.border : "var(--border-soft)"}`,
          boxShadow: isSelected
            ? `var(--shadow-card-hover), 0 0 0 1px ${theme.border}`
            : hovered
              ? "var(--shadow-card-hover)"
              : "var(--shadow-badge)",
          transition:
            "border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease",
        }}
      >
        {/* Hero stripe — icon based, no emoji */}
        <div
          className="relative overflow-hidden"
          style={{
            height: "175px",
            background: theme.gradient,
            borderBottom: `1.5px solid ${theme.border}`,
          }}
        >
          {/* Dot pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(${theme.primary} 0.8px, transparent 0.8px)`,
              backgroundSize: "22px 22px",
              opacity: 0.055,
            }}
          />
          {/* Diagonal lines overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, ${theme.primary} 0px, ${theme.primary} 0.5px, transparent 0.5px, transparent 18px)`,
              opacity: 0.025,
            }}
          />

          {/* Large icon anchor — replaces emoji */}
          <motion.div
            className="absolute"
            style={{ bottom: "14px", right: "18px" }}
            animate={
              hovered
                ? { scale: 1.1, rotate: 8, y: -4 }
                : { scale: 1, rotate: 0, y: 0 }
            }
            transition={{ duration: 0.38, ease: EASE }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: theme.soft,
                border: `2px solid ${theme.border}`,
                boxShadow: `0 8px 32px ${theme.border}`,
              }}
            >
              <Icon
                name={category.icon as any}
                className="w-10 h-10"
                style={{ color: theme.primary } as any}
              />
            </div>
          </motion.div>

          {/* Category tag + tagline */}
          <div
            className="absolute top-5 left-5"
            style={{ maxWidth: "calc(100% - 110px)" }}
          >
            <span
              className="inline-flex px-2.5 py-1 rounded-full font-display font-bold uppercase mb-2"
              style={{
                background: theme.soft,
                color: theme.primary,
                border: `1px solid ${theme.border}`,
                letterSpacing: "0.07em",
                fontSize: "0.5875rem",
                display: "inline-block",
              }}
            >
              {category.shortLabel}
            </span>
            <p
              className="font-display font-extrabold leading-snug"
              style={{
                fontSize: "1rem",
                color: "var(--blue-navy)",
                letterSpacing: "-0.01em",
              }}
            >
              {category.tagline}{" "}
              {category.taglineAccent && (
                <span style={{ color: theme.primary }}>
                  {category.taglineAccent}
                </span>
              )}
            </p>
          </div>

          {/* Selected indicator */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: theme.primary }}
              >
                <svg viewBox="0 0 14 14" className="w-4 h-4" fill="none">
                  <path
                    d="M2.5 7l3.5 3.5 5.5-6"
                    stroke="white"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card body */}
        <div className="flex flex-col flex-1 p-5">
          {/* For who */}
          <div className="mb-4">
            <p
              className="text-xs font-display font-bold uppercase mb-2.5"
              style={{
                color: "var(--text-faint)",
                letterSpacing: "0.1em",
              }}
            >
              Cocok untuk kamu yang…
            </p>
            <ul className="space-y-2">
              {forWhoItems.slice(0, 3).map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: theme.soft }}
                  >
                    <svg
                      viewBox="0 0 10 10"
                      className="w-2.5 h-2.5"
                      fill="none"
                    >
                      <path
                        d="M2 5l2 2 4-4"
                        stroke={theme.primary}
                        strokeWidth={1.6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--text-muted)",
                      lineHeight: "1.55",
                    }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Benefit chips */}
          {highlights.length > 0 && (
            <div
              className="mb-4 pt-4"
              style={{ borderTop: "1px solid var(--border-soft)" }}
            >
              <div className="grid grid-cols-3 gap-2">
                {highlights.map((h, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-2.5 text-center"
                    style={{
                      background: theme.soft,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <p
                      className="font-display font-bold leading-tight mb-0.5"
                      style={{
                        fontSize: "0.6875rem",
                        color: "var(--blue-navy)",
                      }}
                    >
                      {h.title}
                    </p>
                    <p
                      style={{
                        fontSize: "0.5875rem",
                        color: "var(--text-faint)",
                        lineHeight: "1.4",
                      }}
                    >
                      {h.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1" />

          {/* Price + CTA */}
          <div
            className="flex items-center justify-between pt-4"
            style={{ borderTop: "1px solid var(--border-soft)" }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.625rem",
                  color: "var(--text-faint)",
                }}
              >
                Mulai dari
              </p>
              <p
                className="font-display font-black"
                style={{
                  fontSize: "1.125rem",
                  color: theme.primary,
                  letterSpacing: "-0.03em",
                }}
              >
                {price}
              </p>
            </div>
            <motion.a
              href={category.href}
              className="font-display font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-white"
              style={{
                fontSize: "0.875rem",
                background: theme.primary,
                boxShadow: `0 4px 16px ${theme.border}`,
                textDecoration: "none",
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: `0 8px 28px ${theme.border}`,
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              Lihat Program
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="white"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.a>
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
}

function CategorySection({
  sectionRef,
  highlightKey,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
  highlightKey: string | null;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const categories = useMemo(() => Object.values(CATEGORIES), []);

  useEffect(() => {
    if (highlightKey) setSelected(highlightKey);
  }, [highlightKey]);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative py-20 lg:py-28"
      style={{ background: "var(--bg-soft)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse 55% 40% at 0% 30%, rgba(255,107,53,0.035) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 100% 70%, rgba(45,184,176,0.035) 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col items-center text-center mb-14">
          <Reveal>
            <Pill>✦ Pilih Jalur Belajarmu</Pill>
          </Reveal>
          <Reveal delay={0.07}>
            <h2
              className="font-display font-extrabold mt-5 mb-4 leading-[1.07]"
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.75rem)",
                letterSpacing: "-0.024em",
                color: "var(--blue-navy)",
              }}
            >
              Tiga jalur, <GoldText>satu tujuan yang sama</GoldText>
            </h2>
          </Reveal>
          <Reveal delay={0.13}>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--text-muted)",
                maxWidth: "460px",
                lineHeight: "1.72",
              }}
            >
              Setiap jalur dirancang untuk kebutuhan yang berbeda. Pilih yang
              paling mencerminkan situasimu.
            </p>
          </Reveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {categories.map((cat, i) => (
            <CategoryCard
              key={cat.key}
              category={cat}
              isSelected={selected === cat.key}
              onSelect={() =>
                setSelected(selected === cat.key ? null : cat.key)
              }
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
 * SECTION 4: PROGRAM PREVIEW (with "All" tab)
 * ══════════════════════════════════════════════════════════════ */
function ProgramCard({
  program,
  accent,
  accentLight,
  accentBorder,
}: {
  program: ProgramMeta;
  accent: string;
  accentLight: string;
  accentBorder: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.a
      href={program.href}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.025, y: -5 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.26, ease: EASE }}
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface)",
        border: `1.5px solid ${hovered ? accentBorder : "var(--border-soft)"}`,
        boxShadow: hovered ? "var(--shadow-card-hover)" : "var(--shadow-badge)",
        transition: "border-color 0.22s ease, box-shadow 0.22s ease",
        textDecoration: "none",
      }}
    >
      <div
        style={{
          height: "3px",
          background: `linear-gradient(90deg, ${accent} 0%, transparent 100%)`,
        }}
      />
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: accentLight,
              border: `1px solid ${accentBorder}`,
            }}
          >
            <Icon
              name={program.icon as any}
              className="w-5 h-5"
              style={{ color: accent } as any}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="font-display font-bold leading-snug truncate"
              style={{
                fontSize: "0.9375rem",
                color: "var(--blue-navy)",
              }}
            >
              {program.title}
            </p>
            {program.badge && (
              <span
                className="inline-block mt-0.5 px-2 py-0.5 rounded-full font-display font-semibold"
                style={{
                  fontSize: "0.5875rem",
                  background: accentLight,
                  color: accent,
                  border: `1px solid ${accentBorder}`,
                  letterSpacing: "0.04em",
                }}
              >
                {program.badge}
              </span>
            )}
          </div>
        </div>

        {program.highlight && (
          <p
            className="mb-3"
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
              lineHeight: "1.55",
            }}
          >
            ✓ {program.highlight}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-4">
          {program.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full"
              style={{
                fontSize: "0.625rem",
                background: "var(--surface-soft)",
                color: "var(--text-muted)",
                border: "1px solid var(--border-soft)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex-1" />
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: "1px solid var(--border-soft)" }}
        >
          <div>
            <p
              style={{
                fontSize: "0.5875rem",
                color: "var(--text-faint)",
              }}
            >
              Harga
            </p>
            <p
              className="font-display font-black"
              style={{
                fontSize: "1rem",
                color: accent,
                letterSpacing: "-0.02em",
              }}
            >
              {program.price}
            </p>
          </div>
          <motion.div
            className="flex items-center gap-1 font-display font-semibold"
            style={{ fontSize: "0.8125rem", color: accent }}
            animate={hovered ? { x: 4 } : { x: 0 }}
            transition={{ duration: 0.2 }}
          >
            Detail
            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke={accent}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </div>
      </div>
    </motion.a>
  );
}

type ProgramTabEntry = {
  program: ProgramMeta;
  accent: string;
  accentLight: string;
  accentBorder: string;
  catKey: string;
};

function ProgramPreviewSection() {
  const categories = useMemo(() => Object.values(CATEGORIES), []);
  const [activeTab, setActiveTab] = useState<string>("all");

  const allPrograms: ProgramTabEntry[] = useMemo(
    () =>
      categories.flatMap((cat) =>
        cat.programs.map((p) => ({
          program: p,
          accent: generateTheme(cat.theme.primary).primary,
          accentLight: generateTheme(cat.theme.primary).soft,
          accentBorder: generateTheme(cat.theme.primary).border,
          catKey: cat.key,
        })),
      ),
    [categories],
  );

  const displayedPrograms: ProgramTabEntry[] = useMemo(() => {
    if (activeTab === "all") return allPrograms.slice(0, 8);
    const cat = CATEGORIES[activeTab];
    if (!cat) return [];
    return cat.programs.map((p) => ({
      program: p,
      accent: generateTheme(cat.theme.primary).primary,
      accentLight: generateTheme(cat.theme.primary).soft,
      accentBorder: generateTheme(cat.theme.primary).border,
      catKey: cat.key,
    }));
  }, [activeTab, allPrograms]);

  const activeCat = activeTab !== "all" ? CATEGORIES[activeTab] : null;

  return (
    <section
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ background: "var(--surface)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse 45% 55% at 100% 0%, rgba(26,82,200,0.04) 0%, transparent 55%), radial-gradient(ellipse 35% 45% at 0% 100%, rgba(45,184,176,0.03) 0%, transparent 55%)`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div>
            <Reveal>
              <Pill>✦ Program Nyata</Pill>
            </Reveal>
            <Reveal delay={0.07}>
              <h2
                className="font-display font-extrabold mt-4 leading-[1.07]"
                style={{
                  fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
                  letterSpacing: "-0.024em",
                  color: "var(--blue-navy)",
                }}
              >
                Bukan sekadar janji —<br />
                <GoldText>ini programnya</GoldText>
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p
                className="mt-3"
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--text-muted)",
                  maxWidth: "400px",
                }}
              >
                Program konkret yang siap membantu kamu. Klik untuk detail
                lengkap.
              </p>
            </Reveal>
          </div>

          {/* Tab switcher with "All" */}
          <Reveal delay={0.1}>
            <div
              className="flex p-1 gap-1 rounded-2xl"
              style={{
                background: "var(--surface-soft)",
                border: "1.5px solid var(--border-soft)",
              }}
            >
              {/* All tab */}
              <motion.button
                onClick={() => setActiveTab("all")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-display font-semibold"
                style={{
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  border: "none",
                  background:
                    activeTab === "all" ? "var(--surface)" : "transparent",
                  color:
                    activeTab === "all"
                      ? "var(--blue-navy)"
                      : "var(--text-muted)",
                  boxShadow:
                    activeTab === "all" ? "var(--shadow-badge)" : "none",
                  transition: "background 0.2s ease, color 0.2s ease",
                }}
                whileTap={{ scale: 0.97 }}
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                  <rect
                    x="1"
                    y="1"
                    width="6"
                    height="6"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="9"
                    y="1"
                    width="6"
                    height="6"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="1"
                    y="9"
                    width="6"
                    height="6"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="9"
                    y="9"
                    width="6"
                    height="6"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                <span className="hidden sm:inline">Semua</span>
              </motion.button>

              {categories.map((cat) => (
                <motion.button
                  key={cat.key}
                  onClick={() => setActiveTab(cat.key)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-display font-semibold"
                  style={{
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    border: "none",
                    background:
                      activeTab === cat.key ? "var(--surface)" : "transparent",
                    color:
                      activeTab === cat.key
                        ? generateTheme(cat.theme.primary).primary
                        : "var(--text-muted)",
                    boxShadow:
                      activeTab === cat.key ? "var(--shadow-badge)" : "none",
                    transition: "background 0.2s ease, color 0.2s ease",
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Icon name={cat.icon as any} className="w-4 h-4" />
                  <span className="hidden sm:inline">{cat.shortLabel}</span>
                </motion.button>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {displayedPrograms.map((entry) => (
              <ProgramCard
                key={`${entry.catKey}-${entry.program.slug}`}
                program={entry.program}
                accent={entry.accent}
                accentLight={entry.accentLight}
                accentBorder={entry.accentBorder}
              />
            ))}

            {/* See all tile */}
            <motion.a
              href={activeCat ? activeCat.href : "/programs"}
              className="flex flex-col items-center justify-center rounded-2xl p-6 text-center"
              style={{
                background: activeCat
                  ? generateTheme(activeCat.theme.primary).primary
                  : "var(--surface-soft)",
                border: `1.5px dashed ${activeCat ? generateTheme(activeCat.theme.primary).border : "var(--border)"}`,
                minHeight: "200px",
                textDecoration: "none",
              }}
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                style={{
                  background: activeCat
                    ? generateTheme(activeCat.theme.primary).strong
                    : "var(--blue-navy)",
                }}
              >
                <svg viewBox="0 0 16 16" className="w-5 h-5" fill="none">
                  <path
                    d="M8 3v10M3 8h10"
                    stroke="white"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p
                className="font-display font-bold mb-1"
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--blue-navy)",
                }}
              >
                Lihat Semua
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                }}
              >
                Program {activeCat ? activeCat.shortLabel : "Kami"}
              </p>
            </motion.a>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
 * SECTION 5: TESTIMONIALS (reworked — tabs + slider)
 * ══════════════════════════════════════════════════════════════ */
type TestimonialEntry = {
  quote: string;
  name?: string;
  role?: string;
  categoryKey: string;
  categoryLabel: string;
  accent: string;
  accentLight: string;
  accentBorder: string;
};

const ALL_TESTIMONIALS: TestimonialEntry[] = Object.values(CATEGORIES).flatMap(
  (cat) =>
    (cat.socialProof || []).map((t) => ({
      ...t,
      categoryKey: cat.key,
      categoryLabel: cat.shortLabel || cat.label,
      accent: generateTheme(cat.theme.primary).primary,
      accentLight: generateTheme(cat.theme.primary).soft,
      accentBorder: generateTheme(cat.theme.primary).border,
    })),
);

function TestimonialCard({ testimonial }: { testimonial: TestimonialEntry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.42, ease: EASE }}
      className="rounded-2xl p-6"
      style={{
        background: "var(--surface)",
        border: `1.5px solid ${testimonial.accentBorder}`,
        boxShadow: "var(--shadow-card-hover)",
      }}
    >
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <svg key={i} viewBox="0 0 12 12" className="w-4 h-4" fill="#FBBF24">
            <path d="M6 1l1.5 3 3.2.4-2.3 2.2.5 3.2L6 8.2l-2.9 1.6.5-3.2L1.3 4.4 4.5 4z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <p
        className="italic mb-5"
        style={{
          fontSize: "1rem",
          color: "var(--text-muted)",
          lineHeight: "1.72",
        }}
      >
        "{testimonial.quote}"
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar placeholder */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold"
            style={{
              background: testimonial.accentLight,
              border: `1.5px solid ${testimonial.accentBorder}`,
              color: testimonial.accent,
              fontSize: "1rem",
            }}
          >
            {testimonial.name ? testimonial.name[0] : "?"}
          </div>
          <div>
            {testimonial.name && (
              <p
                className="font-display font-bold"
                style={{
                  fontSize: "0.875rem",
                  color: "var(--blue-navy)",
                }}
              >
                {testimonial.name}
              </p>
            )}
            {testimonial.role && (
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-faint)",
                }}
              >
                {testimonial.role}
              </p>
            )}
          </div>
        </div>
        <span
          className="px-2.5 py-1 rounded-full font-display font-semibold"
          style={{
            fontSize: "0.625rem",
            background: testimonial.accentLight,
            color: testimonial.accent,
            border: `1px solid ${testimonial.accentBorder}`,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {testimonial.categoryLabel}
        </span>
      </div>
    </motion.div>
  );
}

function TestimonialsSection() {
  const categories = useMemo(() => Object.values(CATEGORIES), []);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered: TestimonialEntry[] = useMemo(() => {
    if (activeTab === "all") return ALL_TESTIMONIALS;
    return ALL_TESTIMONIALS.filter((t) => t.categoryKey === activeTab);
  }, [activeTab]);

  const pair = useMemo(() => {
    if (filtered.length === 0) return [];
    return [
      filtered[activeIndex % filtered.length],
      filtered[(activeIndex + 1) % filtered.length],
    ].filter(Boolean);
  }, [filtered, activeIndex]);

  useEffect(() => {
    setActiveIndex(0);
  }, [activeTab]);

  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex + 2 < filtered.length;

  const tabs = [
    { key: "all", label: "Semua", icon: null },
    ...categories.map((c) => ({
      key: c.key,
      label: c.shortLabel || c.label,
      icon: c.icon,
    })),
  ];

  return (
    <section
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ background: "var(--bg-soft)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse 65% 45% at 50% 0%, rgba(255,107,53,0.035) 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Reveal>
            <Pill>✦ Cerita Nyata</Pill>
          </Reveal>
          <Reveal delay={0.07}>
            <h2
              className="font-display font-extrabold mt-5 mb-3 leading-[1.07]"
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.75rem)",
                letterSpacing: "-0.024em",
                color: "var(--blue-navy)",
              }}
            >
              Mereka sudah <GoldText>membuktikannya</GoldText>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--text-muted)",
                maxWidth: "360px",
                margin: "0 auto",
              }}
            >
              Lebih dari {SOCIAL_PROOF.totalStudents} siswa dari berbagai jalur
              — ini cerita mereka.
            </p>
          </Reveal>
        </div>

        {/* Tab bar */}
        <Reveal delay={0.1}>
          <div className="flex justify-center mb-10">
            <div
              className="flex p-1 gap-1 rounded-2xl flex-wrap justify-center"
              style={{
                background: "var(--surface)",
                border: "1.5px solid var(--border-soft)",
                boxShadow: "var(--shadow-badge)",
              }}
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                const cat = tab.key !== "all" ? CATEGORIES[tab.key] : null;
                return (
                  <motion.button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-display font-semibold"
                    style={{
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      border: "none",
                      background: isActive
                        ? cat
                          ? generateTheme(cat.theme.primary).soft
                          : "var(--surface-soft)"
                        : "transparent",
                      color: isActive
                        ? cat
                          ? generateTheme(cat.theme.primary).primary
                          : "var(--blue-navy)"
                        : "var(--text-muted)",
                      boxShadow: isActive ? "var(--shadow-badge)" : "none",
                      transition: "all 0.2s ease",
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {tab.icon ? (
                      <Icon name={tab.icon as any} className="w-3.5 h-3.5" />
                    ) : (
                      <svg
                        viewBox="0 0 16 16"
                        className="w-3.5 h-3.5"
                        fill="none"
                      >
                        <rect
                          x="1"
                          y="1"
                          width="6"
                          height="6"
                          rx="1.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <rect
                          x="9"
                          y="1"
                          width="6"
                          height="6"
                          rx="1.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <rect
                          x="1"
                          y="9"
                          width="6"
                          height="6"
                          rx="1.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <rect
                          x="9"
                          y="9"
                          width="6"
                          height="6"
                          rx="1.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                    )}
                    {tab.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* Testimonial cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ color: "var(--text-faint)" }}>
              Belum ada testimoni untuk kategori ini.
            </p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeTab}-${activeIndex}`}
                className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {pair.map((t, i) => (
                  <TestimonialCard key={`${t.name}-${i}`} testimonial={t} />
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <motion.button
                onClick={() => setActiveIndex((i) => Math.max(0, i - 2))}
                disabled={!hasPrev}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: hasPrev
                    ? "var(--surface)"
                    : "var(--surface-soft)",
                  border: "1.5px solid var(--border-soft)",
                  cursor: hasPrev ? "pointer" : "not-allowed",
                  opacity: hasPrev ? 1 : 0.4,
                }}
                whileHover={hasPrev ? { scale: 1.08 } : {}}
                whileTap={hasPrev ? { scale: 0.95 } : {}}
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                  <path
                    d="M10 4L6 8l4 4"
                    stroke="var(--blue-navy)"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.ceil(filtered.length / 2) }).map(
                  (_, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setActiveIndex(i * 2)}
                      className="rounded-full"
                      style={{
                        width: activeIndex / 2 === i ? "24px" : "8px",
                        height: "8px",
                        background:
                          activeIndex / 2 === i
                            ? "var(--blue-navy)"
                            : "var(--border)",
                        cursor: "pointer",
                        border: "none",
                        transition: "all 0.25s ease",
                      }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ),
                )}
              </div>

              <motion.button
                onClick={() => setActiveIndex((i) => i + 2)}
                disabled={!hasNext}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: hasNext
                    ? "var(--surface)"
                    : "var(--surface-soft)",
                  border: "1.5px solid var(--border-soft)",
                  cursor: hasNext ? "pointer" : "not-allowed",
                  opacity: hasNext ? 1 : 0.4,
                }}
                whileHover={hasNext ? { scale: 1.08 } : {}}
                whileTap={hasNext ? { scale: 0.95 } : {}}
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                  <path
                    d="M6 4l4 4-4 4"
                    stroke="var(--blue-navy)"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
            </div>

            <p
              className="text-center mt-3"
              style={{
                fontSize: "0.75rem",
                color: "var(--text-faint)",
              }}
            >
              {Math.min(activeIndex + 2, filtered.length)} dari{" "}
              {filtered.length} testimoni
            </p>
          </>
        )}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
 * SECTION 6: FINAL CTA
 * ══════════════════════════════════════════════════════════════ */
function FinalCTASection({
  onScrollToPrograms,
}: {
  onScrollToPrograms: () => void;
}) {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(155deg, #060f2e 0%, #0a2d87 55%, #1346b0 100%)",
        }}
      />

      <motion.div
        className="pointer-events-none absolute"
        style={{
          width: 640,
          height: 640,
          top: "-28%",
          right: "-8%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(58,143,245,0.14) 0%, transparent 70%)",
          filter: "blur(70px)",
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
          left: "-4%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,107,53,0.09) 0%, transparent 70%)",
          filter: "blur(80px)",
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
          backgroundImage: `radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)`,
          backgroundSize: "38px 38px",
          opacity: 0.035,
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
            Masih ragu{" "}
            <span
              className="bg-gold-gradient bg-clip-text"
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              pilih program?
            </span>
          </h2>
        </Reveal>

        <Reveal delay={0.13}>
          <p
            style={{
              fontSize: "clamp(0.9375rem, 1.5vw, 1.125rem)",
              color: "rgba(255,255,255,0.6)",
              maxWidth: "480px",
              margin: "0 auto 2.5rem",
              lineHeight: "1.72",
            }}
          >
            Kami bantu rekomendasikan program yang paling cocok untuk tujuan dan
            kondisimu. Gratis, tanpa tekanan, tanpa basa-basi.
          </p>
        </Reveal>

        <Reveal delay={0.19}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <motion.a
              href={buildWhatsAppUrl({
                title: "Konsultasi",
                intent: "consultation",
              })}
              className="bg-gold-btn font-display font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2"
              style={{
                fontSize: "1rem",
                color: "var(--blue-abyss)",
                textDecoration: "none",
                boxShadow: "var(--shadow-glow-gold-btn)",
              }}
              whileHover={{
                scale: 1.04,
                boxShadow: "var(--shadow-glow-gold-btn-hover)",
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2, ease: EASE }}
            >
              Konsultasi Gratis
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.a>
            <motion.a
              onClick={onScrollToPrograms}
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
              Lihat Semua Program
            </motion.a>
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
                    stroke="rgba(255,193,7,0.55)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M5 8l2 2 4-4"
                    stroke="#FFC107"
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

export default function ProgramsPage() {
  const categorySectionRef = useRef<HTMLElement | null>(null);
  const [highlightKey, setHighlightKey] = useState<string | null>(null);

  const scrollToPrograms = useCallback(() => {
    categorySectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const handleQuickSelect = useCallback((key: string) => {
    setHighlightKey(key);
    setTimeout(() => {
      categorySectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }, []);

  return (
    <main className="relative w-full overflow-x-hidden">
      <HeroSection onScrollToPrograms={scrollToPrograms} />
      <QuickDecisionSection onSelect={handleQuickSelect} />
      <CategorySection
        sectionRef={categorySectionRef}
        highlightKey={highlightKey}
      />
      <ProgramPreviewSection />
      <TestimonialsSection />
      <FinalCTASection onScrollToPrograms={scrollToPrograms} />
    </main>
  );
}
