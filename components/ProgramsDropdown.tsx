"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import * as Icons from "lucide-react";
import { CATEGORIES } from "@/app/(home)/programs/[categorySlug]/data";
import { BRAND } from "@/constants/brand";
import { generateTheme } from "@/lib/utils";

/* ─── helpers ─────────────────────────────────────────────────── */
function getIcon(name?: string) {
  if (!name) return Icons.Circle;
  const key = name
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
  return (
    ((Icons as Record<string, unknown>)[key] as React.ElementType) ||
    Icons.Circle
  );
}

/* ─── Derived data ────────────────────────────────────────────── */
export const leadCategory = CATEGORIES["lead"];
const leadTheme = generateTheme(leadCategory.theme.primary);

export const leadPrograms = leadCategory.programs.map((p) => ({
  id: p.slug,
  title: p.title,
  href: p.href,
  desc: p.shortDesc ?? p.description?.slice(0, 72) + "…",
  icon: getIcon(p.icon),
  badge: p.badge,
}));

export const categories = Object.values(CATEGORIES).filter(
  (cat) => cat.key !== "lead",
);

export const rightColumns = categories.map((cat) => {
  const theme = generateTheme(cat.theme.primary);
  return {
    id: cat.key,
    label: cat.label,
    shortLabel: cat.shortLabel,
    href: cat.href,
    description: cat.tagline,
    icon: getIcon(cat.icon),
    theme,
    defaultOpen: false,
    items: cat.programs.map((p) => ({
      label: p.title,
      href: p.href,
      desc: p.shortDesc ?? p.highlight ?? "",
      badge: p.badge,
    })),
  };
});

export const allProgramHrefs = [
  ...leadPrograms.map((p) => p.href),
  ...rightColumns.flatMap((col) => col.items.map((item) => item.href)),
];

const EASE = [0.22, 1, 0.36, 1] as const;

/* ══════════════════════════════════════════════════════════════
 * LeadProgramCard — themed from lead category's primary color
 * ══════════════════════════════════════════════════════════════ */
