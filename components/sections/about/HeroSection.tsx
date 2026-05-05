"use client";

import Reveal from "@/components/ui/Reveal";
import { SOCIAL_PROOF } from "@/constants";
import { BRAND, GRADIENT_GOLD_TEXT } from "@/constants/brand";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Users, Star, BookOpen } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const teamAvatars = [
  {
    initials: "NR",
    bg: "#1B4FDB",
    name: "Nina Rokhmawati, S.Pd",
    role: "CEO & Founder",
  },
  {
    initials: "MA",
    bg: "#0D9488",
    name: "Marissa",
    role: "Head of Education",
  },
  {
    initials: "ES",
    bg: "#E8521C",
    name: "Escolastico",
    role: "Head of Marketing",
  },
  {
    initials: "DV",
    bg: "#7C3AED",
    name: "Devi",
    role: "Finance Manager",
  },
  { initials: "HN", bg: "#0EA5E9", name: "Hana", role: "Creative Lead" },
];

const stats = [
  {
    value: `${SOCIAL_PROOF.activeStudents}+`,
    label: "Siswa Aktif",
    Icon: Users,
    accent: BRAND.blue,
  },
  { value: "5+", label: "Tahun Berdiri", Icon: Star, accent: "#F59E0B" },
  { value: "4", label: "Jenis Program", Icon: BookOpen, accent: "#0D9488" },
];

