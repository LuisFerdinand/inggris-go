"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Mic,
  School,
  Tent,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import * as Icons from "lucide-react";
import { CATEGORIES } from "@/app/programs/[category]/data";
import { BRAND } from "@/constants/brand";

function getIcon(name?: string) {
  if (!name) return Icons.Circle;
  const key = name
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");

  return (Icons as any)[key] || Icons.Circle;
}

export const leadCategory = CATEGORIES["lead"];

export const leadPrograms = leadCategory.programs.map((p) => ({
  id: p.slug,
  title: p.title,
  href: p.href,
  desc: p.description,
  icon: getIcon(p.icon),
}));

export const categories = Object.values(CATEGORIES).filter(
  (cat) => cat.key !== "lead",
);

export const rightColumns = categories.map((cat) => ({
  id: cat.key,
  label: cat.label,
  href: cat.href,
  description: cat.tagline,
  icon: getIcon(cat.icon),
  color: cat.color,
  iconBg: cat.iconBg,
  defaultOpen: false,

  items: cat.programs.map((p) => ({
    label: p.title,
    href: p.href,
    desc: p.description,
  })),
}));

// Single source of truth for active-state detection — consumed by Navbar + MobileDrawer
export const allProgramHrefs = [
  ...leadPrograms.map((p) => p.href),
  ...rightColumns.flatMap((col) => col.items.map((item) => item.href)),
];

const EASE = [0.22, 1, 0.36, 1] as const;

// ─── LeadProgramCard ──────────────────────────────────────────────────────────

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
      className="block rounded-[10px] p-[11px_13px] relative overflow-hidden transition-all duration-150"
      style={{
        background: hovered
          ? "var(--color-support-orange-soft)"
          : "rgba(26,82,200,0.04)",

        border: hovered
          ? "1px solid var(--color-support-orange-border)"
          : "var(--color-support-orange-border)",

        boxShadow: hovered ? "var(--shadow-card)" : "none",
        textDecoration: "none",
      }}
    >
      <div className="flex items-center gap-2.5 mb-1.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-150"
          style={{
            background: hovered
              ? "var(--color-support-orange-soft)"
              : "var(--color-support-orange-soft)",
            border: hovered
              ? "1px solid var(--color-support-orange-border)"
              : "",
          }}
        >
          <Icon
            className="w-3.5 h-3.5 transition-colors duration-150"
            style={{
              color: hovered
                ? "var(--color-support-orange)"
                : "var(--color-support-orange)",
            }}
          />
        </div>
        <span
          className="font-semibold transition-colors duration-150"
          style={{
            fontSize: "0.8125rem",
            color: hovered ? "var(--color-support-orange)" : "#0F2340",
          }}
        >
          {prog.title}
        </span>
        <motion.span
          animate={hovered ? { x: 0, opacity: 1 } : { x: -6, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="ml-auto flex-shrink-0"
        >
          <ChevronRight className="w-3.5 h-3.5" style={{ color: BRAND.blue }} />
        </motion.span>
      </div>
      {prog.desc && (
        <p
          style={{
            fontSize: "0.6875rem",
            color: "#94A3B8",
            lineHeight: "1.45",
          }}
        >
          {prog.desc}
        </p>
      )}
    </Link>
  );
}

// ─── NavItem ──────────────────────────────────────────────────────────────────

function NavItem({
  item,
  onClose,
  isLast,
}: {
  item: (typeof rightColumns)[0]["items"][0];
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
      className="flex items-center justify-between py-[7px] px-[11px] transition-colors duration-100"
      style={{
        background: hovered ? "rgba(15,35,64,0.03)" : "transparent",
        borderBottom: isLast ? "none" : "0.5px solid rgba(15,35,64,0.06)",
        textDecoration: "none",
      }}
    >
      <div className="flex flex-col">
        <span
          className="font-medium leading-tight transition-colors duration-100"
          style={{
            fontSize: "0.78125rem",
            color: hovered ? BRAND.blue : "#1E293B",
          }}
        >
          {item.label}
        </span>
        <span
          style={{ fontSize: "0.65625rem", color: "#94A3B8", marginTop: 1 }}
        >
          {item.desc}
        </span>
      </div>
      <motion.span
        animate={hovered ? { x: 0, opacity: 1 } : { x: -4, opacity: 0 }}
        transition={{ duration: 0.12 }}
        className="flex-shrink-0 ml-2"
      >
        <ChevronRight className="w-3 h-3" style={{ color: BRAND.blue }} />
      </motion.span>
    </Link>
  );
}

