// app/(home)/programs/_modules/ui/views/ProgramsView.tsx
"use client";

import { useRef, useState, useEffect, useCallback, useMemo, act } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

import { Icon } from "@/components/Icon";
import SectionHeading from "@/components/ui/SectionHeading";
import { generateTheme } from "@/lib/utils";
import { STUDENT_COUNT_LABEL } from "@/constants";
import { buildWhatsAppUrl } from "@/lib/config";
import Image from "next/image";
import {
  CategoryMeta,
  ProgramMeta,
} from "../../../[categorySlug]/data";
import { useCatalog } from "../../catalog-context";
import { HeroSection } from "../components/HeroSection";
import { QuickDecisionSection } from "../components/QuickDecisionSection";

/* ─── Utils ───────────────────────────────────────────────────── */
export const EASE = [0.22, 1, 0.36, 1] as const;

export function getStartingPrice(programs: ProgramMeta[]): string {
  const nums = programs
    .map((p) => p.price)
    .filter((p) => p.startsWith("Rp"))
    .map((p) => parseInt(p.replace(/[^0-9]/g, ""), 10))
    .filter((n) => !isNaN(n));
  if (nums.length === 0) return programs[0]?.price ?? "—";
  return `Rp ${Math.min(...nums).toLocaleString("id-ID")}`;
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  y = 30,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-56px 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-[0.8125rem] font-display font-bold uppercase"
      style={{
        background: "var(--blue-navy)",
        color: "#ffffff",
        boxShadow: "var(--shadow-glow-blue-btn)",
        letterSpacing: "0.1em",
      }}
    >
      {children}
    </span>
  );
}