function LeadProgramCard({
  prog,
  onClose,
}: {
  prog: (typeof leadPrograms)[0];
  onClose: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = prog.icon;

  return (
    <Link
      href={prog.href}
      onClick={onClose}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group block rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: hovered ? leadTheme.soft : "rgba(255,255,255,0.6)",
        border: `1px solid ${hovered ? leadTheme.border : "rgba(15,35,64,0.06)"}`,
        boxShadow: hovered ? `0 4px 20px ${leadTheme.soft}` : "none",
        textDecoration: "none",
        padding: "10px 12px",
      }}
    >
      {/* Top: icon + title + arrow */}
      <div className="flex items-center gap-2.5">
        <motion.div
          animate={
            hovered ? { scale: 1.08, rotate: -4 } : { scale: 1, rotate: 0 }
          }
          transition={{ duration: 0.2, ease: EASE }}
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: hovered ? leadTheme.softStrong : leadTheme.soft,
            border: `1px solid ${leadTheme.border}`,
          }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: leadTheme.primary }} />
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className="font-semibold leading-tight truncate transition-colors duration-150"
              style={{
                fontSize: "0.8125rem",
                color: hovered ? leadTheme.primary : "#0F2340",
              }}
            >
              {prog.title}
            </span>
            {/* {prog.badge && (
              <span
                className="flex-shrink-0 px-1.5 py-0.5 rounded-full font-bold"
                style={{
                  fontSize: "0.5rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  background: leadTheme.soft,
                  color: leadTheme.primary,
                  border: `1px solid ${leadTheme.border}`,
                }}
              >
                {prog.badge}
              </span>
            )} */}
          </div>
        </div>

        <motion.span
          animate={hovered ? { x: 0, opacity: 1 } : { x: -5, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex-shrink-0 ml-auto"
        >
          <ChevronRight
            className="w-3.5 h-3.5"
            style={{ color: leadTheme.primary }}
          />
        </motion.span>
      </div>

      {/* Desc */}
      {/* {prog.desc && (
        <p
          className="mt-1.5 leading-snug transition-colors duration-150"
          style={{
            fontSize: "0.6875rem",
            color: hovered ? "rgba(15,35,64,0.55)" : "#94A3B8",
            lineHeight: "1.45",
            paddingLeft: "2.25rem", // align with title
          }}
        >
          {prog.desc}
        </p>
      )} */}

      {/* Bottom CTA strip */}
      <motion.div
        initial={false}
        animate={{
          opacity: hovered ? 1 : 0,
          height: hovered ? "auto" : 0,
          marginTop: hovered ? "8px" : 0,
        }}
        transition={{ duration: 0.2, ease: EASE }}
        className="overflow-hidden"
      >
        <div
          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg"
          style={{
            background: leadTheme.primary,
          }}
        >
          <span
            className="font-bold"
            style={{ fontSize: "0.6875rem", color: leadTheme.text }}
          >
            Mulai Sekarang
          </span>
          <ChevronRight
            className="w-3 h-3"
            style={{ color: leadTheme.text, opacity: 0.8 }}
          />
        </div>
      </motion.div>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════════
 * NavItem — themed per parent category
 * ══════════════════════════════════════════════════════════════ */
function NavItem({
  item,
  theme,
  onClose,
  isLast,
}: {
  item: (typeof rightColumns)[0]["items"][0];
  theme: ReturnType<typeof generateTheme>;
  onClose: () => void;
  isLast: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={item.href}
      onClick={onClose}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center justify-between transition-all duration-150"
      style={{
        padding: "7px 11px",
        background: hovered ? theme.soft : "transparent",
        borderBottom: isLast ? "none" : "0.5px solid rgba(15,35,64,0.055)",
        borderLeft: `2px solid ${hovered ? theme.primary : "transparent"}`,
        textDecoration: "none",
        transition: "background 0.15s ease, border-color 0.15s ease",
      }}
    >
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className="font-medium leading-tight truncate transition-colors duration-150"
            style={{
              fontSize: "0.78125rem",
              color: hovered ? theme.strong : "#1E293B",
            }}
          >
            {item.label}
          </span>
          {/* {item.badge && (
            <span
              className="flex-shrink-0 px-1.5 py-0.5 rounded-full font-bold"
              style={{
                fontSize: "0.5rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                background: theme.soft,
                color: theme.primary,
                border: `1px solid ${theme.border}`,
              }}
            >
              {item.badge}
            </span>
          )} */}
        </div>
        {item.desc && (
          <span
            style={{
              fontSize: "0.65625rem",
              color: "#94A3B8",
              marginTop: "1px",
              lineHeight: "1.4",
            }}
          >
            {item.desc}
          </span>
        )}
      </div>

      <motion.span
        animate={hovered ? { x: 0, opacity: 1 } : { x: -4, opacity: 0 }}
        transition={{ duration: 0.12 }}
        className="flex-shrink-0 ml-2"
      >
        <ChevronRight className="w-3 h-3" style={{ color: theme.primary }} />
      </motion.span>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════════
 * CategoryGroup — themed accordion with consistent accent
 * ══════════════════════════════════════════════════════════════ */
function CategoryGroup({
  col,
  onClose,
}: {
  col: (typeof rightColumns)[0];
  onClose: () => void;
}) {
  const [open, setOpen] = useState(col.defaultOpen);
  const [headerHovered, setHeaderHovered] = useState(false);
  const Icon = col.icon;
  const { theme } = col;

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        border: `1px solid ${open ? theme.border : "rgba(15,35,64,0.08)"}`,
        boxShadow: open ? `0 2px 12px ${theme.soft}` : "none",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      {/* Colored top accent line when open */}
      <motion.div
        initial={false}
        animate={{ scaleX: open ? 1 : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25, ease: EASE }}
        style={{
          height: "2px",
          background: `linear-gradient(90deg, ${theme.primary} 0%, transparent 100%)`,
          transformOrigin: "left",
        }}
      />

      {/* Header */}
      <div
        className="flex items-center justify-between transition-colors duration-150"
        style={{
          padding: "9px 11px",
          background: open
            ? theme.soft
            : headerHovered
              ? "rgba(15,35,64,0.02)"
              : "transparent",
          transition: "background 0.15s ease",
        }}
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
      >
        {/* Clickable label → goes to category page */}
        <Link
          href={col.href}
          onClick={onClose}
          className="flex items-center gap-2 flex-1 min-w-0"
          style={{ textDecoration: "none" }}
        >
          <div
            className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center flex-shrink-0 transition-all duration-150"
            style={{
              background: headerHovered || open ? theme.softStrong : theme.soft,
              border: `1px solid ${theme.border}`,
            }}
          >
            <Icon
              style={{
                width: "11px",
                height: "11px",
                color: theme.primary,
              }}
            />
          </div>

          <div className="min-w-0">
            <p
              className="font-semibold leading-tight transition-colors duration-150"
              style={{
                fontSize: "0.72rem",
                color: headerHovered || open ? theme.strong : "#0F2340",
              }}
            >
              {col.label}
            </p>
            <p
              style={{
                fontSize: "0.625rem",
                color: open ? theme.primary : "#94A3B8",
                lineHeight: "1.35",
                transition: "color 0.15s ease",
              }}
            >
              {col.description}
            </p>
          </div>
        </Link>

        {/* Right: count + toggle */}
        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
          <span
            className="text-[0.56rem] px-1.5 py-0.5 rounded-full font-semibold transition-all duration-150"
            style={{
              background: open ? theme.soft : "rgba(15,35,64,0.06)",
              color: open ? theme.primary : "#94A3B8",
              border: `1px solid ${open ? theme.border : "transparent"}`,
            }}
          >
            {col.items.length}
          </span>

          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center justify-center w-6 h-6 rounded-md transition-all duration-150"
            style={{
              background: open ? theme.softStrong : "transparent",
              border: `1px solid ${open ? theme.border : "transparent"}`,
            }}
          >
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="flex items-center justify-center"
            >
              <ChevronDown
                style={{
                  width: "0.875rem",
                  height: "0.875rem",
                  color: open ? theme.primary : "#94A3B8",
                  transition: "color 0.15s ease",
                }}
              />
            </motion.span>
          </button>
        </div>
      </div>

      {/* Accordion body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="accordion"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.25, ease: EASE },
              opacity: { duration: 0.18 },
            }}
            className="overflow-hidden"
            style={{
              borderTop: `1px solid ${theme.border}`,
            }}
          >
            {col.items.map((item, i) => (
              <NavItem
                key={item.href}
                item={item}
                theme={theme}
                onClose={onClose}
                isLast={i === col.items.length - 1}
              />
            ))}

            {/* "See all" footer per category */}
            <Link
              href={col.href}
              onClick={onClose}
              className="flex items-center justify-end gap-1 transition-all duration-150 group/see"
              style={{
                padding: "7px 11px",
                background: theme.soft,
                borderTop: `1px solid ${theme.border}`,
                textDecoration: "none",
              }}
            >
              <span
                className="font-semibold transition-colors duration-150 group-hover/see:underline"
                style={{ fontSize: "0.6875rem", color: theme.primary }}
              >
                Lihat semua {col.shortLabel}
              </span>
              <motion.span className="inline-flex">
                <ChevronRight
                  style={{
                    width: "0.75rem",
                    height: "0.75rem",
                    color: theme.primary,
                  }}
                />
              </motion.span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
 * ProgramsDropdown — root
 * ══════════════════════════════════════════════════════════════ */
export function ProgramsDropdown({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.98 }}
      transition={{ duration: 0.18, ease: EASE }}
      className="absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 z-50"
      style={{ width: 640 }}
      role="menu"
      aria-label="Program Kami"
    >
      {/* Caret tip */}
      <div className="flex justify-center mb-[-1px] relative z-10 pointer-events-none">
        <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
          <path
            d="M0 8L8 0L16 8"
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
          border: "0.5px solid rgba(15,35,64,0.08)",
          boxShadow:
            "0 16px 48px rgba(15,35,64,0.09), 0 4px 12px rgba(15,35,64,0.05)",
        }}
      >
        <div className="grid grid-cols-5">
          {/* ── LEFT: Lead programs panel ─────────────────────── */}
          <div
            className="col-span-2 flex flex-col"
            style={{
              background: leadTheme.soft,
              borderRight: `0.5px solid ${leadTheme.border}`,
            }}
          >
            {/* Panel header */}
            <div
              className="flex items-center gap-2 px-4 pt-4 pb-3"
              style={{ borderBottom: `1px solid ${leadTheme.border}` }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: leadTheme.primary }}
              />
              <p
                className="font-bold uppercase tracking-[0.1em]"
                style={{ fontSize: "0.5625rem", color: leadTheme.primary }}
              >
                Mulai dari Sini
              </p>
              {/* Category page link */}
              <Link
                href={leadCategory.href}
                onClick={onClose}
                className="ml-auto flex items-center gap-0.5 font-semibold transition-all duration-150 hover:opacity-70"
                style={{
                  fontSize: "0.5625rem",
                  color: leadTheme.primary,
                  textDecoration: "none",
                  letterSpacing: "0.04em",
                }}
              >
                Lihat semua
                <ChevronRight
                  style={{ width: "0.6875rem", height: "0.6875rem" }}
                />
              </Link>
            </div>

            {/* Program cards */}
            <div className="p-3 space-y-1.5 flex-1">
              {leadPrograms.map((prog) => (
                <LeadProgramCard key={prog.id} prog={prog} onClose={onClose} />
              ))}
            </div>

            {/* Lead panel footer: price hint */}
            {/* <div
              className="px-4 py-3 flex items-center gap-2"
              style={{ borderTop: `1px solid ${leadTheme.border}` }}
            >
              <div
                className="w-1.5 h-5 rounded-full flex-shrink-0"
                style={{ background: leadTheme.primary, opacity: 0.35 }}
              />
              <p
                style={{
                  fontSize: "0.625rem",
                  color: "rgba(15,35,64,0.4)",
                  lineHeight: "1.45",
                }}
              >
                Mulai dari{" "}
                <strong style={{ color: leadTheme.primary }}>Rp 49.000</strong>{" "}
                — cocok untuk pemula
              </p>
            </div> */}
          </div>

          {/* ── RIGHT: Category accordions ────────────────────── */}
          <div className="col-span-3 flex flex-col">
            {/* Panel header */}
            <div
              className="flex items-center gap-2 px-4 pt-4 pb-3"
              style={{ borderBottom: "0.5px solid rgba(15,35,64,0.07)" }}
            >
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-slate-300" />
              <p
                className="font-bold uppercase tracking-[0.1em]"
                style={{ fontSize: "0.5625rem", color: "#94A3B8" }}
              >
                Semua Program
              </p>
            </div>

            {/* Accordion groups */}
            <div className="p-3 space-y-2 flex-1">
              {rightColumns.map((col) => (
                <CategoryGroup key={col.id} col={col} onClose={onClose} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Global footer ──────────────────────────────────── */}
        <div
          className="px-5 py-[10px] flex items-center justify-between"
          style={{
            borderTop: "0.5px solid rgba(15,35,64,0.06)",
            background: "#FAFAFA",
          }}
        >
          <p style={{ fontSize: "0.6875rem", color: "#94A3B8" }}>
            Bingung pilih yang mana?
          </p>
          <Link
            href="/programs"
            onClick={onClose}
            className="inline-flex items-center gap-1 font-semibold transition-all duration-150 hover:gap-[7px]"
            style={{
              fontSize: "0.6875rem",
              color: BRAND.blue,
              textDecoration: "none",
            }}
          >
            Lihat semua program
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