// ─── CategoryGroup ────────────────────────────────────────────────────────────

function CategoryGroup({
  col,
  onClose,
}: {
  col: (typeof rightColumns)[0];
  onClose: () => void;
}) {
  const [open, setOpen] = useState(col.defaultOpen);
  const Icon = col.icon;

  return (
    <div className="rounded-[10px] overflow-hidden border border-[rgba(15,35,64,0.08)]">
      <div className="flex items-center justify-between px-[11px] py-[9px]">
        {/* LEFT: Clickable content */}
        <Link
          href={col.href}
          onClick={onClose}
          className="flex items-center gap-2 flex-1 min-w-0 group"
        >
          <div
            className="w-5 h-5 rounded-[5px] flex items-center justify-center"
            style={{ background: col.iconBg }}
          >
            <Icon className="w-[11px] h-[11px]" style={{ color: col.color }} />
          </div>

          <div>
            <p className="font-semibold text-[0.72rem] text-[#0F2340] group-hover:text-foreground transition-colors">
              {col.label}
            </p>
            <p className="text-[0.625rem] text-[#94A3B8]">{col.description}</p>
          </div>
        </Link>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-1.5 ml-2">
          {/* Item count */}
          <span className="text-[0.56rem] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
            {col.items.length}
          </span>

          {/* Toggle button ONLY */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center justify-center w-6 h-6 rounded-md transition-all duration-150"
            style={{
              background: open ? "rgba(255,107,53,0.10)" : "transparent",
            }}
          >
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <ChevronDown
                className="w-3.5 h-3.5 transition-colors"
                style={{
                  color: open ? BRAND.blue : "#94A3B8",
                }}
              />
            </motion.span>
          </button>
        </div>
      </div>

      {/* Accordion */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            {col.items.map((item, i) => (
              <NavItem
                key={item.href}
                item={item}
                onClose={onClose}
                isLast={i === col.items.length - 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── ProgramsDropdown ─────────────────────────────────────────────────────────

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
      {/* Arrow tip */}
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
          {/* ── LEFT: Lead programs ── */}
          <div
            className="col-span-2 p-[18px_16px]"
            style={{
              background: "rgba(255,107,53,0.03)",
              borderRight: "0.5px solid rgba(15,35,64,0.07)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-3">
              <div
                className={`w-[5px] h-[5px] rounded-full `}
                style={{ background: BRAND.blue }}
              />
              <p
                className="font-bold uppercase tracking-[0.1em]"
                style={{ fontSize: "0.5625rem", color: BRAND.blue }}
              >
                Mulai dari Sini
              </p>
            </div>
            <div className="space-y-1.5">
              {leadPrograms.map((prog) => (
                <LeadProgramCard key={prog.id} prog={prog} onClose={onClose} />
              ))}
            </div>
          </div>

          {/* ── RIGHT: Accordion categories ── */}
          <div className="col-span-3 p-[18px_16px]">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-[5px] h-[5px] rounded-full bg-slate-300" />
              <p
                className="font-bold uppercase tracking-[0.1em]"
                style={{ fontSize: "0.5625rem", color: "#94A3B8" }}
              >
                Semua Program
              </p>
            </div>
            <div className="space-y-2">
              {rightColumns.map((col) => (
                <CategoryGroup key={col.id} col={col} onClose={onClose} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-[9px] flex items-center justify-between"
          style={{
            borderTop: "0.5px solid rgba(15,35,64,0.06)",
            background: "#FAFAFA",
          }}
        >
          <p style={{ fontSize: "0.6875rem", color: "#94A3B8" }}>
            Bingung pilih yang mana?
          </p>
          <Link
            href="/contact"
            onClick={onClose}
            className="inline-flex items-center gap-1 font-semibold transition-all duration-150 hover:gap-[7px]"
            style={{
              fontSize: "0.6875rem",
              color: BRAND.blue,
              textDecoration: "none",
            }}
          >
            Konsultasi gratis <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
