// app/(home)/contact/page.tsx
"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  RefObject,
} from "react";
import {
  Mail,
  MessageCircle,
  GraduationCap,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Users,
  Phone,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Star,
  Zap,
  Loader2,
  BookOpen,
  PartyPopper,
  Heart,
  MapPin,
  ExternalLink,
  Check,
  Circle,
} from "lucide-react";

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
   TYPES & CONSTANTS
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

const CATEGORIES = [
  { value: "general", label: "Pertanyaan Umum" },
  { value: "speaking", label: "Kelas Speaking" },
  { value: "camp", label: "English Camp" },
  { value: "partnership", label: "Kerjasama / Kolaborasi" },
];

const INITIAL_FORM: FormData = {
  name: "",
  email: "",
  subject: "",
  category: "",
  message: "",
  honeypot: "",
};

/* ─────────────────────────────────────────────────────────
   VALIDATION
───────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────
   FORM FIELD
───────────────────────────────────────────────────────── */
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
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
        {label}
        {required && (
          <span className="text-red-500 normal-case font-normal text-[10px]">
            *
          </span>
        )}
      </label>
      {children}
      {/* hint shown only when no error */}
      {hint && !error && (
        <p className="text-[11px] text-slate-400 leading-snug">{hint}</p>
      )}
      {/* animated error */}
      <div
        style={{
          maxHeight: error ? "40px" : "0",
          opacity: error ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.25s ease, opacity 0.2s ease",
        }}
      >
        {error && (
          <p className="text-[11px] text-red-500 flex items-center gap-1 pt-0.5">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
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
   CONTACT OPTION CARDS
───────────────────────────────────────────────────────── */
type ContactOption = {
  icon: ReactNode;
  label: string;
  whenToUse: string;
  detail: string;
  action?: { label: string; href: string; external?: boolean };
  color: string;
  bgColor: string;
  iconBg: string;
  badge?: string;
};

const CONTACT_OPTIONS: ContactOption[] = [
  {
    icon: <MessageCircle className="w-5 h-5" />,
    label: "WhatsApp",
    whenToUse: "Butuh jawaban cepat sekarang",
    detail: "Biasanya dibalas dalam hitungan menit",
    action: {
      label: "Chat Sekarang",
      href: "https://wa.me/6281234567890?text=Halo%20InggrisGo%2C%20saya%20ingin%20bertanya%20tentang...",
      external: true,
    },
    badge: "Tercepat",
    color: "text-green-700",
    bgColor: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-100",
    iconBg: "bg-green-500",
  },
  {
    icon: <Mail className="w-5 h-5" />,
    label: "Email / Formulir",
    whenToUse: "Pertanyaan detail atau lampiran",
    detail: "support@inggrisgo.com · balas dalam 24 jam",
    action: {
      label: "Isi Formulir",
      href: "#contact-form",
    },
    color: "text-blue-700",
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100",
    iconBg: "bg-blue-600",
  },
  {
    icon: <GraduationCap className="w-5 h-5" />,
    label: "Konsultasi Program",
    whenToUse: "Pilih kelas atau camp yang tepat",
    detail: "Gratis, tanpa syarat, tanpa tekanan",
    action: {
      label: "Lihat Program",
      href: "/courses",
    },
    color: "text-violet-700",
    bgColor: "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100",
    iconBg: "bg-violet-600",
  },
];

/* ─────────────────────────────────────────────────────────
   FAQ ACCORDION
───────────────────────────────────────────────────────── */
type FaqItem = { q: string; a: string };

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Berapa biaya program speaking InggrisGo?",
    a: "Biaya bervariasi tergantung program yang dipilih. Kelas speaking online mulai dari Rp 150.000/sesi, sementara English Camp memiliki paket tersendiri. Kami juga menyediakan sesi percobaan gratis agar kamu bisa merasakan dulu sebelum komitmen.",
  },
  {
    q: "Apakah ada kelas untuk pemula yang belum lancar sama sekali?",
    a: "Tentu! Kami punya jalur belajar dari level dasar (A1) hingga mahir (C1). Setiap pendaftar akan menjalani placement test singkat agar masuk ke kelas yang sesuai levelnya, bukan yang terlalu mudah atau terlalu sulit.",
  },
  {
    q: "Bagaimana sistem belajarnya — online atau offline?",
    a: "InggrisGo menyediakan keduanya. Kelas online via Zoom berlangsung setiap minggu dengan jadwal fleksibel. English Camp diadakan secara offline di beberapa kota besar. Kamu juga bisa gabungkan keduanya untuk hasil yang lebih optimal.",
  },
  {
    q: "Berapa lama sampai saya bisa melihat perkembangan nyata?",
    a: "Sebagian besar pelajar mulai terasa perbedaannya setelah 4–6 sesi. Tentu bergantung pada konsistensi belajar kamu. Kami juga menyediakan progress report bulanan supaya perkembanganmu bisa dipantau secara konkret.",
  },
  {
    q: "Apakah ada garansi uang kembali jika tidak puas?",
    a: "Kami percaya diri dengan kualitas program kami. Jika setelah sesi pertama kamu merasa tidak cocok, kami akan refund penuh tanpa pertanyaan. Kepuasan pelajar adalah prioritas utama kami.",
  },
];

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className={`rounded-xl border transition-all duration-200 overflow-hidden ${
              isOpen
                ? "border-blue-200 bg-blue-50/60 shadow-sm"
                : "border-slate-100 bg-slate-50 hover:border-blue-100 hover:bg-blue-50/30"
            }`}
          >
            <button
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 rounded-xl"
            >
              <span
                className={`text-sm font-semibold leading-snug transition-colors ${
                  isOpen ? "text-blue-700" : "text-slate-700"
                }`}
              >
                {item.q}
              </span>
              <span
                className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isOpen
                    ? "bg-blue-500 text-white rotate-180"
                    : "bg-white border border-slate-200 text-slate-400"
                }`}
              >
                <ChevronDown className="w-3 h-3" />
              </span>
            </button>

            {/* Animated answer panel */}
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
              <p className="px-4 pb-4 text-sm text-slate-600 leading-relaxed">
                {item.a}
              </p>
            </div>
          </div>
        );
      })}

      <div className="pt-3">
        <a
          href="/faq"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 group"
        >
          Lihat semua FAQ
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   SUCCESS SCREEN
───────────────────────────────────────────────────────── */
function SuccessScreen({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-6 animate-fadeIn">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
          <PartyPopper className="w-3.5 h-3.5 text-amber-900" />
        </div>
      </div>

      <h3 className="text-2xl font-extrabold text-slate-800 mb-2">
        Pesan Terkirim! 🎉
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-1">
        Tim kami akan membalas dalam{" "}
        <strong className="text-blue-600">24 jam</strong>. Cek inbox emailmu
        juga ya!
      </p>
      <p className="text-slate-400 text-xs mb-8">
        Butuh respons lebih cepat?{" "}
        <a
          href="https://wa.me/6281234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 font-semibold underline underline-offset-2"
        >
          Chat via WhatsApp
        </a>
      </p>

      <button
        onClick={onReset}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 active:scale-95 transition-all"
      >
        Kirim pesan lain
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   ONLINE INDICATOR (micro trust)
───────────────────────────────────────────────────────── */
function OnlineBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
      </span>
      Tim Online
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   TRUST SECTION DATA
───────────────────────────────────────────────────────── */
const TRUST_ITEMS = [
  {
    icon: <Clock className="w-5 h-5" />,
    title: "Respons rata-rata < 4 jam",
    desc: "Bukan 24 jam yang terasa lama — sebagian besar pesan kami balas pada hari yang sama, bahkan di akhir pekan.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    accent: "border-l-blue-500",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Manusia, bukan template otomatis",
    desc: "Kamu akan berbicara dengan tim pengajar dan staf asli yang memahami kebutuhan belajarmu secara personal.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    accent: "border-l-violet-500",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Datamu tidak kami jual",
    desc: "Email dan pesanmu hanya digunakan untuk membalasmu. Tidak ada iklan, tidak ada daftar mailing tersembunyi.",
    color: "text-teal-600",
    bg: "bg-teal-50",
    accent: "border-l-teal-500",
  },
];

/* ─────────────────────────────────────────────────────────
   CONTACT PAGE (MAIN)
───────────────────────────────────────────────────────── */
export default function ContactPage() {
  const heroRef = useRef<HTMLElement | null>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);

  // Slight delay to trigger CSS entrance on mount
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  /* Form state */
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const charCount = form.message.length;

  const set =
    (field: keyof FormData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const val = e.target.value;
      setForm((f) => ({ ...f, [field]: val }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.honeypot) return; // anti-spam

    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Focus first error field
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
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Gagal mengirim pesan");
      }
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    }
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setStatus("idle");
    setErrorMessage("");
  };

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <div className="min-h-screen pt-10" style={{ background: "#f4f8ff" }}>
      <section
        ref={heroRef}
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(155deg, #060f2e 0%, #0a2d87 40%, #1a52c8 75%, #2a6fd4 100%)",
          minHeight: "420px",
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        {/* Glow blobs */}
        <div
          className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(58,143,245,0.18) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-1/3 w-[280px] h-[280px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(247,181,0,0.14) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* LEFT */}
            <div>
              {/* Badge */}
              <div
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? "translateY(0)" : "translateY(16px)",
                  transition: "opacity .55s ease, transform .55s ease",
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white text-xs font-semibold mb-6"
              >
                <MessageCircle className="w-3.5 h-3.5 text-amber-300" />
                Hubungi InggrisGo
              </div>

              {/* Headline */}
              <h1
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? "translateY(0)" : "translateY(20px)",
                  transition: "opacity .65s .1s ease, transform .65s .1s ease",
                  fontSize: "clamp(1.75rem, 4.5vw, 3rem)",
                }}
                className="font-extrabold text-white leading-[1.1] tracking-tight mb-5"
              >
                Hubungi Kami —{" "}
                <span className="block" style={{ color: "#ffc107" }}>
                  Kami Siap Membantu
                </span>
              </h1>

              <p
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? "translateY(0)" : "translateY(20px)",
                  transition: "opacity .65s .2s ease, transform .65s .2s ease",
                }}
                className="text-blue-100/75 text-[15px] leading-relaxed mb-7 max-w-[420px]"
              >
                Punya pertanyaan tentang belajar English? Tim InggrisGo siap
                membantu kamu menemukan cara terbaik untuk berkembang.
              </p>

              {/* Trust signals */}
              <div
                style={{
                  opacity: heroVisible ? 1 : 0,
                  transform: heroVisible ? "translateY(0)" : "translateY(20px)",
                  transition: "opacity .65s .3s ease, transform .65s .3s ease",
                }}
                className="flex flex-wrap gap-3"
              >
                {[
                  {
                    icon: <Clock className="w-3.5 h-3.5" />,
                    text: "Balas dalam 24 jam",
                  },
                  {
                    icon: <Users className="w-3.5 h-3.5" />,
                    text: "Tim asli, bukan bot",
                  },
                  {
                    icon: <Shield className="w-3.5 h-3.5" />,
                    text: "Data kamu aman",
                  },
                ].map((t) => (
                  <div
                    key={t.text}
                    className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3.5 py-2 text-white/80 text-xs font-medium"
                  >
                    <span className="text-amber-300">{t.icon}</span>
                    {t.text}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Visual card cluster */}
            <div
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible
                  ? "translateY(0) scale(1)"
                  : "translateY(16px) scale(0.97)",
                transition: "opacity .8s .15s ease, transform .8s .15s ease",
              }}
              className="relative hidden lg:block"
            >
              {/* Hero image */}
              <div className="absolute -bottom-8 right-0 z-0 pointer-events-none select-none">
                <img
                  src="/images/categories/online-hero.png"
                  alt="InggrisGo team"
                  className="w-[200px] object-contain"
                  style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.4))" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              {/* Floating info cards */}
              <div className="relative z-10 flex flex-col items-center gap-4 pr-4">
                {/* Response time card */}
                <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 text-white flex items-center gap-3 shadow-xl w-[280px]">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-amber-900" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Waktu Respons</p>
                    <p className="text-white/60 text-xs">
                      Rata-rata &lt; 4 jam kerja
                    </p>
                  </div>
                </div>

                {/* Happy students card */}
                <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 text-white flex items-center gap-3 shadow-xl w-[260px]">
                  <div className="w-10 h-10 rounded-xl bg-green-400 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-green-900" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">1.200+ Pelajar</p>
                    <p className="text-white/60 text-xs">
                      Sudah dipercaya ribuan orang
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 text-white flex items-center gap-3 shadow-xl w-[240px]">
                  <div className="w-10 h-10 rounded-xl bg-violet-400 flex items-center justify-center flex-shrink-0">
                    <Star
                      className="w-5 h-5 text-violet-900"
                      fill="currentColor"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Rating 4.9/5</p>
                    <p className="text-white/60 text-xs">
                      Dari ulasan pelajar aktif
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
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

      {/* ════════════════════════════════════════
          CONTACT OPTIONS
      ════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Reveal className="text-center mb-8">
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">
            Pilih Cara Kontak
          </p>
          <h2 className="font-extrabold text-slate-800 text-2xl">
            Bagaimana Kamu Bisa Menghubungi Kami
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Pilih yang paling nyaman dan sesuai kebutuhanmu
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CONTACT_OPTIONS.map((opt, i) => (
            <Reveal key={opt.label} delay={i * 90}>
              <div
                className={`group relative rounded-2xl border p-6 ${opt.bgColor} hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col`}
              >
                {/* Badge */}
                {opt.badge && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">
                    {opt.badge}
                  </span>
                )}

                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl ${opt.iconBg} flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                >
                  {opt.icon}
                </div>

                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Gunakan ini jika…
                </p>
                <h3 className="font-bold text-slate-800 text-base mb-1">
                  {opt.label}
                </h3>
                <p className={`text-sm font-semibold ${opt.color} mb-1`}>
                  {opt.whenToUse}
                </p>
                <p className="text-xs text-slate-500 mb-5 flex-1">
                  {opt.detail}
                </p>

                {opt.action && (
                  <a
                    href={opt.action.href}
                    target={opt.action.external ? "_blank" : undefined}
                    rel={
                      opt.action.external ? "noopener noreferrer" : undefined
                    }
                    className={`inline-flex items-center gap-1.5 text-xs font-bold ${opt.color} group-hover:gap-2.5 transition-all`}
                  >
                    {opt.action.label}
                    {opt.action.external ? (
                      <ExternalLink className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          FORM + SIDEBAR
      ════════════════════════════════════════ */}
      <section
        ref={formRef}
        id="contact-form"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 scroll-mt-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ── CONTACT FORM (3/5) ───────────────────── */}
          <div className="lg:col-span-3">
            <Reveal from="left">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Form header */}
                <div
                  className="px-8 py-6 relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, #0a2d87 0%, #1a52c8 100%)",
                  }}
                >
                  <div
                    aria-hidden
                    className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5"
                  />
                  <div
                    aria-hidden
                    className="absolute -bottom-6 left-8 w-20 h-20 rounded-full bg-white/5"
                  />
                  <div className="relative">
                    <p className="text-[10px] font-bold text-blue-200/55 uppercase tracking-widest mb-1">
                      Formulir Kontak
                    </p>
                    <h2 className="font-extrabold text-white text-xl">
                      Ceritakan Kebutuhanmu
                    </h2>
                    <p className="text-blue-100/55 text-xs mt-1">
                      Semakin detail pesanmu, semakin tepat jawaban kami.
                    </p>
                  </div>
                </div>

                {/* Form body */}
                <div className="px-6 sm:px-8 py-8">
                  {status === "success" ? (
                    <SuccessScreen onReset={resetForm} />
                  ) : (
                    <form
                      onSubmit={handleSubmit}
                      noValidate
                      className="space-y-5"
                    >
                      {/* Honeypot */}
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

                      {/* Row: Name + Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Field label="Nama" required error={errors.name}>
                          <input
                            id="field-name"
                            type="text"
                            placeholder="Nama lengkap kamu"
                            value={form.name}
                            onChange={set("name")}
                            className={inputCls(errors.name)}
                            autoComplete="name"
                            autoFocus
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

                      {/* Row: Category + Subject */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Field label="Topik" error={errors.category}>
                          <select
                            id="field-category"
                            value={form.category}
                            onChange={set("category")}
                            className={`${inputCls()} text-slate-700 cursor-pointer`}
                          >
                            <option value="">Pilih topik…</option>
                            {CATEGORIES.map((c) => (
                              <option key={c.value} value={c.value}>
                                {c.label}
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

                      {/* Message */}
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

                      {/* Error banner */}
                      <div
                        style={{
                          maxHeight: status === "error" ? "80px" : "0",
                          opacity: status === "error" ? 1 : 0,
                          overflow: "hidden",
                          transition: "max-height 0.3s ease, opacity 0.2s ease",
                        }}
                      >
                        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-red-700">
                              Gagal mengirim pesan
                            </p>
                            <p className="text-xs text-red-500 mt-0.5">
                              {errorMessage}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
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
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Mengirim…
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Kirim Pesan
                          </>
                        )}
                      </button>

                      <p className="text-center text-[11px] text-slate-400 leading-snug">
                        Dengan mengirim, kamu setuju bahwa kami membalas melalui
                        email yang kamu berikan. Tidak ada spam, janji.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </Reveal>
          </div>

          {/* ── SIDEBAR (2/5) ────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Contact info card */}
            <Reveal delay={80} from="right">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Info Kontak
                  </p>
                  <OnlineBadge />
                </div>

                <div className="space-y-3.5">
                  {[
                    {
                      icon: <Mail className="w-4 h-4" />,
                      label: "Email",
                      value: "support@inggrisgo.com",
                      href: "mailto:support@inggrisgo.com",
                      sub: "Balas dalam 24 jam",
                    },
                    {
                      icon: <Phone className="w-4 h-4" />,
                      label: "WhatsApp",
                      value: "+62 812-3456-7890",
                      href: "https://wa.me/6281234567890",
                      sub: "Biasanya lebih cepat",
                    },
                    {
                      icon: <MapPin className="w-4 h-4" />,
                      label: "Lokasi",
                      value: "Online & Offline (Indonesia)",
                      href: undefined,
                      sub: undefined,
                    },
                    {
                      icon: <Clock className="w-4 h-4" />,
                      label: "Jam Operasional",
                      value: "Senin–Sabtu, 08.00–20.00 WIB",
                      href: undefined,
                      sub: undefined,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5 group-hover:bg-blue-100 transition-colors">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-sm text-slate-700 font-semibold hover:text-blue-600 transition-colors truncate block"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-sm text-slate-700 font-semibold">
                            {item.value}
                          </p>
                        )}
                        {item.sub && (
                          <p className="text-[10px] text-slate-400">
                            {item.sub}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* FAQ Accordion */}
            <Reveal delay={150} from="right">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Pertanyaan yang Sering Ditanya
                </p>
                <FaqAccordion />
              </div>
            </Reveal>

            {/* Mini CTA card */}
            <Reveal delay={220} from="right">
              <div
                className="rounded-2xl p-5 text-white relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(145deg, #0a2d87 0%, #2563eb 100%)",
                }}
              >
                <div
                  aria-hidden
                  className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/5"
                />
                <div
                  aria-hidden
                  className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/5"
                />
                <BookOpen className="w-7 h-7 mb-3 opacity-60 relative" />
                <p className="font-bold text-sm mb-1 relative">
                  Mau langsung mulai belajar?
                </p>
                <p className="text-white/60 text-xs mb-4 leading-relaxed relative">
                  Lihat program speaking dan English camp yang sudah diikuti
                  lebih dari 1.200 pelajar.
                </p>
                <a
                  href="/courses"
                  className="relative inline-flex items-center gap-1.5 text-xs font-bold bg-amber-400 text-amber-900 px-4 py-2 rounded-full hover:bg-amber-300 active:scale-95 transition-all"
                >
                  Lihat Semua Program <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TRUST SECTION
      ════════════════════════════════════════ */}
      <section
        className="py-16 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #f4f8ff 0%, #e8f0fe 60%, #f4f8ff 100%)",
        }}
      >
        <div
          aria-hidden
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200/60 to-transparent"
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold mb-4">
              <Shield className="w-3.5 h-3.5" /> Kenapa kamu bisa percaya kami?
            </div>
            <h2 className="font-extrabold text-slate-800 text-2xl">
              Kami Tidak Sekadar Menjawab — Kami Peduli
            </h2>
            <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
              Setiap pesan yang masuk dibaca oleh manusia asli yang ingin
              membantumu berkembang.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TRUST_ITEMS.map((item, i) => (
              <Reveal key={item.title} delay={i * 110}>
                <div
                  className={`bg-white rounded-2xl border border-slate-100 border-l-4 ${item.accent} shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-4`}
                  >
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FINAL CTA
      ════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-20"
        style={{
          background:
            "linear-gradient(145deg, #060f2e 0%, #0a2d87 45%, #1a52c8 100%)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div
          aria-hidden
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,.14), transparent)",
          }}
        />
        <div
          aria-hidden
          className="absolute -bottom-10 right-40 w-60 h-60 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(251,191,36,.12), transparent)",
          }}
        />{" "}
        <div className="absolute right-8 bottom-0 h-full flex items-end pointer-events-none select-none opacity-20 lg:opacity-30">
          <img
            src="/images/categories/online-hero.png"
            alt=""
            className="h-72 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Reveal>
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/15 border border-amber-400/25 text-amber-300 text-xs font-bold mb-6">
              <Zap className="w-3.5 h-3.5" /> Siap mulai?
            </div>

            <h2
              className="font-extrabold text-white mb-4 leading-tight"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.6rem)" }}
            >
              Ribuan pelajar sudah mulai.{" "}
              <span style={{ color: "#fbbf24" }}>Kapan giliranmu?</span>
            </h2>

            <p className="text-blue-100/60 text-base leading-relaxed mb-10 max-w-md mx-auto">
              Jangan tunggu sampai "siap" — mulai saja dari satu langkah kecil.
              Program kami dirancang untuk semua level.
            </p>

            {/* CTA hierarchy: primary + secondary */}
            <div className="flex flex-wrap gap-4 justify-center mb-10">
              <a
                href="/courses"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm hover:-translate-y-0.5 hover:shadow-2xl active:scale-95 transition-all"
                style={{
                  background: "linear-gradient(135deg, #f5a800, #fbbf24)",
                  color: "#0a2d87",
                  boxShadow: "0 6px 24px rgba(180,100,0,.35)",
                }}
              >
                Lihat Program Speaking
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/courses/english-camp"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm text-white bg-white/10 border border-white/20 hover:bg-white/18 active:scale-95 transition-all"
              >
                English Camp
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            {/* Social proof row */}
            <div className="flex flex-wrap items-center justify-center gap-5">
              {[
                {
                  icon: <Users className="w-4 h-4" />,
                  label: "1.200+ pelajar",
                  color: "text-amber-300",
                },
                {
                  icon: <Star className="w-4 h-4" />,
                  label: "4.9 / 5 rating",
                  color: "text-amber-300",
                },
                {
                  icon: <Zap className="w-4 h-4" />,
                  label: "Mulai dari Rp 0",
                  color: "text-green-300",
                },
                {
                  icon: <BookOpen className="w-4 h-4" />,
                  label: "Online & offline",
                  color: "text-blue-300",
                },
              ].map((item, i, arr) => (
                <React.Fragment key={item.label}>
                  <div className="flex items-center gap-2 text-xs text-blue-100/50">
                    <span className={item.color}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="hidden sm:block w-px h-4 bg-white/10" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
