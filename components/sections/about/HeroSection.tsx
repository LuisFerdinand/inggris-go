"use client";

import Reveal from "@/components/ui/Reveal";
import { BRAND, GRADIENT_GOLD_TEXT } from "@/constants/brand";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Users, Star, BookOpen } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const teamAvatars = [
  {
    initials: "YR",
    color: BRAND.problem.orange.accent,
    name: "Yuma Rafi",
    role: "CEO & Founder",
  },
  {
    initials: "MA",
    color: BRAND.problem.teal.accent,
    name: "Marissa",
    role: "Head of Education",
  },
  {
    initials: "ES",
    color: "#E8521C",
    name: "Escolastico",
    role: "Head of Marketing",
  },
  {
    initials: "DV",
    color: BRAND.problem.purple.accent,
    name: "Devi",
    role: "Finance Manager",
  },
  { initials: "HN", color: "#0EA5E9", name: "Hana", role: "Creative Lead" },
];

const stats = [
  { value: "500+", label: "Siswa aktif", icon: Users },
  { value: "2+", label: "Tahun berdiri", icon: Star },
  { value: "4", label: "Jenis program", icon: BookOpen },
];

/* ══════════════════════════════════════════════════════════════════════
 *  DECORATIONS
 *
 *  Pure visual SVG/div shapes — no text, no information.
 *  z-index: 0 (main content is z-10), so they sit behind on mobile.
 *  On desktop they're positioned flush to the text column edges.
 *
 *  Left:  scattered dots grid + arc stroke + floating diamond
 *  Right: concentric rings + cross marks + floating triangle
 * ══════════════════════════════════════════════════════════════════════ */
