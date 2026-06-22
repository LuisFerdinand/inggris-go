// app/login/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Award,
  Bookmark,
  Eye,
  EyeOff,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  Loader2,
  LogOut,
  Mail,
  UserRound,
} from "lucide-react";

import { logout } from "@/lib/auth/actions";
import { getDashboardHome } from "@/lib/auth/permissions";
import type { Role } from "@/app/db/schema/roles";

type AuthTab = "login" | "signup";

type AuthedPanelUser = {
  name?: string | null;
  email?: string | null;
  role?: Role | null;
};

const DEFAULT_CALLBACK = "/dashboard/program-saya";

const BENEFITS = [
  {
    icon: GraduationCap,
    title: "Ruang belajar (LMS)",
    desc: "Akses materi & kelas dari setiap program yang kamu ikuti.",
  },
  {
    icon: Award,
    title: "Sertifikat kelulusan",
    desc: "Dapatkan dan unduh sertifikat setelah menyelesaikan program.",
  },
  {
    icon: LineChart,
    title: "Lacak progres program",
    desc: "Pantau perkembangan dan jadwal batch dalam satu dashboard.",
  },
  {
    icon: Bookmark,
    title: "Simpan artikel",
    desc: "Bookmark materi dan artikel blog untuk kamu baca nanti.",
  },
] as const;

function getInitials(name?: string | null) {
  if (!name) return "U";
  return (
    name
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "U"
  );
}

/* ─── Left-panel scene background (from not-found.tsx) ───────── */
function SceneBackground({
  mouseX,
  mouseY,
}: {
  mouseX: number;
  mouseY: number;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #060f2e 0%, #091f6a 45%, #0d2d87 75%, #060f2e 100%)",
        }}
      />

      {/* Noise */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.025]">
        <filter id="login-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#login-noise)" />
      </svg>

      {/* Dot grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]">
        <defs>
          <pattern
            id="login-dots"
            x="0"
            y="0"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1.5" cy="1.5" r="1.2" fill="#3a8ff5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#login-dots)" />
      </svg>

      {/* Glow orbs */}
      <div
        className="absolute rounded-full blur-[120px] opacity-[0.22]"
        style={{
          width: 560,
          height: 560,
          top: "-18%",
          right: "-12%",
          background: "radial-gradient(circle, #1e6eee 0%, transparent 70%)",
          transform: `translate(${mouseX * 0.3}px,${mouseY * 0.22}px)`,
          transition: "transform 1s cubic-bezier(0.22,1,0.36,1)",
        }}
      />
      <div
        className="absolute rounded-full blur-[110px] opacity-[0.14]"
        style={{
          width: 420,
          height: 420,
          bottom: "-6%",
          left: "-8%",
          background: "radial-gradient(circle, #f7b500 0%, transparent 70%)",
          transform: `translate(${mouseX * -0.18}px,${mouseY * -0.18}px)`,
          transition: "transform 1.2s cubic-bezier(0.22,1,0.36,1)",
        }}
      />

      {/* Floating particles */}
      {[
        { x: "10%", y: "16%", s: 5, c: "#ffc107", d: "0s" },
        { x: "88%", y: "12%", s: 4, c: "#3a8ff5", d: "1.2s" },
        { x: "80%", y: "60%", s: 5, c: "#ffc107", d: "0.6s" },
        { x: "14%", y: "72%", s: 4, c: "#3a8ff5", d: "1.8s" },
        { x: "60%", y: "8%", s: 3, c: "#1e6eee", d: "0.3s" },
        { x: "30%", y: "40%", s: 3, c: "#3a8ff5", d: "2s" },
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
            animation: `login-orb-float 5s ease-in-out ${o.d} infinite alternate`,
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

/* ─── Light-themed inputs (right panel) ──────────────────────── */
function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon: React.ElementType;
  autoComplete?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-[#0d2d87]">{label}</span>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          required
          type={type}
          value={value}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#f5a800] focus:ring-4 focus:ring-[#ffc107]/15"
        />
      </div>
    </label>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  showPassword,
  onToggle,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggle: () => void;
  autoComplete?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-[#0d2d87]">{label}</span>
      <div className="relative">
        <input
          required
          type={showPassword ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          placeholder="Minimal 6 karakter"
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#f5a800] focus:ring-4 focus:ring-[#ffc107]/15"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#0d2d87]"
          aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </label>
  );
}

/* ─── Forms ──────────────────────────────────────────────────── */
function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError("Email atau password salah.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Field
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
        icon={Mail}
        autoComplete="email"
      />

      <PasswordField
        label="Password"
        value={password}
        onChange={setPassword}
        showPassword={showPassword}
        onToggle={() => setShowPassword((value) => !value)}
        autoComplete="current-password"
      />

      <button
        type="submit"
        disabled={loading}
        className="login-btn-gold inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-[#060f2e] disabled:opacity-70"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Login
      </button>
    </form>
  );
}

function RegisterForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setLoading(false);
      setError(data?.error ?? "Gagal membuat akun.");
      return;
    }

    const loginResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (loginResult?.error) {
      setLoading(false);
      setError(
        "Akun berhasil dibuat, tapi auto-login gagal. Silakan login manual.",
      );
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Field
        label="Nama"
        type="text"
        value={name}
        onChange={setName}
        placeholder="Nama kamu"
        icon={UserRound}
        autoComplete="name"
      />

      <Field
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
        icon={Mail}
        autoComplete="email"
      />

      <PasswordField
        label="Password"
        value={password}
        onChange={setPassword}
        showPassword={showPassword}
        onToggle={() => setShowPassword((value) => !value)}
        autoComplete="new-password"
      />

      <PasswordField
        label="Konfirmasi Password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        showPassword={showPassword}
        onToggle={() => setShowPassword((value) => !value)}
        autoComplete="new-password"
      />

      <button
        type="submit"
        disabled={loading}
        className="login-btn-gold inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-[#060f2e] disabled:opacity-70"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Buat Akun
      </button>
    </form>
  );
}

