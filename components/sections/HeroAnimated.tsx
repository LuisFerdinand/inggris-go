"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import WAButton from "@/components/ui/WAButton";

const ease = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

export default function HeroAnimated() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-brand-cream">

      {/* Background mesh */}
      <div className="absolute inset-0 bg-hero-mesh pointer-events-none" />

      {/* Decorative circles */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease }}
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-brand-orange/5 pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, delay: 0.1, ease }}
        className="absolute -bottom-40 -left-20 w-[480px] h-[480px] rounded-full bg-brand-teal/6 pointer-events-none"
      />

      {/* Floating accent shape */}
      <motion.div
        animate={{ y: [0, -18, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute top-20 right-[8%] w-20 h-20 rounded-3xl bg-orange-gradient shadow-glow-orange opacity-80 hidden lg:block"
      />
      <motion.div
        animate={{ y: [0, 14, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-24 right-[18%] w-12 h-12 rounded-2xl bg-teal-gradient opacity-70 hidden lg:block"
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* ── Left column ── */}
          <motion.div variants={container} initial="hidden" animate="show">

            {/* Eyebrow */}
            <motion.div variants={item} className="mb-7">
              <span className="pill pill-orange">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                Kampung Inggris Pare, Indonesia
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={item}
              className="font-display text-display-xl text-brand-navy mb-6"
            >
              Belajar Bahasa Inggris{" "}
              <span className="relative inline-block">
                <span className="text-orange-gradient">Tanpa Takut</span>
                {/* underline squiggle */}
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 220 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 7 C40 2, 80 9, 120 5 C160 1, 200 8, 218 5"
                    stroke="#FF6B35"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>{" "}
              Salah
            </motion.h1>

            {/* Sub */}
            <motion.p variants={item} className="text-brand-charcoal/65 text-lg leading-relaxed mb-8 max-w-lg">
              Mulai berbicara bahasa Inggris dengan percaya diri bersama{" "}
              <span className="font-600 text-brand-orange">Inggris Go</span>. Program online,
              privat, dan English camp yang dirancang khusus untuk pemula.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={item} className="flex flex-wrap gap-3 mb-10">
              <Link
                href="/speaking-challenge"
                className="btn-primary px-7 py-3.5 text-base"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Mulai Speaking Challenge
              </Link>
              <a href="#programs" className="btn-outline px-7 py-3.5 text-base">
                Lihat Semua Program
              </a>
            </motion.div>

            {/* Social proof row */}
            <motion.div variants={item} className="flex items-center gap-4">
              {/* Avatars */}
              <div className="flex -space-x-2.5">
                {["RA", "BH", "SW", "DK"].map((initials, i) => (
                  <div
                    key={initials}
                    className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-700 font-display text-white shadow-sm"
                    style={{
                      background: ["#FF6B35", "#2DB8B0", "#1A365D", "#E8521C"][i],
                      zIndex: 4 - i,
                    }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 mb-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                <p className="text-brand-charcoal/55 text-sm">
                  <span className="font-600 text-brand-charcoal">500+</span> siswa bergabung • Rating{" "}
                  <span className="font-600 text-brand-charcoal">4.9/5</span>
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right column — floating card ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease }}
            className="relative hidden lg:block"
          >
            {/* Main card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="relative z-10 bg-white rounded-4xl shadow-float p-8 border border-brand-navy/6"
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-brand-navy/6">
                <div className="w-14 h-14 rounded-2xl bg-orange-gradient flex items-center justify-center shadow-glow-orange">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-display font-700 text-brand-navy text-base">Live Speaking Practice</p>
                  <p className="text-brand-charcoal/50 text-sm">dengan Tutor Berpengalaman</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 bg-green-50 rounded-full px-3 py-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-700 text-xs font-600">Live</span>
                </div>
              </div>

              {/* Conversation bubbles */}
              <div className="space-y-3 mb-6">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-teal/15 flex items-center justify-center flex-shrink-0 text-xs font-700 text-brand-teal">T</div>
                  <div className="bg-brand-teal-light rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[200px]">
                    <p className="text-brand-navy text-sm">&ldquo;Hello! How are you today?&rdquo;</p>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="bg-orange-gradient rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[180px]">
                    <p className="text-white text-sm">&ldquo;I&apos;m fine, thank you!&rdquo;</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-brand-orange/15 flex items-center justify-center flex-shrink-0 text-xs font-700 text-brand-orange">S</div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-teal/15 flex items-center justify-center flex-shrink-0 text-xs font-700 text-brand-teal">T</div>
                  <div className="bg-brand-teal-light rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[200px]">
                    <p className="text-brand-navy text-sm">&ldquo;Great! Let&apos;s practice more today.&rdquo;</p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="bg-brand-sand rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-600 font-display text-brand-navy/60">Week 3 Progress</span>
                  <span className="text-xs font-700 font-display text-brand-orange">74%</span>
                </div>
                <div className="h-2 bg-brand-cream-deep rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "74%" }}
                    transition={{ duration: 1.2, delay: 0.8, ease }}
                    className="h-full bg-orange-gradient rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Floating badge top-left */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="absolute -top-5 -left-6 bg-white rounded-2xl shadow-card px-4 py-3 flex items-center gap-2.5 border border-brand-navy/6 z-20"
            >
              <div className="w-9 h-9 rounded-xl bg-orange-gradient flex items-center justify-center text-white font-display font-800 text-sm">GO!</div>
              <div>
                <p className="font-display font-700 text-brand-navy text-xs">Mulai Hari Ini</p>
                <p className="text-brand-charcoal/45 text-xs">Tanpa Syarat</p>
              </div>
            </motion.div>

            {/* Floating badge bottom-right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="absolute -bottom-4 -right-4 bg-brand-teal rounded-2xl shadow-glow-teal px-4 py-2.5 z-20"
            >
              <p className="text-white text-xs font-display font-700">🎯 Start Speaking Today!</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
