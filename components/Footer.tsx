"use client";
import Link from "next/link";
import { siteConfig, navLinks, buildWhatsAppUrl } from "@/lib/config";
import MapWrapper from "./Map/MapWrapper";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const socials = [
  {
    label: "Instagram",
    href: `https://instagram.com/${siteConfig.instagram}`,
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    color: "hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500",
  },
  {
    label: "TikTok",
    href: `https://tiktok.com/@${siteConfig.instagram}`,
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
      </svg>
    ),
    color: "hover:bg-[#010101]",
  },
  {
    label: "YouTube",
    href: `https://youtube.com/@${siteConfig.instagram}`,
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    color: "hover:bg-red-600",
  },
  {
    label: "Facebook",
    href: `https://facebook.com/${siteConfig.instagram}`,
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    color: "hover:bg-blue-600",
  },
  {
    label: "X / Twitter",
    href: `https://x.com/${siteConfig.instagram}`,
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: "hover:bg-[#000]",
  },
  {
    label: "LinkedIn",
    href: `https://linkedin.com/company/${siteConfig.instagram}`,
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    color: "hover:bg-blue-700",
  },
];

function useCounter(target: number, duration = 1600, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

const stats = [
  { label: "Alumni", value: 2400, suffix: "+" },
  { label: "Program", value: 12, suffix: "" },
  { label: "Tahun Berdiri", value: 8, suffix: "+" },
  { label: "Rating", value: 4.9, suffix: "★", decimal: true },
];

function StatItem({
  stat,
  animate,
}: {
  stat: (typeof stats)[0];
  animate: boolean;
}) {
  const count = useCounter(
    stat.decimal ? Math.round(stat.value * 10) : stat.value,
    1400,
    animate,
  );
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-2xl font-bold text-white tabular-nums">
        {stat.decimal ? (count / 10).toFixed(1) : count.toLocaleString()}
        {/* Gold suffix — star/+ are stat highlights, same role as heading accent */}
        <span style={{ color: "var(--color-brand-gold-vivid)" }}>
          {stat.suffix}
        </span>
      </span>
      <span className="text-white/40 text-xs uppercase tracking-widest">
        {stat.label}
      </span>
    </div>
  );
}

