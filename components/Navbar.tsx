"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { buildWhatsAppUrl, navLinks, siteConfig } from "@/lib/config";
import WAButton from "./ui/WAButton";
import Image from "next/image";
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Mic,
  Laptop,
  Tent,
  School,
  Home,
  Phone,
  BookOpen,
  Info,
  LayoutGrid,
  Zap,
  Users,
  ArrowRight,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const programGroups = [
  {
    label: "Program Online",
    items: [
      {
        href: "/speaking-challenge",
        icon: Mic,
        iconBg: "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
        iconShadow: "rgba(255,107,53,0.3)",
        title: "Speaking Challenge",
        desc: "Program 30 hari untuk pemula",
        badge: "Populer",
        badgeColor: "#FF6B35",
      },
      {
        href: "/go-private",
        icon: Laptop,
        iconBg: "linear-gradient(135deg, #2DB8B0 0%, #1A9990 100%)",
        iconShadow: "rgba(45,184,176,0.3)",
        title: "GoPrivate / Online Class",
        desc: "Kelas privat 1-on-1 fleksibel",
        badge: "Fleksibel",
        badgeColor: "#2DB8B0",
      },
    ],
  },
  {
    label: "Program Camp",
    items: [
      {
        href: "/vip-camp",
        icon: Tent,
        iconBg: "linear-gradient(135deg, #0F2340 0%, #1A365D 100%)",
        iconShadow: "rgba(15,35,64,0.25)",
        title: "VIP English Camp for Kids",
        desc: "Camp seru di Kampung Inggris Pare",
        badge: "For Kids",
        badgeColor: "#0F2340",
      },
      {
        href: "/school-camp",
        icon: School,
        iconBg: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
        iconShadow: "rgba(124,58,237,0.3)",
        title: "English Camp for Schools",
        desc: "Study tour edukatif untuk sekolah",
        badge: "Grup Sekolah",
        badgeColor: "#7C3AED",
      },
    ],
  },
];

const leadMagnetPrograms = [
  {
    href: "/speaking-challenge",
    icon: Mic,
    iconBg: "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
    iconShadow: "rgba(255,107,53,0.3)",
    badge: "Terjangkau",
    badgeColor: "#FF6B35",
    title: "Basic Speaking",
    price: "Rp49.000",
    highlights: ["10 pertemuan", "60 mnt/sesi", "Breakout room"],
    cta: "Join Basic Speaking",
    ctaHref: buildWhatsAppUrl("Basic Speaking"),
    ctaExternal: true,
  },
  {
    href: "/speaking-challenge",
    icon: Zap,
    iconBg: "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
    iconShadow: "rgba(255,107,53,0.28)",
    badge: "Populer",
    badgeColor: "#E8521C",
    title: "Speaking Challenge",
    price: "Rp49.000",
    highlights: ["10 hari", "Via WhatsApp", "Feedback harian"],
    cta: "Join Speaking Challenge",
    ctaHref: buildWhatsAppUrl("Speaking Challenge"),
    ctaExternal: true,
  },
];

