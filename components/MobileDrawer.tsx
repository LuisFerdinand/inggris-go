"use client";

import {
  LEAD_PROGRAMS,
  RIGHT_COLUMNS,
  allProgramHrefs,
} from "./ProgramsDropdown";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, LayoutGrid, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { MobileUserSection } from "./UserNav";
import { WhatsAppIcon } from "./ui/WAButton";
import { Button } from "./ui/button";
import { NAV_ICONS } from "@/constants";

export { allProgramHrefs };

const EASE = [0.22, 1, 0.36, 1] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type RowState = "default" | "hover" | "active";

function resolveRowState(
  isActive: boolean,
  isHovered: boolean,
  isExpanded: boolean,
): RowState {
  if (isActive) return "active";
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
    border: "1.5px solid rgba(15,35,64,0.09)",
    iconBg: "#F1F5F9",
    iconColor: "#94A3B8",
    textColor: "#0F2340",
    chevronColor: "#94A3B8",
  },
  hover: {
    bg: "rgba(255,107,53,0.04)",
    border: "1.5px solid rgba(255,107,53,0.18)",
    iconBg: "rgba(255,107,53,0.1)",
    iconColor: "#FF6B35",
    textColor: "#CC4D1F",
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

// ─── MobileNavRow ─────────────────────────────────────────────────────────────

function MobileNavRow({
  href,
  label,
  delay = 0,
  isActive,
  hasChevron = false,
  chevronOpen = false,
  merged = false,
  onClick,
}: {
  href?: string;
  label: string;
  delay?: number;
  isActive: boolean;
  hasChevron?: boolean;
  chevronOpen?: boolean;
  merged?: boolean;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = NAV_ICONS[href ?? ""] ?? LayoutGrid;
  const s = ROW_STYLES[resolveRowState(isActive, hovered, chevronOpen)];

  const inner = (
    <div
      className="flex items-center gap-3.5 w-full px-3 py-3 transition-all duration-200"
      style={{
        background: s.bg,
        border: s.border,
        borderRadius: merged ? "1rem 1rem 0 0" : "1rem",
      }}
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
          transition={{ duration: 0.22, ease: EASE }}
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
      transition={{ delay, duration: 0.28, ease: EASE }}
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

// ─── MobileCategoryGroup ──────────────────────────────────────────────────────

function MobileCategoryGroup({
  col,
  pathname,
  onClose,
}: {
  col: (typeof RIGHT_COLUMNS)[0];
  pathname: string;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(col.defaultOpen);
  const Icon = col.icon;

  return (
    <div
      className="rounded-[9px] overflow-hidden"
      style={{ border: "0.5px solid rgba(15,35,64,0.08)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-2.5 py-[8px]"
        style={{
          background: open ? "rgba(15,35,64,0.02)" : "transparent",
          borderBottom: open ? "0.5px solid rgba(15,35,64,0.07)" : "none",
        }}
      >
        {/* LEFT: Navigate to category */}
        <Link
          href={col.href}
          onClick={onClose}
          className="flex items-center gap-2 flex-1 min-w-0"
          style={{ textDecoration: "none" }}
        >
          <div
            className="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center flex-shrink-0"
            style={{ background: col.iconBg }}
          >
            <Icon className="w-[10px] h-[10px]" style={{ color: col.color }} />
          </div>

          <div>
            <p
              className="font-semibold leading-none"
              style={{ fontSize: "0.6875rem", color: "#0F2340" }}
            >
              {col.label}
            </p>
            <p
              style={{
                fontSize: "0.5625rem",
                color: "#94A3B8",
                marginTop: 1,
              }}
            >
              {col.description}
            </p>
          </div>
        </Link>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-1.5 ml-2">
          {/* Count */}
          <span
            className="flex-shrink-0 font-semibold rounded-full px-1.5 py-0.5"
            style={{
              fontSize: "0.5rem",
              background: "rgba(15,35,64,0.06)",
              color: "#64748B",
            }}
          >
            {col.items.length}
          </span>

          {/* Toggle */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="p-1 rounded active:bg-gray-100 transition"
          >
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="inline-flex items-center"
            >
              <ChevronDown
                className="w-3 h-3"
                style={{ color: open ? "#FF6B35" : "#94A3B8" }}
              />
            </motion.span>
          </button>
        </div>
      </div>

      {/* Accordion items */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            {col.items.map((item, ii) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center justify-between px-2.5 py-[7px] transition-colors active:bg-orange-50"
                  style={{
                    borderBottom:
                      ii < col.items.length - 1
                        ? "0.5px solid rgba(15,35,64,0.06)"
                        : "none",
                    background: isActive
                      ? "rgba(255,107,53,0.05)"
                      : "transparent",
                    textDecoration: "none",
                  }}
                >
                  <span
                    className="font-medium"
                    style={{
                      fontSize: "0.75rem",
                      color: isActive ? "#FF6B35" : "#1E293B",
                    }}
                  >
                    {item.label}
                  </span>

                  <span
                    style={{
                      fontSize: "0.65625rem",
                      color: "#94A3B8",
                    }}
                  >
                    {item.desc}
                  </span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MobileProgramPanel ───────────────────────────────────────────────────────

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
        background: "rgba(255,107,53,0.02)",
        border: "1.5px solid rgba(255,107,53,0.15)",
        borderTop: "none",
        borderRadius: "0 0 1rem 1rem",
        marginTop: "-1px",
        overflow: "hidden",
      }}
    >
      {/* Lead programs */}
      <div
        className="flex items-center gap-1.5 px-3.5 py-2"
        style={{ background: "rgba(255,107,53,0.05)" }}
      >
        <div className="w-1 h-1 rounded-full bg-[#FF6B35]" />
        <span
          className="font-bold uppercase tracking-[0.1em]"
          style={{ fontSize: "0.5rem", color: "rgba(255,107,53,0.8)" }}
        >
          Mulai dari Sini
        </span>
      </div>

      <div className="px-2.5 pt-2 pb-1 space-y-1.5">
        {LEAD_PROGRAMS.map((prog, i) => {
          const Icon = prog.icon;
          return (
            <motion.div
              key={prog.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.22, ease: EASE }}
            >
              <Link
                href={prog.href}
                onClick={onClose}
                className="flex items-center gap-2.5 p-2.5 rounded-[9px] active:scale-[0.99] transition-transform"
                style={{
                  background: "rgba(255,107,53,0.05)",
                  border: "0.5px solid rgba(255,107,53,0.10)",
                  textDecoration: "none",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
                    boxShadow: "0 3px 10px rgba(255,107,53,0.28)",
                  }}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold"
                    style={{ fontSize: "0.8125rem", color: "#0F2340" }}
                  >
                    {prog.title}
                  </p>
                  <p
                    style={{
                      fontSize: "0.6875rem",
                      color: "#94A3B8",
                      marginTop: 1,
                    }}
                  >
                    {prog.desc}
                  </p>
                </div>
                <ChevronRight
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: "#FF6B35" }}
                />
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Category accordion groups */}
      <div
        className="flex items-center gap-1.5 px-3.5 py-2 mt-1"
        style={{
          background: "rgba(255,107,53,0.05)",
          borderTop: "0.5px solid rgba(255,107,53,0.08)",
        }}
      >
        <div className="w-1 h-1 rounded-full bg-slate-300" />
        <span
          className="font-bold uppercase tracking-[0.1em]"
          style={{ fontSize: "0.5rem", color: "#94A3B8" }}
        >
          Semua Program
        </span>
      </div>

      <div className="px-2.5 pt-1.5 pb-2 space-y-1.5">
        {RIGHT_COLUMNS.map((col, ci) => (
          <motion.div
            key={col.id}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.04 + 0.05 * ci, duration: 0.22, ease: EASE }}
          >
            <MobileCategoryGroup
              col={col}
              pathname={pathname}
              onClose={onClose}
            />
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-3.5 py-2"
        style={{ borderTop: "0.5px solid rgba(255,107,53,0.08)" }}
      >
        <p style={{ fontSize: "0.6875rem", color: "#94A3B8" }}>
          Bingung pilih yang mana?
        </p>
        <Link
          href="/contact"
          onClick={onClose}
          className="inline-flex items-center gap-1 font-semibold"
          style={{
            fontSize: "0.6875rem",
            color: "#FF6B35",
            textDecoration: "none",
          }}
        >
          Konsultasi gratis <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// ─── MobileDrawer ─────────────────────────────────────────────────────────────

export function MobileDrawer({
  pathname,
  navLinks,
  onClose,
  onOpenAuthModal,
}: {
  pathname: string;
  navLinks: readonly { href: string; label: string }[];
  onClose: () => void;
  onOpenAuthModal: () => void;
}) {
  const [progOpen, setProgOpen] = useState(allProgramHrefs.includes(pathname));
  const { data: session } = authClient.useSession();

  const regularLinks = navLinks.filter((l) => l.label !== "Program Kami");
  const beforePrograms = regularLinks.slice(0, 2);
  const afterPrograms = regularLinks.slice(2);
  const isProgramActive = allProgramHrefs.includes(pathname);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-0 z-40 lg:hidden"
        style={{
          background: "rgba(15,35,64,0.45)",
          backdropFilter: "blur(6px)",
        }}
        onClick={onClose}
        aria-hidden="true"
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
        role="navigation"
        aria-label="Mobile menu"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 flex-shrink-0"
          style={{ height: 64, borderBottom: "1px solid rgba(15,35,64,0.07)" }}
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
          <Button
            variant="brand-outline"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-gray-100"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" style={{ color: "#0F2340" }} />
          </Button>
        </div>

        {/* Scrollable nav */}
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

          <div>
            <MobileNavRow
              label="Program Kami"
              delay={0.08}
              isActive={isProgramActive}
              hasChevron
              chevronOpen={progOpen}
              merged={progOpen}
              onClick={() => setProgOpen((o) => !o)}
            />
            <AnimatePresence>
              {progOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: EASE }}
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

        {/* Footer */}
        <div
          className="flex-shrink-0 px-3 pb-8 pt-4 space-y-3"
          style={{ borderTop: "1px solid rgba(15,35,64,0.07)" }}
        >
          <MobileUserSection
            onClose={onClose}
            onOpenAuthModal={onOpenAuthModal}
          />
          <Button variant="secondary" size="brand-full" className="py-3">
            <WhatsAppIcon className="size-5" />
            Hubungi Kami Sekarang
          </Button>
          <p
            className="text-center"
            style={{ fontSize: "0.6875rem", color: "#94A3B8" }}
          >
            Respon cepat · Konsultasi gratis · Tanpa syarat
          </p>
        </div>
      </motion.aside>
    </>
  );
}
