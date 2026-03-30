"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth/client";
import { BRAND } from "@/constants/brand";

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", damping: 28, stiffness: 240 } as const;

export const USER_MENU_ITEMS = [
  {
    label: "Dashboard",
    shortLabel: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    desc: "Ringkasan aktivitas",
  },
  {
    label: "Program Saya",
    shortLabel: "Program",
    href: "/dashboard/programs",
    icon: BookOpen,
    desc: "Akses semua kelas",
  },
  {
    label: "Profil & Pengaturan",
    shortLabel: "Pengaturan",
    href: "/dashboard/settings",
    icon: Settings,
    desc: "Akun & preferensi",
  },
] as const;

type MenuItem = {
  label: string;
  shortLabel?: string;
  href: string | null;
  icon: React.ElementType;
  desc?: string;
  danger?: boolean;
};

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

type AuthTab = "login" | "signup";
type AuthStep = "idle" | "magic-sent" | "loading" | "error";

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function UserAvatar({
  user,
  size = 32,
  className = "",
}: {
  user: AuthUser;
  size?: number;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (user.image && !imgError) {
    return (
      <Image
        src={user.image}
        alt={user.name}
        width={size}
        height={size}
        className={`rounded-full object-cover ring-2 ring-white/20 ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ring-2 ring-white/20 ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.34,
        background: `linear-gradient(135deg, ${BRAND.orange} 0%, #E8521C 100%)`,
        boxShadow: `0 2px 8px rgba(255,107,53,0.4)`,
      }}
    >
      {getInitials(user.name)}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AuthModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<AuthTab>("login");
  const [step, setStep] = useState<AuthStep>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [magicEmail, setMagicEmail] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [authMethod, setAuthMethod] = useState<"email" | "magic">("email");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const setField =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const resetError = () => {
    setErrorMsg("");
    setStep("idle");
  };

  const handleGoogleLogin = useCallback(async () => {
    setStep("loading");
    setErrorMsg("");
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch {
      setStep("error");
      setErrorMsg("Login Google gagal. Coba lagi.");
    }
  }, []);

  const handleMagicLink = useCallback(async () => {
    if (!magicEmail.trim()) return;
    setStep("loading");
    setErrorMsg("");
  }, [magicEmail]);

  const handleEmailSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setStep("loading");
      setErrorMsg("");
      try {
        if (tab === "login") {
          await authClient.signIn.email({
            email: form.email,
            password: form.password,
          });
        } else {
          await authClient.signUp.email({
            name: form.name,
            email: form.email,
            password: form.password,
          });
        }
        onClose();
      } catch (err: unknown) {
        setStep("error");
        const msg =
          err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.";
        setErrorMsg(msg);
      }
    },
    [tab, form, onClose],
  );

  const isLoading = step === "loading";

  return (
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(15,35,64,0.55)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Login atau Daftar"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={SPRING}
        className="relative w-full max-w-[420px] rounded-3xl overflow-hidden"
        style={{
          background: "white",
          boxShadow:
            "0 32px 80px rgba(15,35,64,0.22), 0 8px 24px rgba(15,35,64,0.1)",
        }}
      >
        {/* ── Decorative header band ── */}
        <div
          className="relative px-7 pt-8 pb-6 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${BRAND.navy} 0%, #1a3a5c 100%)`,
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div
            className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20"
            style={{
              background: `radial-gradient(circle, ${BRAND.orange}, transparent 70%)`,
            }}
          />
          <div
            className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-15"
            style={{
              background: `radial-gradient(circle, ${BRAND.orange}, transparent 70%)`,
            }}
          />

          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <div
                className="px-2.5 py-1 rounded-full flex items-center gap-1.5"
                style={{
                  background: "rgba(255,107,53,0.18)",
                  border: "1px solid rgba(255,107,53,0.3)",
                }}
              >
                <Sparkles className="w-3 h-3" style={{ color: BRAND.orange }} />
                <span
                  className="font-display font-bold"
                  style={{
                    fontSize: "0.5625rem",
                    color: BRAND.orange,
                    letterSpacing: "0.08em",
                  }}
                >
                  INGGRIS GO
                </span>
              </div>
              {/* Close button — no orange glow, just subtle white/10 */}
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.1)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.18)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.1)";
                }}
                aria-label="Tutup"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            <h2
              className="font-display font-bold text-white mb-1.5 whitespace-pre-line"
              style={{ fontSize: "1.375rem", lineHeight: "1.25" }}
            >
              {tab === "login"
                ? "Selamat datang\nkembali! 👋"
                : "Mulai perjalanan\nbahasa Inggrismu 🚀"}
            </h2>
            <p
              style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.55)" }}
            >
              {tab === "login"
                ? "Masuk untuk lanjutkan belajar."
                : "Daftar gratis, akses program terbaik."}
            </p>
          </div>

          {/* Tab switcher */}
          <div
            className="relative mt-5 flex rounded-xl p-1"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            {(["login", "signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  resetError();
                }}
                className="relative flex-1 py-2 rounded-lg font-display font-semibold transition-colors duration-150 cursor-pointer"
                style={{
                  fontSize: "0.8125rem",
                  color: tab === t ? BRAND.navy : "rgba(255,255,255,0.6)",
                  zIndex: 1,
                }}
              >
                {tab === t && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: "white" }}
                    transition={{ duration: 0.22, ease: EASE }}
                  />
                )}
                <span className="relative">
                  {t === "login" ? "Masuk" : "Daftar"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-7 py-6">
          <AnimatePresence mode="wait">
            {step === "magic-sent" ? (
              <motion.div
                key="magic-sent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="text-center py-4"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(255,107,53,0.1)" }}
                >
                  <Mail className="w-6 h-6" style={{ color: BRAND.orange }} />
                </div>
                <p
                  className="font-display font-bold mb-1.5"
                  style={{ fontSize: "1rem", color: BRAND.navy }}
                >
                  Cek emailmu!
                </p>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "#64748B",
                    lineHeight: "1.5",
                  }}
                >
                  Kami kirim magic link ke{" "}
                  <span className="font-semibold" style={{ color: BRAND.navy }}>
                    {magicEmail}
                  </span>
                  . Klik link tersebut untuk masuk.
                </p>
                <button
                  onClick={() => {
                    setStep("idle");
                    setMagicEmail("");
                  }}
                  className="mt-5 text-sm font-display font-semibold transition-colors"
                  style={{ color: BRAND.orange }}
                >
                  Ganti email?
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: tab === "login" ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: EASE }}
                className="space-y-4"
              >
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 rounded-xl py-3 font-display font-semibold transition-all duration-150 disabled:opacity-60 hover:-translate-y-px active:translate-y-0"
                  style={{
                    fontSize: "0.875rem",
                    color: BRAND.navy,
                    border: "1.5px solid rgba(15,35,64,0.12)",
                    background: "white",
                    boxShadow: "0 1px 4px rgba(15,35,64,0.06)",
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  Lanjutkan dengan Google
                </button>

                <div className="flex items-center gap-3">
                  <div
                    className="flex-1 h-px"
                    style={{ background: "rgba(15,35,64,0.08)" }}
                  />
                  <span style={{ fontSize: "0.6875rem", color: "#94A3B8" }}>
                    atau
                  </span>
                  <div
                    className="flex-1 h-px"
                    style={{ background: "rgba(15,35,64,0.08)" }}
                  />
                </div>

                <div
                  className="flex rounded-xl p-0.5"
                  style={{
                    background: "#F1F5F9",
                    border: "1px solid rgba(15,35,64,0.06)",
                  }}
                >
                  {(["email", "magic"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setAuthMethod(m);
                        resetError();
                      }}
                      className="relative flex-1 py-1.5 rounded-[10px] font-display font-semibold transition-all duration-150 cursor-pointer text-center"
                      style={{
                        fontSize: "0.75rem",
                        color: authMethod === m ? BRAND.navy : "#94A3B8",
                        background: authMethod === m ? "white" : "transparent",
                        boxShadow:
                          authMethod === m
                            ? "0 1px 4px rgba(15,35,64,0.08)"
                            : "none",
                      }}
                    >
                      {m === "email" ? "Email & Password" : "Magic Link"}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {authMethod === "email" ? (
                    <motion.form
                      key="email-form"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15, ease: EASE }}
                      onSubmit={handleEmailSubmit}
                      className="space-y-3"
                      noValidate
                    >
                      {tab === "signup" && (
                        <div>
                          <label
                            htmlFor="auth-name"
                            className="block font-display font-semibold mb-1.5"
                            style={{ fontSize: "0.75rem", color: "#475569" }}
                          >
                            Nama Lengkap
                          </label>
                          <input
                            id="auth-name"
                            type="text"
                            value={form.name}
                            onChange={setField("name")}
                            required
                            autoComplete="name"
                            placeholder="Budi Santoso"
                            className="w-full px-3.5 py-2.5 rounded-xl outline-none transition-all duration-150"
                            style={{
                              fontSize: "0.875rem",
                              color: BRAND.navy,
                              border: "1.5px solid rgba(15,35,64,0.12)",
                              background: "#FAFAFA",
                            }}
                            onFocus={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.borderColor = BRAND.orange;
                              (
                                e.currentTarget as HTMLElement
                              ).style.background = "white";
                            }}
                            onBlur={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.borderColor = "rgba(15,35,64,0.12)";
                              (
                                e.currentTarget as HTMLElement
                              ).style.background = "#FAFAFA";
                            }}
                          />
                        </div>
                      )}
                      <div>
                        <label
                          htmlFor="auth-email"
                          className="block font-display font-semibold mb-1.5"
                          style={{ fontSize: "0.75rem", color: "#475569" }}
                        >
                          Email
                        </label>
                        <input
                          id="auth-email"
                          type="email"
                          value={form.email}
                          onChange={setField("email")}
                          required
                          autoComplete="email"
                          placeholder="kamu@email.com"
                          className="w-full px-3.5 py-2.5 rounded-xl outline-none transition-all duration-150"
                          style={{
                            fontSize: "0.875rem",
                            color: BRAND.navy,
                            border: "1.5px solid rgba(15,35,64,0.12)",
                            background: "#FAFAFA",
                          }}
                          onFocus={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor =
                              BRAND.orange;
                            (e.currentTarget as HTMLElement).style.background =
                              "white";
                          }}
                          onBlur={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor =
                              "rgba(15,35,64,0.12)";
                            (e.currentTarget as HTMLElement).style.background =
                              "#FAFAFA";
                          }}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="auth-password"
                          className="block font-display font-semibold mb-1.5"
                          style={{ fontSize: "0.75rem", color: "#475569" }}
                        >
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="auth-password"
                            type={showPass ? "text" : "password"}
                            value={form.password}
                            onChange={setField("password")}
                            required
                            autoComplete={
                              tab === "login"
                                ? "current-password"
                                : "new-password"
                            }
                            placeholder="Min. 8 karakter"
                            className="w-full px-3.5 py-2.5 pr-10 rounded-xl outline-none transition-all duration-150"
                            style={{
                              fontSize: "0.875rem",
                              color: BRAND.navy,
                              border: "1.5px solid rgba(15,35,64,0.12)",
                              background: "#FAFAFA",
                            }}
                            onFocus={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.borderColor = BRAND.orange;
                              (
                                e.currentTarget as HTMLElement
                              ).style.background = "white";
                            }}
                            onBlur={(e) => {
                              (
                                e.currentTarget as HTMLElement
                              ).style.borderColor = "rgba(15,35,64,0.12)";
                              (
                                e.currentTarget as HTMLElement
                              ).style.background = "#FAFAFA";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                            style={{ color: "#94A3B8" }}
                            tabIndex={-1}
                            aria-label={
                              showPass
                                ? "Sembunyikan password"
                                : "Tampilkan password"
                            }
                          >
                            {showPass ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {step === "error" && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-xs font-display font-semibold px-3 py-2 rounded-lg"
                            style={{
                              background: "rgba(239,68,68,0.07)",
                              color: "#DC2626",
                              border: "1px solid rgba(239,68,68,0.12)",
                            }}
                          >
                            {errorMsg}
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-display font-bold text-white transition-all duration-150 disabled:opacity-70 hover:-translate-y-px active:translate-y-0"
                        style={{
                          fontSize: "0.875rem",
                          background: `linear-gradient(135deg, ${BRAND.orange} 0%, #E8521C 100%)`,
                          boxShadow: "0 4px 16px rgba(255,107,53,0.4)",
                        }}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : tab === "login" ? (
                          "Masuk Sekarang"
                        ) : (
                          "Buat Akun Gratis"
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="magic-form"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15, ease: EASE }}
                      className="space-y-3"
                    >
                      <div>
                        <label
                          htmlFor="magic-email"
                          className="block font-display font-semibold mb-1.5"
                          style={{ fontSize: "0.75rem", color: "#475569" }}
                        >
                          Email kamu
                        </label>
                        <input
                          id="magic-email"
                          type="email"
                          value={magicEmail}
                          onChange={(e) => setMagicEmail(e.target.value)}
                          autoComplete="email"
                          placeholder="kamu@email.com"
                          className="w-full px-3.5 py-2.5 rounded-xl outline-none transition-all duration-150"
                          style={{
                            fontSize: "0.875rem",
                            color: BRAND.navy,
                            border: "1.5px solid rgba(15,35,64,0.12)",
                            background: "#FAFAFA",
                          }}
                          onFocus={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor =
                              BRAND.orange;
                            (e.currentTarget as HTMLElement).style.background =
                              "white";
                          }}
                          onBlur={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor =
                              "rgba(15,35,64,0.12)";
                            (e.currentTarget as HTMLElement).style.background =
                              "#FAFAFA";
                          }}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleMagicLink()
                          }
                        />
                      </div>
                      <p
                        style={{
                          fontSize: "0.6875rem",
                          color: "#94A3B8",
                          lineHeight: "1.5",
                        }}
                      >
                        Kami akan kirim link ajaib ke emailmu — tanpa perlu
                        ingat password.
                      </p>
                      <AnimatePresence>
                        {step === "error" && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-xs font-display font-semibold px-3 py-2 rounded-lg"
                            style={{
                              background: "rgba(239,68,68,0.07)",
                              color: "#DC2626",
                              border: "1px solid rgba(239,68,68,0.12)",
                            }}
                          >
                            {errorMsg}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <button
                        onClick={handleMagicLink}
                        disabled={isLoading || !magicEmail.trim()}
                        className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-display font-bold text-white transition-all duration-150 disabled:opacity-50 hover:-translate-y-px active:translate-y-0"
                        style={{
                          fontSize: "0.875rem",
                          background: `linear-gradient(135deg, ${BRAND.orange} 0%, #E8521C 100%)`,
                          boxShadow: "0 4px 16px rgba(255,107,53,0.4)",
                        }}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Mail className="w-4 h-4" />
                            Kirim Magic Link
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {step !== "magic-sent" && (
            <p
              className="text-center mt-5"
              style={{
                fontSize: "0.6875rem",
                color: "#94A3B8",
                lineHeight: "1.5",
              }}
            >
              Dengan melanjutkan, kamu setuju dengan{" "}
              <Link
                href="/terms"
                className="underline"
                style={{ color: "#64748B" }}
              >
                Syarat Layanan
              </Link>{" "}
              &{" "}
              <Link
                href="/privacy"
                className="underline"
                style={{ color: "#64748B" }}
              >
                Kebijakan Privasi
              </Link>{" "}
              kami.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function UserDropdown({
  user,
  onClose,
  onSignOut,
  isSigningOut,
}: {
  user: AuthUser;
  onClose: () => void;
  onSignOut: () => void;
  isSigningOut: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      transition={{ duration: 0.18, ease: EASE }}
      className="absolute top-[calc(100%+12px)] right-0 z-50"
      style={{ width: "268px" }}
      role="menu"
      aria-label="User menu"
    >
      {/* Arrow tip */}
      <div className="absolute -top-[7px] right-[18px] pointer-events-none z-10">
        <svg width="14" height="7" viewBox="0 0 14 7" fill="none">
          <path
            d="M0 7L7 0L14 7"
            fill="white"
            stroke="rgba(15,35,64,0.07)"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "white",
          border: "1px solid rgba(15,35,64,0.08)",
          boxShadow:
            "0 20px 60px rgba(15,35,64,0.16), 0 4px 16px rgba(15,35,64,0.06)",
        }}
      >
        {/* Identity header — navy gradient matching mobile */}
        <div
          className="relative px-4 py-4 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${BRAND.navy} 0%, #1a3a5c 100%)`,
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />
          <div
            className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-15"
            style={{
              background: `radial-gradient(circle, ${BRAND.orange}, transparent 70%)`,
            }}
          />
          <div className="relative flex items-center gap-3">
            <UserAvatar user={user} size={42} />
            <div className="flex-1 min-w-0">
              <p
                className="font-display font-bold text-white truncate"
                style={{ fontSize: "0.9375rem" }}
              >
                {user.name}
              </p>
              <p
                className="truncate"
                style={{
                  fontSize: "0.6875rem",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div className="p-2">
          {USER_MENU_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.03 * i, duration: 0.18, ease: EASE }}
                role="menuitem"
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 hover:bg-slate-50"
                  style={{
                    textDecoration: "none",
                    border: "1px solid rgba(15,35,64,0.05)",
                    marginBottom: i < USER_MENU_ITEMS.length - 1 ? "4px" : "0",
                    display: "flex",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-150 group-hover:scale-105"
                    style={{ background: "#F1F5F9" }}
                  >
                    <Icon
                      className="w-3.5 h-3.5 transition-colors duration-150"
                      style={{ color: "#64748B" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-display font-semibold transition-colors duration-150 group-hover:text-orange-600"
                      style={{ fontSize: "0.8125rem", color: BRAND.navy }}
                    >
                      {item.label}
                    </p>
                    <p style={{ fontSize: "0.625rem", color: "#94A3B8" }}>
                      {item.desc}
                    </p>
                  </div>
                  <ChevronRight
                    className="w-3 h-3 opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-150"
                    style={{ color: BRAND.orange }}
                  />
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Sign out — separated */}
        <div className="px-2 pb-2">
          <div
            style={{
              borderTop: `1px solid rgba(15,35,64,0.08)`,
              paddingTop: 6,
              marginTop: 2,
            }}
          >
            <button
              onClick={onSignOut}
              disabled={isSigningOut}
              className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ border: "1px solid rgba(239,68,68,0.06)" }}
              role="menuitem"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-150 group-hover:bg-red-100"
                style={{ background: "#F1F5F9" }}
              >
                {isSigningOut ? (
                  <Loader2
                    className="w-3.5 h-3.5 animate-spin"
                    style={{ color: "#94A3B8" }}
                  />
                ) : (
                  <LogOut
                    className="w-3.5 h-3.5 transition-colors duration-150 group-hover:text-red-500"
                    style={{ color: "#94A3B8" }}
                  />
                )}
              </div>
              <span
                className="font-display font-semibold transition-colors duration-150 group-hover:text-red-600"
                style={{ fontSize: "0.8125rem", color: "#64748B" }}
              >
                {isSigningOut ? "Keluar..." : "Keluar"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function UserNav({ onOpenAuthModal }: { onOpenAuthModal: () => void }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session, isPending } = authClient.useSession();

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      setDropdownOpen(false);
      router.push("/");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }, [router]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (isPending) {
    return (
      <div className="w-[72px] h-9 rounded-xl bg-slate-100 animate-pulse" />
    );
  }

  if (!session?.user) {
    return (
      <button
        onClick={onOpenAuthModal}
        className="inline-flex items-center gap-2 font-display font-semibold rounded-xl px-4 py-2 transition-all duration-150 hover:-translate-y-px active:translate-y-0 cursor-pointer"
        style={{
          fontSize: "0.8125rem",
          color: "white",
          background: `linear-gradient(135deg, ${BRAND.navy} 0%, #1a3a5c 100%)`,
          border: "1.5px solid rgba(255,255,255,0.08)",
          boxShadow: `0 2px 8px rgba(15,35,64,0.25)`,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            `0 4px 16px rgba(15,35,64,0.3), inset 0 0 0 1px rgba(255,107,53,0.25)`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            `0 2px 8px rgba(15,35,64,0.25)`;
        }}
      >
        Masuk
      </button>
    );
  }

  const user = session.user as AuthUser;

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger button — navy pill matching mobile header aesthetic */}
      <button
        onClick={() => setDropdownOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl pl-1.5 pr-3 py-1.5 transition-all duration-200 cursor-pointer"
        style={{
          background: dropdownOpen
            ? `linear-gradient(135deg, ${BRAND.navy} 0%, #1a3a5c 100%)`
            : `linear-gradient(135deg, ${BRAND.navy} 0%, #1a3a5c 100%)`,
          border: dropdownOpen
            ? `1.5px solid rgba(255,107,53,0.35)`
            : `1.5px solid rgba(255,255,255,0.07)`,
          boxShadow: dropdownOpen
            ? `0 4px 16px rgba(15,35,64,0.3), 0 0 0 3px rgba(255,107,53,0.08)`
            : `0 2px 8px rgba(15,35,64,0.2)`,
        }}
        onMouseEnter={(e) => {
          if (!dropdownOpen) {
            (e.currentTarget as HTMLElement).style.border =
              `1.5px solid rgba(255,107,53,0.2)`;
            (e.currentTarget as HTMLElement).style.boxShadow =
              `0 4px 14px rgba(15,35,64,0.28)`;
          }
        }}
        onMouseLeave={(e) => {
          if (!dropdownOpen) {
            (e.currentTarget as HTMLElement).style.border =
              `1.5px solid rgba(255,255,255,0.07)`;
            (e.currentTarget as HTMLElement).style.boxShadow =
              `0 2px 8px rgba(15,35,64,0.2)`;
          }
        }}
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
        aria-label="User menu"
      >
        <UserAvatar user={user} size={28} />
        <span
          className="font-display font-semibold hidden xl:block max-w-[90px] truncate text-white"
          style={{ fontSize: "0.8125rem" }}
        >
          {user.name.split(" ")[0]}
        </span>
        <motion.span
          animate={{ rotate: dropdownOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="inline-flex"
        >
          <ChevronDown
            className="w-3.5 h-3.5"
            style={{ color: "rgba(255,255,255,0.5)" }}
          />
        </motion.span>
      </button>

      <AnimatePresence>
        {dropdownOpen && (
          <UserDropdown
            user={user}
            onClose={() => setDropdownOpen(false)}
            onSignOut={handleSignOut}
            isSigningOut={isSigningOut}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const GRID_ITEMS: MenuItem[] = [
  ...USER_MENU_ITEMS.map((item) => ({ ...item, danger: false })),
  {
    label: "Keluar",
    shortLabel: "Keluar",
    href: null,
    icon: LogOut,
    desc: "Keluar dari akun",
    danger: true,
  },
];

export function MobileUserSection({
  onClose,
  onOpenAuthModal,
}: {
  onClose: () => void;
  onOpenAuthModal: () => void;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      onClose();
      router.push("/");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }, [onClose, router]);

  if (isPending) {
    return (
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1.5px solid rgba(15,35,64,0.08)" }}
      >
        <div
          className="flex items-center gap-3 px-3.5 py-3"
          style={{
            background: `linear-gradient(135deg, ${BRAND.navy} 0%, #1a3a5c 100%)`,
          }}
        >
          <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 bg-white/10 rounded-full animate-pulse w-24" />
            <div className="h-2 bg-white/10 rounded-full animate-pulse w-36" />
          </div>
          <div className="w-5 h-5 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-4 gap-1 px-2 py-2.5 bg-white">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 py-2 px-1"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 animate-pulse" />
              <div className="h-2 bg-slate-100 rounded-full animate-pulse w-10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <button
        onClick={() => {
          onClose();
          onOpenAuthModal();
        }}
        className="w-full flex items-center justify-center gap-2.5 font-display font-bold rounded-2xl py-3 transition-all duration-150 active:scale-[0.98] hover:-translate-y-px cursor-pointer"
        style={{
          fontSize: "0.875rem",
          color: "white",
          background: `linear-gradient(135deg, ${BRAND.orange} 0%, #E8521C 100%)`,
          boxShadow: "0 4px 16px rgba(255,107,53,0.35)",
        }}
      >
        Masuk / Daftar Akun
      </button>
    );
  }

  const user = session.user as AuthUser;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        border: expanded
          ? "1.5px solid rgba(255,107,53,0.22)"
          : "1.5px solid rgba(15,35,64,0.09)",
        boxShadow: expanded ? "0 4px 20px rgba(255,107,53,0.1)" : "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      {/* ── Navy branded header row ── */}
      <button
        onClick={() => setExpanded((o) => !o)}
        className="relative w-full flex items-center gap-2.5 px-3.5 py-3 overflow-hidden cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${BRAND.navy} 0%, #18355a 100%)`,
        }}
        aria-expanded={expanded}
        aria-label="Toggle user menu"
      >
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />
        <div
          className="absolute -top-5 -right-5 w-20 h-20 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,107,53,0.25), transparent 70%)",
          }}
        />

        <div className="relative flex-shrink-0">
          <UserAvatar user={user} size={32} />
          <div
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
            style={{ background: "#22C55E", borderColor: BRAND.navy }}
          />
        </div>

        <div className="flex-1 min-w-0 text-left relative">
          <p
            className="font-display font-bold truncate leading-tight text-white"
            style={{ fontSize: "0.8125rem" }}
          >
            {user.name}
          </p>
          <p
            className="truncate"
            style={{ fontSize: "0.625rem", color: "rgba(255,255,255,0.45)" }}
          >
            {user.email}
          </p>
        </div>

        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="relative flex items-center justify-center"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.span>
      </button>

      {/* ── Expandable grid ── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: EASE }}
            style={{ overflow: "hidden", background: "white" }}
          >
            {/* Orange separator */}
            <div
              style={{
                height: "2px",
                background: `linear-gradient(90deg, ${BRAND.orange} 0%, rgba(255,107,53,0) 100%)`,
                opacity: 0.25,
              }}
            />

            {/* Nav tiles (3-up) */}
            <div className="grid grid-cols-3 px-2 pt-2.5 pb-1 gap-1.5">
              {GRID_ITEMS.filter((item) => !item.danger).map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href!}
                    href={item.href!}
                    onClick={onClose}
                    className="group flex flex-col items-center gap-1.5 px-1 py-2.5 rounded-xl transition-all duration-150 active:scale-95"
                    style={{
                      textDecoration: "none",
                      border: "1px solid rgba(15,35,64,0.06)",
                      background: "rgba(248,250,252,0.8)",
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: 0.04 * i,
                        duration: 0.2,
                        ease: EASE,
                      }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150"
                      style={{
                        background: "rgba(255,107,53,0.07)",
                        border: "1px solid rgba(255,107,53,0.12)",
                      }}
                    >
                      <Icon
                        className="w-3.5 h-3.5"
                        style={{ color: BRAND.orange }}
                      />
                    </motion.div>
                    <motion.span
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.04 * i + 0.06,
                        duration: 0.18,
                        ease: EASE,
                      }}
                      className="font-display font-semibold text-center leading-tight whitespace-nowrap"
                      style={{ fontSize: "0.5625rem", color: "#475569" }}
                    >
                      {"shortLabel" in item ? item.shortLabel : item.label}
                    </motion.span>
                  </Link>
                );
              })}
            </div>

            {/* Sign out — separated row */}
            <div
              className="px-2 pb-2.5 pt-1.5"
              style={{
                borderTop: "1px solid rgba(15,35,64,0.06)",
                margin: "0 8px",
              }}
            >
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="group w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150 hover:bg-red-50 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                style={{ border: "1px solid rgba(239,68,68,0.08)" }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-150 group-hover:bg-red-100"
                  style={{ background: "rgba(239,68,68,0.06)" }}
                >
                  {isSigningOut ? (
                    <Loader2
                      className="w-3.5 h-3.5 animate-spin"
                      style={{ color: "#EF4444" }}
                    />
                  ) : (
                    <LogOut
                      className="w-3.5 h-3.5 transition-colors duration-150 group-hover:text-red-500"
                      style={{ color: "#EF4444" }}
                    />
                  )}
                </div>
                <span
                  className="font-display font-semibold transition-colors duration-150 group-hover:text-red-600"
                  style={{ fontSize: "0.8125rem", color: "#EF4444" }}
                >
                  {isSigningOut ? "Keluar..." : "Keluar dari akun"}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AuthModalPortal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && <AuthModal onClose={onClose} />}
    </AnimatePresence>
  );
}
