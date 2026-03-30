"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export default function HeroAnimated() {
  const reduced = useReducedMotion();

  return (
    <>
      <section
        className="relative w-full overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #FFF9F5 0%, #FFE8DC 50%, #FFF9F5 100%)",
        }}
      >
        <style>{`
        @keyframes blob {
          0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50%      { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }
        @keyframes floating {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
      `}</style>

        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "8%",
            left: "-7%",
            width: "clamp(220px, 28vw, 400px)",
            height: "clamp(220px, 28vw, 400px)",
            background: "rgba(255,107,53,0.13)",
            animation: reduced ? "none" : "blob 8s ease-in-out infinite",
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: "-2%",
            right: "-6%",
            width: "clamp(250px, 32vw, 460px)",
            height: "clamp(250px, 32vw, 460px)",
            background: "rgba(45,184,176,0.12)",
            animation: reduced
              ? "none"
              : "blob 10s ease-in-out infinite reverse",
            animationDelay: "-4s",
            borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 xl:px-12 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div variants={container} initial="hidden" animate="show">
              <motion.div variants={item} className="mb-6">
                <span
                  className="inline-flex items-center gap-2 bg-white text-sm font-medium px-4 py-2 rounded-full"
                  style={{
                    color: "#1A365D",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  }}
                >
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  Kampung Inggris Pare, Indonesia
                </span>
              </motion.div>

              <motion.h1
                variants={item}
                className="font-display font-extrabold leading-[1.08] mb-6"
                style={{
                  color: "#0F2340",
                  fontSize: "clamp(2.2rem, 4.5vw, 3.75rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                Belajar Bahasa Inggris{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Tanpa Takut Salah
                </span>
              </motion.h1>

              <motion.p
                variants={item}
                className="text-xl leading-relaxed mb-2"
                style={{ color: "#4A5568", maxWidth: "480px" }}
              >
                Mulai berbicara bahasa Inggris dengan percaya diri bersama{" "}
                <strong style={{ color: "#FF6B35", fontWeight: 600 }}>
                  Inggris Go
                </strong>{" "}
                dari Kampung Inggris Pare.
              </motion.p>
              <motion.p
                variants={item}
                className="text-base leading-relaxed mb-8"
                style={{ color: "#718096", maxWidth: "480px" }}
              >
                Inggris Go membantu pemula belajar speaking dengan cara yang
                sederhana, praktis, dan menyenangkan melalui program online,
                privat, dan English camp.
              </motion.p>

              <motion.div
                variants={item}
                className="flex flex-wrap gap-3 mb-10"
              >
                <Link
                  href="/speaking-challenge"
                  className="inline-flex items-center gap-2 font-bold text-base text-white rounded-full px-8 py-4"
                  style={{
                    background:
                      "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
                    boxShadow: "0 8px 28px rgba(255,107,53,0.4)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(-2px)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 14px 40px rgba(255,107,53,0.48)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 8px 28px rgba(255,107,53,0.4)";
                  }}
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Mulai Speaking Challenge
                </Link>

                <a
                  href="#programs"
                  className="inline-flex items-center font-bold text-base text-white rounded-full px-8 py-4"
                  style={{
                    background:
                      "linear-gradient(135deg, #1A365D 0%, #2D4A7C 100%)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(-2px)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 10px 30px rgba(26,54,93,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "";
                    (e.currentTarget as HTMLElement).style.boxShadow = "";
                  }}
                >
                  Lihat Semua Program
                </a>
              </motion.div>

              <motion.div
                variants={item}
                className="flex items-center gap-6 sm:gap-8 flex-wrap"
              >
                {[
                  { value: "500+", label: "Siswa Bergabung", color: "#FF6B35" },
                  { value: "4.9★", label: "Rating Kepuasan", color: "#2DB8B0" },
                  { value: "5+", label: "Tahun Pengalaman", color: "#1A365D" },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-6 sm:gap-8"
                  >
                    {i > 0 && (
                      <div
                        style={{
                          width: "1px",
                          height: "48px",
                          background: "#D1D5DB",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div>
                      <p
                        className="font-display font-bold leading-none mb-1"
                        style={{ fontSize: "1.875rem", color: stat.color }}
                      >
                        {stat.value}
                      </p>
                      <p className="text-sm" style={{ color: "#718096" }}>
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.85, delay: 0.3, ease }}
              className="relative hidden lg:flex justify-center"
            >
              <div
                className="relative rounded-3xl p-8 xl:p-12 w-full"
                style={{
                  maxWidth: "440px",
                  background:
                    "linear-gradient(135deg, rgba(255,107,53,0.18) 0%, rgba(45,184,176,0.15) 100%)",
                }}
              >
                <motion.div
                  animate={reduced ? {} : { y: [0, -10, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut",
                  }}
                  className="bg-white rounded-2xl p-6"
                  style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "#FFE8DC" }}
                    >
                      <svg
                        className="w-8 h-8"
                        fill="#FF6B35"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: "#1A365D" }}>
                        Live Speaking Practice
                      </p>
                      <p className="text-sm" style={{ color: "#718096" }}>
                        dengan Tutor Berpengalaman
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: "#FFF9F5" }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(45,184,176,0.15)" }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="#2DB8B0"
                          viewBox="0 0 24 24"
                        >
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </div>
                      <p className="text-sm" style={{ color: "#1A365D" }}>
                        &ldquo;Hello! How are you today?&rdquo;
                      </p>
                    </div>

                    <div
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: "#FFF9F5" }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(255,107,53,0.15)" }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="#FF6B35"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
                          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                        </svg>
                      </div>
                      <p className="text-sm" style={{ color: "#1A365D" }}>
                        &ldquo;I&apos;m fine, thank you!&rdquo;
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.75, duration: 0.4, ease }}
                  className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                  style={{
                    background: "#FF6B35",
                    boxShadow: "0 8px 28px rgba(255,107,53,0.45)",
                  }}
                >
                  GO!
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.95, duration: 0.4, ease }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-xl px-4 py-2"
                  style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
                >
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#2DB8B0" }}
                  >
                    🎯 Start Speaking Today!
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