function GoogleAuthButton({
  label,
  callbackUrl,
}: {
  label: string;
  callbackUrl: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleGoogleAuth() {
    setLoading(true);
    await signIn("google", { callbackUrl });
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleGoogleAuth}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-70"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-[#0d2d87]" />
      ) : (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1a52c8] text-sm font-black text-white">
          G
        </span>
      )}
      {label}
    </button>
  );
}

/* ─── Already signed in (light) ──────────────────────────────── */
function AuthedPanel({
  user,
  continueHref,
}: {
  user: AuthedPanelUser;
  continueHref: string;
}) {
  return (
    <div className="text-center">
      <div
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-black text-white"
        style={{
          background: "linear-gradient(135deg, #1a52c8 0%, #1e6eee 100%)",
          boxShadow: "0 0 28px rgba(30,110,238,0.28)",
        }}
      >
        {getInitials(user.name)}
      </div>

      <p className="text-sm text-slate-500">Kamu sudah login sebagai</p>
      <p className="mt-1 text-base font-bold text-[#0d2d87]">
        {user.name ?? "User"}
      </p>
      {user.email && <p className="text-xs text-slate-500">{user.email}</p>}
      <p className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0d2d87]">
        {user.role ?? "user"}
      </p>

      <div className="mt-6 space-y-3">
        <Link
          href={continueHref}
          className="login-btn-gold inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-[#060f2e]"
        >
          <LayoutDashboard className="h-4 w-4" />
          Lanjut ke Dashboard
        </Link>

        <form action={logout}>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Page body ──────────────────────────────────────────────── */
function LoginInner() {
  const params = useSearchParams();
  const { data: session, status } = useSession();

  const ref = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [tab, setTab] = useState<AuthTab>(
    params.get("tab") === "signup" ? "signup" : "login",
  );

  const callbackUrl = params.get("callbackUrl") || DEFAULT_CALLBACK;
  const authed = status === "authenticated" && !!session?.user;

  const continueHref =
    params.get("callbackUrl") ||
    getDashboardHome((session?.user?.role as Role) ?? "user");

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      setMouse({
        x: ((e.clientX - r.left) / r.width - 0.5) * 36,
        y: ((e.clientY - r.top) / r.height - 0.5) * 26,
      });
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  return (
    <div ref={ref} className="relative min-h-screen w-full lg:grid lg:grid-cols-2">
      <style>{`
        @keyframes login-orb-float { from { transform:translateY(0) } to { transform:translateY(-14px) } }
        @keyframes login-fade-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes login-shimmer { 0%{background-position:-300% center} 100%{background-position:300% center} }

        .login-fade { animation: login-fade-up .55s cubic-bezier(.22,1,.36,1) both; }

        .login-text-shimmer {
          background:linear-gradient(90deg,#d4a500 0%,#ffd54f 30%,#fff 50%,#ffc107 70%,#f5a800 100%);
          background-size:300% auto;
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
          animation:login-shimmer 4s linear infinite;
        }

        .login-btn-gold {
          background:linear-gradient(135deg,#f5a800 0%,#ffc107 100%);
          box-shadow:0 4px 20px rgba(180,100,0,.28),inset 0 1px 0 rgba(255,230,100,.32);
          transition:all .22s cubic-bezier(.22,1,.36,1);
        }
        .login-btn-gold:hover:not(:disabled) {
          box-shadow:0 8px 32px rgba(180,100,0,.42),inset 0 1px 0 rgba(255,230,100,.32);
          transform:translateY(-2px);
        }

        @media (prefers-reduced-motion: reduce) {
          .login-fade, .login-text-shimmer { animation: none !important; }
          .login-btn-gold:hover { transform: none !important; }
        }
      `}</style>

      {/* ── LEFT: branded value panel (desktop) ── */}
      <aside className="relative hidden overflow-hidden lg:flex lg:flex-col ">
        <SceneBackground mouseX={mouse.x} mouseY={mouse.y} />

        <div className="relative z-10 flex h-full justify-center flex-col p-10 xl:p-12">
          <Link
            href="/"
            className="mb-10 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[13px] font-semibold text-white/80 backdrop-blur-sm transition hover:border-[#ffc107]/35 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Beranda
          </Link>

          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Inggris Go!"
              width={44}
              height={44}
              priority
              className="drop-shadow-lg"
            />
            <span className="text-base font-bold tracking-tight text-white">
              Inggris <span style={{ color: "#ffc107" }}>Go!</span>
            </span>
          </div>

          <div className="mt-9 max-w-md">
            <h2 className="text-3xl font-black leading-[1.15] text-white xl:text-[2.1rem]">
              Satu akun untuk{" "}
              <span className="login-text-shimmer">semua progres belajarmu</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-blue-200/70">
              Login untuk masuk ke ruang belajarmu — kelola kelas, simpan
              materi, dan pantau perkembangan dari satu tempat.
            </p>
          </div>

          <ul className="mt-8 max-w-md space-y-4">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <li key={b.title} className="flex items-start gap-3.5">
                  <span
                    className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-[#ffc107]"
                    style={{
                      background: "rgba(255,193,7,0.10)",
                      border: "1px solid rgba(255,193,7,0.22)",
                    }}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-white">
                      {b.title}
                    </span>
                    <span className="block text-[13px] leading-snug text-blue-200/60">
                      {b.desc}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Hero student */}
          {/* <div className="relative mt-auto min-h-0 w-full flex-1 pt-6">
            <Image
              src="/images/home-hero.png"
              alt="Murid Inggris Go belajar dengan laptop"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 0px"
              className="object-contain object-bottom"
            />
          </div> */}
        </div>
      </aside>

      {/* ── RIGHT: form panel (always visible) ── */}
      <main className="relative flex min-h-screen flex-col bg-white">
        {/* Mobile brand header */}
        <div className="flex items-center justify-between px-6 pt-6 lg:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 transition hover:text-[#0d2d87]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Beranda
          </Link>
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Inggris Go!" width={32} height={32} />
            <span className="text-sm font-bold text-[#0d2d87]">
              Inggris <span style={{ color: "#f5a800" }}>Go!</span>
            </span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="login-fade w-full max-w-[400px]">
            {authed ? (
              <AuthedPanel
                user={session!.user as AuthedPanelUser}
                continueHref={continueHref}
              />
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-black text-[#0d2d87]">
                    {tab === "login" ? "Masuk ke akunmu" : "Buat akun baru"}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    {tab === "login"
                      ? "Selamat datang kembali — lanjutkan belajarmu."
                      : "Daftar gratis untuk mulai mengakses program."}
                  </p>
                </div>

                {/* Tabs */}
                <div className="mb-5 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setTab("login")}
                    className={[
                      "rounded-xl px-4 py-2 text-sm font-bold transition",
                      tab === "login"
                        ? "bg-white text-[#0d2d87] shadow-sm"
                        : "text-slate-500 hover:text-[#0d2d87]",
                    ].join(" ")}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("signup")}
                    className={[
                      "rounded-xl px-4 py-2 text-sm font-bold transition",
                      tab === "signup"
                        ? "bg-white text-[#0d2d87] shadow-sm"
                        : "text-slate-500 hover:text-[#0d2d87]",
                    ].join(" ")}
                  >
                    Register
                  </button>
                </div>

                <GoogleAuthButton
                  label={
                    tab === "login"
                      ? "Login dengan Google"
                      : "Register dengan Google"
                  }
                  callbackUrl={callbackUrl}
                />

                {/* Divider */}
                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    atau
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {tab === "login" ? (
                  <LoginForm callbackUrl={callbackUrl} />
                ) : (
                  <RegisterForm callbackUrl={callbackUrl} />
                )}

                <p className="mt-5 text-center text-xs text-slate-500">
                  {tab === "login" ? (
                    <>
                      Belum punya akun?{" "}
                      <button
                        type="button"
                        onClick={() => setTab("signup")}
                        className="font-bold text-[#f5a800] hover:underline"
                      >
                        Daftar di sini
                      </button>
                    </>
                  ) : (
                    <>
                      Sudah punya akun?{" "}
                      <button
                        type="button"
                        onClick={() => setTab("login")}
                        className="font-bold text-[#f5a800] hover:underline"
                      >
                        Login di sini
                      </button>
                    </>
                  )}
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── Route entry (Suspense for useSearchParams) ─────────────── */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-[#1a52c8]" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}