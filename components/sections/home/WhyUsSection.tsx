"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const features = [
  {
    iconBg: "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
    iconShadow: "rgba(255,107,53,0.45)",
    accentColor: "#FF6B35",
    title: "Metode Praktis",
    desc: "Dirancang khusus untuk pemula — langsung speaking dari hari pertama, tanpa basa-basi teori.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
      </svg>
    ),
  },
  {
    iconBg: "linear-gradient(135deg, #2DB8B0 0%, #1A9990 100%)",
    iconShadow: "rgba(45,184,176,0.45)",
    accentColor: "#2DB8B0",
    title: "Tutor Berpengalaman",
    desc: "Tim tutor profesional dari Kampung Inggris Pare dengan jam terbang tinggi dan dedikasi penuh.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    iconBg: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
    iconShadow: "rgba(124,58,237,0.45)",
    accentColor: "#7C3AED",
    title: "Online & Offline",
    desc: "Belajar dari rumah secara online, atau datang langsung ke Pare untuk pengalaman belajar imersif.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    iconBg: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
    iconShadow: "rgba(245,158,11,0.45)",
    accentColor: "#F59E0B",
    title: "Kampung Inggris Pare",
    desc: "Lingkungan belajar autentik di pusat bahasa Inggris terbesar Indonesia — ekosistem terbaik untuk berkembang.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
  {
    iconBg: "linear-gradient(135deg, #EC4899 0%, #DB2777 100%)",
    iconShadow: "rgba(236,72,153,0.45)",
    accentColor: "#EC4899",
    title: "Fokus Speaking",
    desc: "Setiap program kami punya satu tujuan: membuatmu berani dan lancar bicara bahasa Inggris.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
      </svg>
    ),
  },
  {
    iconBg: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    iconShadow: "rgba(16,185,129,0.45)",
    accentColor: "#10B981",
    title: "Garansi Belajar",
    desc: "Komitmen kualitas penuh — pendampingan berkelanjutan hingga kamu mencapai target yang ditetapkan.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
];

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

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.08, ease }}
      whileHover={{ y: -6, transition: { duration: 0.28, ease } }}
      /* "group" lives here — no extra absolute children */
      className="group relative flex flex-col rounded-2xl p-6 overflow-hidden cursor-default"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        transition:
          "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
      }}
      /* Framer handles y; Tailwind group handles everything else */
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = "rgba(255,255,255,0.075)";
        el.style.borderColor = "rgba(255,255,255,0.15)";
        el.style.boxShadow = "0 24px 56px rgba(0,0,0,0.35)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = "rgba(255,255,255,0.04)";
        el.style.borderColor = "rgba(255,255,255,0.08)";
        el.style.boxShadow = "none";
      }}
    >
      {/* Top accent line — CSS transition via group, no rogue div */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] origin-left
          scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-tr-full"
        style={{ background: feature.iconBg }}
      />

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 flex-shrink-0
          transition-all duration-300 ease-out
          group-hover:scale-110 group-hover:-rotate-3"
        style={{
          background: feature.iconBg,
          boxShadow: `0 6px 20px ${feature.iconShadow}`,
        }}
      >
        {feature.icon}
      </div>

      {/* Title */}
      <h3
        className="font-display font-bold mb-2.5 leading-snug text-white"
        style={{ fontSize: "0.9375rem" }}
      >
        {feature.title}
      </h3>

      {/* Desc */}
      <p
        className="leading-relaxed"
        style={{
          fontSize: "0.8125rem",
          color: "rgba(255,255,255,0.45)",
          lineHeight: "1.7",
        }}
      >
        {feature.desc}
      </p>
    </motion.div>
  );
}

