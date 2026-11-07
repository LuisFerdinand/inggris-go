// app/(home)/contact/_modules/ContactView.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
  PartyPopper,
  Send,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { Icon } from "@/components/Icon";
import SectionHeading from "@/components/ui/SectionHeading";
import SharedCta from "@/components/sections/shared/SharedCta";
import { DEFAULT_CONTACT } from "@/app/modules/site-content/site-content.defaults";
import type {
  ContactMethodColorKey,
  WhyChooseColorKey,
} from "@/app/modules/site-content/site-content.types";

/* ─────────────────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────────────────── */
function useIntersection<T extends Element>(
  ref: RefObject<T | null>,
  { threshold = 0.1, once = true } = {},
) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          if (once) obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold, once]);
  return visible;
}

type RevealFrom = "bottom" | "left" | "right" | "fade";

function Reveal({
  children,
  delay = 0,
  className = "",
  from = "bottom",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  from?: RevealFrom;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useIntersection(ref);

  const initialTransform: Record<RevealFrom, string> = {
    bottom: "translateY(24px)",
    left: "translateX(-24px)",
    right: "translateX(24px)",
    fade: "none",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(0,0)" : initialTransform[from],
        transition: `opacity 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   FORM TYPES + VALIDATION
───────────────────────────────────────────────────────── */
type FormData = {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  honeypot: string;
};
type FormErrors = Partial<Record<keyof FormData, string>>;
type FormStatus = "idle" | "loading" | "success" | "error";

const INITIAL_FORM: FormData = {
  name: "",
  email: "",
  subject: "",
  category: "",
  message: "",
  honeypot: "",
};

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = "Nama wajib diisi";
  else if (data.name.trim().length < 2) errors.name = "Nama terlalu pendek";

  if (!data.email.trim()) errors.email = "Email wajib diisi";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "Format email tidak valid";

  if (!data.message.trim()) errors.message = "Pesan wajib diisi";
  else if (data.message.trim().length < 10)
    errors.message = "Pesan terlalu pendek (min 10 karakter)";

  return errors;
}

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-600">
        {label}
        {required && (
          <span className="text-xs font-normal normal-case text-red-500">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs leading-snug text-slate-400">{hint}</p>
      )}
      <div
        style={{
          maxHeight: error ? "40px" : "0",
          opacity: error ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.25s ease, opacity 0.2s ease",
        }}
      >
        {error && (
          <p className="flex items-center gap-1 pt-0.5 text-xs text-red-500">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

function inputCls(error?: string) {
  return [
    "w-full px-4 py-3 text-sm rounded-xl border transition-all duration-200 outline-none bg-white",
    "placeholder:text-slate-300 focus:ring-2 focus:ring-offset-0",
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-200 bg-red-50/30"
      : "border-slate-200 focus:border-blue-400 focus:ring-blue-100",
  ].join(" ");
}

/* ─────────────────────────────────────────────────────────
   COLOR MAPS
───────────────────────────────────────────────────────── */
const METHOD_COLORS: Record<
  ContactMethodColorKey,
  { color: string; bgColor: string; iconBg: string }
> = {
  green: {
    color: "text-green-700",
    bgColor: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-100",
    iconBg: "bg-green-500",
  },
  blue: {
    color: "text-blue-700",
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100",
    iconBg: "bg-blue-600",
  },
  violet: {
    color: "text-violet-700",
    bgColor: "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100",
    iconBg: "bg-violet-600",
  },
  teal: {
    color: "text-teal-700",
    bgColor: "bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-100",
    iconBg: "bg-teal-600",
  },
  amber: {
    color: "text-amber-700",
    bgColor: "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100",
    iconBg: "bg-amber-500",
  },
};

const WHY_COLORS: Record<
  WhyChooseColorKey,
  { color: string; bg: string; accent: string }
> = {
  blue: { color: "text-blue-600", bg: "bg-blue-50", accent: "border-l-blue-500" },
  violet: {
    color: "text-violet-600",
    bg: "bg-violet-50",
    accent: "border-l-violet-500",
  },
  teal: { color: "text-teal-600", bg: "bg-teal-50", accent: "border-l-teal-500" },
  amber: {
    color: "text-amber-600",
    bg: "bg-amber-50",
    accent: "border-l-amber-500",
  },
};

/* ─────────────────────────────────────────────────────────
   FAQ ACCORDION
───────────────────────────────────────────────────────── */
function FaqAccordion({
  items,
  seeAllHref,
}: {
  items: { q: string; a: string }[];
  seeAllHref: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className={`overflow-hidden rounded-xl border transition-all duration-200 ${
              isOpen
                ? "border-blue-200 bg-blue-50/60 shadow-sm"
                : "border-slate-100 bg-slate-50 hover:border-blue-100 hover:bg-blue-50/30"
            }`}
          >
            <button
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              <span
                className={`text-sm font-semibold leading-snug transition-colors ${
                  isOpen ? "text-blue-700" : "text-slate-700"
                }`}
              >
                {item.q}
              </span>
              <span
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                  isOpen
                    ? "rotate-180 bg-blue-500 text-white"
                    : "border border-slate-200 bg-white text-slate-400"
                }`}
              >
                <ChevronDown className="h-3 w-3" />
              </span>
            </button>

            <div
              ref={(el) => {
                contentRefs.current[i] = el;
              }}
              style={{
                maxHeight: isOpen
                  ? `${contentRefs.current[i]?.scrollHeight ?? 300}px`
                  : "0px",
                opacity: isOpen ? 1 : 0,
                transition:
                  "max-height 0.35s cubic-bezier(.22,1,.36,1), opacity 0.25s ease",
                overflow: "hidden",
              }}
            >
              <p className="px-4 pb-4 text-sm leading-relaxed text-slate-600">
                {item.a}
              </p>
            </div>
          </div>
        );
      })}

      {seeAllHref && (
        <div className="pt-3">
          <a
            href={seeAllHref}
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            Lihat semua FAQ
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      )}
    </div>
  );
}