export default function Footer() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <footer
      className="relative text-white overflow-hidden"
      style={{ background: "var(--color-brand-blue-abyss)" }}
    >
      {/* Decorative glow blobs — blue top-left, gold bottom-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(26,82,200,0.10) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 right-0 w-[400px] h-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(245,168,0,0.07) 0%, transparent 70%)",
        }}
      />

      {/* ── Stats band ── */}
      <div
        ref={statsRef}
        className="border-b border-white/6"
        style={{ background: "rgba(245,168,0,0.05)" }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x-0 sm:divide-x divide-white/10">
            {stats.map((stat, i) => (
              <StatItem key={i} stat={stat} animate={statsVisible} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="border-b border-white/6 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 xl:gap-16">
            {/* Brand column */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <Link
                href="/"
                className="inline-flex items-center gap-3 group w-fit"
              >
                <div
                  className="
    w-11 h-11 rounded-2xl flex items-center justify-center
    bg-white/5 backdrop-blur-sm
    border border-white/10
    transition-all duration-300
    group-hover:scale-105
    group-hover:bg-white/10
  "
                >
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={28}
                    height={28}
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <span className="font-display font-bold text-xl tracking-tight">
                  {siteConfig.name}
                </span>
              </Link>

              <p className="text-white/50 text-sm leading-relaxed">
                {siteConfig.tagline}. Program speaking untuk pemula dari Kampung
                Inggris Pare — belajar dengan cara yang sederhana, praktis, dan
                menyenangkan.
              </p>

              {/* Social icons */}
              <div>
                <p className="text-white/25 text-[10px] uppercase tracking-widest mb-3">
                  Ikuti Kami
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      title={s.label}
                      className={`w-9 h-9 rounded-xl bg-white/6 flex items-center justify-center text-white/50 hover:text-white transition-all duration-200 hover:scale-110 hover:shadow-lg ${s.color}`}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Location pill */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit"
                style={{
                  border: "1px solid rgba(214,232,255,0.12)",
                  background: "rgba(26,82,200,0.08)",
                }}
              >
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: "var(--color-brand-blue-sky)" }}
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span className="text-white/40 text-xs">
                  {siteConfig.location}
                </span>
              </div>
            </div>

            {/* Program links */}
            <div className="lg:col-span-2">
              <p className="text-[10px] uppercase tracking-widest text-white/25 mb-5">
                Program
              </p>
              <ul className="space-y-3">
                {navLinks.slice(1).map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {/* Gold hover dot — matches heading accent system */}
                      <span
                        className="w-1 h-1 rounded-full transition-all duration-200 flex-shrink-0"
                        style={{
                          background: "rgba(245,168,0,0.35)",
                        }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLElement).style.background =
                            "var(--color-brand-gold-vivid)")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLElement).style.background =
                            "rgba(245,168,0,0.35)")
                        }
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="lg:col-span-2">
              <p className="text-[10px] uppercase tracking-widest text-white/25 mb-5">
                Kontak
              </p>
              <ul className="space-y-3">
                <li>
                  <a
                    href={buildWhatsAppUrl("Konsultasi")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2.5 text-white/50 hover:text-white transition-colors duration-200 text-sm"
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                      style={{ background: "rgba(34,197,94,0.10)" }}
                    >
                      <svg
                        className="w-3.5 h-3.5 text-green-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </span>
                    WhatsApp Admin
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="group flex items-center gap-2.5 text-white/50 hover:text-white transition-colors duration-200 text-sm"
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 group-hover:bg-[rgba(26,82,200,0.25)]"
                      style={{ background: "rgba(26,82,200,0.12)" }}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: "var(--color-brand-blue-sky)" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </span>
                    {siteConfig.email}
                  </a>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="group flex items-center gap-2.5 text-white/50 hover:text-white transition-colors duration-200 text-sm"
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 group-hover:bg-[rgba(26,82,200,0.25)]"
                      style={{ background: "rgba(26,82,200,0.12)" }}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: "var(--color-brand-blue-sky)" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </span>
                    Form Pertanyaan
                  </Link>
                </li>
              </ul>
            </div>

            {/* Map */}
            <div className="lg:col-span-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] uppercase tracking-widest text-white/25">
                  Lokasi Kami
                </p>
                <a
                  href="https://maps.app.goo.gl/gD93KnZpFX1BYbha8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] transition-colors flex items-center gap-1"
                  style={{ color: "rgba(245,168,0,0.6)" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      "var(--color-brand-gold-vivid)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      "rgba(245,168,0,0.6)")
                  }
                >
                  Buka di Maps
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>

              <div className="relative group">
                {/* Gold-tinted hover ring */}
                <div
                  className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(245,168,0,0.20) 0%, transparent 60%)",
                  }}
                />
                <div
                  className="relative rounded-2xl overflow-hidden transition-colors duration-500"
                  style={{
                    height: 240,
                    border: "1px solid rgba(214,232,255,0.08)",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(245,168,0,0.20)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(214,232,255,0.08)")
                  }
                >
                  <MapWrapper />
                  <div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(26,82,200,0.05) 0%, transparent 60%)",
                    }}
                  />
                </div>

                <div className="mt-3 flex items-start gap-2">
                  <svg
                    className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: "var(--color-brand-blue-sky)" }}
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span className="text-white/35 text-xs leading-relaxed">
                    Kampung Inggris Pare, Kec. Pare, Kab. Kediri,
                    <br className="hidden sm:inline" /> Jawa Timur 64212
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA strip ── */}
      <div
        className="border-b border-white/6"
        style={{ background: "rgba(245,168,0,0.04)" }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/50 text-sm text-center sm:text-left">
            Siap mulai perjalanan belajar Bahasa Inggris kamu?
          </p>
          <a
            href={buildWhatsAppUrl("Daftar Program")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, #E8940A 0%, var(--color-brand-gold-mid) 50%, var(--color-brand-gold-vivid) 100%)",
              color: "#3a1c00",
              boxShadow: "0 4px 18px rgba(180,100,0,0.35)",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.boxShadow =
                "0 8px 28px rgba(180,100,0,0.52)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.boxShadow =
                "0 4px 18px rgba(180,100,0,0.35)")
            }
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Hubungi Kami
          </a>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="py-5">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/25 text-xs">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-white/20 hover:text-white/50 text-xs transition-colors"
            >
              Privasi
            </Link>
            <Link
              href="/terms"
              className="text-white/20 hover:text-white/50 text-xs transition-colors"
            >
              Ketentuan
            </Link>
            <span className="text-white/15 text-xs">
              Kampung Inggris Pare, Kediri
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
