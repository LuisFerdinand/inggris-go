"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND, GRADIENT_GOLD_TEXT } from "@/constants/brand";

const ease = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export default function HeroAnimated() {
  const reduced = useReducedMotion();

  // FIX: hover state managed in React instead of mutating DOM style directly
  const [primaryHovered, setPrimaryHovered] = useState(false);
  const [secondaryHovered, setSecondaryHovered] = useState(false);

  return (
    <section
      aria-label="Hero section"
      className="relative w-full overflow-hidden"
      style={{ background: BRAND.gradientPage }}
    >
      {/* FIX: blob @keyframes moved to global.css; replaced inline <style> block
               with Tailwind animate-blob / animate-blob-reverse utility classes */}

      {/* ── Decorative blob — gold tint (top-left) ── */}
      <div
        aria-hidden
        className={reduced ? "" : "animate-blob"}
        style={{
          position: "absolute",
          top: "8%",
          left: "-7%",
          width: "clamp(220px, 28vw, 400px)",
          height: "clamp(220px, 28vw, 400px)",
          background: BRAND.overlayGoldBlob,
          borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
        }}
      />

      {/* ── Decorative blob — blue tint (bottom-right) ── */}
      <div
        aria-hidden
        className={reduced ? "" : "animate-blob-reverse"}
        style={{
          position: "absolute",
          bottom: "-2%",
          right: "-6%",
          width: "clamp(250px, 32vw, 460px)",
          height: "clamp(250px, 32vw, 460px)",
          background: BRAND.overlayBlueBlob,
          borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 xl:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* ────────────────── Left column ────────────────── */}
          <motion.div variants={container} initial="hidden" animate="show">
            {/* Badge */}
            <motion.div variants={item} className="mb-6">
              <span
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full"
                style={{
                  background: BRAND.surface,
                  color: BRAND.blueNavy,
                  boxShadow: BRAND.shadowSoft,
                }}
              >
                <span className="relative flex h-2 w-2 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Kampung Inggris Pare, Indonesia
              </span>
            </motion.div>

            {/* Heading — gold clip-text on highlight span, navy on the rest */}
            <motion.h1
              variants={item}
              className="font-display font-extrabold leading-[1.08] mb-6"
              style={{
              color: BRAND.blueNavy,
                fontSize: "clamp(2.2rem, 4.5vw, 3.75rem)",
                letterSpacing: "-0.02em",
              }}
            >
              Belajar Bahasa Inggris{" "}
              {/* FIX: uses GRADIENT_GOLD_TEXT export (CSSProperties) instead of
                       BRAND.gradientGoldText (was an object inside a string record) */}
              <span style={GRADIENT_GOLD_TEXT}>Tanpa Takut Salah</span>
            </motion.h1>

            {/* Lead paragraph */}
            {/* FIX: replaced inline maxWidth string with Tailwind max-w-[480px] */}
            <motion.p
              variants={item}
              className="text-xl leading-relaxed mb-2 max-w-[480px]"
              style={{ color: BRAND.textMuted }}
            >
              Mulai berbicara bahasa Inggris dengan percaya diri bersama{" "}
              <strong style={{ color: BRAND.blue, fontWeight: 600 }}>
                Inggris Go
              </strong>{" "}
              dari Kampung Inggris Pare.
            </motion.p>

            {/* Sub paragraph */}
            <motion.p
              variants={item}
              className="text-base leading-relaxed mb-8 max-w-[480px]"
              style={{ color: BRAND.textFaint }}
            >
              Inggris Go membantu pemula belajar speaking dengan cara yang
              sederhana, praktis, dan menyenangkan melalui program online,
              privat, dan English camp.
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={item} className="flex flex-wrap gap-3 mb-10">
              {/* Primary CTA — gold gradient (intentional brand choice) */}
              {/* FIX: hover shadow now uses useState instead of direct DOM mutation */}
              <Link
                href="/speaking-challenge"
                className="inline-flex items-center gap-2 font-bold text-base rounded-full px-8 py-4 transition-transform duration-200 hover:-translate-y-0.5"
                style={{
                  background: BRAND.gradientGold,
                  boxShadow: primaryHovered
                    ? BRAND.shadowGoldBtnHover
                    : BRAND.shadowGoldBtn,
                  color: "#3a1c00",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={() => setPrimaryHovered(true)}
                onMouseLeave={() => setPrimaryHovered(false)}
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Mulai Speaking Challenge
              </Link>

              {/* Secondary CTA — deep navy gradient */}
              <a
                href="#programs"
                className="inline-flex items-center font-bold text-base text-white rounded-full px-8 py-4 transition-transform duration-200 hover:-translate-y-0.5"
                style={{
                  background: BRAND.gradientNavy,
                  boxShadow: secondaryHovered
                    ? BRAND.shadowNavyBtnHover
                    : BRAND.shadowNavyBtn,
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={() => setSecondaryHovered(true)}
                onMouseLeave={() => setSecondaryHovered(false)}
              >
                Lihat Semua Program
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={item}
              className="flex items-center gap-6 sm:gap-8 flex-wrap"
            >
              {[
                { value: "500+", label: "Siswa Bergabung", color: BRAND.blue },
                {
                  value: "4.9★",
                  label: "Rating Kepuasan",
                  color: BRAND.blueVivid,
                },
                {
                  value: "5+",
                  label: "Tahun Pengalaman",
                  color: BRAND.blueNavy,
                },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-6 sm:gap-8"
                >
                  {i > 0 && (
                    <div
                      style={{
                        width: "1px",
                        height: "48px",
                        background: BRAND.borderSoft,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div>
                    <p
                      className="font-display font-bold leading-none mb-1"
                      style={{ fontSize: "1.875rem", color: stat.color }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-sm" style={{ color: BRAND.textFaint }}>
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ────────────────── Right column ────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, delay: 0.3, ease }}
            className="relative hidden lg:flex justify-center"
          >
            <div
              className="relative rounded-3xl p-8 xl:p-12 w-full"
              style={{
                maxWidth: "440px",
                background: BRAND.gradientHeroCardWrap,
              }}
            >
              {/* Floating inner card */}
              <motion.div
                animate={reduced ? {} : { y: [0, -10, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut",
                }}
                className="rounded-2xl p-6"
                style={{
                  background: BRAND.surface,
                  boxShadow: BRAND.shadowCard,
                }}
              >
                {/* Card header */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: BRAND.surfaceSoft }}
                  >
                    <svg
                      className="w-8 h-8"
                      fill={BRAND.blue}
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: BRAND.blueNavy }}>
                      Live Speaking Practice
                    </p>
                    <p className="text-sm" style={{ color: BRAND.textFaint }}>
                      dengan Tutor Berpengalaman
                    </p>
                  </div>
                </div>

                {/* Practice rows */}
                <div className="space-y-3">
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: BRAND.surfaceSoft }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: BRAND.overlayBlueIcon }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill={BRAND.blue}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </div>
                    <p className="text-sm" style={{ color: BRAND.blueNavy }}>
                      &ldquo;Hello! How are you today?&rdquo;
                    </p>
                  </div>

                  <div
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: BRAND.surfaceSoft }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: BRAND.overlayBlueIconStrong }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill={BRAND.blueVivid}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                      </svg>
                    </div>
                    <p className="text-sm" style={{ color: BRAND.blueNavy }}>
                      &ldquo;I&apos;m fine, thank you!&rdquo;
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* GO! badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.75, duration: 0.4, ease }}
                className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                style={{
                  background: BRAND.gradientBlue,
                  boxShadow: BRAND.shadowBlue,
                }}
              >
                GO!
              </motion.div>

              {/* Bottom floating tag */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.95, duration: 0.4, ease }}
                className="absolute -bottom-4 -left-4 rounded-xl px-4 py-2"
                style={{
                  background: BRAND.surface,
                  boxShadow: BRAND.shadowTag,
                }}
              >
                <p
                  className="text-sm font-semibold"
                  style={{ color: BRAND.blue }}
                >
                  🎯 Start Speaking Today!
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
