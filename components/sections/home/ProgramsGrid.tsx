"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Mic,
  Zap,
  Users,
  Tent,
  School,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/config";

const ease = [0.22, 1, 0.36, 1] as const;

/* ════════════════════════════════════════════════════════════════════
 *  LEAD MAGNET PROGRAMS — slider cards
 *  Each has full detail: price, desc, highlights, WA CTA
 * ════════════════════════════════════════════════════════════════════ */
const leadMagnetPrograms = [
  {
    icon: Mic,
    iconBg: "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
    iconShadow: "rgba(255,107,53,0.35)",
    badge: "Terjangkau",
    badgeColor: "#FF6B35",
    badgeBg: "rgba(255,107,53,0.1)",
    title: "Basic Speaking",
    subtitle: "Kelas speaking online via Zoom untuk pemula",
    price: "Rp49.000",
    desc: "Program online via Zoom khusus pemula. Dalam 10 pertemuan selama 2 minggu, kamu akan langsung berlatih percakapan di breakout room kecil bersama tutor.",
    highlights: [
      "10 pertemuan · 60 mnt/sesi",
      "Breakout room kecil",
      "Interaktif & langsung speaking",
    ],
    cta: "Join Basic Speaking",
    ctaHref: buildWhatsAppUrl("Basic Speaking"),
    cardBg: "linear-gradient(145deg, #FFF5F0 0%, #FFE8DC 100%)",
    cardBorder: "rgba(255,107,53,0.15)",
    cardAccent: "#FF6B35",
  },
  {
    icon: Zap,
    iconBg: "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
    iconShadow: "rgba(255,107,53,0.32)",
    badge: "Populer",
    badgeColor: "#E8521C",
    badgeBg: "rgba(232,82,28,0.1)",
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
    ctaHref: buildWhatsAppUrl("Speaking Challenge"),
    cardBg: "linear-gradient(145deg, #FFF5F0 0%, #FFE8DC 100%)",
    cardBorder: "rgba(232,82,28,0.15)",
    cardAccent: "#E8521C",
  },
];

/* ════════════════════════════════════════════════════════════════════
 *  CATEGORY CARDS — redirect to full program pages
 * ════════════════════════════════════════════════════════════════════ */