export function GoldText({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="bg-gold-gradient bg-clip-text"
      style={{
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {children}
    </span>
  );
}

function HeroMobileVisual() {
  return (
    <div
      className="relative flex justify-center items-end"
      style={{ height: "260px" }}
    >
      {/* Glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: "76%",
          height: "76%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(26,82,200,0.10) 0%, transparent 70%)",
        }}
      />

      {/* Image */}
      <motion.div
        className="relative z-10"
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/images/home-hero.png"
          alt="Siswa belajar Bahasa Inggris — InggrisGo"
          width={200}
          height={260}
          className="object-contain"
          style={{
            maxHeight: "230px",
            width: "auto",
            filter: "drop-shadow(0 16px 36px rgba(0,0,0,0.12))",
          }}
          priority
        />
      </motion.div>

      {/* Single badge bottom-right */}
      <motion.div
        className="absolute bottom-3 right-3 z-20 flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(26,82,200,0.11)",
          boxShadow: "0 4px 16px rgba(10,45,135,0.08)",
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.4, ease: EASE }}
      >
        <motion.span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "#4ade80" }}
          animate={{ opacity: [1, 0.25, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        <span
          className="font-display font-bold"
          style={{
            fontSize: "0.75rem",
            color: "var(--blue-navy)",
          }}
        >
          {STUDENT_COUNT_LABEL} siswa aktif
        </span>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SocialProofBubble — lives in Zone A, tail points down toward image
// ─────────────────────────────────────────────────────────────────────────────

function CategoryCard({
  category,
  isSelected,
  onSelect,
  index,
}: {
  category: CategoryMeta;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const price = getStartingPrice(category.programs);
  const highlights = (category.benefits || []).slice(0, 3);
  const forWhoItems = (category as any).forWhoItems || [category.forWho];
  const theme = generateTheme(category.theme.primary);

  return (
    <Reveal delay={index * 0.1} y={40}>
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={onSelect}
        whileHover={{ scale: 1.022, y: -8 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="flex flex-col h-full rounded-3xl overflow-hidden cursor-pointer"
        style={{
          background: isSelected
            ? "linear-gradient(150deg, var(--surface) 0%, var(--surface-soft) 100%)"
            : "var(--surface)",
          border: `2px solid ${isSelected || hovered ? theme.border : "var(--border-soft)"}`,
          boxShadow: isSelected
            ? `var(--shadow-card-hover), 0 0 0 1px ${theme.border}`
            : hovered
              ? "var(--shadow-card-hover)"
              : "var(--shadow-badge)",
          transition:
            "border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease",
        }}
      >
        {/* Hero stripe — icon based, no emoji */}
        <div
          className="relative overflow-hidden"
          style={{
            height: "175px",
            background: theme.gradient,
            borderBottom: `1.5px solid ${theme.border}`,
          }}
        >
          {/* Dot pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(${theme.primary} 0.8px, transparent 0.8px)`,
              backgroundSize: "22px 22px",
              opacity: 0.055,
            }}
          />
          {/* Diagonal lines overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, ${theme.primary} 0px, ${theme.primary} 0.5px, transparent 0.5px, transparent 18px)`,
              opacity: 0.025,
            }}
          />

          {/* Large icon anchor — replaces emoji */}
          <motion.div
            className="absolute"
            style={{ bottom: "14px", right: "18px" }}
            animate={
              hovered
                ? { scale: 1.1, rotate: 8, y: -4 }
                : { scale: 1, rotate: 0, y: 0 }
            }
            transition={{ duration: 0.38, ease: EASE }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: theme.soft,
                border: `2px solid ${theme.border}`,
                boxShadow: `0 8px 32px ${theme.border}`,
              }}
            >
              <Icon
                name={category.icon as any}
                className="w-10 h-10"
                style={{ color: theme.primary } as any}
              />
            </div>
          </motion.div>

          {/* Category tag + tagline */}
          <div
            className="absolute top-5 left-5"
            style={{ maxWidth: "calc(100% - 110px)" }}
          >
            <span
              className="inline-flex px-2.5 py-1 rounded-full font-display font-bold uppercase mb-2"
              style={{
                background: theme.soft,
                color: theme.primary,
                border: `1px solid ${theme.border}`,
                letterSpacing: "0.07em",
                fontSize: "0.75rem",
                display: "inline-block",
              }}
            >
              {category.shortLabel}
            </span>
            <p
              className="font-display font-extrabold leading-snug"
              style={{
                fontSize: "1rem",
                color: "var(--blue-navy)",
                letterSpacing: "-0.01em",
              }}
            >
              {category.tagline}{" "}
              {category.taglineAccent && (
                <span style={{ color: theme.primary }}>
                  {category.taglineAccent}
                </span>
              )}
            </p>
          </div>

          {/* Selected indicator */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: theme.primary }}
              >
                <svg viewBox="0 0 14 14" className="w-4 h-4" fill="none">
                  <path
                    d="M2.5 7l3.5 3.5 5.5-6"
                    stroke="white"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card body */}
        <div className="flex flex-col flex-1 p-5">
          {/* For who */}
          <div className="mb-4">
            <p
              className="text-xs font-display font-bold uppercase mb-2.5"
              style={{
                color: "var(--text-faint)",
                letterSpacing: "0.1em",
              }}
            >
              Cocok untuk Ayah/Bunda yang…
            </p>
            <ul className="space-y-2">
              {forWhoItems.slice(0, 3).map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: theme.soft }}
                  >
                    <svg
                      viewBox="0 0 10 10"
                      className="w-2.5 h-2.5"
                      fill="none"
                    >
                      <path
                        d="M2 5l2 2 4-4"
                        stroke={theme.primary}
                        strokeWidth={1.6}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-muted)",
                      lineHeight: "1.55",
                    }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Benefit chips */}
          {highlights.length > 0 && (
            <div
              className="mb-4 pt-4"
              style={{ borderTop: "1px solid var(--border-soft)" }}
            >
              <div className="grid grid-cols-3 gap-2">
                {highlights.map((h, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-2.5 text-center"
                    style={{
                      background: theme.soft,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <p
                      className="font-display font-bold leading-tight mb-0.5"
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--blue-navy)",
                      }}
                    >
                      {h.title}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-faint)",
                        lineHeight: "1.4",
                      }}
                    >
                      {h.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1" />

          {/* Price + CTA */}
          <div
            className="flex items-center justify-between pt-4"
            style={{ borderTop: "1px solid var(--border-soft)" }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-faint)",
                }}
              >
                Mulai dari
              </p>
              <p
                className="font-display font-black"
                style={{
                  fontSize: "1.125rem",
                  color: theme.primary,
                  letterSpacing: "-0.03em",
                }}
              >
                {price}
              </p>
            </div>
            <motion.a
              href="#daftar-program"
              className="font-display font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-white"
              style={{
                fontSize: "0.875rem",
                background: theme.primary,
                boxShadow: `0 4px 16px ${theme.border}`,
                textDecoration: "none",
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: `0 8px 28px ${theme.border}`,
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              Lihat Program
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="white"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.a>
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
}

function CategorySection({
  sectionRef,
  highlightKey,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
  highlightKey: string | null;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const { list: categories } = useCatalog();

  useEffect(() => {
    if (highlightKey) setSelected(highlightKey);
  }, [highlightKey]);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="relative py-20 lg:py-28"
      style={{ background: "var(--bg-soft)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse 55% 40% at 0% 30%, rgba(255,107,53,0.035) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 100% 70%, rgba(45,184,176,0.035) 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <SectionHeading
          className="mb-10 sm:mb-14"
          eyebrow="Pilih Jalur Belajar Ayah/Bunda"
          title="Tiga jalur,"
          accent="satu tujuan yang sama"
          description="Setiap jalur dirancang untuk kebutuhan yang berbeda. Pilih yang paling mencerminkan situasi Ayah/Bunda."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {categories.map((cat, i) => (
            <CategoryCard
              key={cat.key}
              category={cat}
              isSelected={selected === cat.key}
              onSelect={() =>
                setSelected(selected === cat.key ? null : cat.key)
              }
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
 * SECTION 4: PROGRAM PREVIEW (with "All" tab)
 * ══════════════════════════════════════════════════════════════ */
function ProgramCard({
  program,
  accent,
  accentLight,
  accentBorder,
}: {
  program: ProgramMeta;
  accent: string;
  accentLight: string;
  accentBorder: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.a
      href={program.href}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.025, y: -5 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.26, ease: EASE }}
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface)",
        border: `1.5px solid ${hovered ? accentBorder : "var(--border-soft)"}`,
        boxShadow: hovered ? "var(--shadow-card-hover)" : "var(--shadow-badge)",
        transition: "border-color 0.22s ease, box-shadow 0.22s ease",
        textDecoration: "none",
      }}
    >
      <div
        style={{
          height: "3px",
          background: `linear-gradient(90deg, ${accent} 0%, transparent 100%)`,
        }}
      />
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: accentLight,
              border: `1px solid ${accentBorder}`,
            }}
          >
            <Icon
              name={program.icon as any}
              className="w-5 h-5"
              style={{ color: accent } as any}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="font-display font-bold leading-snug truncate"
              style={{
                fontSize: "0.9375rem",
                color: "var(--blue-navy)",
              }}
            >
              {program.title}
            </p>
            {program.badge && (
              <span
                className="inline-block mt-0.5 px-2 py-0.5 rounded-full font-display font-semibold"
                style={{
                  fontSize: "0.75rem",
                  background: accentLight,
                  color: accent,
                  border: `1px solid ${accentBorder}`,
                  letterSpacing: "0.04em",
                }}
              >
                {program.badge}
              </span>
            )}
          </div>
        </div>

        {program.highlight && (
          <p
            className="mb-3"
            style={{
              fontSize: "0.875rem",
              color: "var(--text-muted)",
              lineHeight: "1.55",
            }}
          >
            ✓ {program.highlight}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-4">
          {program.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full"
              style={{
                fontSize: "0.75rem",
                background: "var(--surface-soft)",
                color: "var(--text-muted)",
                border: "1px solid var(--border-soft)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex-1" />
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: "1px solid var(--border-soft)" }}
        >
          <div>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--text-faint)",
              }}
            >
              Harga
            </p>
            <p
              className="font-display font-black"
              style={{
                fontSize: "1rem",
                color: accent,
                letterSpacing: "-0.02em",
              }}
            >
              {program.price}
            </p>
          </div>
          <motion.div
            className="flex items-center gap-1 font-display font-semibold"
            style={{ fontSize: "0.875rem", color: accent }}
            animate={hovered ? { x: 4 } : { x: 0 }}
            transition={{ duration: 0.2 }}
          >
            Detail
            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke={accent}
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </div>
      </div>
    </motion.a>
  );
}

type ProgramTabEntry = {
  program: ProgramMeta;
  accent: string;
  accentLight: string;
  accentBorder: string;
  catKey: string;
};

function ProgramPreviewSection() {
  const { list: categories, map: catalogMap } = useCatalog();
  const [activeTab, setActiveTab] = useState<string>("all");

  const allPrograms: ProgramTabEntry[] = useMemo(
    () =>
      categories.flatMap((cat) =>
        cat.programs.map((p) => ({
          program: p,
          accent: generateTheme(cat.theme.primary).primary,
          accentLight: generateTheme(cat.theme.primary).soft,
          accentBorder: generateTheme(cat.theme.primary).border,
          catKey: cat.key,
        })),
      ),
    [categories],
  );

  const displayedPrograms: ProgramTabEntry[] = useMemo(() => {
    if (activeTab === "all") return allPrograms.slice(0, 8);
    const cat = catalogMap[activeTab];
    if (!cat) return [];
    return cat.programs.map((p) => ({
      program: p,
      accent: generateTheme(cat.theme.primary).primary,
      accentLight: generateTheme(cat.theme.primary).soft,
      accentBorder: generateTheme(cat.theme.primary).border,
      catKey: cat.key,
    }));
  }, [activeTab, allPrograms]);

  const activeCat = activeTab !== "all" ? catalogMap[activeTab] : null;

  return (
    <section
      id="daftar-program"
      className="relative py-20 lg:py-28 overflow-hidden scroll-mt-20"
      style={{ background: "var(--surface)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse 45% 55% at 100% 0%, rgba(26,82,200,0.04) 0%, transparent 55%), radial-gradient(ellipse 35% 45% at 0% 100%, rgba(45,184,176,0.03) 0%, transparent 55%)`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <SectionHeading
            align="left"
            eyebrow="Program Nyata"
            title="Bukan sekadar janji —"
            accent="ini programnya"
            description="Program konkret yang siap membantu Ayah/Bunda. Klik untuk detail lengkap."
          />

          {/* Tab switcher with "All" */}
          <Reveal delay={0.1}>
            <div
              className="flex p-1 gap-1 rounded-2xl"
              style={{
                background: "var(--surface-soft)",
                border: "1.5px solid var(--border-soft)",
              }}
            >
              {/* All tab */}
              <motion.button
                onClick={() => setActiveTab("all")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-display font-semibold"
                style={{
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  border: "none",
                  background:
                    activeTab === "all" ? "var(--surface)" : "transparent",
                  color:
                    activeTab === "all"
                      ? "var(--blue-navy)"
                      : "var(--text-muted)",
                  boxShadow:
                    activeTab === "all" ? "var(--shadow-badge)" : "none",
                  transition: "background 0.2s ease, color 0.2s ease",
                }}
                whileTap={{ scale: 0.97 }}
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                  <rect
                    x="1"
                    y="1"
                    width="6"
                    height="6"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="9"
                    y="1"
                    width="6"
                    height="6"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="1"
                    y="9"
                    width="6"
                    height="6"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="9"
                    y="9"
                    width="6"
                    height="6"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                <span className="hidden sm:inline">Semua</span>
              </motion.button>

              {categories.map((cat) => (
                <motion.button
                  key={cat.key}
                  onClick={() => setActiveTab(cat.key)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-display font-semibold"
                  style={{
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    border: "none",
                    background:
                      activeTab === cat.key ? "var(--surface)" : "transparent",
                    color:
                      activeTab === cat.key
                        ? generateTheme(cat.theme.primary).primary
                        : "var(--text-muted)",
                    boxShadow:
                      activeTab === cat.key ? "var(--shadow-badge)" : "none",
                    transition: "background 0.2s ease, color 0.2s ease",
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Icon name={cat.icon as any} className="w-4 h-4" />
                  <span className="hidden sm:inline">{cat.shortLabel}</span>
                </motion.button>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {displayedPrograms.map((entry) => (
              <ProgramCard
                key={`${entry.catKey}-${entry.program.slug}`}
                program={entry.program}
                accent={entry.accent}
                accentLight={entry.accentLight}
                accentBorder={entry.accentBorder}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
 * SECTION 6: FINAL CTA
 * ══════════════════════════════════════════════════════════════ */
function FinalCTASection({
  onScrollToPrograms,
}: {
  onScrollToPrograms: () => void;
}) {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(155deg, #060f2e 0%, #0a2d87 55%, #1346b0 100%)",
        }}
      />

      <motion.div
        className="pointer-events-none absolute"
        style={{
          width: 640,
          height: 640,
          top: "-28%",
          right: "-8%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(58,143,245,0.14) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute"
        style={{
          width: 440,
          height: 440,
          bottom: "-22%",
          left: "-4%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,107,53,0.09) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{ scale: [1, 1.14, 1] }}
        transition={{
          duration: 13,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)`,
          backgroundSize: "38px 38px",
          opacity: 0.035,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 text-center">
        <Reveal>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.14)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: "#4ade80",
                animation: "pulseSoft 2s ease-in-out infinite",
              }}
            />
            <span
              style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.9)" }}
            >
              Admin siap membantu Ayah/Bunda
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.07}>
          <h2
            className="font-display font-extrabold mb-5 leading-[1.07]"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              letterSpacing: "-0.027em",
              color: "white",
            }}
          >
            Masih ragu{" "}
            <span
              className="bg-gold-gradient bg-clip-text"
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              pilih program?
            </span>
          </h2>
        </Reveal>

        <Reveal delay={0.13}>
          <p
            style={{
              fontSize: "clamp(0.9375rem, 1.5vw, 1.125rem)",
              color: "rgba(255,255,255,0.88)",
              maxWidth: "480px",
              margin: "0 auto 2.5rem",
              lineHeight: "1.72",
            }}
          >
            Kami bantu rekomendasikan program yang paling cocok untuk tujuan dan
            kondisi Ayah/Bunda. Gratis, tanpa tekanan, tanpa basa-basi.
          </p>
        </Reveal>

        <Reveal delay={0.19}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <motion.a
              href={buildWhatsAppUrl({
                title: "Konsultasi",
                intent: "consultation",
              })}
              className="bg-gold-btn font-display font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2"
              style={{
                fontSize: "1rem",
                color: "var(--blue-abyss)",
                textDecoration: "none",
                boxShadow: "var(--shadow-glow-gold-btn)",
              }}
              whileHover={{
                scale: 1.04,
                boxShadow: "var(--shadow-glow-gold-btn-hover)",
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2, ease: EASE }}
            >
              Konsultasi Gratis
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.a>
            <motion.a
              onClick={onScrollToPrograms}
              className="font-display font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-2"
              style={{
                fontSize: "1rem",
                color: "white",
                textDecoration: "none",
                background: "rgba(255,255,255,0.09)",
                border: "1.5px solid rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
              }}
              whileHover={{
                scale: 1.03,
                background: "rgba(255,255,255,0.14)",
                borderColor: "rgba(255,255,255,0.32)",
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              Lihat Semua Program
            </motion.a>
          </div>
        </Reveal>

        <Reveal delay={0.26}>
          <div className="flex flex-wrap justify-center gap-x-7 gap-y-2">
            {[
              "Gratis konsultasi",
              "Tanpa komitmen",
              "Tim berpengalaman",
            ].map((f) => (
              <div key={f} className="flex items-center gap-1.5">
                <svg
                  viewBox="0 0 16 16"
                  className="w-3.5 h-3.5 flex-shrink-0"
                  fill="none"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="rgba(255,193,7,0.55)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M5 8l2 2 4-4"
                    stroke="#FFC107"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {f}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function ProgramsView() {
  const categorySectionRef = useRef<HTMLElement | null>(null);
  const [highlightKey, setHighlightKey] = useState<string | null>(null);

  const scrollToPrograms = useCallback(() => {
    categorySectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const handleQuickSelect = useCallback((key: string) => {
    setHighlightKey(key);
    setTimeout(() => {
      categorySectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }, []);

  return (
    <main className="relative w-full overflow-x-hidden">
      <HeroSection onScrollToPrograms={scrollToPrograms} />
      <QuickDecisionSection onSelect={handleQuickSelect} />
      <CategorySection
        sectionRef={categorySectionRef}
        highlightKey={highlightKey}
      />
      <ProgramPreviewSection />
      <FinalCTASection onScrollToPrograms={scrollToPrograms} />
    </main>
  );
}
