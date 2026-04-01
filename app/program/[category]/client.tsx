"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { buildWhatsAppUrl } from "@/lib/config";
import type { CategoryMeta, Program } from "./data";
import LeadPageClient from "./lead";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function Section({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function Eyebrow({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-5 h-px" style={{ background: color }} />
      <span
        className="text-[11px] font-semibold uppercase tracking-[0.15em]"
        style={{ color }}
      >
        {children}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   PROGRAM CARD
───────────────────────────────────────────────────────────────────────────── */
function ProgramCard({
  program,
  accent,
  accentLight,
  index,
  inView,
}: {
  program: Program;
  accent: string;
  accentLight: string;
  index: number;
  inView: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative bg-white rounded-3xl overflow-hidden flex flex-col"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView
          ? hovered
            ? "translateY(-4px)"
            : "translateY(0)"
          : "translateY(32px)",
        boxShadow: hovered
          ? "0 20px 60px rgba(15,35,64,0.14)"
          : "0 4px 24px rgba(15,35,64,0.07)",
        transition: `
          opacity 0.5s ease ${index * 0.1}s,
          transform 0.5s cubic-bezier(0.22,1,0.36,1) ${index * 0.1}s,
          box-shadow 0.3s ease
        `,
      }}
    >
      {/* Top accent strip */}
      <div
        className="h-1 w-full flex-shrink-0"
        style={{
          background: `linear-gradient(90deg, ${accent}, ${accent}88)`,
          opacity: hovered ? 1 : 0.5,
          transition: "opacity 0.3s",
        }}
      />

      <div className="p-6 flex flex-col flex-1 gap-4">
        {/* Badge row */}
        <div className="flex items-start justify-between gap-3">
          <span className="text-3xl">{program.icon}</span>
          {program.badge && (
            <span
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
              style={{ background: accentLight, color: accent }}
            >
              {program.badge}
            </span>
          )}
        </div>

        {/* Title & desc */}
        <div className="flex flex-col gap-2">
          <h3 className="font-display font-bold text-xl text-brand-navy leading-tight">
            {program.title}
          </h3>
          <p className="text-brand-charcoal/60 text-sm leading-relaxed">
            {program.description}
          </p>
        </div>

        {/* Tags */}
        {program.tags && (
          <div className="flex flex-wrap gap-1.5">
            {program.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-brand-sand text-brand-navy/60"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Highlight */}
        {program.highlight && (
          <div
            className="flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-2"
            style={{ background: accentLight, color: accent }}
          >
            <svg
              className="w-3.5 h-3.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {program.highlight}
          </div>
        )}

        <div className="flex-1" />

        {/* Price / CTA */}
        <div className="border-t border-brand-sand pt-4">
          {program.price ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-brand-charcoal/40 uppercase tracking-wider mb-0.5">
                  Harga
                </p>
                <p className="text-2xl font-bold text-brand-navy">
                  {program.price}
                </p>
              </div>
              {program.link && (
                <Link
                  href={program.link ?? `/programs/${program.slug}`}
                  target={program.link ? "_blank" : undefined}
                  rel={program.link ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                  }}
                >
                  Lihat Detail
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              )}
            </div>
          ) : program.priceTiers ? (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                {program.priceTiers.slice(0, 4).map((tier) => (
                  <div
                    key={tier.label}
                    className="rounded-xl bg-brand-sand p-2 text-center"
                  >
                    <p className="text-[10px] text-brand-charcoal/50 mb-0.5">
                      {tier.label}
                    </p>
                    <p className="text-sm font-bold text-brand-navy">
                      {tier.price}
                    </p>
                  </div>
                ))}
              </div>
              <Link
                href={program.link ?? `/programs/${program.slug}`}
                target={program.link ? "_blank" : undefined}
                rel={program.link ? "noopener noreferrer" : undefined}
                className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-95 block"
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                }}
              >
                Lihat Semua Paket →
              </Link>
            </div>
          ) : (
            <Link
              href={program.link ?? `/programs/${program.slug}`}
              target={program.link ? "_blank" : undefined}
              rel={program.link ? "noopener noreferrer" : undefined}
              className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              }}
            >
              Lihat Detail →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FOR-WHO CARDS
───────────────────────────────────────────────────────────────────────────── */
function ForWhoCards({
  accent,
  accentLight,
  categoryKey,
}: {
  accent: string;
  accentLight: string;
  categoryKey: string;
}) {
  const items: Record<
    string,
    { emoji: string; title: string; desc: string }[]
  > = {
    lead: [
      {
        emoji: "⏰",
        title: "Kamu super sibuk",
        desc: "Tidak punya waktu join Zoom tapi tetap mau belajar",
      },
      {
        emoji: "😰",
        title: "Takut salah ngomong",
        desc: "Pengin latihan tapi malu kalau langsung di kelas",
      },
      {
        emoji: "💸",
        title: "Budget terbatas",
        desc: "Mau coba dulu sebelum investasi lebih besar",
      },
    ],
    online: [
      {
        emoji: "🏠",
        title: "Belajar dari rumah",
        desc: "Tidak perlu ke mana-mana, cukup buka laptop",
      },
      {
        emoji: "📅",
        title: "Butuh jadwal tetap",
        desc: "Suka belajar rutin dengan struktur yang jelas",
      },
      {
        emoji: "🎓",
        title: "Ingin ada mentor",
        desc: "Belajar terasa lebih efektif dengan bimbingan langsung",
      },
    ],
    camp: [
      {
        emoji: "🔥",
        title: "Mau hasil cepat",
        desc: "Belajar intensif full immersion dalam waktu singkat",
      },
      {
        emoji: "🌏",
        title: "Suka pengalaman baru",
        desc: "Tidak hanya belajar — tapi juga petualangan di Pare",
      },
      {
        emoji: "👫",
        title: "Ingin komunitas",
        desc: "Belajar bareng teman baru dari seluruh Indonesia",
      },
    ],
    school: [],
  };

  const data = items[categoryKey] ?? [];
  if (!data.length) return null;

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {data.map((item) => (
        <div
          key={item.title}
          className="flex items-start gap-3 rounded-2xl p-4 transition-all"
          style={{ background: accentLight }}
        >
          <span className="text-2xl flex-shrink-0">{item.emoji}</span>
          <div>
            <p className="font-semibold text-brand-navy text-sm mb-1">
              {item.title}
            </p>
            <p className="text-brand-charcoal/60 text-xs leading-relaxed">
              {item.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   CAMP EXPERIENCE
───────────────────────────────────────────────────────────────────────────── */
function CampExperience({ accent }: { accent: string }) {
  const pillars = [
    {
      icon: "🌍",
      title: "Full Immersion",
      desc: "Lingkungan yang mendorong kamu hanya berbicara Bahasa Inggris sepanjang hari.",
    },
    {
      icon: "🤝",
      title: "Komunitas Aktif",
      desc: "Teman belajar dari seluruh Indonesia — networking yang berharga.",
    },
    {
      icon: "📍",
      title: "Langsung di Pare",
      desc: "Merasakan atmosfer Kampung Inggris yang legendaris secara langsung.",
    },
    {
      icon: "⚡",
      title: "Intensif & Terukur",
      desc: "Program terstruktur dengan target pencapaian harian yang jelas.",
    },
  ];
  return (
    <div className="grid sm:grid-cols-2 gap-5">
      {pillars.map((p) => (
        <div
          key={p.title}
          className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: `${accent}12` }}
          >
            {p.icon}
          </div>
          <div>
            <h4 className="font-display font-bold text-brand-navy mb-1">
              {p.title}
            </h4>
            <p className="text-brand-charcoal/60 text-sm leading-relaxed">
              {p.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ONLINE COMPARISON TABLE
───────────────────────────────────────────────────────────────────────────── */
function OnlineComparison() {
  const rows = [
    {
      label: "Format",
      daily: "Zoom",
      kids: "Zoom + Games",
      toefl: "Zoom",
      grammar: "Zoom",
      priv: "Zoom/Offline",
    },
    {
      label: "Untuk siapa",
      daily: "Umum",
      kids: "Anak 6–12 th",
      toefl: "Mahasiswa/Kerja",
      grammar: "Pemula",
      priv: "Semua",
    },
    {
      label: "Fokus utama",
      daily: "Speaking",
      kids: "Vocabulary",
      toefl: "Tes TOEFL",
      grammar: "Tata Bahasa",
      priv: "Custom",
    },
    {
      label: "Harga mulai",
      daily: "299K",
      kids: "349K",
      toefl: "399K",
      grammar: "299K",
      priv: "499K",
    },
    {
      label: "Jadwal",
      daily: "Sen–Jum",
      kids: "Flexible",
      toefl: "Sen–Jum 20.00",
      grammar: "Sen–Jum",
      priv: "Bebas",
    },
  ];
  const headers = ["Daily Conv.", "Kids", "TOEFL", "Grammar", "Private"];
  return (
    <div className="overflow-x-auto rounded-2xl border border-brand-sand">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-brand-sand">
            <th className="text-left px-4 py-3 text-brand-navy/40 font-medium text-xs uppercase tracking-wider bg-brand-cream w-32">
              Perbandingan
            </th>
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-center text-brand-navy font-semibold bg-brand-cream whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.label}
              className={i % 2 === 0 ? "bg-white" : "bg-brand-cream/50"}
            >
              <td className="px-4 py-3 text-brand-navy/50 font-medium text-xs">
                {row.label}
              </td>
              {[row.daily, row.kids, row.toefl, row.grammar, row.priv].map(
                (val, j) => (
                  <td
                    key={j}
                    className="px-4 py-3 text-center text-brand-charcoal/70 whitespace-nowrap"
                  >
                    {val}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SCHOOL PAGE (special case — no program list)
───────────────────────────────────────────────────────────────────────────── */
function SchoolPage({ meta }: { meta: CategoryMeta }) {
  const { ref: cardsRef, inView: cardsInView } = useInView();

  const benefits = [
    {
      icon: "📚",
      title: "Kurikulum Custom",
      desc: "Disesuaikan dengan level, usia, dan tujuan siswa sekolah kamu.",
    },
    {
      icon: "🗓️",
      title: "Jadwal Fleksibel",
      desc: "Tidak mengganggu jam pelajaran utama — kami yang menyesuaikan.",
    },
    {
      icon: "👥",
      title: "Belajar Kelompok",
      desc: "Metode grup yang interaktif dan kompetitif — lebih seru dan efektif.",
    },
    {
      icon: "📈",
      title: "Laporan Berkala",
      desc: "Progress siswa dilaporkan secara transparan kepada pihak sekolah.",
    },
    {
      icon: "🏆",
      title: "Tutor Berpengalaman",
      desc: "Pengajar yang sudah terbiasa mengajar di lingkungan sekolah formal.",
    },
    {
      icon: "💡",
      title: "Metode Modern",
      desc: "Pendekatan komunikatif yang membuat siswa tidak takut berbicara.",
    },
  ];

  const steps = [
    {
      n: "01",
      title: "Konsultasi Gratis",
      desc: "Ceritakan kebutuhan sekolah kamu — kami dengarkan dulu.",
    },
    {
      n: "02",
      title: "Proposal Custom",
      desc: "Kami siapkan kurikulum, jadwal, dan paket harga yang sesuai.",
    },
    {
      n: "03",
      title: "Pelaksanaan",
      desc: "Program berjalan dengan mentor berpengalaman dan monitoring berkala.",
    },
  ];

  return (
    <>
      <Section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-16 lg:py-24">
        <div className="text-center mb-12">
          <Eyebrow color={meta.accent}>Kenapa Pilih Kami</Eyebrow>
          <h2 className="font-display font-bold text-display-md text-brand-navy">
            Apa yang kami tawarkan
            <br />
            <span style={{ color: meta.accent }}>untuk institusi kamu</span>
          </h2>
        </div>
        <div
          ref={cardsRef}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {benefits.map((b, i) => (
            <div
              key={b.title}
              className="bg-white rounded-2xl p-6 shadow-card"
              style={{
                opacity: cardsInView ? 1 : 0,
                transform: cardsInView ? "translateY(0)" : "translateY(24px)",
                transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s`,
              }}
            >
              <span className="text-3xl mb-3 block">{b.icon}</span>
              <h3 className="font-display font-bold text-brand-navy mb-2">
                {b.title}
              </h3>
              <p className="text-brand-charcoal/60 text-sm leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-brand-navy py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="text-center mb-12">
            <Eyebrow color={meta.accent}>Proses Kerja Sama</Eyebrow>
            <h2 className="font-display font-bold text-display-md text-white">
              3 langkah mudah
              <br />
              <span style={{ color: meta.accent }}>untuk mulai</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div
                key={s.n}
                className="flex flex-col items-center text-center gap-4"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-bold text-2xl text-white"
                  style={{
                    background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}99)`,
                  }}
                >
                  {s.n}
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-lg mb-2">
                    {s.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-20">
        <div
          className="rounded-3xl p-10 lg:p-16 text-center"
          style={{
            background: meta.heroGradient,
            backgroundColor: meta.accentLight,
          }}
        >
          <h2 className="font-display font-bold text-display-md text-brand-navy mb-4">
            Tertarik bekerja sama?
          </h2>
          <p className="text-brand-charcoal/60 max-w-lg mx-auto mb-8">
            Ceritakan kebutuhan sekolah atau institusi kamu. Konsultasi awal
            gratis, tanpa komitmen apapun.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-white font-semibold text-base transition-all hover:scale-105 hover:shadow-xl active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}cc)`,
              }}
            >
              Ajukan Proposal
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
            <a
              href={buildWhatsAppUrl("Program Sekolah")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-base border-2 transition-all hover:scale-105 active:scale-95"
              style={{ borderColor: meta.accent, color: meta.accent }}
            >
              Chat WhatsApp
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN CLIENT COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function CategoryPageClient({ meta }: { meta: CategoryMeta }) {
  if (meta.key === "lead") return <LeadPageClient />;

  const { ref: programsRef, inView: programsInView } = useInView();
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const isSchool = meta.key === "school";
  const isOnline = meta.key === "online";
  const isCamp = meta.key === "camp";
  const isLead = meta.key === "lead";

  return (
    <main className="min-h-screen bg-brand-cream">
      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-4 pb-16 lg:pb-24"
        style={{ background: meta.heroGradient, backgroundColor: "#FFF8F3" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle, ${meta.accent}22 0%, transparent 70%)`,
          }}
        />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          {/* Breadcrumb */}
          <div
            className="flex items-center gap-2 text-sm text-brand-charcoal/40 mb-10"
            style={{
              opacity: heroVisible ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
          >
            <Link
              href="/"
              className="hover:text-brand-orange transition-colors"
            >
              Beranda
            </Link>
            <span>/</span>
            <Link
              href="/programs"
              className="hover:text-brand-orange transition-colors"
            >
              Program
            </Link>
            <span>/</span>
            <span style={{ color: meta.accent }}>{meta.label}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left */}
            <div>
              <div
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? "translateY(0)" : "translateY(20px)",
                  transition:
                    "opacity 0.6s ease 0.1s, transform 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s",
                }}
              >
                <Eyebrow color={meta.accent}>{meta.label}</Eyebrow>
              </div>

              <h1
                className="font-display font-bold text-display-lg text-brand-navy leading-[1.1] mb-5"
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? "translateY(0)" : "translateY(24px)",
                  transition:
                    "opacity 0.6s ease 0.2s, transform 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s",
                }}
              >
                {meta.tagline.split("—")[0]}
                {meta.tagline.includes("—") && (
                  <>
                    <span className="text-brand-charcoal/30"> — </span>
                    <span style={{ color: meta.accent }}>
                      {meta.tagline.split("—")[1]}
                    </span>
                  </>
                )}
              </h1>

              <p
                className="text-brand-charcoal/60 text-base lg:text-lg leading-relaxed mb-8 max-w-lg"
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? "translateY(0)" : "translateY(24px)",
                  transition:
                    "opacity 0.6s ease 0.3s, transform 0.6s cubic-bezier(0.22,1,0.36,1) 0.3s",
                }}
              >
                {meta.description}
              </p>

              <div
                className="flex flex-wrap gap-3"
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? "translateY(0)" : "translateY(24px)",
                  transition:
                    "opacity 0.6s ease 0.4s, transform 0.6s cubic-bezier(0.22,1,0.36,1) 0.4s",
                }}
              >
                {!isSchool ? (
                  <a
                    href="#programs"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold text-sm transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}cc)`,
                      boxShadow: `0 4px 20px ${meta.accent}40`,
                    }}
                  >
                    Lihat Program
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </a>
                ) : (
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold text-sm transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}cc)`,
                      boxShadow: `0 4px 20px ${meta.accent}40`,
                    }}
                  >
                    Ajukan Proposal →
                  </Link>
                )}
                <a
                  href={buildWhatsAppUrl(`Tanya ${meta.label}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm border-2 transition-all hover:scale-105 active:scale-95"
                  style={{
                    borderColor: `${meta.accent}40`,
                    color: meta.accent,
                  }}
                >
                  Konsultasi Dulu
                </a>
              </div>
            </div>

            {/* Right: hero card */}
            <div
              className="hidden lg:flex justify-end"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateX(0)" : "translateX(32px)",
                transition:
                  "opacity 0.7s ease 0.3s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s",
              }}
            >
              <div className="relative">
                <div className="w-[340px] rounded-3xl p-8 bg-white shadow-float">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5"
                    style={{ background: meta.accentLight }}
                  >
                    {isLead ? "🎯" : isOnline ? "💻" : isCamp ? "🏕️" : "🏫"}
                  </div>
                  <h3 className="font-display font-bold text-brand-navy text-xl mb-2">
                    {meta.label}
                  </h3>
                  <p className="text-brand-charcoal/50 text-sm leading-relaxed mb-5">
                    Cocok untuk:{" "}
                    <span className="text-brand-navy font-medium">
                      {meta.forWho}
                    </span>
                  </p>
                  <div
                    className="h-px w-full mb-5"
                    style={{ background: `${meta.accent}20` }}
                  />
                  <div className="flex items-center gap-3">
                    <div
                      className="text-center rounded-xl px-4 py-2 flex-1"
                      style={{ background: meta.accentLight }}
                    >
                      <p
                        className="text-xl font-bold"
                        style={{ color: meta.accent }}
                      >
                        {meta.programs.length > 0
                          ? meta.programs.length
                          : "Custom"}
                      </p>
                      <p className="text-xs text-brand-charcoal/50">Program</p>
                    </div>
                    <div className="text-center rounded-xl px-4 py-2 flex-1 bg-brand-cream">
                      <p className="text-xl font-bold text-brand-navy">
                        {isLead
                          ? "49K"
                          : isOnline
                            ? "299K"
                            : isCamp
                              ? "Hubungi"
                              : "Custom"}
                      </p>
                      <p className="text-xs text-brand-charcoal/50">
                        Mulai dari
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-brand-navy text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-float animate-float">
                  ✓{" "}
                  {isLead
                    ? "Tanpa komitmen"
                    : isOnline
                      ? "Zoom interaktif"
                      : isCamp
                        ? "Offline di Pare"
                        : "Program custom"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCHOOL ─────────────────────────────────────────────────────── */}
      {isSchool && <SchoolPage meta={meta} />}

      {/* ── STANDARD CATEGORIES ────────────────────────────────────────── */}
      {!isSchool && (
        <>
          {/* For-who */}
          <Section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-14">
            <Eyebrow color={meta.accent}>Cocok untuk kamu?</Eyebrow>
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <h2 className="font-display font-bold text-display-md text-brand-navy leading-tight">
                Program ini untuk kamu yang…
              </h2>
              <ForWhoCards
                accent={meta.accent}
                accentLight={meta.accentLight}
                categoryKey={meta.key}
              />
            </div>
          </Section>

          {/* Camp experience */}
          {isCamp && (
            <Section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pb-14">
              <Eyebrow color={meta.accent}>Pengalaman Belajar</Eyebrow>
              <h2 className="font-display font-bold text-display-md text-brand-navy mb-8 max-w-xl">
                Bukan sekadar kursus —<br />
                <span style={{ color: meta.accent }}>
                  ini petualangan belajar
                </span>
              </h2>
              <CampExperience accent={meta.accent} />
            </Section>
          )}

          {/* Online comparison */}
          {isOnline && (
            <Section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pb-14">
              <Eyebrow color={meta.accent}>Bandingkan Program</Eyebrow>
              <h2 className="font-display font-bold text-display-md text-brand-navy mb-8">
                Mana yang paling cocok
                <br />
                <span style={{ color: meta.accent }}>untuk kamu?</span>
              </h2>
              <OnlineComparison />
            </Section>
          )}

          {/* Program list */}
          <section
            id="programs"
            className="py-16 lg:py-24"
            style={{
              background:
                "linear-gradient(180deg, #FFF8F3 0%, #FFFFFF 30%, #FFF8F3 100%)",
            }}
          >
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
              <Section className="mb-10">
                <Eyebrow color={meta.accent}>Daftar Program</Eyebrow>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <h2 className="font-display font-bold text-display-md text-brand-navy leading-tight">
                    Pilih program
                    <br />
                    <span style={{ color: meta.accent }}>
                      yang pas buat kamu
                    </span>
                  </h2>
                  <p className="text-brand-charcoal/50 text-sm max-w-xs">
                    {meta.programs.length} program tersedia. Semua bisa
                    dikonsultasikan terlebih dahulu.
                  </p>
                </div>
              </Section>

              <div
                ref={programsRef}
                className={`grid gap-5 ${
                  meta.programs.length === 1
                    ? "max-w-sm"
                    : meta.programs.length === 2
                      ? "sm:grid-cols-2 max-w-2xl"
                      : "sm:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {meta.programs.map((program, i) => (
                  <ProgramCard
                    key={program.slug}
                    program={program}
                    accent={meta.accent}
                    accentLight={meta.accentLight}
                    index={i}
                    inView={programsInView}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Lead reassurance strip */}
          {isLead && (
            <Section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pb-16">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: "⚡",
                    title: "Mulai kapan saja",
                    desc: "Tidak terikat jadwal. Kamu yang atur waktu belajar.",
                  },
                  {
                    icon: "💰",
                    title: "Hanya 49 ribu",
                    desc: "Setara segelas kopi — hasilnya jauh lebih berharga.",
                  },
                  {
                    icon: "🛡️",
                    title: "Tanpa risiko",
                    desc: "Kalau tidak cocok, ya tidak apa-apa. Coba dulu.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-2xl p-5 bg-white shadow-card"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-brand-navy mb-1">
                        {item.title}
                      </p>
                      <p className="text-brand-charcoal/55 text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* CTA */}
          <Section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-8 pb-20">
            <div
              className="rounded-3xl overflow-hidden relative"
              style={{
                background: "linear-gradient(135deg, #0F2340 0%, #1a365d 100%)",
              }}
            >
              <div
                aria-hidden
                className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${meta.accent} 0%, transparent 70%)`,
                  transform: "translate(30%, -30%)",
                }}
              />
              <div className="relative px-8 py-12 lg:px-14 lg:py-14 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                <div className="flex-1 text-center lg:text-left">
                  <p
                    className="text-sm font-semibold uppercase tracking-wider mb-3"
                    style={{ color: meta.accent }}
                  >
                    Masih bingung?
                  </p>
                  <h2 className="font-display font-bold text-2xl lg:text-3xl text-white mb-3">
                    Kami siap bantu kamu pilih program yang tepat
                  </h2>
                  <p className="text-white/50 text-sm leading-relaxed">
                    Konsultasi gratis via WhatsApp — tidak ada paksaan, tidak
                    ada tekanan.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
                  <a
                    href={buildWhatsAppUrl(`Konsultasi ${meta.label}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-white font-semibold text-sm transition-all hover:scale-105 hover:shadow-xl active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}cc)`,
                    }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Chat WhatsApp
                  </a>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm text-white/70 border border-white/15 transition-all hover:scale-105 hover:bg-white/8 active:scale-95"
                  >
                    Lihat Form Kontak
                  </Link>
                </div>
              </div>
            </div>
          </Section>
        </>
      )}
    </main>
  );
}
