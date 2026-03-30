"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const problems = [
  {
    number: "01",
    title: "Takut Salah Grammar",
    body: "Terlalu fokus pada kesempurnaan membuat kamu bungkam sebelum mulai bicara.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    ),
    accent: "#FF6B35",
    bg: "rgba(255,107,53,0.06)",
    border: "rgba(255,107,53,0.18)",
  },
  {
    number: "02",
    title: "Tidak Ada Partner Latihan",
    body: "Tanpa lawan bicara, speaking terasa seperti latihan renang di darat — tidak ada gunanya.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    accent: "#2DB8B0",
    bg: "rgba(45,184,176,0.06)",
    border: "rgba(45,184,176,0.18)",
  },
  {
    number: "03",
    title: "Bingung Harus Mulai dari Mana",
    body: "Banyak metode, banyak aplikasi, banyak kursus — justru bikin makin stuck di titik nol.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
      </svg>
    ),
    accent: "#F59E0B",
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.18)",
  },
  {
    number: "04",
    title: "Kurang Percaya Diri",
    body: "Sudah belajar bertahun-tahun, tapi saat diminta bicara — semua kata seakan lenyap begitu saja.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    accent: "#8B5CF6",
    bg: "rgba(139,92,246,0.06)",
    border: "rgba(139,92,246,0.18)",
  },
];

/* ── Reusable scroll-reveal wrapper ── */
function Reveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });

  const initial = {
    opacity: 0,
    y: direction === "up" ? 32 : 0,
    x: direction === "left" ? -28 : direction === "right" ? 28 : 0,
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initial}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : initial}
      transition={{ duration: 0.65, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

/* ── Individual problem card ── */
function ProblemCard({
  problem,
  index,
}: {
  problem: (typeof problems)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease }}
      whileHover={{ y: -6, transition: { duration: 0.25, ease } }}
      className="group relative flex flex-col rounded-3xl p-7 cursor-default"
      style={{
        background: problem.bg,
        border: `1.5px solid ${problem.border}`,
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Large faint number watermark */}
      <span
        className="absolute top-4 right-5 font-display font-black select-none pointer-events-none leading-none"
        style={{
          fontSize: "5rem",
          color: problem.accent,
          opacity: 0.07,
          lineHeight: 1,
        }}
      >
        {problem.number}
      </span>

      {/* Icon circle */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
        style={{ background: problem.accent, color: "white" }}
      >
        {problem.icon}
      </div>

      {/* Number badge */}
      <span
        className="text-xs font-display font-bold tracking-widest uppercase mb-2"
        style={{ color: problem.accent, opacity: 0.7 }}
      >
        {problem.number}
      </span>

      {/* Title */}
      <h3
        className="font-display font-bold text-xl mb-3 leading-snug"
        style={{ color: "#0F2340" }}
      >
        {problem.title}
      </h3>

      {/* Body */}
      <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>
        {problem.body}
      </p>

      {/* Bottom accent line — grows on hover */}
      <div
        className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full origin-left transition-all duration-500"
        style={{
          background: problem.accent,
          opacity: 0,
          transform: "scaleX(0)",
        }}
      />
      <style>{`
        .group:hover .accent-line-${index} {
          opacity: 1 !important;
          transform: scaleX(1) !important;
        }
      `}</style>
    </motion.div>
  );
}

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-white py-24 lg:py-36"
    >
      {/* Subtle background texture — two soft radial gradients */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 15% 20%, rgba(255,107,53,0.05) 0%, transparent 60%), " +
            "radial-gradient(ellipse 60% 60% at 85% 80%, rgba(45,184,176,0.05) 0%, transparent 55%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 xl:px-12">
        {/* ── Section header ──────────────────────────────────────── */}
        <div className="text-center mb-16 lg:mb-20">
          {/* Eyebrow pill */}
          <Reveal>
            <div className="inline-flex items-center gap-2 mb-6">
              <span
                className="px-4 py-1.5 rounded-full text-xs font-display font-bold tracking-widest uppercase"
                style={{
                  background: "rgba(255,107,53,0.1)",
                  color: "#E8521C",
                  border: "1px solid rgba(255,107,53,0.2)",
                }}
              >
                Masalah Umum
              </span>
            </div>
          </Reveal>

          {/* Main headline — two-line, mixed color */}
          <Reveal delay={0.08}>
            <h2
              className="font-display font-extrabold leading-[1.07] mb-6 mx-auto"
              style={{
                fontSize: "clamp(1rem, 4.5vw, 3rem)",
                color: "#0F2340",
                letterSpacing: "-0.025em",
                maxWidth: "720px",
              }}
            >
              Mengapa Banyak Orang{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Tidak Pernah Berani Speaking?
              </span>
            </h2>
          </Reveal>

          {/* Subtext */}
          <Reveal delay={0.16}>
            <p
              className="text-lg leading-relaxed mx-auto"
              style={{ color: "#64748B", maxWidth: "520px" }}
            >
              Banyak orang sudah belajar bahasa Inggris bertahun-tahun tetapi
              masih merasa takut berbicara.
            </p>
          </Reveal>
        </div>

        {/* ── Problem cards grid ──────────────────────────────────── */}
        {/*
         * Responsive:
         *   mobile  → 1 column
         *   sm(640) → 2 columns
         *   lg(1024)→ 4 columns
         */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {problems.map((p, i) => (
            <ProblemCard key={p.number} problem={p} index={i} />
          ))}
        </div>

        {/* ── Bottom callout banner ───────────────────────────────── */}
        <Reveal delay={0.1}>
          <div
            className="relative overflow-hidden rounded-3xl px-8 py-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left"
            style={{
              background:
                "linear-gradient(135deg, rgba(45,184,176,0.08) 0%, rgba(45,184,176,0.14) 100%)",
              border: "1.5px solid rgba(45,184,176,0.2)",
            }}
          >
            {/* Decorative blurred circle */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 w-40 h-40 rounded-full"
              style={{
                background: "rgba(45,184,176,0.12)",
                filter: "blur(32px)",
              }}
            />

            {/* Lightbulb icon */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(45,184,176,0.15)", color: "#2DB8B0" }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.22-1.206 4.16-3 5.197V17a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1v-2.803C7.206 13.16 6 11.22 6 9a6 6 0 0 1 6-6z" />
              </svg>
            </div>

            {/* Text */}
            <p
              className="text-base sm:text-lg font-medium relative z-10"
              style={{ color: "#0F2340" }}
            >
              Belajar bahasa Inggris seharusnya{" "}
              <span className="font-bold" style={{ color: "#FF6B35" }}>
                tidak membuat kamu merasa takut!
              </span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