function GeometricLines() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Top-left corner bracket */}
      <path
        d="M 0 180 L 0 40 Q 0 0 40 0 L 180 0"
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="1"
      />
      <path
        d="M 0 140 L 0 60 Q 0 24 24 24 L 140 24"
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="1"
      />

      {/* Bottom-right corner bracket */}
      <path
        d="M 100% 100% L calc(100% - 180px) 100% M 100% 100% L 100% calc(100% - 180px)"
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="1"
      />

      {/* Diagonal accent lines — top-right quadrant */}
      <line
        x1="75%"
        y1="0"
        x2="100%"
        y2="30%"
        stroke="rgba(255,107,53,0.06)"
        strokeWidth="1"
      />
      <line
        x1="82%"
        y1="0"
        x2="100%"
        y2="20%"
        stroke="rgba(255,107,53,0.04)"
        strokeWidth="1"
      />
      <line
        x1="90%"
        y1="0"
        x2="100%"
        y2="12%"
        stroke="rgba(255,107,53,0.03)"
        strokeWidth="1"
      />

      {/* Diagonal accent lines — bottom-left quadrant */}
      <line
        x1="0"
        y1="70%"
        x2="25%"
        y2="100%"
        stroke="rgba(45,184,176,0.05)"
        strokeWidth="1"
      />
      <line
        x1="0"
        y1="80%"
        x2="18%"
        y2="100%"
        stroke="rgba(45,184,176,0.04)"
        strokeWidth="1"
      />

      {/* Subtle horizontal rule through mid-section */}
      <line
        x1="5%"
        y1="50%"
        x2="95%"
        y2="50%"
        stroke="rgba(255,255,255,0.025)"
        strokeWidth="1"
        strokeDasharray="6 18"
      />

      {/* Small cross/plus marks */}
      <g stroke="rgba(255,255,255,0.07)" strokeWidth="1">
        <line x1="8%" y1="19%" x2="8%" y2="23%" />
        <line x1="6%" y1="21%" x2="10%" y2="21%" />
      </g>
      <g stroke="rgba(255,107,53,0.15)" strokeWidth="1">
        <line x1="92%" y1="77%" x2="92%" y2="81%" />
        <line x1="90%" y1="79%" x2="94%" y2="79%" />
      </g>
      <g stroke="rgba(45,184,176,0.15)" strokeWidth="1">
        <line x1="50%" y1="8%" x2="50%" y2="11%" />
        <line x1="48.5%" y1="9.5%" x2="51.5%" y2="9.5%" />
      </g>

      {/* Small diamond shapes */}
      <polygon
        points="88,44 96,52 88,60 80,52"
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function WhyUsSection() {
  return (
    <section
      className="relative w-full overflow-hidden py-20 lg:py-28"
      style={{ background: "#0A1628" }}
    >
      {/* Dot-grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='1' fill='%23ffffff' fill-opacity='0.035'/%3E%3C/svg%3E")`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Geometric line decorations — replace the circles */}
      <GeometricLines />

      {/* Ambient glow blobs — atmosphere only */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: "-25%",
          left: "-12%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,107,53,0.07) 0%, transparent 65%)",
          filter: "blur(60px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          bottom: "-20%",
          right: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(45,184,176,0.06) 0%, transparent 65%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 xl:px-12">
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center mb-12 lg:mb-16">
          <Reveal>
            <span
              className="inline-block px-4 py-1.5 rounded-full font-display font-semibold mb-5"
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
                background: "rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              Keunggulan Kami
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h2
              className="font-display font-extrabold leading-[1.08] mb-4 text-white"
              style={{
                fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                letterSpacing: "-0.022em",
              }}
            >
              Mengapa Belajar di{" "}
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
              ?
            </h2>
          </Reveal>

          <Reveal delay={0.15}>
            <p
              className="leading-relaxed"
              style={{
                fontSize: "0.9375rem",
                color: "rgba(255,255,255,0.4)",
                maxWidth: "400px",
              }}
            >
              Bukan sekadar kursus biasa — kami membangun kepercayaan diri
              berbicara bahasa Inggris dari nol.
            </p>
          </Reveal>
        </div>

        {/* ── 3×2 grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 mb-16">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>

        {/* ── Bottom CTA band ────────────────────────────────────
         *   Replaces stats — a single warm callout that nudges action.
         *   Feels earned after seeing 6 reasons to trust.
         ─────────────────────────────────────────────────────────── */}
        <Reveal delay={0.1}>
          <div
            className="relative overflow-hidden rounded-2xl px-8 py-7
              flex flex-col sm:flex-row items-center justify-between gap-5"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,107,53,0.12) 0%, rgba(255,107,53,0.06) 100%)",
              border: "1px solid rgba(255,107,53,0.2)",
            }}
          >
            {/* Faint diagonal stripe texture */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(255,107,53,0.03) 0px, rgba(255,107,53,0.03) 1px, transparent 1px, transparent 12px)",
              }}
            />

            <div className="relative z-10 text-center sm:text-left">
              <p
                className="font-display font-bold text-white mb-1"
                style={{ fontSize: "1rem" }}
              >
                Siap mulai perjalananmu?
              </p>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                Bergabung dengan 500+ siswa yang sudah merasakan manfaatnya.
              </p>
            </div>

            <a
              href="#programs"
              className="relative z-10 inline-flex items-center gap-2 font-display font-bold
                rounded-full px-6 py-3 flex-shrink-0 text-white
                transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                fontSize: "0.875rem",
                background: "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
                boxShadow: "0 6px 20px rgba(255,107,53,0.35)",
              }}
            >
              Lihat Program Kami
              <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="white"
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
