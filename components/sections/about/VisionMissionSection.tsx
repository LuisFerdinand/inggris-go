import Reveal from "@/components/ui/Reveal";
import { BRAND, GRADIENT_GOLD_TEXT } from "@/constants/brand";
import { Eye, Target } from "lucide-react";
import React from "react";

const missions = [
  {
    num: "01",
    text: "Menyediakan program belajar bahasa Inggris yang terjangkau, praktis, dan berdampak nyata.",
  },
  {
    num: "02",
    text: "Menciptakan lingkungan belajar yang mendorong peserta berbicara aktif sejak hari pertama.",
  },
  {
    num: "03",
    text: "Menghadirkan tutor berkualitas yang tidak hanya mengajar, tetapi menginspirasi.",
  },
  {
    num: "04",
    text: "Memperluas akses pendidikan bahasa Inggris berkualitas ke seluruh Indonesia.",
  },
];

export const VisionMissionSection = () => {
  return (
    <section
      className="py-16 lg:py-24"
      style={{ background: BRAND.background }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 xl:px-12">
        {/* ── Header ── */}
        <Reveal className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: BRAND.blueNavy }}
            />
            <span
              className="font-display font-bold"
              style={{
                fontSize: "0.6875rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#94A3B8",
              }}
            >
              Visi & Misi
            </span>
          </div>
          <h2
            className="font-display font-extrabold"
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
              letterSpacing: "-0.022em",
              color: BRAND.blueNavy,
            }}
          >
            Arah & Tujuan Kami
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* ════════════════════════════════════════════════════════
           *  VISION CARD — dark navy, aspirational feel
           *  Full card is navy bg (like the Company card) with
           *  blueNavy accent. The "big bold vision statement" deserves
           *  a bold, dark, confident look.
           * ════════════════════════════════════════════════════════ */}
          <Reveal delay={0.05}>
            <div
              className="relative h-full rounded-3xl overflow-hidden flex flex-col"
              style={{
                background:
                  "linear-gradient(145deg, #0C1B30 0%, #0F2340 50%, #1A365D 100%)",
                boxShadow: "0 8px 40px rgba(15,35,64,0.2)",
                minHeight: "340px",
              }}
            >
              {/* Dot grid */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='1' fill='%23ffffff' fill-opacity='0.04'/%3E%3C/svg%3E")`,
                  backgroundSize: "24px 24px",
                }}
              />

              {/* BlueNblueNavy glow — bottom right */}
              <div
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  bottom: "-32px",
                  right: "-32px",
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255,107,53,0.18) 0%, transparent 65%)",
                  filter: "blur(28px)",
                }}
              />

              {/* Large decorative "VISI" watermark */}
              <div
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  bottom: "-12px",
                  right: "16px",
                  fontFamily: "var(--font-syne), sans-serif",
                  fontWeight: 900,
                  fontSize: "6rem",
                  color: "rgba(255,255,255,0.03)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  userSelect: "none",
                }}
              >
                VISI
              </div>

              <div className="relative z-10 flex flex-col flex-1 p-8 lg:p-10">
                {/* Label + icon row */}
                <div className="flex items-center gap-3 mb-8">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND.goldVivid} 0%, ${BRAND.goldMid} 100%)`,
                      boxShadow: "0 6px 20px rgba(255,107,53,0.35)",
                    }}
                  >
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p
                      className="font-display font-bold"
                      style={{
                        fontSize: "0.625rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: BRAND.goldVivid,
                      }}
                    >
                      Visi
                    </p>
                    <h3
                      className="font-display font-extrabold text-white"
                      style={{
                        fontSize: "1.125rem",
                        letterSpacing: "-0.015em",
                      }}
                    >
                      Our Vision
                    </h3>
                  </div>
                </div>

                {/* Vision statement — large, commanding */}
                <p
                  className="font-display font-bold text-white flex-1"
                  style={{
                    fontSize: "clamp(1.0625rem, 2vw, 1.25rem)",
                    lineHeight: "1.65",
                    color: "rgba(255,255,255,0.88)",
                  }}
                >
                  Menjadi platform pembelajaran bahasa Inggris terdepan yang
                  melahirkan generasi Indonesia yang percaya diri berkomunikasi
                  secara global —
                  <span style={GRADIENT_GOLD_TEXT}>
                    {" "}
                    tanpa rasa takut, tanpa hambatan.
                  </span>
                </p>

                {/* Bottom accent line */}
                <div className="mt-8 flex items-center gap-3">
                  <div
                    style={{
                      height: "2px",
                      width: "32px",
                      borderRadius: "2px",
                      background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.blueNavy})`,
                    }}
                  />
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "rgba(255,255,255,0.25)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Inggris Go · Est. 2022
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* ════════════════════════════════════════════════════════
           *  MISSION CARD — light/cream bg, numbered list
           *  Missions are concrete and actionable — a lighter, more
           *  readable surface makes the numbered items easy to scan.
           *  Teal accent throughout.
           * ════════════════════════════════════════════════════════ */}
          <Reveal delay={0.1}>
            <div
              className="h-full rounded-3xl overflow-hidden flex flex-col"
              style={{
                background: "white",
                border: "1.5px solid rgba(45,184,176,0.16)",
                boxShadow: "0 8px 40px rgba(45,184,176,0.07)",
              }}
            >
              {/* Teal header strip */}
              <div
                className="px-8 py-5 lg:px-10 flex items-center gap-3"
                style={{
                  background:
                    "linear-gradient(135deg, #2DB8B0 0%, #1A9990 100%)",
                  flexShrink: 0,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p
                    className="font-display font-bold text-white"
                    style={{
                      fontSize: "0.625rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      opacity: 0.7,
                    }}
                  >
                    Misi
                  </p>
                  <h3
                    className="font-display font-extrabold text-white"
                    style={{ fontSize: "1.125rem", letterSpacing: "-0.015em" }}
                  >
                    Our Mission
                  </h3>
                </div>
              </div>

              {/* Mission items */}
              <div className="flex-1 flex flex-col p-8 lg:p-10">
                <ul className="space-y-0 flex-1">
                  {missions.map((m, i) => (
                    <li
                      key={m.num}
                      className="flex items-start gap-4 py-4"
                      style={{
                        borderBottom:
                          i < missions.length - 1
                            ? "1px solid rgba(45,184,176,0.1)"
                            : "none",
                      }}
                    >
                      {/* Number badge */}
                      <span
                        className="font-display font-extrabold flex-shrink-0 mt-0.5"
                        style={{
                          fontSize: "0.75rem",
                          color: BRAND.problem.teal.accent,
                          opacity: 0.5,
                          letterSpacing: "0.06em",
                          minWidth: "24px",
                        }}
                      >
                        {m.num}
                      </span>

                      {/* 3px accent bar */}
                      <div
                        className="flex-shrink-0 mt-1.5"
                        style={{
                          width: "3px",
                          height: "calc(100% - 4px)",
                          minHeight: "36px",
                          borderRadius: "2px",
                          background: `linear-gradient(180deg, ${BRAND.problem.teal.accent} 0%, rgba(45,184,176,0.15) 100%)`,
                        }}
                      />

                      <p
                        style={{
                          fontSize: "0.9375rem",
                          color: "#334155",
                          lineHeight: "1.65",
                        }}
                      >
                        {m.text}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
