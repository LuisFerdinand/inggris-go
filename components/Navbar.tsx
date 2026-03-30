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

// ─── Constants ────────────────────────────────────────────────────────────────

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

  const isProgramActive = allProgramHrefs.includes(pathname);
  const regularLinks = navLinks.filter((l) => l.label !== "Program Kami");

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close everything on route change
  useEffect(() => {
    setMobileOpen(false);
    setProgramsOpen(false);
  }, [pathname]);

  // Close programs dropdown on outside click
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
      {/* ── Navbar bar ── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 overflow-visible bg-white transition-all duration-300 ${
          scrolled ? "shadow-sm border-b border-slate-900/5" : "shadow-sm"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
          <div className="flex items-center justify-between h-14 lg:h-[72px] overflow-visible">
            {/* Logo */}
            <Link
              href="/"
              className="flex-shrink-0"
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

            {/* ── Desktop nav ── */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8 overflow-visible">
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
                  className={`nav-link flex items-center gap-1 bg-transparent border-0 p-0 cursor-pointer ${
                    isProgramActive ? "active" : ""
                  }`}
                  aria-haspopup="true"
                  aria-expanded={programsOpen}
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

              {regularLinks.slice(2).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${pathname === link.href ? "active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}

              {/* WhatsApp CTA */}
              <WAButton
                program="Konsultasi"
                label="Hubungi Kami"
                size="default"
                className="px-6 py-2.5 text-sm"
              />

              {/* Visual separator */}
              <div
                className="h-6 w-px flex-shrink-0"
                style={{ background: "rgba(15,35,64,0.1)" }}
                aria-hidden="true"
              />

              {/* UserNav — far right */}
              <UserNav onOpenAuthModal={() => setAuthModalOpen(true)} />
            </div>

            {/* ── Mobile hamburger ── */}
            <Button
              variant={"brand-outline"}
              onClick={() => setMobileOpen((o) => !o)}
              className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-gray-100 cursor-pointer"
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
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
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

      {/* ── Auth Modal Portal ── */}
      <AuthModalPortal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}
