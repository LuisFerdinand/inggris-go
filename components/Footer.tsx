"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { SOCIAL_PROOF } from "@/constants";
import { siteConfig, navLinks, buildWhatsAppUrl } from "@/lib/config";
import { trpc } from "@/lib/trpc/client";

import MapWrapper from "./Map/MapWrapper";

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */

type FooterProgramLink = {
  label: string;
  href: string;
};

type FooterStat = {
  label: string;
  value: number;
  suffix: string;
  decimal?: boolean;
};

type SocialItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  color: string;
};

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */

function buildFooterWhatsAppUrl(number: string | null | undefined) {
  const cleanNumber = number?.replace(/\D/g, "");

  if (!cleanNumber) {
    return buildWhatsAppUrl({
      title: "Konsultasi Belajar Bahasa Inggris",
      intent: "consultation",
    });
  }

  const message = encodeURIComponent(
    "Halo Inggris Go, saya ingin konsultasi tentang program belajar Bahasa Inggris.",
  );

  return `https://wa.me/${cleanNumber}?text=${message}`;
}

function parseProgramLinks(value: string | null | undefined) {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) return null;

    return parsed
      .filter(
        (item): item is FooterProgramLink =>
          typeof item?.label === "string" &&
          typeof item?.href === "string" &&
          item.label.trim().length > 0 &&
          item.href.trim().length > 0,
      )
      .map((item) => ({
        label: item.label.trim(),
        href: item.href.trim(),
      }));
  } catch {
    return null;
  }
}

function useCounter(target: number, duration = 1600, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number | null = null;
    let animationFrameId = 0;

    const step = (ts: number) => {
      if (!startTime) startTime = ts;

      const progress = Math.min((ts - startTime) / duration, 1);

      setCount(Math.floor(progress * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [start, target, duration]);

  return count;
}

/* ─────────────────────────────────────────────────────────────
   Icons
───────────────────────────────────────────────────────────── */

function InstagramIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2Zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-2.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
    </svg>
  );
}

function TiktokIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16.6 5.82a5.86 5.86 0 0 0 3.42 1.09V10a9.18 9.18 0 0 1-3.92-.88v5.74A6.14 6.14 0 1 1 10 8.72c.28 0 .55.02.82.06v3.24A2.95 2.95 0 1 0 13 14.86V2h3.1c.12 1.44.9 2.75 2.08 3.53.14.1.28.2.42.29Z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.5 6.2a3.02 3.02 0 0 0-2.13-2.14C19.5 3.56 12 3.56 12 3.56s-7.5 0-9.37.5A3.02 3.02 0 0 0 .5 6.2 31.46 31.46 0 0 0 0 12a31.46 31.46 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.13 2.14c1.87.5 9.37.5 9.37.5s7.5 0 9.37-.5a3.02 3.02 0 0 0 2.13-2.14A31.46 31.46 0 0 0 24 12a31.46 31.46 0 0 0-.5-5.8ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.77l-.44 2.91h-2.33V22C18.34 21.24 22 17.08 22 12.06Z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.9 2H22l-6.78 7.75L23.2 22h-6.25l-4.9-6.4L6.45 22H3.35l7.25-8.29L2.95 2H9.35l4.43 5.86L18.9 2Zm-1.1 17.84h1.72L8.42 4.05H6.57L17.8 19.84Z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0ZM.5 8h4V24h-4V8Zm7.5 0h3.84v2.18h.05c.53-1.01 1.84-2.18 3.79-2.18C19.73 8 20.5 10.67 20.5 14.14V24h-4v-8.74c0-2.08-.04-4.76-2.9-4.76-2.9 0-3.35 2.27-3.35 4.61V24h-4V8Z" />
    </svg>
  );
}

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   Components
───────────────────────────────────────────────────────────── */

