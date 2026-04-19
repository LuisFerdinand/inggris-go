"use client";

import {
  leadPrograms,
  rightColumns,
  allProgramHrefs,
} from "./ProgramsDropdown";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { MobileUserSection } from "./UserNav";
import { WhatsAppIcon } from "./ui/WAButton";
import { Button } from "./ui/button";
import { BRAND } from "@/constants/brand";

export { allProgramHrefs };

const EASE = [0.22, 1, 0.36, 1] as const;

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
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full "
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

function SectionLabel({
  children,
  color = "#94A3B8",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <p
      className="font-bold uppercase tracking-[0.14em] px-4"
      style={{
        fontSize: "0.5625rem",
        color,
        paddingTop: "0.5rem",
        paddingBottom: "0.5rem",
      }}
    >
      {children}
    </p>
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

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animDelay, duration: 0.24, ease: EASE }}
    >
      {/* Colored left rail — the only visual grouping mechanism */}
      <div style={{ borderLeft: `2px solid ${col.color}33` }}>
        {/* Category header */}
        <div className="flex items-center justify-between pl-3 pr-0 py-2">
          <Link
            href={col.href}
            onClick={onClose}
            className="flex items-center gap-2 flex-1 min-w-0"
            style={{ textDecoration: "none" }}
          >
            <div
              className="w-[6px] h-[6px] rounded-full flex-shrink-0"
              style={{ background: col.color }}
            />
            <span
              className="font-bold uppercase tracking-[0.12em]"
              style={{ fontSize: "0.625rem", color: col.color }}
            >
              {col.label}
            </span>
            {/* <span
              className="truncate"
              style={{ fontSize: "0.625rem", color: "#CBD5E1" }}
            >
              {col.description}
            </span> */}
          </Link>

          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1 pl-2 pr-1 py-1 flex-shrink-0"
            aria-label={open ? "Tutup" : "Buka"}
          >
            <span
              style={{
                fontSize: "0.5625rem",
                color: "#CBD5E1",
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {col.items.length}
            </span>
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="inline-flex"
            >
              <ChevronDown
                className="w-3 h-3"
                style={{ color: open ? col.color : "#CBD5E1" }}
              />
            </motion.span>
          </button>
        </div>

        {/* Expandable items */}
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
                    className="flex items-center justify-between pl-5 pr-1"
                    style={{
                      paddingTop: "0.5rem",
                      paddingBottom: "0.5rem",
                      borderTop: "1px solid rgba(15,35,64,0.04)",
                      textDecoration: "none",
                    }}
                  >
                    <span
                      className="font-normal transition-colors duration-150"
                      style={{
                        fontSize: "0.7rem",
                        color: isActive ? col.color : "#334155",
                      }}
                    >
                      {item.label}
                    </span>
                    {/* <span
                      className="ml-3 flex-shrink-0"
                      style={{ fontSize: "0.6875rem", color: "#CBD5E1" }}
                    >
                      {item.desc}
                    </span> */}
                  </Link>
                );
              })}
              <div style={{ height: 6 }} />
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
}: {
  pathname: string;
  onClose: () => void;
}) {
  return (
    <div className="pl-6 pb-3">
      {/* ── Lead programs ── */}
      <SectionLabel color={BRAND.blue}>Mulai dari sini</SectionLabel>

      {/* Orange left rail groups the lead programs as a visual unit */}
      <div
        className="mx-4"
        style={{ borderLeft: "2px solid rgba(255,107,53,0.2)" }}
      >
        {leadPrograms.map((prog, i) => {
          const isActive = pathname === prog.href;
          return (
            <motion.div
              key={prog.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.24, ease: EASE }}
              style={{
                borderBottom:
                  i < leadPrograms.length - 1
                    ? "1px solid rgba(15,35,64,0.05)"
                    : "none",
              }}
            >
              <Link
                href={prog.href}
                onClick={onClose}
                className="flex items-center justify-between pl-4 pr-3 py-3 group"
                style={{ textDecoration: "none" }}
              >
                <div className="min-w-0">
                  <p
                    className="font-semibold leading-tight transition-colors duration-150"
                    style={{
                      fontSize: "0.9375rem",
                      color: isActive ? BRAND.blue : "#0F2340",
                    }}
                  >
                    {prog.title}
                  </p>
                  <p
                    className="mt-0.5 leading-tight"
                    style={{ fontSize: "0.75rem", color: "#94A3B8" }}
                  >
                    {prog.desc}
                  </p>
                </div>
                <ChevronRight
                  className="w-3.5 h-3.5 flex-shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  style={{ color: BRAND.blue }}
                />
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* ── All programs ── */}
      <SectionLabel>Semua program</SectionLabel>

      <div className="px-4 space-y-3">
        {rightColumns.map((col, ci) => (
          <MobileCategoryGroup
            key={col.id}
            col={col}
            pathname={pathname}
            onClose={onClose}
            animDelay={0.04 + 0.05 * ci}
          />
        ))}
      </div>

      {/* ── Consult nudge ── */}
      <div
        className="flex items-center justify-between mx-4 mt-5 pt-3"
        style={{ borderTop: "1px solid rgba(15,35,64,0.06)" }}
      >
        <p style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
          Bingung pilih yang mana?
        </p>
        <Link
          href="/contact"
          onClick={onClose}
          className="inline-flex items-center gap-1 font-semibold"
          style={{
            fontSize: "0.75rem",
            color: BRAND.blue,
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
        className="fixed top-0 right-0 bottom-0 z-50 lg:hidden flex flex-col"
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
                <MobileProgramPanel pathname={pathname} onClose={onClose} />
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