export const categoryCards = [
  {
    href: "/main-programs",
    icon: Users,
    /* Card gradient — warm teal tint, direction top-left to bottom-right */
    cardGradient:
      "linear-gradient(145deg, rgba(45,184,176,0.07) 0%, rgba(45,184,176,0.13) 100%)",
    cardBorderDefault: "rgba(45,184,176,0.2)",
    cardBorderHover: "rgba(45,184,176,0.38)",
    iconGradient: "linear-gradient(135deg, #2DB8B0 0%, #1A9990 100%)",
    iconShadow: "rgba(45,184,176,0.35)",
    accentColor: "#1A9990",
    /* Label + badge */
    label: "Program Utama",
    badgeEmoji: "👥",
    badgeText: "Max 6–8 siswa",
    /* Tagline — one punchy line */
    tagline: "Speaking intensif dengan kelas kecil",
    /* 2 bullet highlights */
    bullets: ["Daily Conversation", "English for Kids Regular"],
    /* CTA button */
    ctaLabel: "Lihat Program Utama",
    ctaBg: "rgba(45,184,176,0.13)",
    ctaBgHover: "rgba(45,184,176,0.22)",
    ctaColor: "#0E7B74",
    ctaBorder: "rgba(45,184,176,0.3)",
  },
  {
    href: "/camp-programs",
    icon: Tent,
    cardGradient:
      "linear-gradient(145deg, rgba(15,35,64,0.04) 0%, rgba(15,35,64,0.09) 100%)",
    cardBorderDefault: "rgba(15,35,64,0.13)",
    cardBorderHover: "rgba(15,35,64,0.28)",
    iconGradient: "linear-gradient(135deg, #0F2340 0%, #1A365D 100%)",
    iconShadow: "rgba(15,35,64,0.25)",
    accentColor: "#0F2340",
    label: "Camp Program",
    badgeEmoji: "📍",
    badgeText: "Di Kampung Inggris Pare",
    tagline: "Belajar imersif langsung di Pare",
    bullets: ["VIP English Camp for Kids", "Aktivitas outdoor & speaking"],
    ctaLabel: "Lihat Camp Program",
    ctaBg: "rgba(15,35,64,0.07)",
    ctaBgHover: "rgba(15,35,64,0.14)",
    ctaColor: "#0F2340",
    ctaBorder: "rgba(15,35,64,0.18)",
  },
  {
    href: "/school-group-programs",
    icon: School,
    cardGradient:
      "linear-gradient(145deg, rgba(124,58,237,0.05) 0%, rgba(124,58,237,0.11) 100%)",
    cardBorderDefault: "rgba(124,58,237,0.18)",
    cardBorderHover: "rgba(124,58,237,0.35)",
    iconGradient: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
    iconShadow: "rgba(124,58,237,0.3)",
    accentColor: "#6D28D9",
    label: "Grup Sekolah",
    badgeEmoji: "⚙️",
    badgeText: "Customizable",
    tagline: "Khusus sekolah, pesantren & instansi",
    bullets: ["1 hari s/d 1 bulan", "Tutor datang ke sekolah atau di Pare"],
    ctaLabel: "Request Proposal",
    ctaBg: "rgba(124,58,237,0.09)",
    ctaBgHover: "rgba(124,58,237,0.17)",
    ctaColor: "#6D28D9",
    ctaBorder: "rgba(124,58,237,0.25)",
  },
];

const allProgramHrefs = programGroups.flatMap((g) =>
  g.items.map((i) => i.href),
);

const NAV_ICONS: Record<string, React.ElementType> = {
  "/": Home,
  "/program-kami": LayoutGrid,
  "/speaking-challenge": Mic,
  "/go-private": Laptop,
  "/vip-camp": Tent,
  "/school-camp": School,
  "/blog": BookOpen,
  "/tentang-kami": Info,
  "/about": Info,
  "/contact": Phone,
};