function LeftDecor({ reduced }: { reduced: boolean | null }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute hidden lg:block"
      style={{
        left: "clamp(8px, calc(50% - 560px), calc(50% - 280px))",
        top: 80,
        width: 160,
        height: 420,
        zIndex: 0,
      }}
    >
      {/* Dot grid */}
      <svg
        viewBox="0 0 110 140"
        fill="none"
        className="absolute inset-0 w-full h-full"
      >
        {Array.from({ length: 6 }).map((_, col) =>
          Array.from({ length: 7 }).map((_, row) => (
            <circle
              key={`${col}-${row}`}
              cx={col * 18 + 10}
              cy={row * 18 + 12}
              r="2"
              fill={BRAND.blueNavy}
              fillOpacity={Math.max(0.05, 0.18 - row * 0.018 - col * 0.01)}
            />
          )),
        )}
      </svg>

      {/* Animated arc */}
      <motion.svg
        viewBox="0 0 120 120"
        fill="none"
        className="absolute"
        style={{ top: 50, left: 10, width: 110, height: 110 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <motion.path
          d="M 100 5 A 95 95 0 0 0 5 100"
          stroke={BRAND.blue}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.22"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, delay: 0.5, ease }}
        />
        {/* Second inner arc */}
        <motion.path
          d="M 80 12 A 70 70 0 0 0 12 80"
          stroke={BRAND.blueNavy}
          strokeWidth="1"
          strokeLinecap="round"
          strokeOpacity="0.1"
          strokeDasharray="5 8"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, delay: 0.7, ease }}
        />
      </motion.svg>

      {/* Large diamond outline */}
      <motion.div
        className="absolute"
        style={{
          bottom: 80,
          left: 24,
          width: 44,
          height: 44,
          border: `2px solid ${BRAND.blueNavy}`,
          borderRadius: 5,
          opacity: 0.18,
        }}
        initial={{ opacity: 0, rotate: 20, scale: 0.6 }}
        animate={{ opacity: 0.18, rotate: 45, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.75, ease }}
      />
      {/* Small filled diamond */}
      <motion.div
        className="absolute"
        style={{
          bottom: 66,
          left: 14,
          width: 12,
          height: 12,
          background: BRAND.blue,
          borderRadius: 2,
          opacity: 0.25,
        }}
        initial={{ opacity: 0, scale: 0, rotate: 0 }}
        animate={{ opacity: 0.25, scale: 1, rotate: 45 }}
        transition={{ duration: 0.5, delay: 0.9, ease }}
      />

      {/* Vertical dashed line */}
      <svg
        viewBox="0 0 4 100"
        fill="none"
        className="absolute"
        style={{ top: 200, left: 6, width: 4, height: 100 }}
      >
        <line
          x1="2"
          y1="0"
          x2="2"
          y2="100"
          stroke={BRAND.blueNavy}
          strokeWidth="1.5"
          strokeDasharray="4 7"
          strokeOpacity="0.18"
          strokeLinecap="round"
        />
      </svg>

      {/* Floating circle — bobbing */}
      {!reduced && (
        <motion.svg
          viewBox="0 0 24 24"
          fill="none"
          className="absolute"
          style={{ bottom: 110, left: 90, width: 24, height: 24 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke={BRAND.blueNavy}
            strokeWidth="1.5"
            strokeOpacity="0.25"
          />
          <circle
            cx="12"
            cy="12"
            r="3.5"
            fill={BRAND.blue}
            fillOpacity="0.18"
          />
        </motion.svg>
      )}

      {/* Horizontal tick marks — ruler feel */}
      {[0, 1, 2, 3].map((i) => (
        <svg
          key={i}
          viewBox="0 0 16 4"
          fill="none"
          className="absolute"
          style={{ top: 300 + i * 14, left: 30, width: 16, height: 4 }}
        >
          <line
            x1="0"
            y1="2"
            x2={i % 2 === 0 ? 16 : 10}
            y2="2"
            stroke={BRAND.blueNavy}
            strokeWidth="1.5"
            strokeOpacity={0.12 + i * 0.03}
            strokeLinecap="round"
          />
        </svg>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   RIGHT DECORATION — concentric rings + crosses + triangle + scatter
───────────────────────────────────────────────────────────────────── */
function RightDecor({ reduced }: { reduced: boolean | null }) {
  const teal = "#0D9488";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute hidden lg:block"
      style={{
        right: "clamp(8px, calc(50% - 560px), calc(50% - 280px))",
        top: 60,
        width: 160,
        height: 440,
        zIndex: 0,
      }}
    >
      {/* Concentric rings */}
      <motion.svg
        viewBox="0 0 140 140"
        fill="none"
        className="absolute"
        style={{ top: 10, right: 0, width: 140, height: 140 }}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.4, ease }}
      >
        {[54, 40, 27, 14].map((r, i) => (
          <circle
            key={r}
            cx="70"
            cy="70"
            r={r}
            stroke={teal}
            strokeWidth={i === 3 ? 2 : 1}
            strokeOpacity={0.12 + i * 0.04}
            fill={i === 3 ? teal : "none"}
            fillOpacity={i === 3 ? 0.15 : 0}
          />
        ))}
      </motion.svg>

      {/* Cross marks */}
      {[
        { x: 8, y: 180, s: 14, color: teal, delay: 0.55 },
        { x: 88, y: 162, s: 10, color: BRAND.blueNavy, delay: 0.7 },
        { x: 28, y: 310, s: 12, color: teal, delay: 0.85 },
        { x: 110, y: 280, s: 8, color: BRAND.blueNavy, delay: 0.95 },
      ].map((c, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 20 20"
          fill="none"
          className="absolute"
          style={{ left: c.x, top: c.y, width: c.s, height: c.s }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: c.delay, ease }}
        >
          <line
            x1="10"
            y1="2"
            x2="10"
            y2="18"
            stroke={c.color}
            strokeWidth="2"
            strokeOpacity="0.32"
            strokeLinecap="round"
          />
          <line
            x1="2"
            y1="10"
            x2="18"
            y2="10"
            stroke={c.color}
            strokeWidth="2"
            strokeOpacity="0.32"
            strokeLinecap="round"
          />
        </motion.svg>
      ))}

      {/* Triangle outline */}
      <motion.svg
        viewBox="0 0 50 44"
        fill="none"
        className="absolute"
        style={{ bottom: 70, right: 18, width: 50, height: 44 }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.85, ease }}
      >
        <path
          d="M25 4 L46 40 L4 40 Z"
          stroke={teal}
          strokeWidth="1.5"
          strokeOpacity="0.26"
          strokeLinejoin="round"
          fill="none"
        />
      </motion.svg>

      {/* Dot scatter */}
      <svg
        viewBox="0 0 90 70"
        fill="none"
        className="absolute"
        style={{ bottom: 10, left: 0, width: 90, height: 70 }}
      >
        {Array.from({ length: 5 }).map((_, col) =>
          Array.from({ length: 4 }).map((_, row) => (
            <circle
              key={`${col}-${row}`}
              cx={col * 18 + 9}
              cy={row * 17 + 9}
              r="2"
              fill={teal}
              fillOpacity={0.12 + row * 0.02}
            />
          )),
        )}
      </svg>

      {/* Floating rotating square */}
      {!reduced && (
        <motion.svg
          viewBox="0 0 18 18"
          fill="none"
          className="absolute"
          style={{ top: 148, right: 10, width: 18, height: 18 }}
          animate={{ y: [0, -12, 0], rotate: [0, 18, 0] }}
          transition={{
            repeat: Infinity,
            duration: 5.5,
            ease: "easeInOut",
            delay: 0.4,
          }}
        >
          <rect
            x="2"
            y="2"
            width="14"
            height="14"
            rx="2.5"
            stroke={teal}
            strokeWidth="1.5"
            strokeOpacity="0.38"
            fill="none"
          />
        </motion.svg>
      )}

      {/* Horizontal dashed line */}
      <svg
        viewBox="0 0 90 4"
        fill="none"
        className="absolute"
        style={{ top: 152, right: 32, width: 90, height: 4 }}
      >
        <line
          x1="0"
          y1="2"
          x2="90"
          y2="2"
          stroke={teal}
          strokeWidth="1.5"
          strokeDasharray="5 8"
          strokeOpacity="0.18"
          strokeLinecap="round"
        />
      </svg>

      {/* Wavy accent path */}
      <motion.svg
        viewBox="0 0 80 30"
        fill="none"
        className="absolute"
        style={{ bottom: 155, right: 20, width: 80, height: 30 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <motion.path
          d="M4 15 Q18 4 32 15 Q46 26 60 15 Q70 8 78 15"
          stroke={teal}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.22"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.1, duration: 1.2, ease }}
        />
      </motion.svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   STAT PILL
───────────────────────────────────────────────────────────────────── */
function StatsPill() {
  return (
    <div
      className="inline-flex flex-wrap justify-center sm:flex-nowrap rounded-2xl overflow-hidden mx-auto"
      style={{
        border: `1.5px solid rgba(15,35,64,0.08)`,
        background: "white",
        boxShadow: "0 6px 32px rgba(15,35,64,0.07)",
      }}
    >
      {stats.map((s, i) => (
        <div key={s.label} className="flex items-center">
          {i > 0 && (
            <div
              style={{
                width: 1,
                height: 52,
                background: "rgba(15,35,64,0.07)",
                flexShrink: 0,
              }}
            />
          )}
          <motion.div
            className="flex items-center gap-3 px-5 py-4 sm:px-7"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 + i * 0.08, ease }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${s.accent}14` }}
            >
              <s.Icon
                className="w-4.5 h-4.5"
                style={{ color: s.accent, width: 18, height: 18 }}
              />
            </div>
            <div className="text-left">
              <p
                className="font-display font-extrabold leading-none"
                style={{
                  fontSize: "1.5rem",
                  color: BRAND.blueNavy,
                  letterSpacing: "-0.03em",
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontSize: "0.6875rem",
                  color: "#94A3B8",
                  marginTop: 2,
                }}
              >
                {s.label}
              </p>
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   TEAM AVATAR STRIP
───────────────────────────────────────────────────────────────────── */
function TeamStrip() {
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {/* Overlapping avatars */}
      <div className="flex -space-x-3.5">
        {teamAvatars.map((a, i) => (
          <motion.div
            key={a.initials}
            title={`${a.name} — ${a.role}`}
            className="w-11 h-11 rounded-full border-[2.5px] border-white flex items-center justify-center font-display font-black text-white cursor-default select-none"
            style={{
              fontSize: "0.625rem",
              background: a.bg,
              zIndex: teamAvatars.length - i,
              boxShadow: "0 2px 10px rgba(0,0,0,0.14)",
            }}
            initial={{ opacity: 0, scale: 0.65, x: -6 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.38, delay: 0.34 + i * 0.07, ease }}
            whileHover={{
              scale: 1.12,
              zIndex: 20,
              transition: { duration: 0.15 },
            }}
          >
            {a.initials}
          </motion.div>
        ))}
        {/* +9 overflow */}
        <motion.div
          className="w-11 h-11 rounded-full border-[2.5px] border-white flex items-center justify-center font-display font-bold select-none"
          style={{
            fontSize: "0.625rem",
            background: "#F1F5F9",
            color: "#64748B",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            zIndex: 0,
          }}
          initial={{ opacity: 0, scale: 0.65 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.38,
            delay: 0.34 + teamAvatars.length * 0.07,
            ease,
          }}
        >
          +9
        </motion.div>
      </div>

      {/* Label */}
      <motion.div
        className="text-left"
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.7, ease }}
      >
        <p
          className="font-display font-semibold"
          style={{ fontSize: "0.9375rem", color: BRAND.blueNavy }}
        >
          Tim Inggris Go
        </p>
        <p style={{ fontSize: "0.75rem", color: "#94A3B8", marginTop: 1 }}>
          14 orang · tutors, educators &amp; creatives
        </p>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   EDITORIAL BOTTOM BAND
───────────────────────────────────────────────────────────────────── */
function EditorialBand() {
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden"
      style={{ borderTop: "1.5px solid rgba(15,35,64,0.08)" }}
    >
      {/* Quote panel — navy */}
      <div
        className="lg:col-span-8 relative flex items-center gap-6 px-8 py-9 lg:px-14 lg:py-11 overflow-hidden"
        style={{ background: BRAND.blueNavy }}
      >
        {/* Background texture — faint radial */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 90% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)",
          }}
        />

        {/* Big decorative quote mark */}
        <svg
          viewBox="0 0 60 46"
          fill="none"
          className="flex-shrink-0 hidden sm:block"
          style={{ width: 52, height: 40, opacity: 0.22 }}
          aria-hidden
        >
          <path
            d="M0 29.7C0 38.9 5.4 46 14.8 46c8 0 13.7-5.7 13.7-13.7 0-7.4-5.1-12.5-12-12.5-.6 0-1.4 0-2.3.3 1.7-7.1 7.3-13.4 14.3-17.3L23.9 0C10.8 5.7 0 16.5 0 29.7zm31.7 0C31.7 38.9 37.1 46 46.5 46c8 0 13.5-5.7 13.5-13.7 0-7.4-5.1-12.5-12-12.5-.6 0-1.4 0-2.3.3 1.7-7.1 7.3-13.4 14.3-17.3L55.6 0C42.5 5.7 31.7 16.5 31.7 29.7z"
            fill="white"
          />
        </svg>

        <div className="relative z-10">
          <motion.p
            className="font-display font-extrabold text-white mb-3"
            style={{
              fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1.3,
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.42, ease }}
          >
            "Speak First, Perfect Later."
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.54, ease }}
          >
            {/* Attribution line with avatar */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-display font-black text-white flex-shrink-0"
                style={{
                  background: "#1B4FDB",
                  fontSize: "0.625rem",
                  border: "2px solid rgba(255,255,255,0.25)",
                }}
              >
                NR
              </div>
              <div>
                <p
                  className="font-display font-semibold text-white"
                  style={{ fontSize: "0.8125rem", opacity: 0.9 }}
                >
                  Nina Rokhmawati, S.Pd
                </p>
                <p
                  style={{
                    fontSize: "0.6875rem",
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  CEO &amp; Founder · Inggris Go
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Facts panel — teal tints */}
      <div
        className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1"
        style={{ borderLeft: "1.5px solid rgba(13,148,136,0.18)" }}
      >
        {[
          {
            label: "Berbasis di",
            value: "Kampung Inggris Pare",
            bg: "rgba(13,148,136,0.07)",
            border: "none",
          },
          {
            label: "Program tersedia",
            value: "Online & Offline",
            bg: "rgba(13,148,136,0.04)",
            border: "1.5px solid rgba(13,148,136,0.12)",
          },
        ].map((fact, i) => (
          <motion.div
            key={fact.label}
            className="flex flex-col justify-center px-6 py-6 lg:py-5"
            style={{
              background: fact.bg,
              borderLeft:
                i === 1 && fact.border !== "none" ? fact.border : undefined,
              borderTop: i === 1 ? fact.border : undefined,
            }}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.1, ease }}
          >
            <p
              style={{
                fontSize: "0.5875rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(13,148,136,0.75)",
                fontWeight: 700,
                marginBottom: 3,
              }}
            >
              {fact.label}
            </p>
            <p
              className="font-display font-bold"
              style={{ fontSize: "0.9375rem", color: BRAND.blueNavy }}
            >
              {fact.value}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export const HeroSection = () => {
  const reduced = useReducedMotion();

  return (
    <section
      className="relative w-full overflow-hidden pt-28 pb-0 lg:pt-36"
      style={{ background: "var(--color-brand-background, #F8FAFC)" }}
    >
      {/* ── Ambient radial glow behind headline ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 0,
          background:
            "radial-gradient(ellipse 65% 50% at 50% 0%, rgba(27,79,219,0.07) 0%, transparent 65%)",
        }}
      />

      {/* ── Dot texture overlay ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Ccircle cx='14' cy='14' r='1.2' fill='%230F2340' fill-opacity='0.035'/%3E%3C/svg%3E")`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── Geometric side decorations ── */}
      <LeftDecor reduced={reduced} />
      <RightDecor reduced={reduced} />

      {/* ══════════════════════════════════════════════════════════
          CENTER CONTENT — z-10
      ══════════════════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 text-center">
        {/* Badges */}
        <Reveal>
          <div className="flex items-center justify-center flex-wrap gap-2.5 mb-7">
            {/* Location badge */}
            <span
              className="inline-flex items-center gap-2 font-display font-semibold rounded-full px-4 py-1.5"
              style={{
                fontSize: "0.75rem",
                background: "white",
                color: BRAND.blueNavy,
                border: "1px solid rgba(15,35,64,0.1)",
                boxShadow: "0 2px 14px rgba(15,35,64,0.07)",
              }}
            >
              <span className="relative flex w-2 h-2 flex-shrink-0">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70"
                  style={{ background: "#22C55E" }}
                />
                <span
                  className="relative inline-flex w-2 h-2 rounded-full"
                  style={{ background: "#22C55E" }}
                />
              </span>
              <MapPin
                className="w-3 h-3 flex-shrink-0"
                style={{ color: BRAND.blueNavy }}
              />
              Kampung Inggris Pare, Kediri
            </span>

            {/* Section label */}
            <span
              className="inline-flex items-center gap-1.5 font-display font-semibold rounded-full px-4 py-1.5"
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.03em",
                background: "rgba(234,88,12,0.09)",
                color: "#C2410C",
                border: "1px solid rgba(234,88,12,0.18)",
              }}
            >
              Tentang Kami
            </span>
          </div>
        </Reveal>

        {/* ── Overline — small editorial label ── */}
        <Reveal delay={0.04}>
          <p
            className="font-display font-bold uppercase tracking-widest mb-4"
            style={{
              fontSize: "0.6875rem",
              color: "#94A3B8",
              letterSpacing: "0.2em",
            }}
          >
            Kisah kami
          </p>
        </Reveal>

        {/* ── Main headline ── */}
        <Reveal delay={0.09}>
          <h1
            className="font-display font-extrabold leading-[1.06] mb-5 mx-auto"
            style={{
              fontSize: "clamp(2.1rem, 5.5vw, 3.75rem)",
              letterSpacing: "-0.028em",
              color: BRAND.blueNavy,
              maxWidth: "780px",
            }}
          >
            Membangun Kepercayaan Diri <br className="hidden sm:block" />
            <span style={GRADIENT_GOLD_TEXT}>Berbahasa Inggris</span>
          </h1>
        </Reveal>

        {/* ── Supporting paragraph ── */}
        <Reveal delay={0.15}>
          <p
            className="leading-relaxed mx-auto"
            style={{
              fontSize: "1.0625rem",
              color: "#64748B",
              maxWidth: "540px",
              lineHeight: "1.8",
            }}
          >
            Inggris Go hadir untuk membuktikan bahwa siapa pun bisa berbicara
            bahasa Inggris dengan percaya diri — dari Kampung Inggris untuk
            seluruh Indonesia.
          </p>
        </Reveal>

        {/* ── Thin divider ── */}
        <Reveal delay={0.19}>
          <div className="flex items-center justify-center gap-3 my-10">
            <div
              style={{
                width: 40,
                height: 1,
                background: "rgba(15,35,64,0.12)",
              }}
            />
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: 2,
                background: BRAND.blue,
                opacity: 0.5,
                transform: "rotate(45deg)",
              }}
            />
            <div
              style={{
                width: 40,
                height: 1,
                background: "rgba(15,35,64,0.12)",
              }}
            />
          </div>
        </Reveal>

        {/* ── Stats pill ── */}
        <Reveal delay={0.21}>
          <StatsPill />
        </Reveal>

        {/* ── Team avatar strip ── */}
        <Reveal delay={0.28} className="mt-10 mb-16">
          <TeamStrip />
        </Reveal>
      </div>

      {/* ── Editorial bottom band — full width, no max-w ── */}
      <Reveal delay={0.34}>
        <EditorialBand />
      </Reveal>
    </section>
  );
};
