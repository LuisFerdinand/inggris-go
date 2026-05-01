"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BRAND, GRADIENT_GOLD_TEXT } from "@/constants/brand";
import { SOCIAL_PROOF } from "@/constants";

const ease = [0.22, 1, 0.36, 1] as const;

const steps = [
  {
    num: "1",
    title: "Understand",
    subtitle: "Pahami Dasarnya",
    body: "Memahami kalimat sederhana dan struktur dasar bahasa Inggris dengan metode yang mudah dicerna.",
    tags: ["Kosakata dasar", "Pola kalimat", "Listening"],
    squareBg: BRAND.gradientBlue,
    accentBg: BRAND.gradientNavy,
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
    squareBg: BRAND.gradientGold,
    accentBg: BRAND.gradientBlue,
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
    squareBg: BRAND.gradientNavy,
    accentBg: BRAND.gradientGold,
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
    squareBg: BRAND.gradientBlue,
    accentBg: BRAND.gradientNavy,
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
      className="group flex flex-col items-center text-center flex-1 min-w-0 cursor-default"
    >
      <div className="relative mb-5" style={{ width: "88px", height: "88px" }}>
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
            boxShadow: BRAND.shadowBlueBtn,
            transition:
              "transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease",
          }}
        >
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
            boxShadow: BRAND.shadowBlueBtn,
          }}
        >
          {step.icon}
        </div>
      </div>

      <span
        className="font-display font-semibold mb-1 transition-colors duration-200"
        style={{
          fontSize: "0.6875rem",
          letterSpacing: "0.08em",
          color: BRAND.textFaint,
          textTransform: "uppercase",
        }}
      >
        {step.subtitle}
      </span>

      <h3
        className="font-display font-bold mb-2 leading-snug transition-colors duration-200"
        style={{
          fontSize: "1.0625rem",
          color: BRAND.blueNavy,
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.color = BRAND.goldVivid)
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.color = BRAND.blueNavy)
        }
      >
        {step.title}
      </h3>

      <p
        className="leading-relaxed mb-4"
        style={{
          fontSize: "0.8125rem",
          color: BRAND.textMuted,
          maxWidth: "176px",
        }}
      >
        {step.body}
      </p>

      <div className="flex flex-wrap justify-center gap-1.5">
        {step.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded-full font-medium transition-all duration-200
              opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
            style={{
              fontSize: "0.6875rem",
              background: BRAND.overlayGoldIcon,
              color: BRAND.goldMid,
              border: `1px solid var(--overlay-gold-blob)`,
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
      className="group relative flex gap-5"
    >
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="relative" style={{ width: "68px", height: "68px" }}>
          <div
            className="absolute top-0 left-0 flex items-center justify-center
              group-hover:scale-105 transition-transform duration-300"
            style={{
              width: "58px",
              height: "58px",
              borderRadius: "16px",
              background: step.squareBg,
              transform: `rotate(${step.rotate})`,
              boxShadow: BRAND.shadowBlueBtn,
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

          <div
            className="absolute bottom-0 right-0 z-10 flex items-center justify-center
              group-hover:-translate-y-1.5 group-hover:scale-110 transition-transform duration-300"
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "8px",
              background: step.accentBg,
              boxShadow: BRAND.shadowBlueBtn,
            }}
          >
            {step.icon}
          </div>
        </div>

        {!isLast && (
          <div
            className="mt-3 flex-1 flex flex-col items-center"
            style={{ minHeight: "40px" }}
          >
            <motion.div
              initial={{ height: 0 }}
              animate={inView ? { height: "100%" } : {}}
              transition={{ duration: 0.7, delay: index * 0.1 + 0.3, ease }}
              style={{
                width: "2px",
                background: `linear-gradient(180deg, ${BRAND.blueVivid} 0%, ${BRAND.blueFrost} 100%)`,
                borderRadius: "2px",
                flex: 1,
              }}
            />
          </div>
        )}
      </div>

      <div className="pb-10 flex-1 pt-1">
        <span
          className="font-display font-semibold block mb-1"
          style={{
            fontSize: "0.6875rem",
            letterSpacing: "0.08em",
            color: BRAND.textFaint,
            textTransform: "uppercase",
          }}
        >
          Langkah {step.num} · {step.subtitle}
        </span>

        <h3
          className="font-display font-bold mb-2 leading-snug transition-colors duration-200"
          style={{ fontSize: "1.0625rem", color: BRAND.blueNavy }}
        >
          {step.title}
        </h3>

        <p
          className="leading-relaxed mb-3"
          style={{ fontSize: "0.8125rem", color: BRAND.textMuted }}
        >
          {step.body}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {step.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full font-medium"
              style={{
                fontSize: "0.6875rem",
                background: BRAND.overlayGoldIcon,
                color: BRAND.goldMid,
                border: `1px solid var(--overlay-gold-blob)`,
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

export default function MethodSection() {
  return (
    <section className="relative w-full overflow-hidden py-20 lg:py-28 bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            `radial-gradient(ellipse 60% 50% at 85% 15%, ${BRAND.overlayBlueBlob} 0%, transparent 60%),` +
            `radial-gradient(ellipse 50% 60% at 15% 85%, ${BRAND.overlayGoldBlob} 0%, transparent 55%)`,
        }}
      />

      <style>{`
        .group:hover .step-large-square {
          transform: rotate(0deg) !important;
          box-shadow: var(--shadow-glow-blue-btn-hover) !important;
        }
      `}</style>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 xl:px-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-14 lg:mb-20">
          <Reveal>
            <div className="inline-flex items-center gap-2 mb-6">
              <span
                className="px-4 py-1.5 rounded-full text-xs font-display font-bold tracking-tight uppercase"
                style={{
                  background: BRAND.background,
                  color: BRAND.blueNavy,
                  border: `1px solid ${BRAND.border}`,
                }}
              >
                Metode kami
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <h2
              className="font-display font-extrabold leading-[1.08] mb-4"
              style={{
                fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
                letterSpacing: "-0.022em",
                color: BRAND.blueNavy,
              }}
            >
              Metode Belajar <span style={GRADIENT_GOLD_TEXT}>Inggris Go</span>
            </h2>
          </Reveal>

          <Reveal delay={0.15}>
            <p
              className="leading-relaxed"
              style={{
                fontSize: "0.9375rem",
                color: BRAND.textMuted,
                maxWidth: "420px",
              }}
            >
              4 langkah sederhana untuk berbicara bahasa Inggris dengan percaya
              diri
            </p>
          </Reveal>
        </div>

        {/* Desktop */}
        <div className="hidden lg:flex items-start justify-center gap-0">
          {steps.map((step, i) => (
            <div key={step.num} className="flex items-start">
              <DesktopStepCard step={step} index={i} />

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
                      background: BRAND.gradientGold,
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile */}
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

        {/* Bottom note */}
        <Reveal delay={0.1} className="mt-14 lg:mt-16">
          <div className="flex items-center justify-center gap-2.5">
            <div
              style={{
                width: "32px",
                height: "1px",
                background: BRAND.gradientGold,
                borderRadius: "1px",
              }}
            />
            <p
              className="font-display font-medium text-center"
              style={{ fontSize: "0.8125rem", color: BRAND.textFaint }}
            >
              Sudah terbukti membantu{" "}
              <span style={{ color: BRAND.goldVivid, fontWeight: 700 }}>
                {SOCIAL_PROOF.totalStudents}+
              </span>{" "}
              siswa dari nol jadi berani speaking
            </p>
            <div
              style={{
                width: "32px",
                height: "1px",
                background: BRAND.gradientGold,
                borderRadius: "1px",
              }}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
