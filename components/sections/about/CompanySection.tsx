import Reveal from "@/components/ui/Reveal";
import { SOCIAL_PROOF } from "@/constants";
import { BRAND } from "@/constants/brand";
import { Award, MapPin, Users } from "lucide-react";
import Image from "next/image";
import React from "react";

const chips = [
  { icon: MapPin, text: "Kampung Inggris Pare, Kediri" },
  { icon: Users, text: `${SOCIAL_PROOF.totalStudents}+ alumni` },
  { icon: Award, text: "Tutor berpengalaman" },
];

export const CompanySection = () => {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-stretch">
          {/* ── LEFT: text content ── */}
          <Reveal>
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-5">
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
                  Profil Perusahaan
                </span>
              </div>

              <h2
                className="font-display font-extrabold mb-5 leading-[1.1]"
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                  letterSpacing: "-0.022em",
                  color: BRAND.blueNavy,
                }}
              >
                Siapa Kami?
              </h2>

              <div
                className="space-y-4 flex-1"
                style={{
                  fontSize: "0.9375rem",
                  color: "#475569",
                  lineHeight: "1.75",
                }}
              >
                <p>
                  <strong style={{ color: BRAND.blueNavy }}>Inggris Go</strong>{" "}
                  adalah lembaga belajar bahasa Inggris berbasis di Kampung
                  Inggris Pare, Kediri — pusat bahasa Inggris terbesar di
                  Indonesia. Kami didirikan dengan satu keyakinan: rasa takut
                  salah ngomong adalah hambatan terbesar, bukan kemampuan.
                </p>
                <p>
                  Kami menyediakan program online yang terjangkau untuk pemula,
                  kelas intensif dengan kelas kecil untuk hasil maksimal,
                  program camp di Pare untuk pengalaman imersif, hingga program
                  khusus untuk sekolah dan pesantren di seluruh Indonesia.
                </p>
                <p>
                  Dengan tim tutor berpengalaman dan metode yang berfokus pada
                  speaking aktif sejak hari pertama, siswa telah membuktikan
                  bahwa bahasa Inggris bukan sesuatu yang sulit — hanya butuh
                  tempat yang tepat untuk berlatih.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-2.5">
                {chips.map((item) => (
                  <div
                    key={item.text}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl"
                    style={{
                      background: BRAND.background,
                      border: "1px solid rgba(255,107,53,0.14)",
                      fontSize: "0.8125rem",
                      color: BRAND.blueNavy,
                    }}
                  >
                    <item.icon
                      className="w-3.5 h-3.5 flex-shrink-0"
                      style={{ color: BRAND.blueNavy }}
                    />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* ── RIGHT: brand identity card ── */}
          <Reveal delay={0.12}>
            <div
              className="relative rounded-3xl overflow-hidden flex flex-col"
              style={{
                background:
                  "linear-gradient(145deg, #0C1B30 0%, #0F2340 45%, #1A365D 100%)",
                boxShadow: "0 28px 72px rgba(15,35,64,0.28)",
                minHeight: "460px",
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

              {/* Orange glow — bottom right */}
              <div
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  bottom: "-40px",
                  right: "-40px",
                  width: "240px",
                  height: "240px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255,107,53,0.16) 0%, transparent 65%)",
                  filter: "blur(30px)",
                }}
              />

              {/* Teal glow — top left */}
              <div
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  top: "-30px",
                  left: "-30px",
                  width: "180px",
                  height: "180px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(45,184,176,0.1) 0%, transparent 65%)",
                  filter: "blur(24px)",
                }}
              />

              {/* Decorative rings behind logo */}
              <div
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  top: "44%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "300px",
                  height: "300px",
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.045)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  top: "44%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "220px",
                  height: "220px",
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.035)",
                }}
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col flex-1 px-8 py-10 lg:px-10">
                {/* Logo — centered, takes all available space above divider */}
                <div className="flex-1 flex items-center justify-center py-6">
                  <div className="relative">
                    {/* Halo */}
                    <div
                      aria-hidden
                      style={{
                        position: "absolute",
                        inset: "-28px",
                        borderRadius: "50%",
                        background:
                          "radial-gradient(circle, rgba(255,107,53,0.1) 0%, transparent 70%)",
                        filter: "blur(14px)",
                      }}
                    />
                    <Image
                      src="/logo.png"
                      alt="Inggris Go"
                      width={220}
                      height={220}
                      priority
                      className="relative z-10 w-auto"
                      style={{
                        height: "clamp(150px, 18vw, 210px)",
                        objectFit: "contain",
                        filter: "drop-shadow(0 8px 32px rgba(255,107,53,0.22))",
                      }}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div
                  style={{
                    height: "1px",
                    background: "rgba(255,255,255,0.07)",
                    marginBottom: "20px",
                  }}
                />

                {/* Quote */}
                <div className="mb-5">
                  <p
                    className="font-display font-extrabold text-white mb-2"
                    style={{
                      fontSize: "clamp(1rem, 2vw, 1.125rem)",
                      letterSpacing: "-0.015em",
                      lineHeight: "1.35",
                    }}
                  >
                    "Speak First, Perfect Later."
                  </p>

                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "rgba(255,255,255,0.38)",
                      lineHeight: "1.6",
                    }}
                  >
                    Filosofi kami — mulailah berbicara dari hari pertama.
                    Kesempurnaan datang seiring latihan.
                  </p>

                  <p
                    className="mt-3 leading-snug"
                    style={{
                      fontSize: "0.75rem",
                    }}
                  >
                    <span className="block text-white/70">
                      — Nina Rokhmawati, S.Pd
                    </span>
                    <span className="block text-white/30">
                      CEO & Founder · Inggris Go
                    </span>
                  </p>
                </div>

                {/* Location line — minimal footer, no stats */}
                <div
                  className="flex items-center gap-2"
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    paddingTop: "14px",
                  }}
                >
                  <div
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: BRAND.problem.teal.accent,
                      opacity: 0.55,
                      flexShrink: 0,
                    }}
                  />
                  <p
                    style={{
                      fontSize: "0.6875rem",
                      color: "rgba(255,255,255,0.25)",
                      letterSpacing: "0.03em",
                    }}
                  >
                    Kampung Inggris Pare, Kediri · Indonesia
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