function Decorations({ reduced }: { reduced: boolean | null }) {
  return (
    <>
      {/* ── LEFT decoration cluster ───────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          /* Hugs the left edge of max-w-5xl — on mobile just floats top-left */
          left: "clamp(8px, calc(50% - 640px + 20px), calc(50% - 320px))",
          top: "100px",
          width: "140px",
          height: "360px",
          zIndex: 0,
          opacity: 0.9,
        }}
      >
        {/* Dot grid — 5×6 orange dots, very faint */}
        <svg
          viewBox="0 0 100 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute"
          style={{ top: 0, left: 0, width: "100px", height: "120px" }}
        >
          {Array.from({ length: 5 }).map((_, col) =>
            Array.from({ length: 6 }).map((_, row) => (
              <circle
                key={`${col}-${row}`}
                cx={col * 20 + 10}
                cy={row * 20 + 10}
                r="2.5"
                fill={BRAND.blueNavy}
                fillOpacity={0.18 - row * 0.015}
              />
            )),
          )}
        </svg>

        {/* Arc stroke — quarter circle, orange */}
        <motion.svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute"
          style={{ top: "60px", left: "20px", width: "100px", height: "100px" }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease }}
        >
          <motion.path
            d="M 90 10 A 80 80 0 0 0 10 90"
            stroke={BRAND.blue}
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.25"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, delay: 0.5, ease }}
          />
        </motion.svg>

        {/* Diamond shape — rotated square outline */}
        <motion.div
          className="absolute"
          style={{
            bottom: "40px",
            left: "30px",
            width: "36px",
            height: "36px",
            border: `2px solid ${BRAND.blueNavy}`,
            borderRadius: "4px",
            transform: "rotate(45deg)",
            opacity: 0.22,
          }}
          initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
          animate={{ opacity: 0.22, scale: 1, rotate: 45 }}
          transition={{ duration: 0.7, delay: 0.7, ease }}
        />

        {/* Small filled diamond accent */}
        <motion.div
          className="absolute"
          style={{
            bottom: "24px",
            left: "16px",
            width: "10px",
            height: "10px",
            background: BRAND.blueNavy,
            borderRadius: "2px",
            transform: "rotate(45deg)",
            opacity: 0.3,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.9, ease }}
        />

        {/* Vertical dashed line */}
        <svg
          viewBox="0 0 4 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute"
          style={{ top: "180px", left: "4px", width: "4px", height: "80px" }}
        >
          <line
            x1="2"
            y1="0"
            x2="2"
            y2="80"
            stroke={BRAND.blueNavy}
            strokeWidth="1.5"
            strokeDasharray="4 6"
            strokeOpacity="0.2"
            strokeLinecap="round"
          />
        </svg>

        {/* Floating bob — gentle y movement */}
        {!reduced && (
          <motion.div
            className="absolute"
            style={{
              bottom: "100px",
              left: "80px",
              width: "20px",
              height: "20px",
            }}
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke={BRAND.blueNavy}
                strokeWidth="1.5"
                strokeOpacity="0.28"
              />
              <circle
                cx="10"
                cy="10"
                r="3"
                fill={BRAND.blueNavy}
                fillOpacity="0.2"
              />
            </svg>
          </motion.div>
        )}
      </div>

      {/* ── RIGHT decoration cluster ──────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          right: "clamp(8px, calc(50% - 640px + 20px), calc(50% - 320px))",
          top: "80px",
          width: "140px",
          height: "380px",
          zIndex: 0,
          opacity: 0.9,
        }}
      >
        {/* Concentric rings — teal */}
        <motion.svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute"
          style={{ top: "20px", right: 0, width: "120px", height: "120px" }}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.45, ease }}
        >
          <circle
            cx="60"
            cy="60"
            r="52"
            stroke={BRAND.problem.teal.accent}
            strokeWidth="1"
            strokeOpacity="0.15"
            fill="none"
          />
          <circle
            cx="60"
            cy="60"
            r="38"
            stroke={BRAND.problem.teal.accent}
            strokeWidth="1"
            strokeOpacity="0.18"
            fill="none"
          />
          <circle
            cx="60"
            cy="60"
            r="22"
            stroke={BRAND.problem.teal.accent}
            strokeWidth="1.5"
            strokeOpacity="0.22"
            fill="none"
          />
          <circle
            cx="60"
            cy="60"
            r="6"
            fill={BRAND.problem.teal.accent}
            fillOpacity="0.2"
          />
        </motion.svg>

        {/* Cross / plus marks */}
        {[
          {
            x: 10,
            y: 190,
            size: 12,
            color: BRAND.problem.teal.accent,
            delay: 0.6,
          },
          { x: 80, y: 170, size: 8, color: BRAND.blueNavy, delay: 0.75 },
          {
            x: 30,
            y: 320,
            size: 10,
            color: BRAND.problem.teal.accent,
            delay: 0.85,
          },
        ].map((cross, i) => (
          <motion.svg
            key={i}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute"
            style={{
              left: cross.x,
              top: cross.y,
              width: cross.size,
              height: cross.size,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: cross.delay, ease }}
          >
            <line
              x1="10"
              y1="2"
              x2="10"
              y2="18"
              stroke={cross.color}
              strokeWidth="2"
              strokeOpacity="0.35"
              strokeLinecap="round"
            />
            <line
              x1="2"
              y1="10"
              x2="18"
              y2="10"
              stroke={cross.color}
              strokeWidth="2"
              strokeOpacity="0.35"
              strokeLinecap="round"
            />
          </motion.svg>
        ))}

        {/* Triangle outline */}
        <motion.svg
          viewBox="0 0 44 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute"
          style={{
            bottom: "60px",
            right: "20px",
            width: "44px",
            height: "40px",
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease }}
        >
          <path
            d="M22 4 L40 36 L4 36 Z"
            stroke={BRAND.problem.teal.accent}
            strokeWidth="1.5"
            strokeOpacity="0.28"
            fill="none"
            strokeLinejoin="round"
          />
        </motion.svg>

        {/* Dot scatter — teal, bottom area */}
        <svg
          viewBox="0 0 80 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute"
          style={{ bottom: "10px", left: "0", width: "80px", height: "60px" }}
        >
          {Array.from({ length: 4 }).map((_, col) =>
            Array.from({ length: 3 }).map((_, row) => (
              <circle
                key={`${col}-${row}`}
                cx={col * 20 + 10}
                cy={row * 20 + 10}
                r="2"
                fill={BRAND.problem.teal.accent}
                fillOpacity={0.15 + row * 0.02}
              />
            )),
          )}
        </svg>

        {/* Floating bob — slow rotation feel */}
        {!reduced && (
          <motion.div
            className="absolute"
            style={{
              top: "155px",
              right: "8px",
              width: "16px",
              height: "16px",
            }}
            animate={{ y: [0, -10, 0], rotate: [0, 15, 0] }}
            transition={{
              repeat: Infinity,
              duration: 5,
              ease: "easeInOut",
              delay: 0.5,
            }}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="2"
                y="2"
                width="12"
                height="12"
                rx="2"
                stroke={BRAND.problem.teal.accent}
                strokeWidth="1.5"
                strokeOpacity="0.4"
                fill="none"
              />
            </svg>
          </motion.div>
        )}

        {/* Horizontal dash line */}
        <svg
          viewBox="0 0 80 4"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute"
          style={{ top: "155px", right: "30px", width: "80px", height: "4px" }}
        >
          <line
            x1="0"
            y1="2"
            x2="80"
            y2="2"
            stroke={BRAND.problem.teal.accent}
            strokeWidth="1.5"
            strokeDasharray="5 7"
            strokeOpacity="0.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 *  MAIN HERO SECTION
 * ══════════════════════════════════════════════════════════════════════ */
