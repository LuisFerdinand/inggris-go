// components/MobileDrawer.tsx
"use client";

import {
  buildDropdownData,
  rightColumns, // kept for the `typeof rightColumns` type alias below
  allProgramHrefs,
  type MenuCategory,
} from "./ProgramsDropdown";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MobileUserSection } from "./UserNav";
import { WhatsAppIcon } from "./ui/WAButton";
import { Button } from "./ui/button";
import { BRAND } from "@/constants/brand";
import { generateTheme } from "@/lib/utils";

export { allProgramHrefs };

const EASE = [0.22, 1, 0.36, 1] as const;

type DropdownData = ReturnType<typeof buildDropdownData>;

// ─── MobileNavRow ─────────────────────────────────────────────────────────────

function MobileNavRow({
  href,
  label,
  delay = 0,
  isActive,
  hasChevron = false,
  chevronOpen = false,
  onClick,
}: {
  href?: string;
  label: string;
  delay?: number;
  isActive: boolean;
  hasChevron?: boolean;
  chevronOpen?: boolean;
  onClick?: () => void;
}) {
  const inner = (
    <div className="relative flex items-center justify-between w-full py-3 pl-4 pr-1">
      <motion.div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full"
        animate={{ height: isActive ? 20 : 0, opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.22, ease: EASE }}
        style={{ background: BRAND.blue }}
      />
      <span
        className="font-display font-semibold tracking-[-0.01em] transition-colors duration-200"
        style={{
          fontSize: "1.0625rem",
          color: isActive ? BRAND.blue : "#0F2340",
        }}
      >
        {label}
      </span>
      {hasChevron && (
        <motion.span
          animate={{ rotate: chevronOpen ? 180 : 0 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="flex-shrink-0 ml-2"
        >
          <ChevronDown
            className="w-4 h-4 transition-colors duration-200"
            style={{ color: chevronOpen ? BRAND.blue : "#CBD5E1" }}
          />
        </motion.span>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3, ease: EASE }}
      style={{ borderBottom: "1px solid rgba(15,35,64,0.06)" }}
    >
      {href && !hasChevron ? (
        <Link
          href={href}
          onClick={onClick}
          className="block w-full"
          style={{ textDecoration: "none" }}
        >
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
  animDelay = 0,
}: {
  col: (typeof rightColumns)[0];
  pathname: string;
  onClose: () => void;
  animDelay?: number;
}) {
  const [open, setOpen] = useState(col.defaultOpen);
  const theme = generateTheme(col.theme.primary);

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animDelay, duration: 0.24, ease: EASE }}
      className=""
    >
      <div
        className="rounded-xl overflow-hidden transition-all duration-200"
        style={{
          border: `1px solid ${open ? theme.border : "rgba(15,35,64,0.07)"}`,
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

        {/* Category header */}
        <div
          className="flex items-center justify-between transition-colors duration-150"
          style={{
            padding: "9px 10px 9px 12px",
            background: open ? theme.soft : "transparent",
            transition: "background 0.15s ease",
          }}
        >
          {/* Left: icon + label — taps to category page */}
          <Link
            href={col.href}
            onClick={onClose}
            className="flex items-center gap-2 flex-1 min-w-0"
            style={{ textDecoration: "none" }}
          >
            <div
              className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center flex-shrink-0 transition-all duration-150"
              style={{
                background: open ? theme.softStrong : theme.soft,
                border: `1px solid ${theme.border}`,
              }}
            >
              {(() => {
                const Icon = col.icon;
                return (
                  <Icon
                    style={{
                      width: "11px",
                      height: "11px",
                      color: theme.primary,
                    }}
                  />
                );
              })()}
            </div>

            <div className="min-w-0">
              <p
                className="font-semibold leading-tight transition-colors duration-150"
                style={{
                  fontSize: "0.75rem",
                  color: open ? theme.strong : "#0F2340",
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
              className="font-semibold transition-all duration-150"
              style={{
                fontSize: "0.5625rem",
                padding: "2px 6px",
                borderRadius: "999px",
                background: open ? theme.soft : "rgba(15,35,64,0.06)",
                color: open ? theme.primary : "#94A3B8",
                border: `1px solid ${open ? theme.border : "transparent"}`,
                fontVariantNumeric: "tabular-nums",
                transition:
                  "background 0.15s ease, color 0.15s ease, border-color 0.15s ease",
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
              aria-label={open ? "Tutup" : "Buka"}
            >
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.22, ease: EASE }}
                className="inline-flex"
              >
                <ChevronDown
                  style={{
                    width: "0.75rem",
                    height: "0.75rem",
                    color: open ? theme.primary : "#CBD5E1",
                    transition: "color 0.15s ease",
                  }}
                />
              </motion.span>
            </button>
          </div>
        </div>

        {/* Expandable items */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { duration: 0.25, ease: EASE },
                opacity: { duration: 0.18 },
              }}
              style={{
                overflow: "hidden",
                borderTop: `1px solid ${theme.border}`,
              }}
              className=""
            >
              {col.items.map((item, ii) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center justify-between transition-all duration-150"
                    style={{
                      padding: "8px 10px 8px 12px",
                      background: isActive ? theme.soft : "transparent",
                      borderBottom:
                        ii < col.items.length - 1
                          ? `1px solid rgba(15,35,64,0.04)`
                          : "none",
                      borderLeft: `2px solid ${isActive ? theme.primary : "transparent"}`,
                      textDecoration: "none",
                      transition:
                        "background 0.15s ease, border-color 0.15s ease",
                    }}
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-medium leading-tight transition-colors duration-150"
                          style={{
                            fontSize: "0.8125rem",
                            color: isActive ? theme.primary : "#1E293B",
                          }}
                        >
                          {item.label}
                        </span>
                      </div>
                      {item.desc && (
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            color: "#94A3B8",
                            marginTop: "1px",
                            lineHeight: "1.4",
                          }}
                        >
                          {item.desc}
                        </span>
                      )}
                    </div>

                    <ChevronRight
                      style={{
                        width: "0.75rem",
                        height: "0.75rem",
                        color: isActive ? theme.primary : "#CBD5E1",
                        flexShrink: 0,
                        marginLeft: "0.5rem",
                      }}
                    />
                  </Link>
                );
              })}

              {/* Per-category "see all" footer */}
              <Link
                href={col.href}
                onClick={onClose}
                className="flex items-center justify-between"
                style={{
                  padding: "8px 10px 8px 12px",
                  background: theme.soft,
                  borderTop: `1px solid ${theme.border}`,
                  textDecoration: "none",
                }}
              >
                <span
                  className="font-semibold"
                  style={{ fontSize: "0.6875rem", color: theme.primary }}
                >
                  Lihat semua {col.shortLabel}
                </span>
                <ChevronRight
                  style={{
                    width: "0.75rem",
                    height: "0.75rem",
                    color: theme.primary,
                  }}
                />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── MobileProgramPanel ───────────────────────────────────────────────────────

function MobileProgramPanel({
  pathname,
  onClose,
  data,
}: {
  pathname: string;
  onClose: () => void;
  data: DropdownData;
}) {
  const { leadHref, leadTheme, leadPrograms, rightColumns: rCols } = data;

  return (
    <div className="pb-3 pl-4">
      {/* ══ Lead programs ══════════════════════════════════════ */}
      <div
        className="mx-4 my-2 rounded-xl overflow-hidden"
        style={{
          background: leadTheme.soft,
          border: `1px solid ${leadTheme.border}`,
        }}
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-3 py-2.5"
          style={{ borderBottom: `1px solid ${leadTheme.border}` }}
        >
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: leadTheme.primary }}
            />
            <p
              className="font-bold uppercase tracking-[0.12em]"
              style={{ fontSize: "0.5625rem", color: leadTheme.primary }}
            >
              Mulai dari Sini
            </p>
          </div>
          <Link
            href={leadHref}
            onClick={onClose}
            className="flex items-center gap-0.5 font-semibold transition-opacity duration-150 hover:opacity-70"
            style={{
              fontSize: "0.5625rem",
              color: leadTheme.primary,
              textDecoration: "none",
              letterSpacing: "0.04em",
            }}
          >
            Lihat semua
            <ChevronRight style={{ width: "0.6875rem", height: "0.6875rem" }} />
          </Link>
        </div>

        {/* Lead program items */}
        <div
          className="divide-y"
          style={{ "--divide-color": leadTheme.border } as React.CSSProperties}
        >
          {leadPrograms.map((prog, i) => {
            const isActive = pathname === prog.href;
            const Icon = prog.icon;

            return (
              <motion.div
                key={prog.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.03 * i, duration: 0.24, ease: EASE }}
                style={{
                  borderTop: i > 0 ? `1px solid ${leadTheme.border}` : "none",
                }}
              >
                <Link
                  href={prog.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-3 group"
                  style={{
                    background: isActive ? leadTheme.softStrong : "transparent",
                    borderLeft: `2px solid ${isActive ? leadTheme.primary : "transparent"}`,
                    textDecoration: "none",
                    transition:
                      "background 0.15s ease, border-color 0.15s ease",
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isActive ? leadTheme.softStrong : "white",
                      border: `1px solid ${leadTheme.border}`,
                    }}
                  >
                    <Icon
                      style={{
                        width: "0.875rem",
                        height: "0.875rem",
                        color: leadTheme.primary,
                      }}
                    />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p
                        className="font-semibold leading-tight"
                        style={{
                          fontSize: "0.875rem",
                          color: isActive ? leadTheme.primary : "#0F2340",
                        }}
                      >
                        {prog.title}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    style={{
                      width: "0.875rem",
                      height: "0.875rem",
                      color: leadTheme.primary,
                    }}
                  />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ══ All programs (category accordions) ════════════════ */}
      <div className="flex items-center gap-2 px-4 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
        <p
          className="font-bold uppercase tracking-[0.12em]"
          style={{ fontSize: "0.5625rem", color: "#94A3B8" }}
        >
          Semua Program
        </p>
      </div>

      <div className="px-4 space-y-2">
        {rCols.map((col, ci) => (
          <MobileCategoryGroup
            key={col.id}
            col={col}
            pathname={pathname}
            onClose={onClose}
            animDelay={0.04 + 0.05 * ci}
          />
        ))}
      </div>

      {/* ══ Consult nudge ══════════════════════════════════════ */}
      <div
        className="flex items-center justify-between mx-4 mt-2 pt-2"
        style={{ borderTop: "1px solid rgba(15,35,64,0.06)" }}
      >
        <p style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
          Bingung pilih yang mana?
        </p>
        <Link
          href="/programs"
          onClick={onClose}
          className="inline-flex items-center gap-1 font-semibold"
          style={{
            fontSize: "0.75rem",
            color: BRAND.blue,
            textDecoration: "none",
          }}
        >
          Lihat selengkapnya <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// ─── MobileDrawer ─────────────────────────────────────────────────────────────

export function MobileDrawer({
  pathname,
  navLinks,
  categories,
  onClose,
  onOpenAuthModal,
}: {
  pathname: string;
  navLinks: readonly { href: string; label: string }[];
  categories: MenuCategory[];
  onClose: () => void;
  onOpenAuthModal: () => void;
}) {
  // Build once from the DB menu (with static fallback) — same source as desktop.
  const data = buildDropdownData(categories);
  const programHrefs = [
    ...data.leadPrograms.map((p) => p.href),
    ...data.rightColumns.flatMap((c) => c.items.map((i) => i.href)),
  ];

  const [progOpen, setProgOpen] = useState(programHrefs.includes(pathname));

  const regularLinks = navLinks.filter((l) => l.label !== "Program Kami");
  const beforePrograms = regularLinks.slice(0, 2);
  const afterPrograms = regularLinks.slice(2);
  const isProgramActive = pathname.startsWith("/programs");
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-0 z-[1500] lg:hidden"
        style={{
          background: "rgba(15,35,64,0.35)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 230 }}
        className="fixed top-0 right-0 bottom-0 z-[2000] lg:hidden flex flex-col"
        style={{
          width: "min(85vw, 320px)",
          background: "white",
          boxShadow: "-12px 0 50px rgba(15,35,64,0.12)",
        }}
        role="navigation"
        aria-label="Mobile menu"
        id="mobile-drawer"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 flex-shrink-0"
          style={{ height: 60, borderBottom: "1px solid rgba(15,35,64,0.06)" }}
        >
          <Link href="/" onClick={onClose}>
            <Image
              src="/logo.png"
              alt="Inggris Go"
              width={90}
              height={30}
              className="h-7 w-auto object-contain"
            />
          </Link>
          <button
            onClick={onClose}
            aria-label="Tutup menu"
            className="text-xs font-semibold uppercase tracking-widest transition-colors duration-150"
            style={{ color: "#94A3B8", letterSpacing: "0.12em" }}
          >
            Tutup
          </button>
        </div>

        {/* Scrollable nav list */}
        <div className="flex-1 overflow-y-auto overscroll-contain pt-2 pb-4">
          <div className="px-4">
            {beforePrograms.map((link, i) => (
              <MobileNavRow
                key={link.href}
                href={link.href}
                label={link.label}
                delay={0.03 * i}
                isActive={pathname === link.href}
                onClick={onClose}
              />
            ))}
          </div>

          <div className="px-4">
            <MobileNavRow
              label="Program Kami"
              delay={0.06}
              isActive={isProgramActive}
              hasChevron
              chevronOpen={progOpen}
              onClick={() => setProgOpen((o) => !o)}
            />
          </div>

          <AnimatePresence>
            {progOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: EASE }}
                style={{ overflow: "hidden" }}
              >
                <MobileProgramPanel
                  pathname={pathname}
                  onClose={onClose}
                  data={data}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="px-4">
            {afterPrograms.map((link, i) => (
              <MobileNavRow
                key={link.href}
                href={link.href}
                label={link.label}
                delay={0.03 * (i + 3)}
                isActive={pathname === link.href}
                onClick={onClose}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex-shrink-0 px-4 pb-8 pt-4 space-y-3"
          style={{ borderTop: "1px solid rgba(15,35,64,0.06)" }}
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