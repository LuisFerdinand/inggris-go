// VisionMissionSection.tsx
import Reveal from "@/components/ui/Reveal";
import { BRAND, GRADIENT_GOLD_TEXT } from "@/constants/brand";
import { Eye, Target } from "lucide-react";

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
              Visi &amp; Misi
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
            Arah &amp; <span style={GRADIENT_GOLD_TEXT}>Tujuan</span> Kami
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* ══════════════════════════════════════════════
           *  VISION CARD — dark navy, aspirational
           * ══════════════════════════════════════════════ */}
          <Reveal delay={0.05}>
            <div
              className="relative h-full rounded-3xl overflow-hidden flex flex-col group"
              style={{
                background:
                  "linear-gradient(145deg, #0C1B30 0%, #0F2340 55%, #1A365D 100%)",
                boxShadow: "0 8px 40px rgba(15,35,64,0.22)",
                minHeight: "360px",
              }}
            >
              {/* Dot grid texture */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Ccircle cx='11' cy='11' r='1' fill='%23ffffff' fill-opacity='0.045'/%3E%3C/svg%3E")`,
                  backgroundSize: "22px 22px",
                }}
              />

              {/* Glow — bottom right (gold) */}
              <div
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  bottom: "-40px",
                  right: "-40px",
                  width: "220px",
                  height: "220px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(201,150,58,0.22) 0%, transparent 65%)",
                  filter: "blur(32px)",
                }}
              />

              {/* Glow — top left (blue) */}
              <div
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  top: "-60px",
                  left: "-60px",
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(24,95,165,0.28) 0%, transparent 65%)",
                  filter: "blur(32px)",
                }}
              />

              {/* Shimmer sweep on hover */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                  background:
                    "linear-gradient(120deg, transparent 25%, rgba(201,150,58,0.07) 50%, transparent 75%)",
                  transform: "skewX(-8deg)",
                }}
              />

              {/* Watermark */}
              <div
                aria-hidden
                className="pointer-events-none absolute select-none"
                style={{
                  bottom: "-14px",
                  right: "14px",
                  fontFamily: "var(--font-syne), sans-serif",
                  fontWeight: 900,
                  fontSize: "6rem",
                  color: "rgba(255,255,255,0.025)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                VISI
              </div>

              <div className="relative z-10 flex flex-col flex-1 p-8 lg:p-10">
                {/* Icon + label row */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND.goldVivid} 0%, ${BRAND.goldMid} 100%)`,
                      boxShadow: "0 6px 20px rgba(201,150,58,0.35)",
                    }}
                  >
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p
                      className="font-display font-bold"
                      style={{
                        fontSize: "0.625rem",
                        letterSpacing: "0.14em",
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

                {/* Gold pill badge */}
                <div
                  className="inline-flex items-center gap-2 mb-6 self-start"
                  style={{
                    background: "rgba(201,150,58,0.1)",
                    border: "1px solid rgba(201,150,58,0.25)",
                    borderRadius: "100px",
                    padding: "5px 14px",
                  }}
                >
                  <div
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: BRAND.goldVivid,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    className="font-display font-bold"
                    style={{
                      fontSize: "0.6875rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: BRAND.goldVivid,
                    }}
                  >
                    Inggris Go · Est. 2022
                  </span>
                </div>

                {/* Vision statement */}
                <p
                  className="font-display font-bold flex-1"
                  style={{
                    fontSize: "clamp(1.0625rem, 1.8vw, 1.25rem)",
                    lineHeight: "1.7",
                    color: "rgba(255,255,255,0.88)",
                    marginBottom: "28px",
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

                {/* Footer accent */}
                <div
                  className="flex items-center gap-3"
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.07)",
                    paddingTop: "20px",
                  }}
                >
                  <div
                    style={{
                      height: "2px",
                      width: "32px",
                      borderRadius: "2px",
                      background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.blueNavy})`,
                      flexShrink: 0,
                    }}
                  />
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "rgba(255,255,255,0.25)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Membangun Indonesia yang berbicara dunia
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* ══════════════════════════════════════════════
           *  MISSION CARD — white surface, navy header
           * ══════════════════════════════════════════════ */}
          <Reveal delay={0.1}>
            <div
              className="h-full rounded-3xl overflow-hidden flex flex-col"
              style={{
                background: "white",
                border: `1.5px solid rgba(26,58,110,0.12)`,
                boxShadow: "0 8px 40px rgba(26,58,110,0.07)",
              }}
            >
              {/* Navy header strip */}
              <div
                className="px-8 py-5 lg:px-10 flex items-center gap-3 flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.blueNavy} 0%, #0C1B30 100%)`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p
                    className="font-display font-bold text-white"
                    style={{
                      fontSize: "0.625rem",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      opacity: 0.5,
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
              <ul className="flex-1 flex flex-col">
                {missions.map((m, i) => (
                  <li
                    key={m.num}
                    className="flex items-start gap-4 px-8 lg:px-10 py-5 transition-colors duration-200"
                    style={{
                      borderBottom:
                        i < missions.length - 1
                          ? `1px solid rgba(26,58,110,0.07)`
                          : "none",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLLIElement).style.background =
                        "rgba(26,58,110,0.03)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLLIElement).style.background =
                        "transparent";
                    }}
                  >
                    {/* Number */}
                    <span
                      className="font-display font-extrabold flex-shrink-0"
                      style={{
                        fontSize: "0.75rem",
                        color: BRAND.goldVivid,
                        opacity: 0.65,
                        letterSpacing: "0.08em",
                        minWidth: "24px",
                        paddingTop: "3px",
                      }}
                    >
                      {m.num}
                    </span>

                    {/* Accent bar — navy gradient */}
                    <div
                      className="flex-shrink-0"
                      style={{
                        width: "3px",
                        minHeight: "38px",
                        borderRadius: "2px",
                        marginTop: "4px",
                        background: `linear-gradient(180deg, ${BRAND.blueNavy} 0%, rgba(26,58,110,0.12) 100%)`,
                      }}
                    />

                    <p
                      style={{
                        fontSize: "0.9375rem",
                        color: "#334155",
                        lineHeight: "1.68",
                      }}
                    >
                      {m.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
