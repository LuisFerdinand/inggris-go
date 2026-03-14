"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { navLinks, siteConfig } from "@/lib/config";
import WAButton from "./ui/WAButton";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 bg-white ${
          scrolled ? "border-brand-navy/5" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20 overflow-visible">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-orange-gradient flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <span className="font-jakarta font-bold text-xl text-brand-navy tracking-tight">
                {siteConfig.name}
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-8 overflow-visible">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${pathname === link.href ? "active" : ""}`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="hidden lg:block">
                <WAButton program="Konsultasi" label="Hubungi Kami" size="sm" />
              </div>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:bg-brand-sand transition-colors"
              aria-label="Toggle menu"
            >
              <motion.span
                animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="block w-5 h-0.5 bg-brand-navy rounded-full origin-center"
              />
              <motion.span
                animate={
                  menuOpen
                    ? { opacity: 0, scaleX: 0 }
                    : { opacity: 1, scaleX: 1 }
                }
                transition={{ duration: 0.2 }}
                className="block w-5 h-0.5 bg-brand-navy rounded-full"
              />
              <motion.span
                animate={
                  menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }
                }
                transition={{ duration: 0.2 }}
                className="block w-5 h-0.5 bg-brand-navy rounded-full origin-center"
              />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-brand-navy/20 backdrop-blur-sm lg:hidden"
              onClick={() => setMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-75 bg-white shadow-float lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-brand-navy/6">
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-gradient flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <span className="font-display font-700 text-base text-brand-navy">
                    {siteConfig.name}
                  </span>
                </Link>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-sand transition-colors text-brand-navy/50"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center px-6 py-3.5 font-display font-600 text-[0.9375rem] transition-colors ${
                        pathname === link.href
                          ? "text-brand-orange bg-brand-orange-light"
                          : "text-brand-navy hover:bg-brand-sand"
                      }`}
                    >
                      {link.label}
                      {pathname === link.href && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-orange" />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="px-6 py-6 border-t border-brand-navy/6">
                <WAButton
                  program="Konsultasi"
                  label="Hubungi Kami"
                  size="md"
                  className="w-full justify-center"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