const categoryCards = [
  {
    href: "/main-programs",
    icon: Users,
    iconGradient: "linear-gradient(135deg, #2DB8B0 0%, #1A9990 100%)",
    iconShadow: "rgba(45,184,176,0.35)",
    cardGradient: "linear-gradient(145deg, #F0FFFE 0%, #DCFAF8 100%)",
    cardBorder: "rgba(45,184,176,0.18)",
    cardBorderHover: "rgba(45,184,176,0.4)",
    accentColor: "#1A9990",
    shadowHover: "rgba(45,184,176,0.18)",
    label: "Program Utama",
    badgeEmoji: "👥",
    badgeText: "Max 6–8 siswa",
    tagline: "Speaking intensif untuk kelas kecil",
    desc: "Kelas reguler yang intensif dengan jumlah siswa terbatas, memastikan setiap peserta mendapatkan perhatian penuh dari tutor.",
    bullets: ["Daily Conversation", "English for Kids Regular"],
    cta: "Lihat Program Utama",
    ctaBg: "rgba(45,184,176,0.12)",
    ctaBgHover: "rgba(45,184,176,0.22)",
    ctaBorder: "rgba(45,184,176,0.28)",
    ctaColor: "#0E7B74",
  },
  {
    href: "/camp-programs",
    icon: Tent,
    iconGradient: "linear-gradient(135deg, #0F2340 0%, #1A365D 100%)",
    iconShadow: "rgba(15,35,64,0.28)",
    cardGradient: "linear-gradient(145deg, #F4F6FF 0%, #E8ECF8 100%)",
    cardBorder: "rgba(15,35,64,0.12)",
    cardBorderHover: "rgba(15,35,64,0.3)",
    accentColor: "#0F2340",
    shadowHover: "rgba(15,35,64,0.12)",
    label: "Camp Program",
    badgeEmoji: "📍",
    badgeText: "Di Kampung Inggris Pare",
    tagline: "Pengalaman belajar imersif di Pare",
    desc: "Belajar bahasa Inggris langsung di pusat bahasa terbesar Indonesia. Suasana belajar yang unik dan intensif untuk anak-anak.",
    bullets: ["VIP English Camp for Kids", "Aktivitas outdoor & speaking"],
    cta: "Lihat Camp Program",
    ctaBg: "rgba(15,35,64,0.07)",
    ctaBgHover: "rgba(15,35,64,0.14)",
    ctaBorder: "rgba(15,35,64,0.18)",
    ctaColor: "#0F2340",
  },
  {
    href: "/school-group-programs",
    icon: School,
    iconGradient: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
    iconShadow: "rgba(124,58,237,0.32)",
    cardGradient: "linear-gradient(145deg, #FAF5FF 0%, #EDE9FE 100%)",
    cardBorder: "rgba(124,58,237,0.16)",
    cardBorderHover: "rgba(124,58,237,0.38)",
    accentColor: "#6D28D9",
    shadowHover: "rgba(124,58,237,0.16)",
    label: "Grup Sekolah",
    badgeEmoji: "⚙️",
    badgeText: "Customizable",
    tagline: "Program khusus sekolah & pesantren",
    desc: "Program belajar bahasa Inggris yang dapat disesuaikan untuk sekolah, pesantren, atau instansi dengan durasi fleksibel.",
    bullets: ["1 hari s/d 1 bulan", "Tutor datang ke sekolah atau di Pare"],
    cta: "Request Proposal",
    ctaBg: "rgba(124,58,237,0.09)",
    ctaBgHover: "rgba(124,58,237,0.18)",
    ctaBorder: "rgba(124,58,237,0.22)",
    ctaColor: "#6D28D9",
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

function CheckIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 flex-shrink-0">
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

/* ════════════════════════════════════════════════════════════════════
 *  LEAD MAGNET SLIDER
 *  Desktop: shows cards side-by-side (max 2), prev/next nav
 *  Mobile: one card at a time, drag to swipe
 * ════════════════════════════════════════════════════════════════════ */
function LeadMagnetSlider() {
  const [current, setCurrent] = useState(0);
  const total = leadMagnetPrograms.length;
  const dragStart = useRef(0);

  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + total) % total),
    [total],
  );
  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);

  const onDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    dragStart.current = "touches" in e ? e.touches[0].clientX : e.clientX;
  };
  const onDragEnd = (e: React.TouchEvent | React.MouseEvent) => {
    const endX =
      "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
    const delta = dragStart.current - endX;
    if (Math.abs(delta) > 40) delta > 0 ? next() : prev();
  };

  return (
    <div className="relative">
      {/* ── Desktop: full grid — all cards shown ── */}
      <div className="hidden sm:grid sm:grid-cols-2 gap-5 lg:gap-6">
        {leadMagnetPrograms.map((prog, i) => (
          <LeadMagnetCard key={prog.title} prog={prog} index={i} />
        ))}
      </div>

      {/* ── Mobile: single card slider ── */}
      <div className="sm:hidden">
        <div
          className="overflow-hidden rounded-3xl"
          onTouchStart={onDragStart}
          onTouchEnd={onDragEnd}
          onMouseDown={onDragStart}
          onMouseUp={onDragEnd}
          style={{ cursor: "grab", userSelect: "none" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease }}
            >
              <LeadMagnetCard
                prog={leadMagnetPrograms[current]}
                index={current}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile dots + arrows */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={prev}
              aria-label="Previous"
              className="w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-150"
              style={{
                borderColor: "rgba(15,35,64,0.14)",
                background: "white",
              }}
            >
              <ChevronLeft
                className="w-3.5 h-3.5"
                style={{ color: "#0F2340" }}
              />
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: total }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? "20px" : "7px",
                    height: "7px",
                    background:
                      i === current ? "#FF6B35" : "rgba(15,35,64,0.15)",
                  }}
                />
              ))}
            </div>
            <button
              onClick={next}
              aria-label="Next"
              className="w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-150"
              style={{
                borderColor: "rgba(15,35,64,0.14)",
                background: "white",
              }}
            >
              <ChevronRight
                className="w-3.5 h-3.5"
                style={{ color: "#0F2340" }}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Single lead magnet card ─────────────────────────────────────── */
