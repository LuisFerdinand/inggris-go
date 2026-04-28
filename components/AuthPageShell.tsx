"use client";
 
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  MessageCircle,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { BRAND } from "@/constants/brand";
import { AuthForm, type AuthTab } from "./AuthForm";
import { useEffect, useState } from "react";
 
const EASE = [0.22, 1, 0.36, 1] as const;
 
const SOCIAL_PROOF = [
  { value: "50K+", label: "Pelajar Aktif" },
  { value: "4.9★", label: "Rating Rata-rata" },
  { value: "95%", label: "Tingkat Kelulusan" },
];
 
const FEATURE_BULLETS = [
  {
    icon: Zap,
    title: "Belajar Super Cepat",
    desc: "Metode spaced-repetition terbukti 3× lebih efektif",
  },
  {
    icon: MessageCircle,
    title: "Praktek Berbicara",
    desc: "Sesi speaking live dengan native & non-native speaker",
  },
  {
    icon: GraduationCap,
    title: "Kurikulum Terstruktur",
    desc: "Dari A1 hingga C2 dengan jalur yang jelas",
  },
  {
    icon: TrendingUp,
    title: "Lacak Progres",
    desc: "Dashboard personal yang memotivasi setiap hari",
  },
];
 
const TESTIMONIALS = [
  {
    name: "Rina S.",
    role: "Mahasiswa UI",
    avatar: "RS",
    text: "Dalam 3 bulan IELTS naik 1.5 poin. Metodenya beda banget!",
  },
  {
    name: "Budi K.",
    role: "Software Engineer",
    avatar: "BK",
    text: "Akhirnya bisa interview dalam bahasa Inggris dengan percaya diri.",
  },
];
 
/* ─── Tab-aware dynamic content ──────────────────────────── */
const TAB_CONTENT = {
  login: {
    badge: "SELAMAT DATANG KEMBALI",
    headline: (
      <>
        Lanjutkan
        <br />
        perjalananmu
        <br />
        <span style={{ color: "var(--color-brand-gold-vivid)" }}>
          menuju fasih.
        </span>
      </>
    ),
    sub: "Program, progres, dan komunitas kamu sudah menunggu.",
    cardTitle: "Selamat datang kembali 👋",
    cardSub: "Masuk untuk melanjutkan progres belajarmu.",
    footerText: "Belum punya akun?",
    footerLink: "Daftar gratis",
  },
  signup: {
    badge: "MULAI GRATIS SEKARANG",
    headline: (
      <>
        Kuasai bahasa
        <br />
        Inggris tanpa
        <br />
        <span style={{ color: "var(--color-brand-gold-vivid)" }}>
          takut salah.
        </span>
      </>
    ),
    sub: "Bergabung bersama 50.000+ pelajar Indonesia yang sudah merasakan bedanya.",
    cardTitle: "Mulai belajar gratis 🚀",
    cardSub: "Daftar sekarang, akses semua program.",
    footerText: "Sudah punya akun?",
    footerLink: "Masuk sekarang",
  },
};
 
