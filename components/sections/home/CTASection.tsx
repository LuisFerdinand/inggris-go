"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { buildWhatsAppUrl } from "@/lib/config";
import { BRAND } from "@/constants/brand";

const ease = [0.22, 1, 0.36, 1] as const;

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
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export default function CTASection() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.blueNavy} 100%)`,
      }}
    >
      {/* ── Plus / cross pattern — matches template exactly ───────
       *  SVG tile: 32×32 cell, thin plus mark at center
       *  White at low opacity so the orange bg shines through
       * ─────────────────────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cline x1='16' y1='10' x2='16' y2='22' stroke='white' stroke-width='1.5' stroke-opacity='0.18' stroke-linecap='round'/%3E%3Cline x1='10' y1='16' x2='22' y2='16' stroke='white' stroke-width='1.5' stroke-opacity='0.18' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 py-20 lg:py-28 text-center">
        {/* Eyebrow pill */}
        <Reveal>
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7
              font-display font-semibold text-white"
            style={{
              fontSize: "0.8125rem",
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.28)",
              backdropFilter: "blur(4px)",
            }}
          >
            🚀 Mulai Perjalanan Bahasa Inggrismu Sekarang!
          </span>
        </Reveal>

        {/* Headline */}
        <Reveal delay={0.08}>
          <h2
            className="font-display font-extrabold text-white mb-5 leading-[1.08]"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              letterSpacing: "-0.025em",
            }}
          >
            Siap Berani Bicara
            <br />
            Bahasa Inggris?
          </h2>
        </Reveal>

        {/* Subtext */}
        <Reveal delay={0.14}>
          <p
            className="leading-relaxed mb-10 mx-auto"
            style={{
              fontSize: "0.9375rem",
              color: "rgba(255,255,255,0.82)",
              maxWidth: "440px",
              lineHeight: "1.75",
            }}
          >
            Jangan biarkan rasa takut menghalangi impianmu. Mulai belajar
            speaking bersama Inggris Go hari ini!
          </p>
        </Reveal>

        {/* CTA buttons */}
        <Reveal delay={0.2}>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Primary — white fill */}
            <Link
              href="/programs"
              className="inline-flex items-center font-display font-bold rounded-full
                transition-all duration-200"
              style={{
                fontSize: "0.9375rem",
                background: "white",
                color: BRAND.blueNavy,
                padding: "0.875rem 2rem",
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 10px 32px rgba(0,0,0,0.18)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 4px 20px rgba(0,0,0,0.12)";
              }}
            >
              Lihat Program
            </Link>

            {/* Secondary — ghost/outline */}
            <a
              href={buildWhatsAppUrl({
                intent: "consultation",
                title: "konsultasi dari CTA section",
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-display font-bold rounded-full
                transition-all duration-200"
              style={{
                fontSize: "0.9375rem",
                background: "transparent",
                color: "white",
                padding: "0.875rem 2rem",
                border: "2px solid rgba(255,255,255,0.55)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.14)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,255,255,0.85)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,255,255,0.55)";
                (e.currentTarget as HTMLElement).style.transform = "";
              }}
            >
              {/* WhatsApp icon */}
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Hubungi Admin
            </a>
          </div>
        </Reveal>

        {/* Trust micro-copy */}
        <Reveal delay={0.26}>
          <p
            className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-1"
            style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)" }}
          >
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                <path
                  d="M3 8l3.5 3.5L13 4"
                  stroke="white"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Tanpa syarat khusus
            </span>
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                <path
                  d="M3 8l3.5 3.5L13 4"
                  stroke="white"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Cocok untuk pemula absolut
            </span>
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                <path
                  d="M3 8l3.5 3.5L13 4"
                  stroke="white"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Respon admin cepat
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
