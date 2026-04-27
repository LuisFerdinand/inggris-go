"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { BRAND, GRADIENT_GOLD_TEXT } from "@/constants/brand";
import { SOCIAL_PROOF } from "@/constants";

const ease = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
};

// ── Pulsing mic icon (SVG) ──────────────────────────────────────────────────
function MicIcon({ color }: { color: string }) {
  return (
    <svg
      className="w-5 h-5"
      fill={color}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  );
}

// ── Star rating ────────────────────────────────────────────────────────────
function Stars({ count = 5 }: { count?: number }) {
  return (
    <span className="flex gap-px">
      {[...Array(count)].map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 12 12"
          className="w-3 h-3"
          fill="#FBBF24"
          aria-hidden="true"
        >
          <path d="M6 1l1.5 3 3.2.4-2.3 2.2.5 3.2L6 8.2l-2.9 1.6.5-3.2L1.3 4.4l3.2-.4z" />
        </svg>
      ))}
    </span>
  );
}

// ── Waveform bars (decorative) ────────────────────────────────────────────
function WaveformBars({ color }: { color: string }) {
  const heights = [8, 14, 20, 14, 18, 10, 16, 12, 20, 8, 14, 18];
  return (
    <span className="flex items-center gap-[2px]" aria-hidden="true">
      {heights.map((h, i) => (
        <motion.span
          key={i}
          className="rounded-full"
          style={{ width: 2, height: h, background: color, opacity: 0.7 }}
          animate={{ scaleY: [1, 0.4, 1.2, 0.6, 1] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.07,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}

// ── Floating speech bubble ────────────────────────────────────────────────
function SpeechBubble({ reduced }: { reduced: boolean | null }) {
  return (
    <motion.div
      className="absolute z-30"
      style={{
        top: "12%",
        left: "-12%",
        maxWidth: 200,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(16px)",
        borderRadius: "18px 18px 18px 4px",
        padding: "12px 16px",
        boxShadow: "0 8px 32px rgba(10,45,135,0.13)",
        border: `1.5px solid ${BRAND.borderSoft}`,
      }}
      initial={{ opacity: 0, scale: 0.8, x: -10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ delay: 1.1, duration: 0.55, ease }}
    >
      {/* Bubble tail */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: -9,
          left: 14,
          width: 0,
          height: 0,
          borderLeft: "10px solid rgba(255,255,255,0.97)",
          borderRight: "4px solid transparent",
          borderTop: "10px solid rgba(255,255,255,0.97)",
          filter: "drop-shadow(0 2px 2px rgba(10,45,135,0.08))",
        }}
      />

      {/* Avatar + name */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
          style={{
            background: BRAND.surfaceSoft,
            color: BRAND.blueNavy,
            border: `1.5px solid ${BRAND.borderSoft}`,
          }}
        >
          R
        </div>
        <div>
          <p
            className="font-bold leading-none"
            style={{ fontSize: "0.6875rem", color: BRAND.blueNavy }}
          >
            Rina, Surabaya
          </p>
          <Stars />
        </div>
      </div>

      <p
        style={{
          fontSize: "0.6875rem",
          color: BRAND.textMuted,
          lineHeight: 1.55,
          fontStyle: "italic",
          margin: 0,
        }}
      >
        &ldquo;Sekarang aku udah berani ngomong di depan bule!&rdquo;
      </p>
    </motion.div>
  );
}

// ── Floating live-session badge ───────────────────────────────────────────
function LiveBadge() {
  return (
    <motion.div
      className="absolute z-30 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl"
      style={{
        bottom: "10%",
        right: "-10%",
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 8px 32px rgba(10,45,135,0.13)",
        border: `1.5px solid ${BRAND.borderSoft}`,
        minWidth: 160,
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.3, duration: 0.5, ease }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: BRAND.overlayBlueIconStrong }}
      >
        <MicIcon color={BRAND.blueVivid} />
      </div>
      <div>
        <p
          className="font-bold leading-none mb-1"
          style={{ fontSize: "0.75rem", color: BRAND.blueNavy }}
        >
          Live Speaking Now
        </p>
        <WaveformBars color={BRAND.blue} />
      </div>
    </motion.div>
  );
}

// ── Floating active-students pill ──────────────────────────────────────────
function ActiveStudentsBadge() {
  return (
    <motion.div
      className="absolute z-30 flex items-center gap-2 px-3.5 py-2 rounded-full"
      style={{
        top: "38%",
        right: "-8%",
        background: BRAND.gradientBlue,
        boxShadow: BRAND.shadowBlue,
      }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.5, duration: 0.45, ease }}
    >
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
      </span>
      <p
        className="font-bold text-white leading-none"
        style={{ fontSize: "0.6875rem" }}
      >
        {SOCIAL_PROOF.activeStudents}+ Active
      </p>
    </motion.div>
  );
}

// ── Floating conversation mini-card ───────────────────────────────────────
function ConversationCard() {
  return (
    <motion.div
      className="absolute z-30 rounded-2xl overflow-hidden"
      style={{
        bottom: "28%",
        left: "-14%",
        width: 180,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 8px 32px rgba(10,45,135,0.11)",
        border: `1.5px solid ${BRAND.borderSoft}`,
      }}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6, duration: 0.5, ease }}
    >
      {/* Header bar */}
      <div
        className="px-3 py-2 flex items-center gap-2"
        style={{
          background: BRAND.surfaceSoft,
          borderBottom: `1px solid ${BRAND.borderSoft}`,
        }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        <p
          className="font-bold"
          style={{
            fontSize: "0.5875rem",
            color: BRAND.textFaint,
            letterSpacing: "0.06em",
          }}
        >
          SPEAKING PRACTICE
        </p>
      </div>
      {/* Messages */}
      <div className="p-3 space-y-2">
        {[
          { text: "Hello! How are you?", align: "left" },
          { text: "I'm fine, thank you!", align: "right" },
        ].map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.align === "right" ? "justify-end" : "justify-start"}`}
          >
            <span
              className="px-2.5 py-1.5 rounded-xl text-white"
              style={{
                fontSize: "0.625rem",
                background: msg.align === "right" ? BRAND.blue : BRAND.blueNavy,
                borderRadius:
                  msg.align === "right"
                    ? "12px 12px 4px 12px"
                    : "12px 12px 12px 4px",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main radial glow behind image ──────────────────────────────────────────
function ImageGlow() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse 75% 80% at 50% 60%, ${BRAND.overlayBlueBlob} 0%, transparent 70%)`,
        borderRadius: "50%",
        transform: "scale(1.1)",
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export default function HeroAnimated() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();

  // Subtle parallax on the image column
  const imageY = useTransform(scrollY, [0, 500], [0, -40]);

  const [primaryHovered, setPrimaryHovered] = useState(false);
  const [secondaryHovered, setSecondaryHovered] = useState(false);

  return (
    <section
      aria-label="Hero section"
      className="relative w-full overflow-hidden"
      style={{
        background: BRAND.gradientPage,
        paddingTop: "var(--navbar-height)",
      }}
    >
      {/* ── Decorative blobs ── */}
      <div
        aria-hidden
        className={reduced ? "" : "animate-blob"}
        style={{
          position: "absolute",
          top: "6%",
          left: "-8%",
          width: "clamp(200px, 26vw, 380px)",
          height: "clamp(200px, 26vw, 380px)",
          background: BRAND.overlayGoldBlob,
          borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          filter: "blur(1px)",
        }}
      />
      <div
        aria-hidden
        className={reduced ? "" : "animate-blob-reverse"}
        style={{
          position: "absolute",
          bottom: "-4%",
          right: "-7%",
          width: "clamp(240px, 30vw, 440px)",
          height: "clamp(240px, 30vw, 440px)",
          background: BRAND.overlayBlueBlob,
          borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%",
          filter: "blur(1px)",
        }}
      />

      {/* ── Content wrapper ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 xl:px-12 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 xl:gap-16 items-center min-h-[min(88vh,780px)] lg:min-h-0">
          {/* ──────────────────────────────────────────────────────────
              LEFT COLUMN — copy, CTAs, stats
          ────────────────────────────────────────────────────────── */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col"
          >
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

            {/* Headline */}
            <motion.h1
              variants={item}
              className="font-display font-extrabold leading-[1.07] mb-5"
              style={{
                color: BRAND.blueNavy,
                fontSize: "clamp(2.4rem, 4.8vw, 4rem)",
                letterSpacing: "-0.025em",
              }}
            >
              Belajar Bahasa Inggris{" "}
              <span style={GRADIENT_GOLD_TEXT}>Tanpa Takut Salah</span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              variants={item}
              className="text-lg sm:text-xl leading-relaxed mb-2 max-w-[500px]"
              style={{ color: BRAND.textMuted }}
            >
              Mulai berbicara bahasa Inggris dengan percaya diri bersama{" "}
              <strong style={{ color: BRAND.blue, fontWeight: 600 }}>
                Inggris Go
              </strong>{" "}
              dari Kampung Inggris Pare.
            </motion.p>

            <motion.p
              variants={item}
              className="text-base leading-relaxed mb-9 max-w-[480px]"
              style={{ color: BRAND.textFaint }}
            >
              Program online, privat, dan English camp — dirancang khusus agar
              pemula bisa speaking dengan cara yang sederhana, praktis, dan
              menyenangkan.
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={item} className="flex flex-wrap gap-3 mb-10">
              <Link
                href="/programs/lead/speaking-challenge"
                className="inline-flex items-center gap-2 font-bold text-base rounded-full px-8 py-4 transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
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

              <a
                href="#programs"
                className="inline-flex items-center font-bold text-base text-white rounded-full px-8 py-4 transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
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

            {/* Social proof stats */}
            <motion.div
              variants={item}
              className="flex items-center gap-5 sm:gap-8 flex-wrap"
            >
              {[
                {
                  value: `${SOCIAL_PROOF.activeStudents}+`,
                  label: "Siswa Bergabung",
                  color: BRAND.blue,
                },
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
                  className="flex items-center gap-5 sm:gap-8"
                >
                  {i > 0 && (
                    <div
                      style={{
                        width: "1px",
                        height: "44px",
                        background: BRAND.borderSoft,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div>
                    <p
                      className="font-display font-bold leading-none mb-1"
                      style={{ fontSize: "1.75rem", color: stat.color }}
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

          {/* ──────────────────────────────────────────────────────────
              RIGHT COLUMN — human image + floating UI layers
          ────────────────────────────────────────────────────────── */}
          <motion.div
            style={{ y: reduced ? 0 : imageY }}
            className="relative hidden lg:flex justify-center items-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease }}
          >
            {/*
             * OUTER WRAPPER — gives a defined coordinate space for the
             * absolutely-positioned floating elements
             */}
            <div
              className="relative"
              style={{ width: "clamp(340px, 38vw, 480px)", aspectRatio: "4/5" }}
            >
              {/* ── Soft radial glow ── */}
              <ImageGlow />

              {/* ── Decorative ring ── */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  border: `2px dashed ${BRAND.borderSoft}`,
                  borderRadius: "50%",
                  transform: "scale(0.88)",
                  top: "8%",
                  opacity: 0.5,
                }}
              />

              {/* ── Human image ── */}
              <motion.div
                className="relative z-10 w-full h-full flex items-end justify-center"
                // animate={reduced ? {} : { y: [0, -12, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 5.5,
                  ease: "easeInOut",
                }}
              >
                <Image
                  src="/images/categories/online-hero.png"
                  alt="Siswa Inggris Go berbicara dengan percaya diri"
                  fill
                  sizes="(max-width: 1024px) 0px, 38vw"
                  className="object-contain object-bottom"
                  style={{
                    filter: "drop-shadow(0 24px 56px rgba(10,45,135,0.18))",
                  }}
                  priority
                />
              </motion.div>

              {/* ── Floating UI elements ── */}
              <SpeechBubble reduced={reduced} />
              <LiveBadge />
              <ActiveStudentsBadge />
              <ConversationCard />
            </div>
          </motion.div>

          {/* ── Mobile-only compact visual (below copy) ── */}
          <motion.div
            className="lg:hidden flex justify-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease }}
          >
            {/* Compact floating card for mobile */}
            <div
              className="w-full max-w-sm rounded-3xl p-6"
              style={{ background: BRAND.surface, boxShadow: BRAND.shadowCard }}
            >
              {/* Live row */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: BRAND.overlayBlueIconStrong }}
                >
                  <MicIcon color={BRAND.blueVivid} />
                </div>
                <div>
                  <p
                    className="font-bold text-sm"
                    style={{ color: BRAND.blueNavy }}
                  >
                    Live Speaking Practice
                  </p>
                  <WaveformBars color={BRAND.blue} />
                </div>
                <span
                  className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: "rgba(22,163,74,0.1)",
                    color: "#16a34a",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Live
                </span>
              </div>

              {/* Sample conversation */}
              <div className="space-y-2">
                {[
                  { text: "Hello! How are you today?", right: false },
                  { text: "I'm fine, thank you!", right: true },
                ].map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.right ? "justify-end" : "justify-start"}`}
                  >
                    <span
                      className="px-4 py-2 rounded-2xl text-sm text-white max-w-[75%]"
                      style={{
                        background: msg.right ? BRAND.blue : BRAND.blueNavy,
                        borderRadius: msg.right
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",
                      }}
                    >
                      {msg.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