export function AuthPageShell() {
  const searchParams = useSearchParams();
  const router = useRouter();
 
  const tabParam = searchParams?.get("tab");
  // ✅ FIX: tab state is the single source of truth for BOTH the form and the left panel content
  const [tab, setTab] = useState<AuthTab>(
    tabParam === "signup" ? "signup" : "login",
  );
 
  // ✅ FIX: handleTabChange is passed as onTabChange to AuthForm, so when the
  // form's internal tab switcher fires, it bubbles up here and updates the
  // left-panel content too.
  const handleTabChange = (t: AuthTab) => {
    setTab(t);
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("tab", t);
    router.replace(`/auth?${params.toString()}`, { scroll: false });
  };
 
  const content = TAB_CONTENT[tab];
 
  return (
    <div
      className="min-h-screen flex pt-10"
      style={{ background: "var(--color-brand-bg)" }}
    >
      {/* ══════════════════════════════════════
          LEFT PANEL — Brand / Social Proof
      ══════════════════════════════════════ */}
      <div
        className="hidden lg:flex flex-col justify-between w-[52%] xl:w-[56%] relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, var(--color-brand-blue-abyss) 0%, #071240 40%, var(--color-brand-blue-navy) 100%)",
        }}
      >
        {/* Background layers */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 60% 30%, rgba(26,82,200,0.22), transparent 70%)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "-10%",
            left: "-5%",
            width: "50%",
            height: "50%",
            background:
              "radial-gradient(circle, rgba(247,181,0,0.1), transparent 65%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
 
        <div className="relative z-10 flex flex-col h-full px-12 xl:px-16 py-10">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Inggris Go"
                width={40}
                height={40}
                className="rounded-xl"
                style={{ objectFit: "contain" }}
              />
              <span
                className="font-display font-bold text-white"
                style={{ fontSize: "1.125rem", letterSpacing: "-0.01em" }}
              >
                Inggris{" "}
                <span style={{ color: "var(--color-brand-gold-vivid)" }}>
                  Go!
                </span>
              </span>
            </Link>
          </motion.div>
 
          {/* ✅ FIX: Dynamic headline now reacts to `tab` state which is controlled by handleTabChange */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab + "-headline"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="mt-auto mb-10"
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                style={{
                  background: "rgba(247,181,0,0.12)",
                  border: "1px solid rgba(247,181,0,0.22)",
                }}
              >
                <Sparkles
                  className="w-3.5 h-3.5"
                  style={{ color: "var(--color-brand-gold-vivid)" }}
                />
                <span
                  className="font-display font-bold"
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--color-brand-gold-vivid)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {content.badge}
                </span>
              </div>
 
              <h1
                className="font-display font-bold text-white leading-tight mb-4"
                style={{
                  fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                  letterSpacing: "-0.025em",
                }}
              >
                {content.headline}
              </h1>
              <p
                className="font-body leading-relaxed"
                style={{
                  fontSize: "0.9375rem",
                  color: "rgba(255,255,255,0.55)",
                  maxWidth: "380px",
                }}
              >
                {content.sub}
              </p>
            </motion.div>
          </AnimatePresence>
 
          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
            className="grid grid-cols-1 gap-3 mb-10"
          >
            {FEATURE_BULLETS.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 + i * 0.06, ease: EASE }}
                  className="flex items-start gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: "rgba(247,181,0,0.12)",
                      border: "1px solid rgba(247,181,0,0.18)",
                    }}
                  >
                    <Icon
                      className="w-3.5 h-3.5"
                      style={{ color: "var(--color-brand-gold-vivid)" }}
                    />
                  </div>
                  <div>
                    <p
                      className="font-display font-semibold text-white"
                      style={{ fontSize: "0.8125rem" }}
                    >
                      {f.title}
                    </p>
                    <p style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.4)" }}>
                      {f.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
 
          {/* Testimonials + Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: EASE }}
          >
            <div className="space-y-3 mb-6">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.08, ease: EASE }}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-white"
                    style={{
                      fontSize: "0.625rem",
                      background: `linear-gradient(135deg, var(--color-brand-blue) 0%, var(--color-brand-blue-navy) 100%)`,
                    }}
                  >
                    {t.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="font-display font-bold text-white"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {t.name}
                      </span>
                      <span style={{ fontSize: "0.625rem", color: "rgba(255,255,255,0.4)" }}>
                        · {t.role}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.55)", lineHeight: "1.5" }}>
                      "{t.text}"
                    </p>
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-2.5 h-2.5 fill-current"
                        style={{ color: "var(--color-brand-gold-vivid)" }}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
 
            <div
              className="flex items-center gap-4 pt-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              {SOCIAL_PROOF.map((s, i) => (
                <div
                  key={s.value}
                  className={i < SOCIAL_PROOF.length - 1 ? "border-r pr-4" : ""}
                  style={{ borderColor: "rgba(255,255,255,0.1)" }}
                >
                  <p className="font-display font-bold text-white" style={{ fontSize: "1rem" }}>
                    {s.value}
                  </p>
                  <p style={{ fontSize: "0.625rem", color: "rgba(255,255,255,0.4)" }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
 
      {/* ══════════════════════════════════════
          RIGHT PANEL — Auth Form
      ══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-10 lg:py-16 relative">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.015]"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--color-brand-blue-navy) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
 
        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="lg:hidden mb-8 flex items-center gap-2"
          >
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="Inggris Go"
                width={32}
                height={32}
                className="rounded-lg"
                style={{ objectFit: "contain" }}
              />
              <span
                className="font-display font-bold"
                style={{ fontSize: "1rem", color: "var(--color-brand-text)" }}
              >
                Inggris{" "}
                <span style={{ color: "var(--color-brand-blue)" }}>Go!</span>
              </span>
            </Link>
          </motion.div>
 
          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
            className="rounded-3xl overflow-hidden"
            style={{
              background: "var(--color-brand-surface)",
              border: "1px solid var(--color-brand-border-soft)",
              boxShadow:
                "0 20px 60px rgba(10,45,135,0.1), 0 4px 16px rgba(10,45,135,0.05)",
            }}
          >
            {/* ✅ FIX: Card Header reacts to tab which is now kept in sync via onTabChange */}
            <AnimatePresence mode="wait">
              <motion.div
                key={tab + "-header"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="relative px-8 pt-7 pb-6 overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-brand-blue-abyss) 0%, var(--color-brand-blue-navy) 100%)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-[0.04] pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, white 1px, transparent 1px)",
                    backgroundSize: "18px 18px",
                  }}
                />
                <div
                  className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(26,82,200,0.3), transparent 70%)",
                  }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 h-[1.5px]"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, var(--color-brand-gold-mid) 50%, transparent)",
                  }}
                />
                <div className="relative">
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-4"
                    style={{
                      background: "rgba(247,181,0,0.12)",
                      border: "1px solid rgba(247,181,0,0.22)",
                    }}
                  >
                    <Sparkles
                      className="w-3 h-3"
                      style={{ color: "var(--color-brand-gold-vivid)" }}
                    />
                    <span
                      className="font-display font-bold"
                      style={{
                        fontSize: "0.5625rem",
                        color: "var(--color-brand-gold-vivid)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      INGGRIS GO
                    </span>
                  </div>
                  <h2
                    className="font-display font-bold text-white"
                    style={{
                      fontSize: "1.375rem",
                      letterSpacing: "-0.02em",
                      lineHeight: "1.25",
                    }}
                  >
                    {content.cardTitle}
                  </h2>
                  <p
                    className="mt-1.5"
                    style={{
                      fontSize: "0.8125rem",
                      color: "rgba(255,255,255,0.45)",
                    }}
                  >
                    {content.cardSub}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
 
            {/* Form Body */}
            <div className="px-8 py-7">
              {/* ✅ FIX: Pass both tab and onTabChange so the form is fully controlled */}
              <AuthForm
                variant="page"
                defaultTab={tab}
                tab={tab}
                onTabChange={handleTabChange}
              />
            </div>
          </motion.div>
 
          {/* Footer link */}
          <AnimatePresence mode="wait">
            <motion.p
              key={tab + "-footer"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-center mt-5 font-body"
              style={{ fontSize: "0.8125rem", color: "#94A3B8" }}
            >
              {content.footerText}{" "}
              <button
                onClick={() => handleTabChange(tab === "login" ? "signup" : "login")}
                className="font-display font-semibold hover:underline transition-colors cursor-pointer"
                style={{ color: "var(--color-brand-blue)", background: "none", border: "none", padding: 0 }}
              >
                {content.footerLink}
              </button>
            </motion.p>
          </AnimatePresence>
 
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="text-center mt-3"
          >
            <Link
              href="/"
              className="font-body hover:underline transition-colors flex justify-center items-center gap-2"
              style={{ fontSize: "0.75rem", color: BRAND.blueNavy }}
            >
              <ArrowLeft className="size-4" /> Kembali ke beranda
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}