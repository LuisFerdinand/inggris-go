"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Mic,
  Zap,
  Users,
  Tent,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/config";
import { BRAND, GRADIENT_GOLD_TEXT } from "@/constants/brand";
import { generateTheme } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/* ─── Lead Magnet Programs ────────────────────────────────────── */
const leadMagnetPrograms = [
  {
    icon: Zap,
    iconBg: generateTheme("#ff6b35").primary,
    iconShadow: generateTheme("#ff6b35").soft,
    badge: "Populer",
    badgeColor: generateTheme("#ff6b35").strong,
    badgeBg: generateTheme("#ff6b35").soft,
    title: "Speaking Challenge",
    subtitle: "Challenge speaking 10 hari via WhatsApp",
    price: "Rp49.000",
    desc: "Latihan speaking setiap hari lewat WhatsApp Group. Terima video contoh dari tutor, kirim rekamanmu, dan dapatkan feedback langsung setiap hari selama 10 hari.",
    highlights: [
      "10 hari challenge",
      "Feedback harian dari tutor",
      "Via WhatsApp Group",
    ],
    cta: "Join Speaking Challenge",
    ctaHref: buildWhatsAppUrl({
      title: "Speaking Challenge",
      price: "Rp 49.000",
      duration: "7 hari",
      format: "WhatsApp Self-paced",
      highlight: "Mulai dari nol tanpa takut salah",
    }),
    cardAccent: "#ff6b35",
    cardBorder: generateTheme("#ff6b35").border,
    iconShadowColor: generateTheme("#ff6b35").soft,
  },
];

/* ─── Category (Program Lanjutan) Cards ──────────────────────── */
const categoryCards = [
  {
    href: "/programs/online",
    icon: Users,
    accent: "#0a2d87",
    accentSoft: "rgba(10,45,135,0.07)",
    accentBorder: "rgba(10,45,135,0.16)",
    accentMid: "rgba(10,45,135,0.12)",
    heroGradient: "linear-gradient(145deg, #f0f5ff 0%, #e4ecff 100%)",
    badgeText: "Online · Zoom",
    label: "Program Online",
    tagline: "Kelas Zoom terstruktur dengan mentor nyata",
    desc: "Belajar dari rumah dengan jadwal tetap, mentor berpengalaman, dan kelas kecil yang memastikan setiap siswa dapat perhatian penuh.",
    bullets: [
      { label: "Daily Conversation", sub: "10 sesi intensif Senin–Jumat" },
      { label: "English for Kids", sub: "Game-based, interaktif & seru" },
      { label: "Basic TOEFL", sub: "Bonus 2× simulasi TOEFL" },
      { label: "Private Class", sub: "Jadwal & materi 100% fleksibel" },
    ],
    stat1: { value: "10×", label: "Sesi / Program" },
    stat2: { value: "6–8", label: "Siswa / Kelas" },
    cta: "Lihat Program Online",
    number: "01",
  },
  {
    href: "/programs/offline",
    icon: Tent,
    accent: "#f7b500",
    accentSoft: "rgba(194,138,0,0.07)",
    accentBorder: "rgba(194,138,0,0.2)",
    accentMid: "rgba(194,138,0,0.12)",
    heroGradient: "linear-gradient(145deg, #fffbeb 0%, #fff3cc 100%)",
    badgeText: "Offline · Kampung Inggris Pare",
    label: "Program Offline",
    tagline: "Pengalaman imersif langsung di Pare",
    desc: "Rasakan belajar bahasa Inggris intensif di Kampung Inggris Pare — lingkungan full English-speaking yang mempercepat progress secara dramatis.",
    bullets: [
      { label: "VIP English Camp", sub: "Full immersion 24 jam di Pare" },
      {
        label: "Kelas Rombongan",
        sub: "Custom program untuk sekolah & komunitas",
      },
    ],
    stat1: { value: "24 Jam", label: "English Area" },
    stat2: { value: "100%", label: "Immersive" },
    cta: "Lihat Program Offline",
    number: "02",
  },
];