function LeadMagnetCard({
  prog,
  index,
}: {
  prog: (typeof leadMagnetPrograms)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  const Icon = prog.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease }}
      className="group h-full"
    >
      <div
        className="relative h-full flex flex-col rounded-3xl p-6 lg:p-7 overflow-hidden transition-all duration-300"
        style={{
          background: prog.cardBg,
          border: `1.5px solid ${prog.cardBorder}`,
          boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            `0 16px 48px ${prog.iconShadow}`;
          (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
          (e.currentTarget as HTMLElement).style.borderColor =
            prog.cardAccent + "40";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 2px 16px rgba(0,0,0,0.04)";
          (e.currentTarget as HTMLElement).style.transform = "";
          (e.currentTarget as HTMLElement).style.borderColor = prog.cardBorder;
        }}
      >
        {/* Decorative blobs */}
        <div
          aria-hidden
          className="absolute -top-10 -right-10 w-36 h-36 rounded-full transition-transform duration-500 group-hover:scale-125"
          style={{ background: `${prog.cardAccent}10` }}
        />
        <div
          aria-hidden
          className="absolute -top-3 -right-3 w-16 h-16 rounded-full transition-transform duration-500 group-hover:scale-110"
          style={{ background: `${prog.cardAccent}08` }}
        />

        {/* Top row: icon + price */}
        <div className="relative z-10 flex items-start justify-between mb-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3"
            style={{
              background: prog.iconBg,
              boxShadow: `0 8px 24px ${prog.iconShadow}`,
            }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <p style={{ fontSize: "0.6875rem", color: "#94A3B8" }}>
              Mulai dari
            </p>
            <p
              className="font-display font-extrabold"
              style={{
                fontSize: "1.25rem",
                color: "#FF6B35",
                lineHeight: "1.2",
              }}
            >
              {prog.price}
            </p>
          </div>
        </div>

        {/* Badge */}
        <div className="relative z-10 mb-3">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-display font-bold"
            style={{
              fontSize: "0.6875rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: prog.badgeColor,
              background: prog.badgeBg,
            }}
          >
            {prog.badge}
          </span>
        </div>

        {/* Title + subtitle */}
        <h3
          className="relative z-10 font-display font-extrabold mb-1 leading-snug"
          style={{ fontSize: "1.125rem", color: "#0F2340" }}
        >
          {prog.title}
        </h3>
        <p
          className="relative z-10 mb-3"
          style={{ fontSize: "0.8125rem", color: "#94A3B8" }}
        >
          {prog.subtitle}
        </p>

        {/* Divider */}
        <div
          className="relative z-10 mb-4"
          style={{ height: "1px", background: `${prog.cardAccent}18` }}
        />

        {/* Description */}
        <p
          className="relative z-10 leading-relaxed mb-5 flex-1"
          style={{ fontSize: "0.8125rem", color: "#64748B", lineHeight: "1.7" }}
        >
          {prog.desc}
        </p>

        {/* Highlights */}
        <ul className="relative z-10 space-y-2 mb-6">
          {prog.highlights.map((h) => (
            <li key={h} className="flex items-center gap-2">
              <CheckIcon color={prog.cardAccent} />
              <span style={{ fontSize: "0.8125rem", color: "#475569" }}>
                {h}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA — full-width orange button */}
        <a
          href={prog.ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 flex items-center justify-center gap-2 font-display font-bold rounded-2xl py-3.5 text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          style={{
            fontSize: "0.9375rem",
            background: "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
            boxShadow: `0 6px 20px ${prog.iconShadow}`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              `0 10px 28px ${prog.iconShadow}`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              `0 6px 20px ${prog.iconShadow}`;
          }}
        >
          {prog.cta}
          <ArrowRight className="w-4 h-4" />
        </a>

        {/* Bottom accent bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
          style={{
            background: `linear-gradient(90deg, ${prog.cardAccent}, transparent)`,
          }}
        />
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════
 *  CATEGORY REDIRECT CARD
 * ════════════════════════════════════════════════════════════════════ */
function CategoryCard({
  card,
  index,
}: {
  card: (typeof categoryCards)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  const [hovered, setHovered] = useState(false);
  const Icon = card.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease }}
    >
      <Link
        href={card.href}
        className="group block h-full rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          background: card.cardGradient,
          border: `1.5px solid ${hovered ? card.cardBorderHover : card.cardBorder}`,
          transform: hovered ? "translateY(-3px)" : "none",
          boxShadow: hovered ? `0 12px 36px ${card.shadowHover}` : "none",
          textDecoration: "none",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Card top */}
        <div className="flex items-start gap-3.5 px-5 pt-5 pb-3">
          <motion.div
            animate={
              hovered ? { scale: 1.1, rotate: -8 } : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.22, ease }}
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: card.iconGradient,
              boxShadow: `0 5px 16px ${card.iconShadow}`,
            }}
          >
            <Icon className="w-5 h-5 text-white" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap mb-1">
              <h3
                className="font-display font-bold leading-tight"
                style={{ fontSize: "1rem", color: "#0F2340" }}
              >
                {card.label}
              </h3>
              <span
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-display font-bold flex-shrink-0"
                style={{
                  fontSize: "0.5625rem",
                  letterSpacing: "0.03em",
                  background: `${card.accentColor}15`,
                  color: card.accentColor,
                  border: `1px solid ${card.cardBorder}`,
                }}
              >
                <span style={{ fontSize: "0.7rem" }}>{card.badgeEmoji}</span>
                {card.badgeText}
              </span>
            </div>
            <p
              className="font-display font-semibold"
              style={{ fontSize: "0.75rem", color: card.accentColor }}
            >
              {card.tagline}
            </p>
          </div>
        </div>

        {/* Thin divider */}
        <div
          className="mx-5"
          style={{ height: "1px", background: `${card.accentColor}12` }}
        />

        {/* Description */}
        <p
          className="px-5 pt-3 pb-3 leading-relaxed"
          style={{
            fontSize: "0.8125rem",
            color: "#64748B",
            lineHeight: "1.65",
          }}
        >
          {card.desc}
        </p>

        {/* Bullets */}
        <ul className="px-5 pb-4 space-y-1.5">
          {card.bullets.map((b) => (
            <li key={b} className="flex items-center gap-2">
              <motion.div
                animate={hovered ? { scale: 1.3 } : { scale: 1 }}
                transition={{ duration: 0.18 }}
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: card.accentColor, opacity: 0.55 }}
              />
              <span style={{ fontSize: "0.8125rem", color: "#475569" }}>
                {b}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA button */}
        <div className="px-4 pb-4">
          <div
            className="w-full flex items-center justify-center gap-2 font-display font-semibold rounded-xl py-2.5 transition-all duration-150"
            style={{
              fontSize: "0.875rem",
              background: hovered ? card.ctaBgHover : card.ctaBg,
              color: card.ctaColor,
              border: `1px solid ${card.ctaBorder}`,
            }}
          >
            {card.cta}
            <motion.span
              animate={hovered ? { x: 4 } : { x: 0 }}
              transition={{ duration: 0.18, ease }}
              className="inline-flex"
            >
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════
 *  SECTION DIVIDER — "Atau pelajari program lainnya"
 * ════════════════════════════════════════════════════════════════════ */
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 my-10 lg:my-12">
      <div
        className="flex-1 h-px"
        style={{ background: "rgba(15,35,64,0.07)" }}
      />
      <span
        className="font-display font-bold px-4 py-1.5 rounded-full"
        style={{
          fontSize: "0.6875rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#94A3B8",
          background: "#F8FAFC",
          border: "1px solid rgba(15,35,64,0.07)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-px"
        style={{ background: "rgba(15,35,64,0.07)" }}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
 *  MAIN SECTION
 * ════════════════════════════════════════════════════════════════════ */
export default function ProgramsGrid() {
  return (
    <section
      id="programs"
      className="relative w-full bg-white overflow-hidden py-20 lg:py-28"
    >
      {/* Subtle ambient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 5% 50%, rgba(255,107,53,0.04) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 95% 50%, rgba(45,184,176,0.04) 0%, transparent 55%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 xl:px-12">
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center mb-12 lg:mb-14">
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
                maxWidth: "420px",
              }}
              className="leading-relaxed"
            >
              Mulai dari program terjangkau, lanjutkan ke kelas intensif, atau
              ikuti camp langsung di Pare.
            </p>
          </Reveal>
        </div>

        {/* ════════════════════════════════════════════════════════
         *  SECTION 1 — Lead Magnet Programs
         *  Label + 2-card grid (desktop) / slider (mobile)
         * ════════════════════════════════════════════════════════ */}
        <Reveal delay={0.05} className="mb-2">
          <div className="flex items-center gap-2.5 mb-6">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "#FF6B35" }}
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
              Mulai dari Sini · Program Terjangkau
            </span>
          </div>
        </Reveal>

        <LeadMagnetSlider />

        {/* ════════════════════════════════════════════════════════
         *  DIVIDER
         * ════════════════════════════════════════════════════════ */}
        <Reveal>
          <SectionDivider label="Atau pelajari program lanjutan" />
        </Reveal>

        {/* ════════════════════════════════════════════════════════
         *  SECTION 2 — Category Cards
         *  3-column grid → 2-col on tablet → 1-col on mobile
         * ════════════════════════════════════════════════════════ */}
        <Reveal delay={0.05} className="mb-6">
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
              Jelajahi Program Lanjutan
            </span>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {categoryCards.map((card, i) => (
            <CategoryCard key={card.href} card={card} index={i} />
          ))}
        </div>

        {/* ── Bottom CTA ────────────────────────────────────────── */}
        <Reveal delay={0.1} className="mt-12 lg:mt-14">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <p style={{ fontSize: "0.875rem", color: "#94A3B8" }}>
              Belum tahu program yang cocok?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 font-display font-semibold transition-all duration-200 hover:gap-3"
              style={{ fontSize: "0.875rem", color: "#FF6B35" }}
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
