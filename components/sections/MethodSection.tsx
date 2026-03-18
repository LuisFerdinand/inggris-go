"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

/* ── Step data — richer with tags and a short "what you'll do" line ── */
const steps = [
  {
    num: "1",
    title: "Understand",
    subtitle: "Pahami Dasarnya",
    body: "Memahami kalimat sederhana dan struktur dasar bahasa Inggris dengan metode yang mudah dicerna.",
    tags: ["Kosakata dasar", "Pola kalimat", "Listening"],
    squareBg: "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
    accentBg: "linear-gradient(135deg, #2DB8B0 0%, #1A9990 100%)",
    accentColor: "#2DB8B0",
    rotate: "-6deg",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    num: "2",
    title: "Imitate",
    subtitle: "Tiru & Rasakan",
    body: "Meniru cara bicara tutor berpengalaman — intonasi, ritme, dan ekspresi yang natural.",
    tags: ["Shadowing", "Pronunciation", "Intonasi"],
    squareBg: "linear-gradient(135deg, #2DB8B0 0%, #1A9990 100%)",
    accentBg: "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
    accentColor: "#FF6B35",
    rotate: "5deg",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    ),
  },
  {
    num: "3",
    title: "Practice",
    subtitle: "Latihan Rutin",
    body: "Latihan berbicara secara konsisten dengan feedback langsung dari tutor yang supportif.",
    tags: ["Feedback tutor", "Speaking drill", "Koreksi langsung"],
    squareBg: "linear-gradient(135deg, #0F2340 0%, #1A365D 100%)",
    accentBg: "linear-gradient(135deg, #2DB8B0 0%, #1A9990 100%)",
    accentColor: "#2DB8B0",
    rotate: "-4deg",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
  {
    num: "4",
    title: "Speak",
    subtitle: "Berani Bicara!",
    body: "Gunakan bahasa Inggris dengan percaya diri di situasi nyata — tanpa rasa takut salah.",
    tags: ["Percaya diri", "Situasi nyata", "No fear!"],
    squareBg: "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
    accentBg: "linear-gradient(135deg, #0F2340 0%, #1A365D 100%)",
    accentColor: "#0F2340",
    rotate: "6deg",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
      </svg>
    ),
  },
];

/* ── Scroll reveal ─────────────────────────────────────────────────── */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-72px 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

