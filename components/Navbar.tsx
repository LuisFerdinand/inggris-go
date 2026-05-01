"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { navLinks } from "@/lib/config";
import WAButton from "./ui/WAButton";
import { ProgramsDropdown } from "./ProgramsDropdown";
import { MobileDrawer, allProgramHrefs } from "./MobileDrawer";
import { UserNav, AuthModalPortal } from "./UserNav";
import { Button } from "./ui/button";

const EASE = [0.22, 1, 0.36, 1] as const;

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar() {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const programsRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isProgramActive = pathname.startsWith("/programs");
  const regularLinks = navLinks.filter((l) => l.label !== "Program Kami");

  // ── Scroll shadow ────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Close everything on route change ────────────────────────────────────
  useEffect(() => {
    setMobileOpen(false);
    setProgramsOpen(false);
  }, [pathname]);

  // ── Close programs dropdown on outside click ─────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        programsRef.current &&
        !programsRef.current.contains(e.target as Node)
      ) {
        setProgramsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openPrograms = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setProgramsOpen(true);
  }, []);

  const scheduleClosePrograms = useCallback(() => {
    closeTimer.current = setTimeout(() => setProgramsOpen(false), 130);
  }, []);

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════
          Navbar bar
      ══════════════════════════════════════════════════════════════════ */}
      <nav
        role="navigation"
        aria-label="Main navigation"
        className={[
          // Layout
          "fixed top-0 inset-x-0 z-[1000] isolate overflow-visible",
          // Background — white with blue-tinted surface
          "bg-[var(--surface)]",
          // Smooth transition for scroll state
          "transition-all duration-300",
          // Scroll shadow — uses brand border + card shadow
          scrolled
            ? "shadow-[0_1px_0_var(--border),0_4px_24px_var(--shadow-soft)]"
            : "shadow-[0_1px_0_var(--border-soft)]",
        ].join(" ")}
      >
        {/* ── Inner container ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
          <div className="flex items-center justify-between h-14 lg:h-[72px] overflow-visible">
            {/* ── Logo ─────────────────────────────────────────────────── */}
            <Link
              href="/"
              className="flex-shrink-0 transition-opacity duration-200 hover:opacity-85"
              aria-label="Inggris Go — Beranda"
            >
              <Image
                src="/logo.png"
                alt="Inggris Go"
                width={120}
                height={40}
                priority
                className="h-9 w-auto object-contain"
              />
            </Link>

            {/* ── Desktop nav ──────────────────────────────────────────── */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8 overflow-visible">
              {/* Left nav links */}
              {regularLinks.slice(0, 2).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${pathname === link.href ? "active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Programs mega dropdown */}
              <div
                ref={programsRef}
                className="relative overflow-visible"
                onMouseEnter={openPrograms}
                onMouseLeave={scheduleClosePrograms}
              >
                <button
                  onClick={() => setProgramsOpen((o) => !o)}
                  aria-haspopup="true"
                  aria-expanded={programsOpen}
                  className={[
                    "nav-link",
                    "flex items-center gap-1",
                    "bg-transparent border-0 p-0 cursor-pointer",
                    isProgramActive ? "active" : "",
                  ].join(" ")}
                >
                  Program Kami
                  <motion.span
                    animate={{ rotate: programsOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    style={{ display: "inline-flex", lineHeight: 0 }}
                  >
                    <ChevronDown
                      className="w-3.5 h-3.5"
                      style={{ color: "inherit" }}
                    />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {programsOpen && (
                    <ProgramsDropdown onClose={() => setProgramsOpen(false)} />
                  )}
                </AnimatePresence>
              </div>

              {/* Right nav links */}
              {regularLinks.slice(2).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${pathname === link.href ? "active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}

              {/* ── WhatsApp CTA — gold gradient (primary brand CTA) ──── */}
              <WAButton
                program="Konsultasi"
                label="Hubungi Kami"
                size="default"
                variant="default"
                className="px-5 py-2 text-sm font-semibold"
              />

              {/* ── Visual separator ──────────────────────────────────── */}
              <div
                className="h-6 w-px flex-shrink-0"
                style={{ background: "var(--border)" }}
                aria-hidden="true"
              />

              {/* ── UserNav — far right ───────────────────────────────── */}
              <UserNav onOpenAuthModal={() => setAuthModalOpen(true)} />
            </div>

            {/* ── Mobile hamburger ─────────────────────────────────────── */}
            <Button
              variant="brand-outline"
              size="icon"
              onClick={() => setMobileOpen((o) => !o)}
              className={[
                "lg:hidden",
                "rounded-xl",
                "transition-all duration-200",

                mobileOpen
                  ? [
                      // ✅ ACTIVE = solid blue button
                      "bg-background",
                      "text-[var(--blue-navy)]",
                      "border-transparent",
                      "shadow-glow-blue-btn",
                    ].join(" ")
                  : [
                      // ✅ DEFAULT = subtle blue outline
                      "border-[var(--border)]",
                      "bg-[var(--surface)]",
                      "text-[var(--blue-navy)]",
                      "hover:bg-[var(--surface-soft)]",
                    ].join(" "),
              ].join(" ")}
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-drawer"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.span
                    key="x"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18, ease: EASE }}
                    style={{ display: "inline-flex" }}
                  >
                    <X
                      className="w-5 h-5"
                      style={{ color: "var(--gold-dark)" }}
                    />
                  </motion.span>
                ) : (
                  <motion.span
                    key="burger"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.18, ease: EASE }}
                    style={{ display: "inline-flex" }}
                  >
                    <Menu
                      className="w-5 h-5"
                      style={{ color: "var(--blue-navy)" }}
                    />
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {/* ── Gold accent line — only visible when scrolled ───────────── */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              key="gold-line"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              aria-hidden="true"
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "2px",
                background:
                  "linear-gradient(90deg, var(--gold-vivid) 0%, var(--gold-dark) 100%)",
                transformOrigin: "left center",
              }}
            />
          )}
        </AnimatePresence>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════
          Mobile Drawer
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <MobileDrawer
            pathname={pathname}
            navLinks={navLinks}
            onClose={() => setMobileOpen(false)}
            onOpenAuthModal={() => {
              setMobileOpen(false);
              setAuthModalOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
          Auth Modal Portal
      ══════════════════════════════════════════════════════════════════ */}
      <AuthModalPortal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}