/* ─── Scroll reveal ───────────────────────────────────────────── */
function Reveal({
  children,
  delay = 0,
  className = "",
  y = 24,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-64px 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 flex-shrink-0">
      <circle cx="8" cy="8" r="8" fill={color} fillOpacity={0.1} />
      <path
        d="M5 8.5l2 2 4-4"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
 * PROGRAM LANJUTAN CARD — large, editorial, immersive
 * ══════════════════════════════════════════════════════════════ */
function ProgramLanjutanCard({
  card,
  index,
}: {
  card: (typeof categoryCards)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-48px 0px" });
  const [hovered, setHovered] = useState(false);
  const Icon = card.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.12, ease }}
    >
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.32, ease }}
        className="relative flex flex-col h-full rounded-3xl overflow-hidden"
        style={{
          background: "white",
          border: `1.5px solid ${hovered ? card.accentBorder : "rgba(15,35,64,0.07)"}`,
          boxShadow: hovered
            ? `0 24px 64px ${card.accentSoft}, 0 4px 16px rgba(0,0,0,0.04)`
            : "0 2px 16px rgba(0,0,0,0.04)",
          transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        {/* ── Hero panel ─────────────────────────────────────── */}
        <div
          className="relative overflow-hidden"
          style={{
            background: card.heroGradient,
            padding: "1.75rem 1.75rem 1.5rem",
            borderBottom: `1.5px solid ${card.accentBorder}`,
          }}
        >
          {/* Dot-grid texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(${card.accent} 0.8px, transparent 0.8px)`,
              backgroundSize: "20px 20px",
              opacity: 0.045,
            }}
          />

          {/* Large number watermark */}
          <span
            className="absolute font-display font-black select-none pointer-events-none"
            style={{
              fontSize: "7rem",
              lineHeight: 1,
              bottom: "-1.25rem",
              right: "1rem",
              color: card.accent,
              opacity: 0.07,
              letterSpacing: "-0.05em",
            }}
          >
            {card.number}
          </span>

          {/* Top row: icon + badge */}
          <div className="relative z-10 flex items-start justify-between mb-4">
            <motion.div
              animate={
                hovered ? { scale: 1.08, rotate: -6 } : { scale: 1, rotate: 0 }
              }
              transition={{ duration: 0.26, ease }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: card.accent,
                boxShadow: `0 8px 20px ${card.accentMid}`,
              }}
            >
              <Icon
                className="w-5.5 h-5.5 text-white"
                style={{ width: "1.25rem", height: "1.25rem" }}
              />
            </motion.div>

            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-display font-bold"
              style={{
                fontSize: "0.6875rem",
                letterSpacing: "0.04em",
                background: "white",
                color: card.accent,
                border: `1px solid ${card.accentBorder}`,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              {card.badgeText}
            </span>
          </div>

          {/* Label + tagline */}
          <div className="relative z-10">
            <h3
              className="font-display font-extrabold leading-tight mb-1.5"
              style={{
                fontSize: "clamp(1.25rem, 2vw, 1.5rem)",
                color: "#0F2340",
                letterSpacing: "-0.02em",
              }}
            >
              {card.label}
            </h3>
            <p
              className="font-display font-semibold"
              style={{
                fontSize: "0.875rem",
                color: card.accent,
                lineHeight: "1.45",
              }}
            >
              {card.tagline}
            </p>
          </div>

          {/* Stats row */}
          <div className="relative z-10 flex gap-4 mt-4">
            {[card.stat1, card.stat2].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{
                  background: "white",
                  border: `1px solid ${card.accentBorder}`,
                }}
              >
                <span
                  className="font-display font-black"
                  style={{
                    fontSize: "1rem",
                    color: card.accent,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    color: "#94A3B8",
                    lineHeight: "1.3",
                  }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 p-6">
          {/* Description */}
          <p
            className="leading-relaxed mb-5"
            style={{
              fontSize: "0.875rem",
              color: "#64748B",
              lineHeight: "1.7",
            }}
          >
            {card.desc}
          </p>

          {/* Program list */}
          <ul className="space-y-2.5 mb-6 flex-1">
            {card.bullets.map((b, i) => (
              <motion.li
                key={b.label}
                initial={false}
                animate={hovered ? { x: 3 } : { x: 0 }}
                transition={{ duration: 0.22, delay: i * 0.04, ease }}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{
                  background: hovered ? card.accentSoft : "rgba(15,35,64,0.02)",
                  border: `1px solid ${hovered ? card.accentBorder : "transparent"}`,
                  transition: "background 0.25s ease, border-color 0.25s ease",
                }}
              >
                <CheckIcon color={card.accent} />
                <div>
                  <p
                    className="font-display font-semibold leading-tight"
                    style={{ fontSize: "0.875rem", color: "#0F2340" }}
                  >
                    {b.label}
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#94A3B8",
                      marginTop: "1px",
                    }}
                  >
                    {b.sub}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            href={card.href}
            className="flex items-center justify-center gap-2 font-display font-bold rounded-2xl py-3.5 transition-all duration-200 group/cta"
            style={{
              fontSize: "0.9375rem",
              color: "white",
              background: card.accent,
              boxShadow: `0 6px 20px ${card.accentMid}`,
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                `0 10px 30px ${card.accentBorder}`;
              (e.currentTarget as HTMLElement).style.filter =
                "brightness(1.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                `0 6px 20px ${card.accentMid}`;
              (e.currentTarget as HTMLElement).style.filter = "";
            }}
          >
            {card.cta}
            <motion.span
              animate={hovered ? { x: 4 } : { x: 0 }}
              transition={{ duration: 0.2, ease }}
              className="inline-flex"
            >
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
        </div>

        {/* Bottom accent bar */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[3px]"
          style={{
            background: `linear-gradient(90deg, ${card.accent}, transparent)`,
          }}
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: hovered ? 1 : 0 }}
          transition={{ duration: 0.4, ease }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * LEAD MAGNET CARD — centered, single, supporting role
 * ══════════════════════════════════════════════════════════════ */
function LeadMagnetCard({ prog }: { prog: (typeof leadMagnetPrograms)[0] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-48px 0px" });
  const [hovered, setHovered] = useState(false);
  const Icon = prog.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease }}
      className="w-full max-w-xl mx-auto"
    >
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.28, ease }}
        className="relative flex flex-col sm:flex-row gap-0 rounded-3xl overflow-hidden"
        style={{
          background: "white",
          border: `1.5px solid ${hovered ? prog.cardAccent + "40" : "rgba(15,35,64,0.07)"}`,
          boxShadow: hovered
            ? `0 20px 56px ${prog.iconShadowColor}, 0 4px 12px rgba(0,0,0,0.04)`
            : "0 2px 16px rgba(0,0,0,0.04)",
          transition: "border-color 0.28s ease, box-shadow 0.28s ease",
        }}
      >
        {/* Left accent strip */}
        <div
          className="w-full sm:w-1.5 h-1.5 sm:h-auto flex-shrink-0"
          style={{
            background: `linear-gradient(${prog.cardAccent}, ${prog.cardAccent}80)`,
            borderRadius: "0",
          }}
        />

        {/* Content */}
        <div className="flex flex-col sm:flex-row flex-1 p-5 sm:p-6 gap-5">
          {/* Left col: icon + info */}
          <div className="flex-1">
            <div className="flex items-start gap-3.5 mb-4">
              <motion.div
                animate={
                  hovered ? { scale: 1.1, rotate: -5 } : { scale: 1, rotate: 0 }
                }
                transition={{ duration: 0.24, ease }}
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: prog.iconBg,
                  boxShadow: `0 6px 18px ${prog.iconShadow}`,
                }}
              >
                <Icon className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full font-display font-bold mb-1"
                  style={{
                    fontSize: "0.625rem",
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: prog.badgeColor,
                    background: prog.badgeBg,
                  }}
                >
                  {prog.badge}
                </span>
                <h4
                  className="font-display font-extrabold leading-tight"
                  style={{
                    fontSize: "1.125rem",
                    color: "#0F2340",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {prog.title}
                </h4>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "#94A3B8",
                    marginTop: "2px",
                  }}
                >
                  {prog.subtitle}
                </p>
              </div>
            </div>

            <p
              className="leading-relaxed mb-4"
              style={{
                fontSize: "0.8125rem",
                color: "#64748B",
                lineHeight: "1.7",
              }}
            >
              {prog.desc}
            </p>

            <ul className="space-y-1.5">
              {prog.highlights.map((h) => (
                <li key={h} className="flex items-center gap-2">
                  <CheckIcon color={prog.cardAccent} />
                  <span style={{ fontSize: "0.8125rem", color: "#475569" }}>
                    {h}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right col: price + CTA */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-end gap-3 sm:gap-4 sm:min-w-[140px]">
            <div className="text-left sm:text-right">
              <p
                style={{
                  fontSize: "0.6875rem",
                  color: "#94A3B8",
                  fontWeight: 600,
                }}
              >
                Mulai dari
              </p>
              <p
                className="font-display font-extrabold"
                style={{
                  fontSize: "1.375rem",
                  color: prog.cardAccent,
                  letterSpacing: "-0.03em",
                  lineHeight: "1.1",
                }}
              >
                {prog.price}
              </p>
            </div>
            <a
              href={prog.ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-display font-bold px-4 py-2.5 rounded-xl text-white whitespace-nowrap flex-shrink-0 transition-all duration-200"
              style={{
                fontSize: "0.875rem",
                background: `linear-gradient(135deg, ${prog.cardAccent} 0%, ${prog.cardAccent}cc 100%)`,
                boxShadow: `0 4px 14px ${prog.iconShadow}`,
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  `0 8px 22px ${prog.iconShadow}`;
                (e.currentTarget as HTMLElement).style.filter =
                  "brightness(1.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  `0 4px 14px ${prog.iconShadow}`;
                (e.currentTarget as HTMLElement).style.filter = "";
              }}
            >
              {prog.cta}
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * SECTION DIVIDER
 * ══════════════════════════════════════════════════════════════ */
function SectionDivider({ label }: { label: string }) {
  return (
    <Reveal>
      <div className="flex items-center gap-4 my-10 lg:my-12">
        <div
          className="flex-1 h-px"
          style={{ background: "rgba(15,35,64,0.07)" }}
        />
        <span
          className="font-display font-bold px-4 py-1.5 rounded-full whitespace-nowrap"
          style={{
            fontSize: "0.6875rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#94A3B8",
            background: "#F8FAFC",
            border: "1px solid rgba(15,35,64,0.07)",
          }}
        >
          {label}
        </span>
        <div
          className="flex-1 h-px"
          style={{ background: "rgba(15,35,64,0.07)" }}
        />
      </div>
    </Reveal>
  );
}

/* ══════════════════════════════════════════════════════════════
 * MAIN SECTION
 * ══════════════════════════════════════════════════════════════ */
export default function ProgramsGrid() {
  return (
    <section
      id="programs"
      className="relative w-full bg-white overflow-hidden py-20 lg:py-28"
    >
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 55% 45% at 5% 55%, rgba(10,45,135,0.04) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 95% 45%, rgba(194,138,0,0.04) 0%, transparent 55%)
          `,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 xl:px-12">
        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center mb-12 lg:mb-14">
          <Reveal>
            <div className="inline-flex items-center gap-2 mb-6">
              <span
                className="px-4 py-1.5 rounded-full text-xs font-display font-bold tracking-tight uppercase"
                style={{
                  background: BRAND.background,
                  color: BRAND.blueNavy,
                  border: `1px solid ${BRAND.border}`,
                }}
              >
                Program Kami
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.07}>
            <h2
              className="font-display font-extrabold leading-[1.08] mb-4"
              style={{
                fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                letterSpacing: "-0.022em",
                color: "#0F2340",
              }}
            >
              Program Belajar <span style={GRADIENT_GOLD_TEXT}>Inggris Go</span>
            </h2>
          </Reveal>
          <Reveal delay={0.13}>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "#64748B",
                maxWidth: "420px",
              }}
              className="leading-relaxed"
            >
              Mulai dari kelas online terstruktur, camp intensif di Pare, hingga
              challenge terjangkau untuk pemula.
            </p>
          </Reveal>
        </div>

        {/* ══════════════════════════════════════════════════
         *  SECTION 1 — Program Lanjutan (MAIN FOCUS)
         *  2-column grid, large editorial cards
         * ══════════════════════════════════════════════════ */}
        <Reveal delay={0.04} className="mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: BRAND.blue }}
            />
            <span
              className="font-display font-bold"
              style={{
                fontSize: "0.6875rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#94A3B8",
              }}
            >
              Program Unggulan
            </span>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
          {categoryCards.map((card, i) => (
            <ProgramLanjutanCard key={card.href} card={card} index={i} />
          ))}
        </div>

        {/* ══════════════════════════════════════════════════
         *  DIVIDER
         * ══════════════════════════════════════════════════ */}
        <SectionDivider label="Atau mulai dari yang terjangkau" />

        {/* ══════════════════════════════════════════════════
         *  SECTION 2 — Lead Magnet (supporting role)
         *  Single card, centered
         * ══════════════════════════════════════════════════ */}
        <Reveal delay={0.04} className="mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "#CBD5E1" }}
            />
            <span
              className="font-display font-bold"
              style={{
                fontSize: "0.6875rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#94A3B8",
              }}
            >
              Program Starter · Mulai dari Sini
            </span>
          </div>
        </Reveal>

        {leadMagnetPrograms.map((prog) => (
          <LeadMagnetCard key={prog.title} prog={prog} />
        ))}

        {/* ── Bottom CTA ────────────────────────────────────── */}
        <Reveal delay={0.08} className="mt-12 lg:mt-14">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <p style={{ fontSize: "0.875rem", color: "#94A3B8" }}>
              Belum tahu program yang cocok?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 font-display font-semibold transition-all duration-200 hover:gap-2.5"
              style={{
                fontSize: "0.875rem",
                color: BRAND.blue,
                textDecoration: "none",
              }}
            >
              Konsultasi gratis dengan admin
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
