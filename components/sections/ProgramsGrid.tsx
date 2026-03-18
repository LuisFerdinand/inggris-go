"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

const ease = [0.22, 1, 0.36, 1] as const;

/* ── Program data ──────────────────────────────────────────────────── */
const programs = [
  {
    href: "/speaking-challenge",
    badge: "Populer",
    badgeBg: "#FF6B35",
    title: "Speaking Challenge",
    desc: "Latihan speaking selama 1 bulan untuk pemula. Tingkatkan kepercayaan diri dengan challenge mingguan yang menyenangkan!",
    cta: "Lihat Detail Program",
    ctaColor: "#E8521C",
    /* Card palette */
    cardBg: "linear-gradient(145deg, #FFF5F0 0%, #FFE8DC 100%)",
    cardBorder: "rgba(255,107,53,0.14)",
    decorColor: "rgba(255,107,53,0.12)",
    iconBg: "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
    iconShadow: "rgba(255,107,53,0.35)",
    highlights: ["30 hari program", "Challenge mingguan", "Feedback personal"],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
      </svg>
    ),
  },
  {
    href: "/go-private",
    badge: "Fleksibel",
    badgeBg: "#2DB8B0",
    title: "GoPrivate / Online Class",
    desc: "Belajar bahasa Inggris secara privat dan fleksibel. Jadwal sesuai kesibukanmu dengan tutor personal!",
    cta: "Lihat Detail Program",
    ctaColor: "#1A9990",
    cardBg: "linear-gradient(145deg, #F0FFFE 0%, #DCFAF8 100%)",
    cardBorder: "rgba(45,184,176,0.14)",
    decorColor: "rgba(45,184,176,0.12)",
    iconBg: "linear-gradient(135deg, #2DB8B0 0%, #1A9990 100%)",
    iconShadow: "rgba(45,184,176,0.35)",
    highlights: ["Jadwal fleksibel", "1-on-1 tutor", "Via Zoom / WA"],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/vip-camp",
    badge: "For Kids",
    badgeBg: "#0F2340",
    title: "VIP English Camp for Kids",
    desc: "Program camp belajar bahasa Inggris yang seru di Kampung Inggris Pare. Pengalaman belajar tak terlupakan untuk anak!",
    cta: "Lihat Detail Program",
    ctaColor: "#0F2340",
    cardBg: "linear-gradient(145deg, #F4F6FF 0%, #E8ECF8 100%)",
    cardBorder: "rgba(15,35,64,0.1)",
    decorColor: "rgba(15,35,64,0.07)",
    iconBg: "linear-gradient(135deg, #0F2340 0%, #1A365D 100%)",
    iconShadow: "rgba(15,35,64,0.25)",
    highlights: ["Di Kampung Inggris", "Akomodasi nyaman", "Pengawasan 24 jam"],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
      </svg>
    ),
  },
  {
    href: "/school-camp",
    badge: "Grup Sekolah",
    badgeBg: "#7C3AED",
    title: "English Camp for Schools",
    desc: "Program rombongan sekolah untuk pengalaman belajar bahasa Inggris langsung di Pare. Cocok untuk study tour!",
    cta: "Lihat Detail Program",
    ctaColor: "#6D28D9",
    cardBg: "linear-gradient(145deg, #FAF5FF 0%, #EDE9FE 100%)",
    cardBorder: "rgba(124,58,237,0.13)",
    decorColor: "rgba(124,58,237,0.1)",
    iconBg: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
    iconShadow: "rgba(124,58,237,0.32)",
    highlights: ["Paket rombongan", "Kurikulum sekolah", "Study tour Pare"],
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
];

/* ── Scroll reveal ─────────────────────────────────────────────────── */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-72px 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