/* ── Desktop step card ─────────────────────────────────────────────── */
function DesktopStepCard({
  step,
  index,
}: {
  step: (typeof steps)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease }}
      /* group — children react to card hover */
      className="group flex flex-col items-center text-center flex-1 min-w-0 cursor-default"
    >
      {/* ── Dual-square icon block ── */}
      <div className="relative mb-5" style={{ width: "88px", height: "88px" }}>
        {/* Large square — unrotates and scales on group hover */}
        <motion.div
          className="group-hover:scale-105 transition-all duration-300"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "76px",
            height: "76px",
            borderRadius: "20px",
            background: step.squareBg,
            transform: `rotate(${step.rotate})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
            transition:
              "transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease",
          }}
          /* On group hover, unrotate via inline style override via CSS class below */
        >
          {/* Inner rotate resets on group hover via a wrapper trick */}
          <span
            className="font-display font-black text-white select-none"
            style={{
              fontSize: "2rem",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            {step.num}
          </span>
        </motion.div>

        {/* Small accent square — bounces up on group hover */}
        <div
          className="
            absolute bottom-0 right-0 z-10
            flex items-center justify-center
            transition-transform duration-300 ease-out
            group-hover:-translate-y-2 group-hover:scale-110
          "
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "10px",
            background: step.accentBg,
            boxShadow: "0 4px 14px rgba(0,0,0,0.22)",
          }}
        >
          {step.icon}
        </div>
      </div>

      {/* Subtitle — small eyebrow above title */}
      <span
        className="font-display font-semibold mb-1 transition-colors duration-200"
        style={{
          fontSize: "0.6875rem",
          letterSpacing: "0.08em",
          color: "#94A3B8",
          textTransform: "uppercase",
        }}
      >
        {step.subtitle}
      </span>

      {/* Title */}
      <h3
        className="font-display font-bold mb-2 leading-snug group-hover:text-brand-orange transition-colors duration-200"
        style={{ fontSize: "1.0625rem", color: "#0F2340" }}
      >
        {step.title}
      </h3>

      {/* Body */}
      <p
        className="leading-relaxed mb-4"
        style={{ fontSize: "0.8125rem", color: "#64748B", maxWidth: "176px" }}
      >
        {step.body}
      </p>

      {/* Tags — appear on hover with a slight fade-up */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {step.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded-full font-medium transition-all duration-200
              opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
            style={{
              fontSize: "0.6875rem",
              background: "rgba(255,107,53,0.08)",
              color: "#E8521C",
              border: "1px solid rgba(255,107,53,0.15)",
              transitionDelay: "40ms",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Mobile vertical step — timeline layout ───────────────────────── */
function MobileStep({
  step,
  index,
  isLast,
}: {
  step: (typeof steps)[0];
  index: number;
  isLast: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease }}
      /* group for hover */
      className="group relative flex gap-5"
    >
      {/* ── Left: icon + vertical line ── */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Dual-square icon */}
        <div className="relative" style={{ width: "68px", height: "68px" }}>
          {/* Large square */}
          <div
            className="absolute top-0 left-0 flex items-center justify-center
              group-hover:scale-105 transition-transform duration-300"
            style={{
              width: "58px",
              height: "58px",
              borderRadius: "16px",
              background: step.squareBg,
              transform: `rotate(${step.rotate})`,
              boxShadow: "0 6px 20px rgba(0,0,0,0.16)",
              transition:
                "transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease",
            }}
          >
            <span
              className="font-display font-black text-white select-none"
              style={{
                fontSize: "1.5rem",
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              {step.num}
            </span>
          </div>

          {/* Small accent square */}
          <div
            className="absolute bottom-0 right-0 z-10 flex items-center justify-center
              group-hover:-translate-y-1.5 group-hover:scale-110 transition-transform duration-300"
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "8px",
              background: step.accentBg,
              boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
            }}
          >
            {step.icon}
          </div>
        </div>

        {/* Vertical connector line */}
        {!isLast && (
          <div
            className="mt-3 flex-1 flex flex-col items-center"
            style={{ minHeight: "40px" }}
          >
            {/* Animated dashed line */}
            <motion.div
              initial={{ height: 0 }}
              animate={inView ? { height: "100%" } : {}}
              transition={{ duration: 0.7, delay: index * 0.1 + 0.3, ease }}
              style={{
                width: "2px",
                background:
                  "linear-gradient(180deg, rgba(255,107,53,0.6) 0%, rgba(255,107,53,0.1) 100%)",
                borderRadius: "2px",
                flex: 1,
              }}
            />
          </div>
        )}
      </div>

      {/* ── Right: text content ── */}
      <div className="pb-10 flex-1 pt-1">
        {/* Step label */}
        <span
          className="font-display font-semibold block mb-1"
          style={{
            fontSize: "0.6875rem",
            letterSpacing: "0.08em",
            color: "#94A3B8",
            textTransform: "uppercase",
          }}
        >
          Langkah {step.num} · {step.subtitle}
        </span>

        {/* Title */}
        <h3
          className="font-display font-bold mb-2 leading-snug group-hover:text-brand-orange transition-colors duration-200"
          style={{ fontSize: "1.0625rem", color: "#0F2340" }}
        >
          {step.title}
        </h3>

        {/* Body */}
        <p
          className="leading-relaxed mb-3"
          style={{ fontSize: "0.8125rem", color: "#64748B" }}
        >
          {step.body}
        </p>

        {/* Tags — always visible on mobile (no hover) */}
        <div className="flex flex-wrap gap-1.5">
          {step.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full font-medium"
              style={{
                fontSize: "0.6875rem",
                background: "rgba(255,107,53,0.08)",
                color: "#E8521C",
                border: "1px solid rgba(255,107,53,0.15)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Section ───────────────────────────────────────────────────────── */
export default function MethodSection() {
  return (
    <section
      className="relative w-full overflow-hidden py-20 lg:py-28"
      style={{
        background: "linear-gradient(180deg, #FFF8F3 0%, #FFF0E6 100%)",
      }}
    >
      {/* Subtle radial bg tints */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 85% 15%, rgba(255,107,53,0.06) 0%, transparent 60%)," +
            "radial-gradient(ellipse 50% 60% at 15% 85%, rgba(45,184,176,0.05) 0%, transparent 55%)",
        }}
      />

      {/* CSS for group-hover rotate reset on large square */}
      <style>{`
        .group:hover .step-large-square {
          transform: rotate(0deg) !important;
          box-shadow: 0 16px 48px rgba(0,0,0,0.22) !important;
        }
      `}</style>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 xl:px-12">
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center mb-14 lg:mb-20">
          {/* Solid orange pill */}
          <Reveal>
            <span
              className="inline-block px-5 py-2 rounded-full font-display font-semibold mb-5 text-white"
              style={{
                fontSize: "0.8125rem",
                background: "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
                boxShadow: "0 4px 16px rgba(255,107,53,0.28)",
              }}
            >
              Metode Kami
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h2
              className="font-display font-extrabold leading-[1.08] mb-4"
              style={{
                fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                letterSpacing: "-0.022em",
                color: "#0F2340",
              }}
            >
              Metode Belajar{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Inggris Go
              </span>
            </h2>
          </Reveal>

          <Reveal delay={0.15}>
            <p
              className="leading-relaxed"
              style={{
                fontSize: "0.9375rem",
                color: "#64748B",
                maxWidth: "420px",
              }}
            >
              4 langkah sederhana untuk berbicara bahasa Inggris dengan percaya
              diri
            </p>
          </Reveal>
        </div>

        {/* ── DESKTOP: horizontal row with connector dashes ──────── */}
        <div className="hidden lg:flex items-start justify-center gap-0">
          {steps.map((step, i) => (
            <div key={step.num} className="flex items-start">
              <DesktopStepCard step={step} index={i} />

              {/* Connector dash between steps */}
              {i < steps.length - 1 && (
                <div
                  className="flex-shrink-0 flex items-start justify-center"
                  style={{ paddingTop: "36px", width: "56px" }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "3px",
                      borderRadius: "2px",
                      background:
                        "linear-gradient(90deg, #FF6B35, rgba(255,107,53,0.2))",
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── MOBILE: vertical timeline flow ────────────────────── */}
        <div className="lg:hidden max-w-sm mx-auto">
          {steps.map((step, i) => (
            <MobileStep
              key={step.num}
              step={step}
              index={i}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>

        {/* ── Bottom note — subtle reassurance line ─────────────── */}
        <Reveal delay={0.1} className="mt-14 lg:mt-16">
          <div className="flex items-center justify-center gap-2.5">
            <div
              style={{
                width: "32px",
                height: "1px",
                background: "rgba(255,107,53,0.35)",
                borderRadius: "1px",
              }}
            />
            <p
              className="font-display font-medium text-center"
              style={{ fontSize: "0.8125rem", color: "#94A3B8" }}
            >
              Sudah terbukti membantu{" "}
              <span style={{ color: "#FF6B35", fontWeight: 700 }}>500+</span>{" "}
              siswa dari nol jadi berani speaking
            </p>
            <div
              style={{
                width: "32px",
                height: "1px",
                background: "rgba(255,107,53,0.35)",
                borderRadius: "1px",
              }}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