function StatItem({
  stat,
  animate,
}: {
  stat: FooterStat;
  animate: boolean;
}) {
  const numericValue = Number.isFinite(stat.value) ? stat.value : 0;

  const count = useCounter(
    stat.decimal ? Math.round(numericValue * 10) : numericValue,
    1400,
    animate,
  );

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-2xl font-bold text-white tabular-nums">
        {stat.decimal ? (count / 10).toFixed(1) : count.toLocaleString()}
        <span style={{ color: "var(--gold-vivid)" }}>{stat.suffix}</span>
      </span>

      <span className="text-white/40 text-xs uppercase tracking-widest">
        {stat.label}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Footer
───────────────────────────────────────────────────────────── */

export default function Footer() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  const footerQuery = trpc.footer.getSettings.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  const settings = footerQuery.data;
  const useDynamicFooter = settings?.isActive !== false;

  const parsedProgramLinks = useMemo(
    () => parseProgramLinks(settings?.programLinks),
    [settings?.programLinks],
  );

  const footerTagline =
    useDynamicFooter && settings?.tagline
      ? settings.tagline
      : siteConfig.tagline;

  const footerDescription =
    useDynamicFooter && settings?.description
      ? settings.description
      : `${siteConfig.tagline}. Program speaking untuk pemula dari Kampung Inggris Pare — belajar dengan cara yang sederhana, praktis, dan menyenangkan.`;

  const footerEmail =
    useDynamicFooter && settings?.email ? settings.email : siteConfig.email;

  const footerLocationTagline =
    useDynamicFooter && settings?.locationTagline
      ? settings.locationTagline
      : siteConfig.location;

  const footerLocationAddress =
    useDynamicFooter && settings?.locationAddress
      ? settings.locationAddress
      : "Kampung Inggris Pare, Kec. Pare, Kab. Kediri, Jawa Timur 64212";

  const footerMapsUrl =
    useDynamicFooter && settings?.locationMapsUrl
      ? settings.locationMapsUrl
      : "https://maps.app.goo.gl/Hibvyj6gYGjSTkHE6";

  const privacyHref =
    useDynamicFooter && settings?.privacyHref ? settings.privacyHref : "/privacy";

  const privacyLabel =
    useDynamicFooter && settings?.privacyLabel ? settings.privacyLabel : "Privasi";

  const termsHref =
    useDynamicFooter && settings?.termsHref ? settings.termsHref : "/terms";

  const termsLabel =
    useDynamicFooter && settings?.termsLabel ? settings.termsLabel : "Ketentuan";

  const contactHref =
    useDynamicFooter && settings?.contactPageHref
      ? settings.contactPageHref
      : "/contact";

  const contactLabel =
    useDynamicFooter && settings?.contactPageLabel
      ? settings.contactPageLabel
      : "Form Pertanyaan";

  const whatsappLabel =
    useDynamicFooter && settings?.whatsappLabel
      ? settings.whatsappLabel
      : "WhatsApp Admin";

  const ctaText =
    useDynamicFooter && settings?.ctaText
      ? settings.ctaText
      : "Siap mulai perjalanan belajar Bahasa Inggris kamu?";

  const ctaButtonLabel =
    useDynamicFooter && settings?.ctaButtonLabel
      ? settings.ctaButtonLabel
      : "Hubungi Kami";

  const contactWhatsAppHref =
    useDynamicFooter && settings?.whatsappNumber
      ? buildFooterWhatsAppUrl(settings.whatsappNumber)
      : buildFooterWhatsAppUrl(null);

  const whatsappHref =
    useDynamicFooter && settings?.ctaButtonHref
      ? settings.ctaButtonHref
      : contactWhatsAppHref;

  const programLinks =
    useDynamicFooter && parsedProgramLinks?.length
      ? parsedProgramLinks
      : navLinks.slice(1);

  const socials: SocialItem[] = [
    {
      label: "Instagram",
      href:
        useDynamicFooter && settings?.instagramUrl
          ? settings.instagramUrl
          : siteConfig.instagram,
      icon: <InstagramIcon />,
      color: "hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500",
    },
    {
      label: "TikTok",
      href:
        useDynamicFooter && settings?.tiktokUrl
          ? settings.tiktokUrl
          : siteConfig.tiktok,
      icon: <TiktokIcon />,
      color: "hover:bg-[#010101]",
    },
    {
      label: "YouTube",
      href:
        useDynamicFooter && settings?.youtubeUrl
          ? settings.youtubeUrl
          : siteConfig.youtube,
      icon: <YoutubeIcon />,
      color: "hover:bg-red-600",
    },
    {
      label: "Facebook",
      href: useDynamicFooter && settings?.facebookUrl ? settings.facebookUrl : "",
      icon: <FacebookIcon />,
      color: "hover:bg-blue-600",
    },
    {
      label: "X / Twitter",
      href: useDynamicFooter && settings?.twitterUrl ? settings.twitterUrl : "",
      icon: <TwitterIcon />,
      color: "hover:bg-black",
    },
    {
      label: "LinkedIn",
      href: useDynamicFooter && settings?.linkedinUrl ? settings.linkedinUrl : "",
      icon: <LinkedinIcon />,
      color: "hover:bg-blue-700",
    },
  ].filter((item) => Boolean(item.href));

  const stats: FooterStat[] = [
    {
      label: "Alumni",
      value: settings?.statAlumniOverride ?? SOCIAL_PROOF.totalStudents,
      suffix: "+",
    },
    {
      label: "Program",
      value: settings?.statProgramOverride ?? 12,
      suffix: "",
    },
    {
      label: "Tahun Berdiri",
      value: settings?.statYearsOverride ?? 8,
      suffix: "+",
    },
    {
      label: "Rating",
      value: Number(settings?.statRatingOverride ?? 4.9),
      suffix: "★",
      decimal: true,
    },
  ];

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
      className="relative overflow-hidden text-white"
      style={{ background: "var(--blue-abyss)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(26,82,200,0.10) 0%, transparent 70%)",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 right-0 h-[400px] w-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(245,168,0,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Stats band */}
      <div
        ref={statsRef}
        className="border-b border-white/6"
        style={{ background: "rgba(245,168,0,0.05)" }}
      >
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="grid grid-cols-2 gap-6 divide-x-0 divide-white/10 sm:grid-cols-4 sm:divide-x">
            {stats.map((stat) => (
              <StatItem
                key={stat.label}
                stat={stat}
                animate={statsVisible}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="border-b border-white/6 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8 xl:gap-16">
            {/* Brand column */}
            <div className="flex flex-col gap-6 lg:col-span-4">
              <Link href="/" className="group inline-flex w-fit items-center gap-3">
                <div
                  className="
                    flex h-11 w-11 items-center justify-center rounded-2xl
                    border border-white/10 bg-white/5 backdrop-blur-sm
                    transition-all duration-300
                    group-hover:scale-105 group-hover:bg-white/10
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

                <div className="flex flex-col">
                  <span className="font-display text-xl font-bold tracking-tight">
                    {siteConfig.name}
                  </span>
                  {footerTagline ? (
                    <span className="text-[11px] font-medium text-white/35">
                      {footerTagline}
                    </span>
                  ) : null}
                </div>
              </Link>

              <p className="text-sm leading-relaxed text-white/50">
                {footerDescription}
              </p>

              {/* Social icons */}
              {socials.length > 0 ? (
                <div>
                  <p className="mb-3 text-[10px] uppercase tracking-widest text-white/25">
                    Ikuti Kami
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    {socials.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        title={s.label}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/6 text-white/50 transition-all duration-200 hover:scale-110 hover:text-white hover:shadow-lg ${s.color}`}
                      >
                        {s.icon}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Location pill */}
              <div
                className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5"
                style={{
                  border: "1px solid rgba(214,232,255,0.12)",
                  background: "rgba(26,82,200,0.08)",
                }}
              >
                <svg
                  className="h-3.5 w-3.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: "var(--blue-sky)" }}
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>

                <span className="text-xs text-white/40">
                  {footerLocationTagline}
                </span>
              </div>
            </div>

            {/* Program links */}
            <div className="lg:col-span-2">
              <p className="mb-5 text-[10px] uppercase tracking-widest text-white/25">
                Program
              </p>

              <ul className="space-y-3">
                {programLinks.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-2 text-sm text-white/50 transition-colors duration-200 hover:text-white"
                    >
                      <span
                        className="h-1 w-1 flex-shrink-0 rounded-full transition-all duration-200 group-hover:bg-[var(--gold-vivid)]"
                        style={{
                          background: "rgba(245,168,0,0.35)",
                        }}
                      />

                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="lg:col-span-2">
              <p className="mb-5 text-[10px] uppercase tracking-widest text-white/25">
                Kontak
              </p>

              <ul className="space-y-3">
                <li>
                  <a
                    href={contactWhatsAppHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2.5 text-sm text-white/50 transition-colors duration-200 hover:text-white"
                  >
                    <span
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-200"
                      style={{ background: "rgba(34,197,94,0.10)" }}
                    >
                      <WhatsAppIcon className="h-3.5 w-3.5 text-green-400" />
                    </span>

                    {whatsappLabel}
                  </a>
                </li>

                {footerEmail ? (
                  <li>
                    <a
                      href={`mailto:${footerEmail}`}
                      className="group flex items-center gap-2.5 text-sm text-white/50 transition-colors duration-200 hover:text-white"
                    >
                      <span
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-200 group-hover:bg-[rgba(26,82,200,0.25)]"
                        style={{ background: "rgba(26,82,200,0.12)" }}
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{ color: "var(--blue-sky)" }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </span>

                      {footerEmail}
                    </a>
                  </li>
                ) : null}

                <li>
                  <Link
                    href={contactHref}
                    className="group flex items-center gap-2.5 text-sm text-white/50 transition-colors duration-200 hover:text-white"
                  >
                    <span
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-200 group-hover:bg-[rgba(26,82,200,0.25)]"
                      style={{ background: "rgba(26,82,200,0.12)" }}
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: "var(--blue-sky)" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </span>

                    {contactLabel}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Map */}
            <div className="lg:col-span-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-white/25">
                  Lokasi Kami
                </p>

                <a
                  href={footerMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] transition-colors"
                  style={{ color: "rgba(245,168,0,0.6)" }}
                >
                  Buka di Maps

                  <svg
                    className="h-3 w-3"
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

              <div className="group relative">
                <div
                  className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(245,168,0,0.20) 0%, transparent 60%)",
                  }}
                />

                <div
                  className="relative overflow-hidden rounded-2xl transition-colors duration-500"
                  style={{
                    height: 240,
                    border: "1px solid rgba(214,232,255,0.08)",
                  }}
                >
                  <MapWrapper />

                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(26,82,200,0.05) 0%, transparent 60%)",
                    }}
                  />
                </div>

                <div className="mt-3 flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: "var(--blue-sky)" }}
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>

                  <span className="text-xs leading-relaxed text-white/35">
                    {footerLocationAddress}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA strip */}
      <div
        className="border-b border-white/6"
        style={{ background: "rgba(245,168,0,0.04)" }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-5 sm:flex-row sm:px-8 lg:px-10">
          <p className="text-center text-sm text-white/50 sm:text-left">
            {ctaText}
          </p>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition-all duration-200 hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, #E8940A 0%, var(--gold-mid) 50%, var(--gold-vivid) 100%)",
              color: "#3a1c00",
              boxShadow: "0 4px 18px rgba(180,100,0,0.35)",
            }}
          >
            <WhatsAppIcon className="h-4 w-4" />
            {ctaButtonLabel}
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 sm:flex-row sm:px-8 lg:px-10">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <Link
              href={privacyHref}
              className="text-xs text-white/20 transition-colors hover:text-white/50"
            >
              {privacyLabel}
            </Link>

            <Link
              href={termsHref}
              className="text-xs text-white/20 transition-colors hover:text-white/50"
            >
              {termsLabel}
            </Link>

            <span className="text-xs text-white/15">
              {footerLocationTagline}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}