/* ── Check icon for highlights ─────────────────────────────────────── */
function Check({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
    >
      <circle cx="8" cy="8" r="8" fill={color} fillOpacity={0.12} />
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

/* ── Arrow icon for CTA ────────────────────────────────────────────── */
function ArrowRight() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Single program card ───────────────────────────────────────────── */
function ProgramCard({
  program,
  index,
}: {
  program: (typeof programs)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease }}
    >
      <Link href={program.href} className="group block h-full">
        <div
          className="relative h-full flex flex-col rounded-3xl p-7 overflow-hidden
            transition-all duration-350"
          style={{
            background: program.cardBg,
            border: `1.5px solid ${program.cardBorder}`,
            boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
            /* hover handled by group CSS below */
          }}
        >
          {/* ── Decorative circle — top right, bleeds slightly out ── */}
          <div
            aria-hidden
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full
              transition-transform duration-500 group-hover:scale-125"
            style={{ background: program.decorColor }}
          />
          {/* Second smaller circle for depth */}
          <div
            aria-hidden
            className="absolute -top-2 -right-2 w-14 h-14 rounded-full
              transition-transform duration-500 delay-75 group-hover:scale-110"
            style={{ background: program.decorColor, opacity: 0.6 }}
          />

          {/* ── Icon square ── */}
          <div
            className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center mb-5
              transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
            style={{
              background: program.iconBg,
              boxShadow: `0 8px 24px ${program.iconShadow}`,
            }}
          >
            {program.icon}
          </div>

          {/* ── Badge ── */}
          <div className="relative z-10 mb-3">
            <span
              className="inline-block px-3 py-1 rounded-full font-display font-bold text-white"
              style={{
                fontSize: "0.6875rem",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                background: program.badgeBg,
              }}
            >
              {program.badge}
            </span>
          </div>

          {/* ── Title ── */}
          <h3
            className="relative z-10 font-display font-bold mb-2.5 leading-snug
              transition-colors duration-200"
            style={{ fontSize: "1.125rem", color: "#0F2340" }}
          >
            {program.title}
          </h3>

          {/* ── Description ── */}
          <p
            className="relative z-10 leading-relaxed mb-5"
            style={{ fontSize: "0.8125rem", color: "#64748B" }}
          >
            {program.desc}
          </p>

          {/* ── Highlights — 3 bullet points ── */}
          <ul className="relative z-10 space-y-1.5 mb-6 flex-1">
            {program.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2">
                <Check color={program.badgeBg} />
                <span style={{ fontSize: "0.75rem", color: "#475569" }}>
                  {h}
                </span>
              </li>
            ))}
          </ul>

          {/* ── CTA link ── */}
          <div
            className="relative z-10 flex items-center gap-1.5 font-display font-semibold
              transition-all duration-200 group-hover:gap-2.5 w-fit"
            style={{ fontSize: "0.875rem", color: program.ctaColor }}
          >
            {program.cta}
            <ArrowRight />
          </div>

          {/* Bottom border reveal on hover */}
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full origin-left
              scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
            style={{ background: program.iconBg }}
          />
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Section ───────────────────────────────────────────────────────── */
export default function ProgramsGrid() {
  return (
    <section
      id="programs"
      className="relative w-full bg-white overflow-hidden py-20 lg:py-28"
    >
      {/* Subtle bg tints */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 5% 50%, rgba(255,107,53,0.04) 0%, transparent 60%)," +
            "radial-gradient(ellipse 50% 50% at 95% 50%, rgba(45,184,176,0.04) 0%, transparent 55%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 xl:px-12">
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center mb-12 lg:mb-16">
          <Reveal>
            <span
              className="inline-block px-4 py-1.5 rounded-full font-display font-semibold mb-5"
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.04em",
                background: "rgba(45,184,176,0.1)",
                color: "#1A9990",
                border: "1px solid rgba(45,184,176,0.2)",
              }}
            >
              Program Kami
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h2
              className="font-display font-extrabold leading-[1.08] mb-4"
              style={{
                fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                letterSpacing: "-0.022em",
                color: "#0F2340",
              }}
            >
              Program Belajar{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Inggris Go
              </span>
            </h2>
          </Reveal>

          <Reveal delay={0.15}>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "#64748B",
                maxWidth: "400px",
              }}
              className="leading-relaxed"
            >
              Pilih program yang sesuai dengan kebutuhan belajarmu
            </p>
          </Reveal>
        </div>

        {/* ── 2×2 Cards grid ────────────────────────────────────── */}
        {/*
         * Responsive:
         *   mobile      → 1 col (full width, stacked)
         *   sm (640px)  → 2 col
         *   lg (1024px) → 2 col with larger gap
         */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
          {programs.map((p, i) => (
            <ProgramCard key={p.href} program={p} index={i} />
          ))}
        </div>

        {/* ── Bottom CTA nudge ──────────────────────────────────── */}
        <Reveal delay={0.1} className="mt-12 lg:mt-14">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <p style={{ fontSize: "0.875rem", color: "#94A3B8" }}>
              Belum tahu program yang cocok?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 font-display font-semibold
                transition-all duration-200 hover:gap-3"
              style={{ fontSize: "0.875rem", color: "#FF6B35" }}
            >
              Konsultasi gratis dengan admin
              <ArrowRight />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
