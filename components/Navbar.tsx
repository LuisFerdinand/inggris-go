"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks, siteConfig } from "@/lib/config";
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
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

/* ── Program groups ────────────────────────────────────────────────── */
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

/* ── Desktop dropdown (unchanged) ─────────────────────────────────── */
function ProgramsDropdown({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.2, ease }}
      className="absolute top-[calc(100%+14px)] left-1/2 -translate-x-1/2 z-50"
      style={{ width: "540px" }}
    >
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
            "0 20px 60px rgba(15,35,64,0.14), 0 4px 16px rgba(15,35,64,0.06)",
        }}
      >
        <div
          className="px-5 py-3 border-b"
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
            Pilih Program Belajarmu
          </p>
        </div>
        <div className="grid grid-cols-2">
          {programGroups.map((group, gi) => (
            <div
              key={group.label}
              className="p-4"
              style={{
                borderRight:
                  gi === 0 ? "1px solid rgba(15,35,64,0.06)" : "none",
              }}
            >
              <p
                className="font-display font-bold px-1 mb-3"
                style={{
                  fontSize: "0.625rem",
                  letterSpacing: "0.07em",
                  color: "#CBD5E1",
                  textTransform: "uppercase",
                }}
              >
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className="group flex items-start gap-3 p-2.5 rounded-xl transition-colors duration-150"
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "#FFF8F3";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "transparent";
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110 mt-0.5"
                        style={{
                          background: item.iconBg,
                          boxShadow: `0 4px 12px ${item.iconShadow}`,
                        }}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="font-display font-bold"
                            style={{
                              fontSize: "0.8125rem",
                              color: "#0F2340",
                              lineHeight: "1.3",
                            }}
                          >
                            {item.title}
                          </span>
                          <span
                            className="px-1.5 py-0.5 rounded-full font-display font-bold flex-shrink-0"
                            style={{
                              fontSize: "0.5625rem",
                              letterSpacing: "0.04em",
                              background: `${item.badgeColor}18`,
                              color: item.badgeColor,
                            }}
                          >
                            {item.badge}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "#94A3B8",
                            marginTop: "2px",
                          }}
                        >
                          {item.desc}
                        </p>
                      </div>
                      <ChevronRight
                        className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-150 -translate-x-1 group-hover:translate-x-0 mt-1"
                        style={{ color: "#FF6B35" }}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
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

/* ══════════════════════════════════════════════════════════════════════
 *  MobileNavRow — 4 visual states
 *
 *  DEFAULT  → light navy border, slate icon, navy text
 *  HOVER    → faint orange bg, orange-tinted border, orange-tinted icon
 *             (same direction as active, but weaker — ~40% of active)
 *  EXPANDED → same as hover (trigger shows hovered state when open)
 *             UNLESS it's also active → then active wins
 *  ACTIVE   → stronger orange bg, full orange border, filled icon, orange text
 *  MERGED   → when open, bottom radius removed so sub-panel connects flush
 * ══════════════════════════════════════════════════════════════════════ */

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

/* ── Mobile Drawer ─────────────────────────────────────────────────── */
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
  const beforePrograms = regularLinks.filter((_, i) => i < 2);
  const afterPrograms = regularLinks.filter((_, i) => i >= 2);

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
          width: "min(88vw, 320px)",
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

          {/* Programs group — trigger + sub-panel as one visual unit */}
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
                  {/*
                   * Sub-panel design:
                   * - No top border (connects flush to trigger's bottom border)
                   * - No top radius (continuous with trigger)
                   * - Slightly elevated bg to feel like "inside" the group
                   * - marginTop: -1px to close the 1px seam at the join
                   */}
                  <div
                    style={{
                      background: "rgba(255,107,53,0.025)",
                      border: "1.5px solid rgba(255,107,53,0.18)",
                      borderTop: "none",
                      borderRadius: "0 0 1rem 1rem",
                      marginTop: "-1px",
                    }}
                  >
                    {programGroups.map((group, gi) => (
                      <div key={group.label}>
                        {/*
                         * Group header row — full-width tinted stripe
                         * Acts as a visual "shelf" to separate the two groups
                         */}
                        <div
                          style={{
                            background:
                              gi === 0
                                ? "rgba(255,107,53,0.05)"
                                : "rgba(255,107,53,0.05)",
                            borderTop:
                              gi > 0
                                ? "1px solid rgba(255,107,53,0.1)"
                                : "none",
                            padding: "6px 16px 5px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {/* Left dot accent */}
                          <div
                            style={{
                              width: "4px",
                              height: "4px",
                              borderRadius: "50%",
                              background: "rgba(255,107,53,0.4)",
                              flexShrink: 0,
                            }}
                          />
                          <span
                            className="font-display font-bold"
                            style={{
                              fontSize: "0.5625rem",
                              letterSpacing: "0.1em",
                              color: "rgba(255,107,53,0.55)",
                              textTransform: "uppercase",
                            }}
                          >
                            {group.label}
                          </span>
                        </div>

                        {/* Items */}
                        <div className="px-2 pb-1">
                          {group.items.map((item, ii) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            const isLastInGroup = ii === group.items.length - 1;

                            return (
                              <motion.div
                                key={item.href}
                                initial={{ opacity: 0, x: 8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  delay: 0.03 * ii + 0.04 * gi,
                                  duration: 0.22,
                                  ease,
                                }}
                              >
                                <Link
                                  href={item.href}
                                  onClick={onClose}
                                  className="group flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150"
                                  style={{
                                    background: isActive
                                      ? "rgba(255,107,53,0.08)"
                                      : "transparent",
                                    /* Thin separator between items within a group */
                                    borderBottom: !isLastInGroup
                                      ? "1px solid rgba(255,107,53,0.06)"
                                      : "none",
                                    marginBottom: !isLastInGroup ? "0" : "0",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isActive)
                                      (
                                        e.currentTarget as HTMLElement
                                      ).style.background =
                                        "rgba(255,107,53,0.05)";
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isActive)
                                      (
                                        e.currentTarget as HTMLElement
                                      ).style.background = "transparent";
                                  }}
                                >
                                  {/* Indent marker — small left accent */}
                                  <div
                                    className="flex-shrink-0 self-stretch flex items-center"
                                    style={{ width: "3px", marginRight: "2px" }}
                                  >
                                    <div
                                      style={{
                                        width: "3px",
                                        height: "60%",
                                        borderRadius: "2px",
                                        background: isActive
                                          ? "#FF6B35"
                                          : "rgba(255,107,53,0.2)",
                                        transition: "background 0.15s",
                                      }}
                                    />
                                  </div>

                                  {/* Icon */}
                                  <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                                    style={{
                                      background: item.iconBg,
                                      boxShadow: `0 3px 8px ${item.iconShadow}`,
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

                                  {/* Text — no truncate */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-1.5 flex-wrap mb-0.5">
                                      <span
                                        className="font-display font-semibold"
                                        style={{
                                          fontSize: "0.875rem",
                                          color: isActive
                                            ? "#FF6B35"
                                            : "#0F2340",
                                          lineHeight: "1.35",
                                        }}
                                      >
                                        {item.title}
                                      </span>
                                      <span
                                        className="px-1.5 py-0.5 rounded-full font-display font-bold flex-shrink-0"
                                        style={{
                                          fontSize: "0.5rem",
                                          letterSpacing: "0.04em",
                                          background: `${item.badgeColor}15`,
                                          color: item.badgeColor,
                                          marginTop: "2px",
                                        }}
                                      >
                                        {item.badge}
                                      </span>
                                    </div>
                                    <p
                                      style={{
                                        fontSize: "0.6875rem",
                                        color: "#94A3B8",
                                        lineHeight: "1.5",
                                      }}
                                    >
                                      {item.desc}
                                    </p>
                                  </div>

                                  {/* Right indicator */}
                                  {isActive ? (
                                    <div
                                      className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
                                      style={{ background: "#FF6B35" }}
                                    />
                                  ) : (
                                    <ChevronRight
                                      className="w-3.5 h-3.5 flex-shrink-0 mt-1 opacity-25 group-hover:opacity-60 transition-opacity"
                                      style={{ color: "#FF6B35" }}
                                    />
                                  )}
                                </Link>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    {/* Footer consult link */}
                    <div
                      className="flex items-center justify-between px-4 py-2.5 mx-1 mt-1"
                      style={{ borderTop: "1px solid rgba(255,107,53,0.1)" }}
                    >
                      <p style={{ fontSize: "0.6875rem", color: "#94A3B8" }}>
                        Belum tahu?
                      </p>
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

/* ── Main Navbar ───────────────────────────────────────────────────── */
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
