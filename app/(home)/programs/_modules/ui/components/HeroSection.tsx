// app/(home)/programs/_modules/ui/components/HeroSection.tsx
import { useCallback, useMemo, useRef, useState } from "react";
import {
  CATEGORIES,
  CategoryMeta,
  ProgramMeta,
} from "../../../[categorySlug]/data";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  EASE,
  getStartingPrice,
  GoldText,
  Pill,
  Reveal,
} from "../views/ProgramsView";
import { buildWhatsAppUrl } from "@/lib/config";
import { SOCIAL_PROOF } from "@/constants";
import Image from "next/image";
import { generateTheme } from "@/lib/utils";
import { Icon } from "@/components/Icon";

export function HeroSection({
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