function SuccessScreen({ onReset }: { onReset: () => void }) {
  return (
    <div className="animate-fadeIn flex flex-col items-center px-6 py-12 text-center">
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <Icon name="check-circle-2" className="h-10 w-10 text-green-500" />
        </div>
        <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 shadow-md">
          <PartyPopper className="h-3.5 w-3.5 text-amber-900" />
        </div>
      </div>
      <h3 className="mb-2 text-2xl font-extrabold text-slate-800">
        Pesan Terkirim! 🎉
      </h3>
      <p className="mb-1 max-w-xs text-sm leading-relaxed text-slate-500">
        Tim kami akan membalas dalam{" "}
        <strong className="text-blue-600">24 jam</strong>. Cek inbox emailmu
        juga ya!
      </p>
      <button
        onClick={onReset}
        className="mt-8 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-600 transition-all hover:bg-blue-100 active:scale-95"
      >
        Kirim pesan lain
      </button>
    </div>
  );
}

function OnlineBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
      </span>
      Tim Online
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN
───────────────────────────────────────────────────────── */
export default function ContactView() {
  const { data } = trpc.siteContent.getContact.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const c = data && data.isActive !== false ? data : DEFAULT_CONTACT;

  const heroBadge = c.heroBadgeText || DEFAULT_CONTACT.heroBadgeText;
  const heroTitle = c.heroTitle || DEFAULT_CONTACT.heroTitle;
  const heroTitleAccent = c.heroTitleAccent ?? DEFAULT_CONTACT.heroTitleAccent;
  const heroDescription =
    c.heroDescription || DEFAULT_CONTACT.heroDescription;
  const heroTrustPills =
    c.heroTrustPills && c.heroTrustPills.length > 0
      ? c.heroTrustPills
      : DEFAULT_CONTACT.heroTrustPills;
  const heroStats =
    c.heroStats && c.heroStats.length > 0
      ? c.heroStats
      : DEFAULT_CONTACT.heroStats;
  const heroImage = c.heroImageUrl || DEFAULT_CONTACT.heroImageUrl;

  const methodsEyebrow = c.methodsEyebrow || DEFAULT_CONTACT.methodsEyebrow;
  const methodsTitle = c.methodsTitle || DEFAULT_CONTACT.methodsTitle;
  const methodsSubtitle = c.methodsSubtitle || DEFAULT_CONTACT.methodsSubtitle;
  const methods =
    c.methods && c.methods.length > 0 ? c.methods : DEFAULT_CONTACT.methods;

  const formEyebrow = c.formEyebrow || DEFAULT_CONTACT.formEyebrow;
  const formTitle = c.formTitle || DEFAULT_CONTACT.formTitle;
  const formSubtitle = c.formSubtitle || DEFAULT_CONTACT.formSubtitle;
  const categories =
    c.formCategories && c.formCategories.length > 0
      ? c.formCategories
      : DEFAULT_CONTACT.formCategories;
  const infoItems =
    c.infoItems && c.infoItems.length > 0
      ? c.infoItems
      : DEFAULT_CONTACT.infoItems;
  const faqItems =
    c.faqItems && c.faqItems.length > 0 ? c.faqItems : DEFAULT_CONTACT.faqItems;
  const faqSeeAllHref = c.faqSeeAllHref || DEFAULT_CONTACT.faqSeeAllHref;

  const sidebarCtaTitle =
    c.sidebarCtaTitle || DEFAULT_CONTACT.sidebarCtaTitle;
  const sidebarCtaText = c.sidebarCtaText || DEFAULT_CONTACT.sidebarCtaText;
  const sidebarCtaButtonLabel =
    c.sidebarCtaButtonLabel || DEFAULT_CONTACT.sidebarCtaButtonLabel;
  const sidebarCtaButtonHref =
    c.sidebarCtaButtonHref || DEFAULT_CONTACT.sidebarCtaButtonHref;

  const whyBadge = c.whyChooseBadgeText || DEFAULT_CONTACT.whyChooseBadgeText;
  const whyTitle = c.whyChooseTitle || DEFAULT_CONTACT.whyChooseTitle;
  const whyDescription =
    c.whyChooseDescription || DEFAULT_CONTACT.whyChooseDescription;
  const whyItems =
    c.whyChooseItems && c.whyChooseItems.length > 0
      ? c.whyChooseItems
      : DEFAULT_CONTACT.whyChooseItems;

  /* Hero entrance */
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  /* Form state */
  const formRef = useRef<HTMLDivElement | null>(null);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const charCount = form.message.length;

  const set = useCallback(
    (fieldName: keyof FormData) =>
      (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
      ) => {
        const val = e.target.value;
        setForm((f) => ({ ...f, [fieldName]: val }));
        setErrors((prev) =>
          prev[fieldName] ? { ...prev, [fieldName]: undefined } : prev,
        );
      },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.honeypot) return;

    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0] as keyof FormData;
      document.getElementById(`field-${firstKey}`)?.focus();
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          category: form.category,
          message: form.message,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Gagal mengirim pesan");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan. Silakan coba lagi.",
      );
    }
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setStatus("idle");
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen pt-10" style={{ background: "#f4f8ff" }}>
      {/* ═══ HERO ═══ */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(155deg, #060f2e 0%, #0a2d87 40%, #1a52c8 75%, #2a6fd4 100%)",
          minHeight: "420px",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* LEFT */}
            <div>
              {heroBadge && (
                <div
                  style={{
                    opacity: heroVisible ? 1 : 0,
                    transform: heroVisible
                      ? "translateY(0)"
                      : "translateY(16px)",
                    transition: "opacity .55s ease, transform .55s ease",
                  }}
                  className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white"
                >
                  <Icon name="message-circle" className="h-3.5 w-3.5 text-amber-300" />
                  {heroBadge}
                </div>
              )}

              <h1
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? "translateY(0)" : "translateY(20px)",
                  transition:
                    "opacity .65s .1s ease, transform .65s .1s ease",
                  fontSize: "clamp(1.875rem, 4.5vw, 3rem)",
                }}
                className="mb-5 font-extrabold leading-[1.1] tracking-tight text-white"
              >
                {heroTitle}{" "}
                {heroTitleAccent && (
                  <span className="block" style={{ color: "#ffc107" }}>
                    {heroTitleAccent}
                  </span>
                )}
              </h1>

              <p
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? "translateY(0)" : "translateY(20px)",
                  transition:
                    "opacity .65s .2s ease, transform .65s .2s ease",
                }}
                className="mb-7 max-w-[420px] text-[15px] leading-relaxed text-blue-100/75"
              >
                {heroDescription}
              </p>

              <div
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? "translateY(0)" : "translateY(20px)",
                  transition:
                    "opacity .65s .3s ease, transform .65s .3s ease",
                }}
                className="flex flex-wrap gap-3"
              >
                {heroTrustPills.map((t) => (
                  <div
                    key={t.text}
                    className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-medium text-white/80"
                  >
                    <span className="text-amber-300">
                      <Icon name={t.icon} className="h-3.5 w-3.5" />
                    </span>
                    {t.text}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — floating stat cards */}
            <div
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible
                  ? "translateY(0) scale(1)"
                  : "translateY(16px) scale(0.97)",
                transition:
                  "opacity .8s .15s ease, transform .8s .15s ease",
              }}
              className="relative hidden lg:block"
            >
              <div className="pointer-events-none absolute -bottom-8 right-0 z-0 select-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImage}
                  alt=""
                  className="w-[200px] object-contain"
                  style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.4))" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <div className="relative z-10 flex flex-col items-center gap-4 pr-4">
                {heroStats.map((stat, i) => (
                  <div
                    key={i}
                    className="flex w-[280px] items-center gap-3 rounded-2xl border border-white/20 bg-white/15 px-5 py-4 text-white shadow-xl backdrop-blur-md"
                  >
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                        ["bg-amber-400 text-amber-900", "bg-green-400 text-green-900", "bg-violet-400 text-violet-900"][
                          i % 3
                        ]
                      }`}
                    >
                      <Icon name={stat.icon} className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{stat.title}</p>
                      <p className="text-xs text-white/60">{stat.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 52 C480 0 960 0 1440 52 L1440 52 L0 52Z"
              fill="#f4f8ff"
            />
          </svg>
        </div>
      </section>

      {/* ═══ CONTACT OPTIONS ═══ */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          className="mb-8 sm:mb-10"
          eyebrow={methodsEyebrow}
          title={methodsTitle}
          description={methodsSubtitle}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {methods.map((opt, i) => {
            const cc = METHOD_COLORS[opt.colorKey] ?? METHOD_COLORS.blue;
            return (
              <Reveal key={opt.label} delay={i * 90}>
                <div
                  className={`group relative flex h-full flex-col rounded-2xl border p-6 ${cc.bgColor} transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg`}
                >
                  {opt.badge && (
                    <span className="absolute right-4 top-4 rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                      {opt.badge}
                    </span>
                  )}

                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white ${cc.iconBg} transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110`}
                  >
                    <Icon name={opt.icon} className="h-5 w-5" />
                  </div>

                  <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                    Gunakan ini jika…
                  </p>
                  <h3 className="mb-1 text-base font-bold text-slate-800">
                    {opt.label}
                  </h3>
                  <p className={`mb-1 text-sm font-semibold ${cc.color}`}>
                    {opt.whenToUse}
                  </p>
                  <p className="mb-5 flex-1 text-xs text-slate-500">
                    {opt.detail}
                  </p>

                  {opt.actionLabel && opt.actionHref && (
                    <a
                      href={opt.actionHref}
                      target={opt.external ? "_blank" : undefined}
                      rel={opt.external ? "noopener noreferrer" : undefined}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold ${cc.color} transition-all group-hover:gap-2.5`}
                    >
                      {opt.actionLabel}
                      {opt.external ? (
                        <ExternalLink className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </a>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ═══ FORM + SIDEBAR ═══ */}
      <section
        ref={formRef}
        id="contact-form"
        // overflow-x-clip: cards slide in from the right (Reveal from="right");
        // without it the page widens by ~24px on phones while they animate.
        className="mx-auto max-w-7xl scroll-mt-8 overflow-x-clip px-4 pb-16 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* FORM */}
          <div className="lg:col-span-3">
            <Reveal from="left">
              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                <div
                  className="relative overflow-hidden px-8 py-6"
                  style={{
                    background:
                      "linear-gradient(135deg, #0a2d87 0%, #1a52c8 100%)",
                  }}
                >
                  <div className="relative">
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-100">
                      {formEyebrow}
                    </p>
                    <h2 className="text-2xl font-extrabold text-white">
                      {formTitle}
                    </h2>
                    <p className="mt-1 text-sm text-blue-100">
                      {formSubtitle}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-8 sm:px-8">
                  {status === "success" ? (
                    <SuccessScreen onReset={resetForm} />
                  ) : (
                    <form
                      onSubmit={handleSubmit}
                      noValidate
                      className="space-y-5"
                    >
                      <input
                        type="text"
                        name="website"
                        value={form.honeypot}
                        onChange={set("honeypot")}
                        className="hidden"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                      />

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <Field label="Nama" required error={errors.name}>
                          <input
                            id="field-name"
                            type="text"
                            placeholder="Nama lengkap kamu"
                            value={form.name}
                            onChange={set("name")}
                            className={inputCls(errors.name)}
                            autoComplete="name"
                          />
                        </Field>
                        <Field label="Email" required error={errors.email}>
                          <input
                            id="field-email"
                            type="email"
                            placeholder="email@kamu.com"
                            value={form.email}
                            onChange={set("email")}
                            className={inputCls(errors.email)}
                            autoComplete="email"
                          />
                        </Field>
                      </div>

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <Field label="Topik" error={errors.category}>
                          <select
                            id="field-category"
                            value={form.category}
                            onChange={set("category")}
                            className={`${inputCls()} cursor-pointer text-slate-700`}
                          >
                            <option value="">Pilih topik…</option>
                            {categories.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field
                          label="Subjek"
                          hint="Opsional — bantu kami memahami topiknya"
                        >
                          <input
                            id="field-subject"
                            type="text"
                            placeholder="Subjek pesan"
                            value={form.subject}
                            onChange={set("subject")}
                            className={inputCls()}
                          />
                        </Field>
                      </div>

                      <Field
                        label="Pesan"
                        required
                        error={errors.message}
                        hint={`${charCount}/500 karakter`}
                      >
                        <textarea
                          id="field-message"
                          rows={5}
                          placeholder="Ceritakan pertanyaan atau kebutuhanmu secara detail di sini…"
                          value={form.message}
                          onChange={set("message")}
                          maxLength={500}
                          className={`${inputCls(errors.message)} resize-none`}
                        />
                      </Field>

                      <div
                        style={{
                          maxHeight: status === "error" ? "80px" : "0",
                          opacity: status === "error" ? 1 : 0,
                          overflow: "hidden",
                          transition:
                            "max-height 0.3s ease, opacity 0.2s ease",
                        }}
                      >
                        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                          <div>
                            <p className="text-sm font-semibold text-red-700">
                              Gagal mengirim pesan
                            </p>
                            <p className="mt-0.5 text-xs text-red-500">
                              {errorMessage}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="flex w-full items-center justify-center gap-2.5 rounded-2xl py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
                        style={{
                          background:
                            status === "loading"
                              ? "#6b8dd4"
                              : "linear-gradient(135deg, #1a52c8 0%, #2563eb 100%)",
                          boxShadow:
                            status === "loading"
                              ? "none"
                              : "0 4px 20px rgba(26,82,200,.3)",
                        }}
                      >
                        {status === "loading" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Mengirim…
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Kirim Pesan
                          </>
                        )}
                      </button>

                      <p className="text-center text-xs leading-snug text-slate-400">
                        Dengan mengirim formulir ini, Ayah/Bunda setuju kami
                        membalas melalui email yang diberikan.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </Reveal>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-5 lg:col-span-2">
            <Reveal delay={80} from="right">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Info Kontak
                  </p>
                  <OnlineBadge />
                </div>

                <div className="space-y-3.5">
                  {infoItems.map((info) => (
                    <div
                      key={info.label}
                      className="group flex items-start gap-3"
                    >
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
                        <Icon name={info.icon} className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {info.label}
                        </p>
                        {info.href ? (
                          <a
                            href={info.href}
                            className="block truncate text-sm font-semibold text-slate-700 transition-colors hover:text-blue-600"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <p className="text-sm font-semibold text-slate-700">
                            {info.value}
                          </p>
                        )}
                        {info.sub && (
                          <p className="text-xs text-slate-400">
                            {info.sub}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={150} from="right">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Pertanyaan yang Sering Ditanya
                </p>
                <FaqAccordion items={faqItems} seeAllHref={faqSeeAllHref} />
              </div>
            </Reveal>

            <Reveal delay={220} from="right">
              <div
                className="relative overflow-hidden rounded-2xl p-5 text-white"
                style={{
                  background:
                    "linear-gradient(145deg, #0a2d87 0%, #2563eb 100%)",
                }}
              >
                <BookOpen className="relative mb-3 h-7 w-7 opacity-60" />
                <p className="relative mb-1 text-sm font-bold">
                  {sidebarCtaTitle}
                </p>
                <p className="relative mb-4 text-xs leading-relaxed text-white/60">
                  {sidebarCtaText}
                </p>
                <a
                  href={sidebarCtaButtonHref}
                  className="relative inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-4 py-2 text-xs font-bold text-amber-900 transition-all hover:bg-amber-300 active:scale-95"
                >
                  {sidebarCtaButtonLabel} <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ WHY CHOOSE US ═══ */}
      <section
        className="relative overflow-hidden py-16"
        style={{
          background:
            "linear-gradient(180deg, #f4f8ff 0%, #e8f0fe 60%, #f4f8ff 100%)",
        }}
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            className="mb-8 sm:mb-10"
            eyebrow={whyBadge || undefined}
            title={whyTitle}
            description={whyDescription}
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {whyItems.map((it, i) => {
              const cc = WHY_COLORS[it.colorKey] ?? WHY_COLORS.blue;
              return (
                <Reveal key={it.title} delay={i * 110}>
                  <div
                    className={`h-full rounded-2xl border border-l-4 border-slate-100 ${cc.accent} bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
                  >
                    <div
                      className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${cc.bg} ${cc.color}`}
                    >
                      <Icon name={it.icon} className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-sm font-bold text-slate-800">
                      {it.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-400">
                      {it.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ SHARED CTA ═══ */}
      <SharedCta />
    </div>
  );
}
