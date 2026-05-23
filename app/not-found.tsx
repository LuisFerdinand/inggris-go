"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Home,
  Users,
  BookOpen,
  FileText,
  MessageCircle,
  ArrowRight,
  Compass,
  Zap,
  Star,
  User,
  Tent,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";

/* ─── Data ───────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Beranda", href: "/", icon: Home },
  { label: "Tentang Kami", href: "/about", icon: Users },
  { label: "Program", href: "/programs", icon: BookOpen },
  { label: "Blog", href: "/blog", icon: FileText },
  { label: "Kontak", href: "/contact", icon: MessageCircle },
];

const PROGRAM_LINKS = [
  {
    label: "Starter Program",
    href: "/programs/lead",
    tag: "Populer",
    icon: Zap,
  },
  {
    label: "Daily Conversation",
    href: "/programs/online/daily-conversation",
    tag: "Terlaris",
    icon: MessageCircle,
  },
  {
    label: "English for Kids",
    href: "/programs/online/english-for-kids",
    tag: "Favorit",
    icon: Star,
  },
  {
    label: "Private Class",
    href: "/programs/online/private-class",
    tag: "Fleksibel",
    icon: User,
  },
  {
    label: "VIP Kids Camp",
    href: "/programs/offline/vip-kids",
    tag: "Pare",
    icon: Tent,
  },
];

/* ─── Scene background ───────────────────────────────────────── */
function SceneBackground({
  mouseX,
  mouseY,
}: {
  mouseX: number;
  mouseY: number;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #060f2e 0%, #091f6a 45%, #0d2d87 75%, #060f2e 100%)",
        }}
      />

      {/* Noise */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.025]">
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      {/* Dot grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]">
        <defs>
          <pattern
            id="dots"
            x="0"
            y="0"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1.5" cy="1.5" r="1.2" fill="#3a8ff5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* Glow orbs */}
      <div
        className="absolute rounded-full blur-[120px] opacity-[0.22]"
        style={{
          width: 600,
          height: 600,
          top: "-20%",
          right: "-8%",
          background: "radial-gradient(circle, #1e6eee 0%, transparent 70%)",
          transform: `translate(${mouseX * 0.35}px,${mouseY * 0.25}px)`,
          transition: "transform 1s cubic-bezier(0.22,1,0.36,1)",
        }}
      />
      <div
        className="absolute rounded-full blur-[100px] opacity-[0.10]"
        style={{
          width: 400,
          height: 400,
          bottom: "0%",
          left: "3%",
          background: "radial-gradient(circle, #f7b500 0%, transparent 70%)",
          transform: `translate(${mouseX * -0.2}px,${mouseY * -0.2}px)`,
          transition: "transform 1.2s cubic-bezier(0.22,1,0.36,1)",
        }}
      />
      <div
        className="absolute rounded-full blur-[140px] opacity-[0.08]"
        style={{
          width: 500,
          height: 280,
          top: "40%",
          left: "28%",
          background: "radial-gradient(ellipse, #1a52c8 0%, transparent 70%)",
          transform: `translate(${mouseX * 0.15}px,${mouseY * 0.15}px)`,
          transition: "transform 1.4s cubic-bezier(0.22,1,0.36,1)",
        }}
      />

      {/* Corner geometry */}
      <svg
        className="absolute top-0 left-0 opacity-[0.09]"
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
      >
        <line
          x1="0"
          y1="100"
          x2="100"
          y2="0"
          stroke="#3a8ff5"
          strokeWidth="0.8"
        />
        <line
          x1="0"
          y1="150"
          x2="150"
          y2="0"
          stroke="#3a8ff5"
          strokeWidth="0.5"
        />
        <line
          x1="0"
          y1="55"
          x2="55"
          y2="0"
          stroke="#ffc107"
          strokeWidth="0.8"
        />
        <circle cx="100" cy="0" r="2.5" fill="#ffc107" opacity="0.7" />
      </svg>
      <svg
        className="absolute bottom-0 right-0 opacity-[0.09]"
        width="180"
        height="180"
        viewBox="0 0 180 180"
        fill="none"
      >
        <line
          x1="180"
          y1="70"
          x2="70"
          y2="180"
          stroke="#3a8ff5"
          strokeWidth="0.8"
        />
        <line
          x1="180"
          y1="120"
          x2="120"
          y2="180"
          stroke="#ffc107"
          strokeWidth="0.5"
        />
        <circle cx="70" cy="180" r="2.5" fill="#3a8ff5" opacity="0.7" />
      </svg>

      {/* Floating particles */}
      {[
        { x: "7%", y: "18%", s: 5, c: "#ffc107", d: "0s" },
        { x: "93%", y: "14%", s: 4, c: "#3a8ff5", d: "1.2s" },
        { x: "86%", y: "74%", s: 5, c: "#ffc107", d: "0.6s" },
        { x: "11%", y: "78%", s: 4, c: "#3a8ff5", d: "1.8s" },
        { x: "51%", y: "5%", s: 3, c: "#1e6eee", d: "0.3s" },
        { x: "54%", y: "92%", s: 5, c: "#ffc107", d: "1s" },
        { x: "24%", y: "44%", s: 3, c: "#3a8ff5", d: "2s" },
        { x: "76%", y: "38%", s: 4, c: "#ffc107", d: "0.8s" },
      ].map((o, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: o.x,
            top: o.y,
            width: o.s,
            height: o.s,
            background: o.c,
            opacity: 0.5,
            boxShadow: `0 0 ${o.s * 3}px ${o.c}`,
            animation: `orb-float 5s ease-in-out ${o.d} infinite alternate`,
          }}
        />
      ))}

      {/* Top edge line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,193,7,0.35), transparent)",
        }}
      />
    </div>
  );
}

/* ─── 404 numeral ────────────────────────────────────────────── */
function FourOhFour() {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ height: "clamp(96px,16vh,148px)" }}
    >
      {/* Rings */}
      <div
        className="absolute rounded-full border border-dashed opacity-[0.16] animate-spin-slow"
        style={{
          width: "clamp(150px,20vw,210px)",
          height: "clamp(150px,20vw,210px)",
          borderColor: "#ffc107",
        }}
      />
      <div
        className="absolute rounded-full border opacity-[0.10] animate-spin-rev"
        style={{
          width: "clamp(110px,14vw,160px)",
          height: "clamp(110px,14vw,160px)",
          borderColor: "#3a8ff5",
        }}
      />
      <div
        className="absolute rounded-full animate-pulse-ring"
        style={{
          width: "clamp(82px,11vw,120px)",
          height: "clamp(82px,11vw,120px)",
          border: "1.5px solid rgba(255,193,7,0.3)",
        }}
      />

      {/* Numbers + icon */}
      <div className="relative z-10 flex items-center gap-2 animate-bounce-subtle">
        <span
          className="font-black leading-none text-shimmer"
          style={{
            fontSize: "clamp(3.8rem, 10vw, 8rem)",
            letterSpacing: "-0.05em",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          4
        </span>

        <div
          className="relative flex items-center justify-center rounded-full"
          style={{
            width: "clamp(3.2rem, 8vw, 6rem)",
            height: "clamp(3.2rem, 8vw, 6rem)",
            background: "linear-gradient(135deg, #1a52c8 0%, #1e6eee 100%)",
            boxShadow:
              "0 0 36px rgba(30,110,238,0.45), 0 0 70px rgba(30,110,238,0.12), inset 0 1px 0 rgba(255,255,255,0.1)",
            border: "1.5px solid rgba(255,255,255,0.1)",
          }}
        >
          <Compass
            style={{
              width: "clamp(1.4rem, 3.5vw, 2.6rem)",
              height: "clamp(1.4rem, 3.5vw, 2.6rem)",
              color: "#fff",
              opacity: 0.92,
            }}
            strokeWidth={1.5}
          />
          <div
            className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse-soft"
            style={{ background: "#ffc107", boxShadow: "0 0 8px #ffc107" }}
          />
        </div>

        <span
          className="font-black leading-none text-shimmer"
          style={{
            fontSize: "clamp(3.8rem, 10vw, 8rem)",
            letterSpacing: "-0.05em",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          4
        </span>
      </div>

      {/* Label */}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span
          className="text-[10px] font-semibold tracking-[0.22em] uppercase"
          style={{ color: "rgba(58,143,245,0.55)" }}
        >
          Page Not Found
        </span>
      </div>
    </div>
  );
}

/* ─── Root ───────────────────────────────────────────────────── */
export default function NotFound() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      setMouse({
        x: ((e.clientX - r.left) / r.width - 0.5) * 40,
        y: ((e.clientY - r.top) / r.height - 0.5) * 30,
      });
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  return (
    <div
      ref={ref}
      className="relative min-h-screen flex flex-col overflow-hidden"
    >
      <SceneBackground mouseX={mouse.x} mouseY={mouse.y} />

      <style>{`
        @keyframes orb-float { from { transform:translateY(0) } to { transform:translateY(-14px) } }
        @keyframes spin-slow  { to { transform:rotate(360deg)  } }
        @keyframes spin-rev   { to { transform:rotate(-360deg) } }
        @keyframes bounce-subtle { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(1.55);opacity:0} }
        @keyframes pulse-soft { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes fade-up  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fade-in  { from{opacity:0} to{opacity:1} }
        @keyframes shimmer  { 0%{background-position:-300% center} 100%{background-position:300% center} }

        .animate-spin-slow    { animation:spin-slow 14s linear infinite; }
        .animate-spin-rev     { animation:spin-rev  9s linear infinite; }
        .animate-bounce-subtle{ animation:bounce-subtle 4s ease-in-out infinite; }
        .animate-pulse-ring   { animation:pulse-ring 2.4s ease-out infinite; }
        .animate-pulse-soft   { animation:pulse-soft 2s ease-in-out infinite; }

        .text-shimmer {
          background:linear-gradient(90deg,#d4a500 0%,#ffd54f 30%,#fff 50%,#ffc107 70%,#f5a800 100%);
          background-size:300% auto;
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
          animation:shimmer 4s linear infinite;
        }

        .e { opacity:0; }
        .e1 { animation:fade-in  .5s ease .05s forwards; }
        .e2 { animation:fade-up  .6s cubic-bezier(.22,1,.36,1) .12s forwards; }
        .e3 { animation:fade-up  .6s cubic-bezier(.22,1,.36,1) .22s forwards; }
        .e4 { animation:fade-up  .6s cubic-bezier(.22,1,.36,1) .32s forwards; }
        .e5 { animation:fade-up  .6s cubic-bezier(.22,1,.36,1) .42s forwards; }
        .e6 { animation:fade-up  .6s cubic-bezier(.22,1,.36,1) .52s forwards; }

        .nav-item {
          border:1px solid rgba(255,255,255,.07);
          background:rgba(255,255,255,.03);
          backdrop-filter:blur(8px);
          transition:all .22s cubic-bezier(.22,1,.36,1);
        }
        .nav-item:hover {
          border-color:rgba(255,193,7,.32);
          background:rgba(255,193,7,.055);
          transform:translateX(4px);
        }
        .prog-item {
          border:1px solid rgba(255,255,255,.055);
          background:rgba(255,255,255,.022);
          backdrop-filter:blur(8px);
          transition:all .22s cubic-bezier(.22,1,.36,1);
        }
        .prog-item:hover {
          border-color:rgba(58,143,245,.38);
          background:rgba(26,82,200,.11);
          transform:translateX(4px);
        }
        .btn-gold {
          background:linear-gradient(135deg,#f5a800 0%,#ffc107 100%);
          box-shadow:0 4px 20px rgba(180,100,0,.32),inset 0 1px 0 rgba(255,230,100,.32);
          transition:all .22s cubic-bezier(.22,1,.36,1);
        }
        .btn-gold:hover { box-shadow:0 8px 32px rgba(180,100,0,.48),inset 0 1px 0 rgba(255,230,100,.32); transform:translateY(-2px); }
        .btn-ghost {
          border:1.5px solid rgba(255,255,255,.16);
          background:rgba(255,255,255,.045);
          backdrop-filter:blur(8px);
          transition:all .22s cubic-bezier(.22,1,.36,1);
        }
        .btn-ghost:hover { border-color:rgba(58,143,245,.45); background:rgba(26,82,200,.14); transform:translateY(-2px); }
      `}</style>

      {/* ── Navbar ── */}
      {/* <nav className="e e1 relative z-20 flex items-center justify-between px-5 lg:px-10 py-3.5 lg:py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Inggris Go!"
            width={34}
            height={34}
            className="drop-shadow-lg"
          />
          <span className="hidden sm:block font-bold text-white text-[15px] tracking-tight">
            Inggris <span style={{ color: "#ffc107" }}>Go!</span>
          </span>
        </Link>
        <div className="hidden lg:flex items-center gap-0.5">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13px] font-medium text-blue-200/65 hover:text-white px-3 py-1.5 rounded-lg transition-all hover:bg-white/[0.05]"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <Link
          href="/programs"
          className="btn-gold text-[12px] font-bold text-[#060f2e] px-4 py-2 rounded-full"
        >
          Lihat Program
        </Link>
      </nav> */}
      {/* <Navbar /> */}
      {/* ── Content ── */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 xl:gap-16 px-5 lg:px-10 py-4 lg:py-0">
        {/* LEFT */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full max-w-[420px]">
          {/* Badge */}
          <div className="e e2 mb-4">
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(255,193,7,.09)",
                border: "1px solid rgba(255,193,7,.22)",
                color: "#ffc107",
              }}
            >
              <Compass size={10} strokeWidth={2.5} />
              Error 404
            </span>
          </div>

          {/* 404 */}
          <div className="e e3 w-full flex justify-center lg:justify-start mb-4">
            <FourOhFour />
          </div>

          {/* Copy */}
          <div className="mt-7">
            <h1
              className="e e4 font-black text-white leading-[1.1] mb-2.5"
              style={{
                fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Waduh, kamu nyasar nih!{" "}
              <span style={{ color: "#ffc107" }}>Tapi tenang</span> —
              <br className="hidden sm:block" /> kita bantu balik ke jalur yang
              bener.
            </h1>
            <p
              className="e e5 text-sm leading-relaxed mb-6"
              style={{ color: "rgba(164,192,240,.7)" }}
            >
              Halaman yang kamu cari sudah pindah, dihapus, atau memang tidak
              pernah ada. Gunakan navigasi di bawah untuk melanjutkan.
            </p>

            {/* CTAs */}
            <div className="e e6 flex flex-col sm:flex-row items-center lg:items-start gap-2.5">
              <Link
                href="/"
                className="btn-gold inline-flex items-center gap-2 text-[13px] font-bold text-[#060f2e] px-5 py-2.5 rounded-full w-full sm:w-auto justify-center"
              >
                <Home size={14} strokeWidth={2.5} />
                Ke Beranda
              </Link>
              <Link
                href="/contact"
                className="btn-ghost inline-flex items-center gap-2 text-[13px] font-semibold text-white px-5 py-2.5 rounded-full w-full sm:w-auto justify-center"
              >
                <MessageCircle size={14} strokeWidth={2} />
                Konsultasi Gratis
              </Link>
            </div>
          </div>
        </div>

        {/* Vertical divider */}
        <div
          className="hidden lg:block w-px self-stretch my-10 opacity-[0.10] flex-shrink-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent, #3a8ff5 40%, #3a8ff5 60%, transparent)",
          }}
        />

        {/* RIGHT */}
        <div className="w-full max-w-sm lg:max-w-[280px] xl:max-w-xs flex flex-col gap-4">
          {/* Pages */}
          <div className="e e5">
            <p
              className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-2 flex items-center gap-2"
              style={{ color: "#3a8ff5" }}
            >
              <span
                className="w-4 h-px"
                style={{ background: "#3a8ff5", display: "inline-block" }}
              />
              Halaman Utama
            </p>
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => {
                const Icon = l.icon;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="nav-item flex items-center justify-between px-3 py-2 rounded-xl group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(26,82,200,.25)" }}
                      >
                        <Icon
                          size={12}
                          strokeWidth={2}
                          style={{ color: "#3a8ff5" }}
                        />
                      </div>
                      <span className="text-[13px] font-medium text-white/75 group-hover:text-white transition-colors">
                        {l.label}
                      </span>
                    </div>
                    <ChevronRight
                      size={12}
                      strokeWidth={2}
                      className="text-white/20 group-hover:text-yellow-400 transition-colors"
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Programs */}
          <div className="e e6">
            <p
              className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-2 flex items-center gap-2"
              style={{ color: "#ffc107" }}
            >
              <span
                className="w-4 h-px"
                style={{ background: "#ffc107", display: "inline-block" }}
              />
              Program Populer
            </p>
            <div className="flex flex-col gap-1">
              {PROGRAM_LINKS.map((p) => {
                const Icon = p.icon;
                return (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="prog-item flex items-center justify-between px-3 py-2 rounded-xl group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(255,193,7,.11)" }}
                      >
                        <Icon
                          size={12}
                          strokeWidth={2}
                          style={{ color: "#ffc107" }}
                        />
                      </div>
                      <span className="text-[13px] font-medium text-white/75 group-hover:text-white transition-colors">
                        {p.label}
                      </span>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: "rgba(255,193,7,.11)",
                        color: "#ffc107",
                        border: "1px solid rgba(255,193,7,.2)",
                      }}
                    >
                      {p.tag}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        className="e e1 relative z-10 px-5 lg:px-10 py-3 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(255,255,255,.05)" }}
      >
        <p className="text-[11px]" style={{ color: "rgba(122,144,184,.55)" }}>
          © {new Date().getFullYear()} Inggris Go! — Kampung Inggris Pare
        </p>
        <Link
          href="/programs"
          className="inline-flex items-center gap-1 text-[11px] font-semibold transition-colors hover:text-white"
          style={{ color: "rgba(58,143,245,.65)" }}
        >
          Semua Program <ArrowRight size={10} strokeWidth={2.5} />
        </Link>
      </footer>
    </div>
  );
}