function CategoryCard({
  card,
  onClose,
}: {
  card: (typeof categoryCards)[0];
  onClose: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = card.icon;

  return (
    <Link
      href={card.href}
      onClick={onClose}
      className="block rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: card.cardGradient,
        border: `1.5px solid ${hovered ? card.cardBorderHover : card.cardBorderDefault}`,
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? `0 8px 28px ${card.iconShadow}` : "none",
        textDecoration: "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Card top: icon + label + badge ── */}
      <div className="flex items-start gap-3 px-3.5 pt-3.5 pb-2">
        <motion.div
          animate={
            hovered ? { scale: 1.1, rotate: -6 } : { scale: 1, rotate: 0 }
          }
          transition={{ duration: 0.22, ease }}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: card.iconGradient,
            boxShadow: `0 4px 12px ${card.iconShadow}`,
          }}
        >
          <Icon className="w-4 h-4 text-white" />
        </motion.div>

        <div className="flex-1 min-w-0">
          {/* Label row */}
          <div className="flex items-start gap-1.5 flex-wrap mb-0.5">
            <p
              className="font-display font-bold leading-tight"
              style={{ fontSize: "0.8125rem", color: "#0F2340" }}
            >
              {card.label}
            </p>
            {/* Emoji badge */}
            <span
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-display font-bold flex-shrink-0"
              style={{
                fontSize: "0.5rem",
                letterSpacing: "0.03em",
                background: `${card.accentColor}18`,
                color: card.accentColor,
                border: `1px solid ${card.cardBorderDefault}`,
              }}
            >
              <span style={{ fontSize: "0.65rem" }}>{card.badgeEmoji}</span>
              {card.badgeText}
            </span>
          </div>
          {/* Tagline */}
          <p
            style={{
              fontSize: "0.6875rem",
              color: "#64748B",
              lineHeight: "1.4",
            }}
          >
            {card.tagline}
          </p>
        </div>
      </div>

      {/* ── Bullet highlights ── */}
      <div className="px-3.5 pb-2.5">
        <ul className="space-y-0.5">
          {card.bullets.map((b) => (
            <li
              key={b}
              className="flex items-center gap-1.5"
              style={{ fontSize: "0.6875rem", color: "#475569" }}
            >
              <motion.div
                animate={hovered ? { scale: 1.3 } : { scale: 1 }}
                transition={{ duration: 0.18 }}
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: card.accentColor, opacity: 0.55 }}
              />
              {b}
            </li>
          ))}
        </ul>
      </div>

      {/* ── CTA button — full-width accent ── */}
      <div className="px-2.5 pb-2.5">
        <div
          className="w-full flex items-center justify-center gap-1.5 font-display font-semibold rounded-lg py-2 transition-all duration-150"
          style={{
            fontSize: "0.75rem",
            background: hovered ? card.ctaBgHover : card.ctaBg,
            color: card.ctaColor,
            border: `1px solid ${card.ctaBorder}`,
          }}
        >
          {card.ctaLabel}
          <motion.span
            animate={hovered ? { x: 3 } : { x: 0 }}
            transition={{ duration: 0.18, ease }}
            className="inline-flex"
          >
            <ArrowRight className="w-3 h-3" />
          </motion.span>
        </div>
      </div>
    </Link>
  );
}

