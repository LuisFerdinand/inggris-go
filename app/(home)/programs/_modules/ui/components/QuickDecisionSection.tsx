// app/(home)/programs/_modules/ui/components/QuickDecisionSection.tsx
import { useMemo, useState } from "react";
import { CATEGORIES } from "../../../[categorySlug]/data";
import { EASE, Reveal } from "../views/ProgramsView";
import { generateTheme } from "@/lib/utils";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/Icon";

export function QuickDecisionSection({
  onSelect,
}: {
  onSelect: (key: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const categories = useMemo(() => Object.values(CATEGORIES), []);

  return (
    <section
      className="relative py-16 lg:py-24 overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #060f2e 0%, #0a2d87 60%, #0f3aa0 100%)",
      }}
    >
      {/* Radial overlays */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 15% 50%, rgba(26,82,200,0.4) 0%, transparent 55%), radial-gradient(circle at 85% 50%, rgba(58,143,245,0.22) 0%, transparent 55%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
      />
      <div>
        <div></div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <Reveal>
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#4ade80" }}
              />
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: "0.05em",
                }}
              >
                Pilih kondisi kamu
              </span>
            </div>
            <p
              className="font-display font-black mb-2 leading-tight"
              style={{
                fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)",
                color: "white",
                letterSpacing: "-0.022em",
              }}
            >
              Masih bingung? Jawab ini:
            </p>
            <p
              style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.45)" }}
            >
              Klik yang paling mencerminkan situasimu sekarang
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-3 gap-5">
          {categories.map((cat, i) => {
            const theme = generateTheme(cat.theme.primary);
            return (
              <Reveal key={cat.key} delay={i * 0.08}>
                <motion.button
                  onClick={() => onSelect(cat.key)}
                  onHoverStart={() => setHovered(cat.key)}
                  onHoverEnd={() => setHovered(null)}
                  whileHover={{ scale: 1.035, y: -6 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.26, ease: EASE }}
                  className="w-full text-left rounded-2xl relative overflow-hidden"
                  style={{
                    background:
                      hovered === cat.key
                        ? "rgba(255,255,255,0.13)"
                        : "rgba(255,255,255,0.065)",
                    border: `1.5px solid ${hovered === cat.key ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"}`,
                    backdropFilter: "blur(10px)",
                    cursor: "pointer",
                    transition:
                      "background 0.22s ease, border-color 0.22s ease",
                    padding: 0,
                  }}
                >
                  {/* Glow on hover */}
                  <AnimatePresence>
                    {hovered === cat.key && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `radial-gradient(ellipse 90% 80% at 50% 115%, ${theme.soft} 0%, transparent 70%)`,
                        }}
                      />
                    )}
                  </AnimatePresence>

                  <div className="relative z-10 p-5">
                    {/* Large icon */}
                    <div className="mb-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{
                          background: theme.soft,
                          border: `1.5px solid ${theme.border}`,
                        }}
                      >
                        <Icon
                          name={cat.icon as any}
                          className="w-7 h-7"
                          style={{ color: theme.primary } as any}
                        />
                      </div>
                    </div>

                    <div className="flex items-start justify-between mb-3">
                      <p
                        className="font-display font-bold leading-snug"
                        style={{
                          fontSize: "1rem",
                          color: "white",
                          flex: 1,
                          paddingRight: "0.5rem",
                        }}
                      >
                        "{cat.quickDecisionLabel}"
                      </p>
                      <span
                        className="font-display font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{
                          background: theme.soft,
                          color: theme.primary,
                          border: `1px solid ${theme.border}`,
                          fontSize: "0.5875rem",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        {cat.shortLabel}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "rgba(255,255,255,0.5)",
                        lineHeight: "1.55",
                        marginBottom: "1.25rem",
                      }}
                    >
                      {cat.quickDecisionDesc}
                    </p>

                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200"
                      style={{
                        border: "1px solid rgba(255,255,255,0.14)",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: theme.primary,
                          fontWeight: 600,
                        }}
                      >
                        Lihat Program
                      </span>

                      <motion.svg
                        viewBox="0 0 16 16"
                        className="w-3.5 h-3.5"
                        fill="none"
                        animate={hovered === cat.key ? { x: 4 } : { x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <path
                          d="M3 8h10M9 4l4 4-4 4"
                          stroke={theme.primary}
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </motion.svg>
                    </div>
                  </div>
                </motion.button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