export const HeroSection = () => {
  const reduced = useReducedMotion();

  return (
    <section className="relative w-full overflow-hidden pt-28 pb-0 lg:pt-36 bg-background">
      {/* Ambient radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 0,
          background:
            "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(255,107,53,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Dot grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='1' fill='%23FF6B35' fill-opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Geometric decorations — z-0, behind main content */}
      <Decorations reduced={reduced} />

      {/* ── Center content — z-10 ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 text-center">
        {/* Badges */}
        <Reveal>
          <div className="flex items-center justify-center flex-wrap gap-3 mb-6">
            <span
              className="inline-flex items-center gap-2 font-display font-semibold rounded-full px-4 py-1.5"
              style={{
                fontSize: "0.75rem",
                background: "white",
                color: BRAND.blueNavy,
                border: "1px solid rgba(15,35,64,0.1)",
                boxShadow: "0 2px 12px rgba(15,35,64,0.07)",
              }}
            >
              <span className="relative flex w-2 h-2 flex-shrink-0">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
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
            <span
              className="inline-flex items-center gap-1.5 font-display font-semibold rounded-full px-4 py-1.5"
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.04em",
                background: "rgba(255,107,53,0.09)",
                color: BRAND.blueNavy,
                border: "1px solid rgba(255,107,53,0.2)",
              }}
            >
              Tentang Kami
            </span>
          </div>
        </Reveal>

        {/* Headline */}
        <Reveal delay={0.08}>
          <h1
            className="font-display font-extrabold leading-[1.06] mb-5"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              letterSpacing: "-0.025em",
              color: BRAND.blueNavy,
            }}
          >
            Membangun Kepercayaan Diri
            <br />
            <span style={GRADIENT_GOLD_TEXT}>Berbahasa Inggris</span>
          </h1>
        </Reveal>

        {/* Subtext */}
        <Reveal delay={0.14}>
          <p
            className="leading-relaxed mx-auto"
            style={{
              fontSize: "1.0625rem",
              color: "#64748B",
              maxWidth: "520px",
              lineHeight: "1.75",
            }}
          >
            Inggris Go hadir untuk membuktikan bahwa siapa pun bisa berbicara
            bahasa Inggris dengan percaya diri — dari Kampung Inggris untuk
            seluruh Indonesia.
          </p>
        </Reveal>

        {/* Stats pill */}
        <Reveal delay={0.2} className="mt-10">
          <div
            className="inline-flex items-center gap-0 rounded-2xl overflow-hidden"
            style={{
              border: "1.5px solid rgba(15,35,64,0.08)",
              background: "white",
              boxShadow: "0 4px 24px rgba(15,35,64,0.06)",
            }}
          >
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center">
                  {i > 0 && (
                    <div
                      style={{
                        width: "1px",
                        height: "48px",
                        background: "rgba(15,35,64,0.07)",
                      }}
                    />
                  )}
                  <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: BRAND.background }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: BRAND.blueNavy }}
                      />
                    </div>
                    <div className="text-left">
                      <p
                        className="font-display font-extrabold leading-none"
                        style={{
                          fontSize: "1.375rem",
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
                          marginTop: "2px",
                        }}
                      >
                        {s.label}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* Team avatar strip */}
        <Reveal delay={0.26} className="mt-8">
          <div className="flex items-center justify-center gap-3">
            <div className="flex -space-x-3">
              {teamAvatars.map((a, i) => (
                <motion.div
                  key={a.initials}
                  initial={{ opacity: 0, scale: 0.7, x: -8 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.3 + i * 0.07, ease }}
                  title={`${a.name} — ${a.role}`}
                  className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center font-display font-bold text-white cursor-default"
                  style={{
                    fontSize: "0.625rem",
                    background: a.color,
                    zIndex: teamAvatars.length - i,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  }}
                >
                  {a.initials}
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.35,
                  delay: 0.3 + teamAvatars.length * 0.07,
                  ease,
                }}
                className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center font-display font-bold"
                style={{
                  fontSize: "0.625rem",
                  background: "#F1F5F9",
                  color: "#64748B",
                  zIndex: 0,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                +9
              </motion.div>
            </div>
            <div className="text-left">
              <p
                className="font-display font-semibold"
                style={{ fontSize: "0.875rem", color: BRAND.blueNavy }}
              >
                Tim Inggris Go
              </p>
              <p style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                14 orang · tutors, educators & creatives
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Bottom editorial band */}
      <Reveal delay={0.32} className="mt-16">
        <div
          className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden"
          style={{ borderTop: "1.5px solid rgba(15,35,64,0.07)" }}
        >
          <div
            className="lg:col-span-8 px-8 py-8 lg:px-12 lg:py-10 flex items-center gap-6"
            style={{ background: BRAND.blueNavy }}
          >
            <svg
              viewBox="0 0 48 36"
              fill="none"
              className="w-10 h-7 flex-shrink-0 hidden sm:block"
              aria-hidden
            >
              <path
                d="M0 23.4C0 30.6 4.275 36 11.7 36c6.3 0 10.8-4.5 10.8-10.8 0-5.85-4.05-9.9-9.45-9.9-.45 0-1.125 0-1.8.225C12.6 9.9 17.1 5.4 22.5 2.7L18.9 0C8.55 4.5 0 13.05 0 23.4zm25 0C25 30.6 29.275 36 36.7 36 43 36 47.5 31.5 47.5 25.2c0-5.85-4.05-9.9-9.45-9.9-.45 0-1.125 0-1.8.225C37.6 9.9 42.1 5.4 47.5 2.7L43.9 0C33.55 4.5 25 13.05 25 23.4z"
                fill={BRAND.blueNavy}
                fillOpacity={0.3}
              />
            </svg>
            <div>
              <p
                className="font-display font-extrabold text-white mb-1.5"
                style={{
                  fontSize: "clamp(1rem, 2vw, 1.25rem)",
                  letterSpacing: "-0.015em",
                  lineHeight: "1.35",
                }}
              >
                "Speak First, Perfect Later."
              </p>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                — Yuma Rafi, CEO & Founder · Inggris Go
              </p>
            </div>
          </div>
          <div
            className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1"
            style={{ borderLeft: "1.5px solid rgba(45,184,176,0.2)" }}
          >
            {[
              { label: "Berbasis di", value: "Kampung Inggris Pare" },
              { label: "Program tersedia", value: "Online & Offline" },
            ].map((fact, i) => (
              <div
                key={fact.label}
                className="flex flex-col justify-center px-6 py-5"
                style={{
                  background:
                    i === 0 ? "rgba(45,184,176,0.07)" : "rgba(45,184,176,0.04)",
                  borderLeft:
                    i === 1 ? "1.5px solid rgba(45,184,176,0.15)" : "none",
                  borderTop:
                    i === 1 ? "1.5px solid rgba(45,184,176,0.12)" : "none",
                }}
              >
                <p
                  style={{
                    fontSize: "0.625rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(45,184,176,0.7)",
                    fontWeight: 700,
                    marginBottom: "2px",
                  }}
                >
                  {fact.label}
                </p>
                <p
                  className="font-display font-bold"
                  style={{ fontSize: "0.875rem", color: BRAND.blueNavy }}
                >
                  {fact.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
};