export function ProgramsDropdown({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.18, ease }}
      className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 z-50"
      style={{ width: "700px" }}
    >
      {/* Arrow tip */}
      <div className="flex justify-center mb-[-1px] relative z-10 pointer-events-none">
        <svg width="18" height="9" viewBox="0 0 18 9" fill="none">
          <path
            d="M0 9L9 0L18 9"
            fill="white"
            stroke="rgba(15,35,64,0.07)"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "white",
          border: "1px solid rgba(15,35,64,0.08)",
          boxShadow:
            "0 24px 64px rgba(15,35,64,0.13), 0 4px 16px rgba(15,35,64,0.05)",
        }}
      >
        {/* Panel header */}
        <div
          className="px-5 py-3 border-b flex items-center justify-between"
          style={{ borderColor: "rgba(15,35,64,0.06)", background: "#FAFAFA" }}
        >
          <p
            className="font-display font-semibold"
            style={{
              fontSize: "0.6875rem",
              letterSpacing: "0.07em",
              color: "#94A3B8",
              textTransform: "uppercase",
            }}
          >
            Semua Program Inggris Go
          </p>
          <Link
            href="/speaking-challenge"
            onClick={onClose}
            className="inline-flex items-center gap-1 font-display font-semibold transition-all duration-150 hover:gap-1.5"
            style={{ fontSize: "0.6875rem", color: "#FF6B35" }}
          >
            Lihat semua <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Body: 7/12 left + 5/12 right */}
        <div className="grid grid-cols-12">
          {/* ── LEFT: Lead Magnet Programs ── */}
          <div
            className="col-span-7 p-5 border-r"
            style={{ borderColor: "rgba(15,35,64,0.06)" }}
          >
            <div className="flex items-center gap-2 mb-3.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
              <p
                className="font-display font-bold"
                style={{
                  fontSize: "0.625rem",
                  letterSpacing: "0.08em",
                  color: "#94A3B8",
                  textTransform: "uppercase",
                }}
              >
                Mulai dari Sini · Terjangkau
              </p>
            </div>

            <div className="space-y-2.5">
              {leadMagnetPrograms.map((prog) => {
                const Icon = prog.icon;
                return (
                  <div
                    key={prog.title}
                    className="group flex items-start gap-3.5 p-3.5 rounded-xl transition-all duration-150 cursor-pointer "
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "#FFF8F3";
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "rgba(255,107,53,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "transparent";
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110"
                      style={{
                        background: prog.iconBg,
                        boxShadow: `0 4px 12px ${prog.iconShadow}`,
                      }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="font-display font-bold"
                          style={{ fontSize: "0.875rem", color: "#0F2340" }}
                        >
                          {prog.title}
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded-full font-display font-bold flex-shrink-0"
                          style={{
                            fontSize: "0.5625rem",
                            letterSpacing: "0.04em",
                            background: `${prog.badgeColor}18`,
                            color: prog.badgeColor,
                          }}
                        >
                          {prog.badge}
                        </span>
                        <span
                          className="font-display font-bold ml-auto flex-shrink-0"
                          style={{ fontSize: "0.875rem", color: "#FF6B35" }}
                        >
                          {prog.price}
                        </span>
                      </div>

                      <div
                        className="flex items-center flex-wrap mb-2.5"
                        style={{ gap: "4px" }}
                      >
                        {prog.highlights.map((h, i) => (
                          <span
                            key={h}
                            className="inline-flex items-center"
                            style={{ fontSize: "0.6875rem", color: "#94A3B8" }}
                          >
                            {i > 0 && (
                              <span
                                style={{ marginRight: "4px", color: "#E2E8F0" }}
                              >
                                ·
                              </span>
                            )}
                            {h}
                          </span>
                        ))}
                      </div>

                      <a
                        href={prog.ctaHref}
                        target={prog.ctaExternal ? "_blank" : undefined}
                        rel={
                          prog.ctaExternal ? "noopener noreferrer" : undefined
                        }
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 font-display font-semibold rounded-lg px-3 py-1.5 text-white transition-all duration-150 hover:-translate-y-px active:translate-y-0"
                        style={{
                          fontSize: "0.75rem",
                          background:
                            "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
                          boxShadow: "0 3px 10px rgba(255,107,53,0.3)",
                        }}
                      >
                        {prog.cta}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT: Category cards ── */}
          <div className="col-span-5 p-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 mb-0.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#CBD5E1" }}
              />
              <p
                className="font-display font-bold"
                style={{
                  fontSize: "0.625rem",
                  letterSpacing: "0.08em",
                  color: "#94A3B8",
                  textTransform: "uppercase",
                }}
              >
                Jelajahi Program Lanjutan
              </p>
            </div>

            {categoryCards.map((card) => (
              <CategoryCard key={card.href} card={card} onClose={onClose} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 border-t flex items-center justify-between"
          style={{ borderColor: "rgba(15,35,64,0.06)", background: "#FAFAFA" }}
        >
          <p style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
            Belum tahu pilih yang mana?
          </p>
          <Link
            href="/contact"
            onClick={onClose}
            className="inline-flex items-center gap-1 font-display font-semibold transition-all duration-150 hover:gap-2"
            style={{ fontSize: "0.75rem", color: "#FF6B35" }}
          >
            Konsultasi gratis <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

type RowState = "default" | "hover" | "active";

function resolveState(
  isActive: boolean,
  isHovered: boolean,
  isExpanded: boolean,
): RowState {
  if (isActive) return "active";
  // Expanded (open) inherits hover look unless it's also active
  if (isHovered || isExpanded) return "hover";
  return "default";
}

const ROW_STYLES: Record<
  RowState,
  {
    bg: string;
    border: string;
    iconBg: string;
    iconColor: string;
    textColor: string;
    chevronColor: string;
  }
> = {
  default: {
    bg: "transparent",
    border: "1.5px solid rgba(15,35,64,0.09)", // subtle navy — always visible
    iconBg: "#F1F5F9",
    iconColor: "#94A3B8",
    textColor: "#0F2340",
    chevronColor: "#94A3B8",
  },
  hover: {
    bg: "rgba(255,107,53,0.04)", // ~40% of active bg
    border: "1.5px solid rgba(255,107,53,0.18)", // ~40% of active border
    iconBg: "rgba(255,107,53,0.1)", // tinted but not filled
    iconColor: "#FF6B35",
    textColor: "#CC4D1F", // slightly muted orange
    chevronColor: "#FF6B35",
  },
  active: {
    bg: "rgba(255,107,53,0.09)",
    border: "1.5px solid rgba(255,107,53,0.28)",
    iconBg: "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
    iconColor: "white",
    textColor: "#FF6B35",
    chevronColor: "#FF6B35",
  },
};

function MobileNavRow({
  href,
  label,
  delay = 0,
  isActive,
  hasChevron = false,
  chevronOpen = false,
  onClick,
  merged = false,
}: {
  href?: string;
  label: string;
  delay?: number;
  isActive: boolean;
  hasChevron?: boolean;
  chevronOpen?: boolean;
  onClick?: () => void;
  merged?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = NAV_ICONS[href ?? ""] ?? LayoutGrid;

  const state = resolveState(isActive, hovered, chevronOpen);
  const s = ROW_STYLES[state];

  const borderRadius = merged ? "1rem 1rem 0 0" : "1rem";

  const inner = (
    <div
      className="flex items-center gap-3.5 w-full px-3 py-3 transition-all duration-200"
      style={{ background: s.bg, border: s.border, borderRadius }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={{ background: s.iconBg }}
      >
        <Icon
          className="w-4 h-4 transition-colors duration-200"
          style={{ color: s.iconColor }}
        />
      </div>

      <span
        className="font-display font-semibold flex-1 transition-colors duration-200"
        style={{ fontSize: "0.9375rem", color: s.textColor }}
      >
        {label}
      </span>

      {isActive && !hasChevron && (
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: "#FF6B35" }}
        />
      )}
      {hasChevron && (
        <motion.span
          animate={{ rotate: chevronOpen ? 180 : 0 }}
          transition={{ duration: 0.22, ease }}
          className="flex-shrink-0"
        >
          <ChevronDown
            className="w-4 h-4 transition-colors duration-200"
            style={{ color: s.chevronColor }}
          />
        </motion.span>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.28, ease }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {href && !hasChevron ? (
        <Link href={href} onClick={onClick}>
          {inner}
        </Link>
      ) : (
        <button onClick={onClick} className="w-full text-left cursor-pointer">
          {inner}
        </button>
      )}
    </motion.div>
  );
}

function MobileProgramPanel({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        background: "rgba(255,107,53,0.025)",
        border: "1.5px solid rgba(255,107,53,0.18)",
        borderTop: "none",
        borderRadius: "0 0 1rem 1rem",
        marginTop: "-1px",
      }}
    >
      {/* ── Section 1: Lead Magnet ── */}
      <div
        style={{
          background: "rgba(255,107,53,0.05)",
          padding: "6px 16px 5px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div
          style={{
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: "#FF6B35",
            flexShrink: 0,
          }}
        />
        <span
          className="font-display font-bold"
          style={{
            fontSize: "0.5625rem",
            letterSpacing: "0.1em",
            color: "rgba(255,107,53,0.7)",
            textTransform: "uppercase",
          }}
        >
          Mulai dari Sini
        </span>
      </div>

      <div className="px-2 py-1 space-y-1">
        {leadMagnetPrograms.map((prog, ii) => {
          const Icon = prog.icon;
          const isActive = pathname === prog.href;
          const isLast = ii === leadMagnetPrograms.length - 1;
          return (
            <motion.div
              key={prog.title}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.03 * ii, duration: 0.22, ease }}
            >
              <div
                className="flex items-start gap-3 px-3 py-3 rounded-xl transition-colors duration-150 border"
                style={{
                  background: isActive
                    ? "rgba(255,107,53,0.08)"
                    : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(255,107,53,0.05)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                }}
              >
                {/* Indent bar */}
                <div
                  className="flex-shrink-0 self-stretch flex items-center"
                  style={{ width: "3px", marginRight: "2px" }}
                >
                  <div
                    style={{
                      width: "3px",
                      height: "60%",
                      borderRadius: "2px",
                      background: isActive ? "#FF6B35" : "rgba(255,107,53,0.2)",
                      transition: "background 0.15s",
                    }}
                  />
                </div>

                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background: prog.iconBg,
                    boxShadow: `0 3px 10px ${prog.iconShadow}`,
                  }}
                >
                  <Icon
                    style={{ width: "1rem", height: "1rem", color: "white" }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title row: name + badge + price */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span
                      className="font-display font-bold"
                      style={{
                        fontSize: "0.875rem",
                        color: isActive ? "#FF6B35" : "#0F2340",
                        lineHeight: "1.3",
                      }}
                    >
                      {prog.title}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded-full font-display font-bold flex-shrink-0"
                      style={{
                        fontSize: "0.5rem",
                        letterSpacing: "0.04em",
                        background: `${prog.badgeColor}15`,
                        color: prog.badgeColor,
                      }}
                    >
                      {prog.badge}
                    </span>
                    <span
                      className="font-display font-bold ml-auto flex-shrink-0"
                      style={{ fontSize: "0.8125rem", color: "#FF6B35" }}
                    >
                      {prog.price}
                    </span>
                  </div>

                  {/* Highlights */}
                  <div
                    className="flex items-center flex-wrap mb-2"
                    style={{ gap: "3px" }}
                  >
                    {prog.highlights.map((h, hi) => (
                      <span
                        key={h}
                        className="inline-flex items-center"
                        style={{ fontSize: "0.625rem", color: "#94A3B8" }}
                      >
                        {hi > 0 && (
                          <span
                            style={{ marginRight: "3px", color: "#E2E8F0" }}
                          >
                            ·
                          </span>
                        )}
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* WA CTA button */}
                  <a
                    href={prog.ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 font-display font-semibold rounded-lg px-3 py-1.5 text-white active:scale-95 transition-transform"
                    style={{
                      fontSize: "0.6875rem",
                      background:
                        "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
                      boxShadow: "0 3px 10px rgba(255,107,53,0.3)",
                    }}
                  >
                    {prog.cta}
                  </a>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Section 2: Category Cards ── */}
      <div
        style={{
          background: "rgba(255,107,53,0.05)",
          borderTop: "1px solid rgba(255,107,53,0.1)",
          padding: "6px 16px 5px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div
          style={{
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: "#CBD5E1",
            flexShrink: 0,
          }}
        />
        <span
          className="font-display font-bold"
          style={{
            fontSize: "0.5625rem",
            letterSpacing: "0.1em",
            color: "#94A3B8",
            textTransform: "uppercase",
          }}
        >
          Jelajahi Program Lanjutan
        </span>
      </div>

      <div className="px-2 pt-1.5 pb-1.5 space-y-2">
        {categoryCards.map((card, ci) => {
          const Icon = card.icon;
          const isActive = pathname === card.href;
          return (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 + 0.05 * ci, duration: 0.22, ease }}
            >
              {/*
               * Mobile category card — condensed version of desktop:
               * Same gradient bg, same border, icon+label+tagline top,
               * 2 bullet items, full-width CTA button.
               * Slightly more compact padding than desktop.
               */}
              <Link
                href={card.href}
                onClick={onClose}
                className="block rounded-xl overflow-hidden transition-all duration-150 active:scale-[0.99]"
                style={{
                  background: card.cardGradient,
                  border: `1.5px solid ${isActive ? card.cardBorderHover : card.cardBorderDefault}`,
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    card.cardBorderHover;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = isActive
                    ? card.cardBorderHover
                    : card.cardBorderDefault;
                }}
              >
                {/* Card top: icon + label + badge */}
                <div className="flex items-start gap-2.5 px-3 pt-3 pb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: card.iconGradient,
                      boxShadow: `0 3px 8px ${card.iconShadow}`,
                    }}
                  >
                    <Icon
                      style={{
                        width: "0.875rem",
                        height: "0.875rem",
                        color: "white",
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-1.5 flex-wrap mb-0.5">
                      <p
                        className="font-display font-bold leading-tight"
                        style={{
                          fontSize: "0.8125rem",
                          color: isActive ? card.accentColor : "#0F2340",
                        }}
                      >
                        {card.label}
                      </p>
                      <span
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-display font-bold flex-shrink-0"
                        style={{
                          fontSize: "0.5rem",
                          letterSpacing: "0.03em",
                          background: `${card.accentColor}15`,
                          color: card.accentColor,
                          border: `1px solid ${card.cardBorderDefault}`,
                        }}
                      >
                        <span style={{ fontSize: "0.6rem" }}>
                          {card.badgeEmoji}
                        </span>
                        {card.badgeText}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "0.6875rem",
                        color: "#64748B",
                        lineHeight: "1.4",
                      }}
                    >
                      {card.tagline}
                    </p>
                  </div>
                </div>

                {/* Bullet items */}
                <div className="px-3 pb-2.5">
                  <ul className="space-y-0.5">
                    {card.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-center gap-1.5"
                        style={{ fontSize: "0.6875rem", color: "#475569" }}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: card.accentColor, opacity: 0.5 }}
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA button */}
                <div className="px-2 pb-2.5">
                  <div
                    className="w-full flex items-center justify-center gap-1.5 font-display font-semibold rounded-lg py-2"
                    style={{
                      fontSize: "0.75rem",
                      background: card.ctaBg,
                      color: card.ctaColor,
                      border: `1px solid ${card.ctaBorder}`,
                    }}
                  >
                    {card.ctaLabel}
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Footer consult link */}
      <div
        className="flex items-center justify-between px-4 py-2.5 mx-1"
        style={{ borderTop: "1px solid rgba(255,107,53,0.1)" }}
      >
        <p style={{ fontSize: "0.6875rem", color: "#94A3B8" }}>Belum tahu?</p>
        <Link
          href="/contact"
          onClick={onClose}
          className="inline-flex items-center gap-1 font-display font-semibold transition-all hover:gap-1.5"
          style={{ fontSize: "0.6875rem", color: "#FF6B35" }}
        >
          Konsultasi gratis <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

function MobileDrawer({
  onClose,
  pathname,
}: {
  onClose: () => void;
  pathname: string;
}) {
  const [progOpen, setProgOpen] = useState(allProgramHrefs.includes(pathname));
  const regularLinks = navLinks.filter((l) => l.label !== "Program Kami");
  const isProgramActive = allProgramHrefs.includes(pathname);
  const beforePrograms = regularLinks.filter((_, i) => i < 1);
  const afterPrograms = regularLinks.filter((_, i) => i >= 1);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-0 z-40 lg:hidden"
        style={{
          background: "rgba(15,35,64,0.4)",
          backdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      />

      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 220 }}
        className="fixed top-0 right-0 bottom-0 z-50 lg:hidden flex flex-col"
        style={{
          width: "min(88vw, 340px)",
          background: "white",
          boxShadow: "-8px 0 60px rgba(15,35,64,0.2)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 flex-shrink-0"
          style={{
            height: "64px",
            borderBottom: "1px solid rgba(15,35,64,0.07)",
          }}
        >
          <Link href="/" onClick={onClose}>
            <Image
              src="/logo.png"
              alt="Inggris Go"
              width={90}
              height={30}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" style={{ color: "#0F2340" }} />
          </button>
        </div>

        {/* Nav list */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 space-y-1.5">
          {beforePrograms.map((link, i) => (
            <MobileNavRow
              key={link.href}
              href={link.href}
              label={link.label}
              delay={0.04 * i}
              isActive={pathname === link.href}
              onClick={onClose}
            />
          ))}

          {/* Programs group — trigger connected to sub-panel */}
          <div>
            <MobileNavRow
              label="Program Kami"
              delay={0.04}
              isActive={isProgramActive}
              hasChevron
              chevronOpen={progOpen}
              onClick={() => setProgOpen((o) => !o)}
              merged={progOpen}
            />
            <AnimatePresence>
              {progOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease }}
                  style={{ overflow: "hidden" }}
                >
                  <MobileProgramPanel pathname={pathname} onClose={onClose} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {afterPrograms.map((link, i) => (
            <MobileNavRow
              key={link.href}
              href={link.href}
              label={link.label}
              delay={0.04 * (i + 3)}
              isActive={pathname === link.href}
              onClick={onClose}
            />
          ))}
        </div>

        {/* Footer CTA */}
        <div
          className="flex-shrink-0 px-4 pb-8 pt-4"
          style={{ borderTop: "1px solid rgba(15,35,64,0.07)" }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex -space-x-2">
              {(["#FF6B35", "#2DB8B0", "#0F2340"] as const).map((bg, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center font-bold text-white"
                  style={{ fontSize: "0.5rem", background: bg, zIndex: 3 - i }}
                >
                  {["R", "B", "S"][i]}
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.75rem", color: "#64748B" }}>
              <span style={{ color: "#FF6B35", fontWeight: 700 }}>500+</span>{" "}
              siswa sudah bergabung
            </p>
          </div>
          <WAButton
            program="Konsultasi"
            label="Hubungi Kami Sekarang"
            size="default"
            className="w-full justify-center py-3.5"
          />
          <p
            className="text-center mt-3"
            style={{ fontSize: "0.6875rem", color: "#94A3B8" }}
          >
            Respon cepat · Konsultasi gratis · Tanpa syarat
          </p>
        </div>
      </motion.aside>
    </>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isProgramActive = allProgramHrefs.includes(pathname);
  const regularLinks = navLinks.filter((l) => l.label !== "Program Kami");

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openDropdown = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setDropdownOpen(true);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setDropdownOpen(false), 130);
  };

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 overflow-visible transition-all duration-300 bg-white ${scrolled ? "shadow-sm border-b border-brand-navy/5" : "shadow-sm"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
          <div className="flex items-center justify-between h-14 lg:h-[72px] overflow-visible">
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Inggris Go"
                width={120}
                height={40}
                priority
                className="h-9 w-auto object-contain"
              />
            </Link>

            <div className="hidden lg:flex items-center gap-8 overflow-visible">
              {regularLinks
                .filter((_, i) => i < 1)
                .map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`nav-link ${pathname === link.href ? "active" : ""}`}
                  >
                    {link.label}
                  </Link>
                ))}
              <div
                ref={dropdownRef}
                className="relative overflow-visible"
                onMouseEnter={openDropdown}
                onMouseLeave={scheduleClose}
              >
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className={`nav-link flex items-center gap-1 bg-transparent border-0 p-0 cursor-pointer ${isProgramActive ? "active" : ""}`}
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                >
                  Program Kami
                  <motion.span
                    animate={{ rotate: dropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease }}
                    style={{ display: "inline-flex", lineHeight: 0 }}
                  >
                    <ChevronDown
                      className="w-3.5 h-3.5"
                      style={{ color: "inherit" }}
                    />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <ProgramsDropdown onClose={() => setDropdownOpen(false)} />
                  )}
                </AnimatePresence>
              </div>
              {regularLinks
                .filter((_, i) => i >= 1)
                .map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`nav-link ${pathname === link.href ? "active" : ""}`}
                  >
                    {link.label}
                  </Link>
                ))}
              <WAButton
                program="Konsultasi"
                label="Hubungi Kami"
                size="sm"
                className="px-6 py-2.5 text-sm"
              />
            </div>

            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-gray-100 cursor-pointer"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait">
                {menuOpen ? (
                  <motion.span
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <X className="w-5 h-5 text-brand-navy" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="burger"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Menu className="w-5 h-5 text-brand-navy" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <MobileDrawer
            onClose={() => setMenuOpen(false)}
            pathname={pathname}
          />
        )}
      </AnimatePresence>
    </>
  );
}
