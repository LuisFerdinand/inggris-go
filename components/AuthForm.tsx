"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Lock,
  Mail,
  Loader2,
  User,
  KeyRound,
  Smartphone,
  ChevronLeft,
  CheckCircle2,
  RefreshCw,
  Shield,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { authClient } from "@/lib/auth/client";
import { AppToast } from "@/lib/toast";

/* ─── Types ─────────────────────────────────────────────── */
export type AuthTab = "login" | "signup";
export type AuthVariant = "modal" | "page";
export type AuthMethod = "password" | "otp";
export type OtpStep = "idle" | "sent" | "verified";

export interface AuthFormProps {
  variant: AuthVariant;
  defaultTab?: AuthTab;
  onSuccess?: () => void;
  onClose?: () => void;
  tab?: AuthTab;
  onTabChange?: (tab: AuthTab) => void;
}

type AuthStep = "idle" | "loading" | "error";

/* ─── Constants ─────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", damping: 26, stiffness: 220 } as const;
const OTP_COOLDOWN = 60; // seconds

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ─── InputField ─────────────────────────────────────────── */
function InputField({
  id,
  type,
  label,
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  autoComplete,
  disabled,
  onEnter,
}: {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ElementType;
  error?: string;
  autoComplete?: string;
  disabled?: boolean;
  onEnter?: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block font-display font-semibold"
        style={{
          fontSize: "0.6875rem",
          color: "var(--color-brand-text-muted)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      <div className="relative">
        <div
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
          style={{
            color: focused
              ? "var(--color-brand-blue)"
              : hasError
                ? "#EF4444"
                : "#94A3B8",
          }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-3 rounded-xl font-body transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed outline-none"
          style={{
            fontSize: "0.875rem",
            background: focused ? "#FFFFFF" : "#F8FAFC",
            border: `1.5px solid ${hasError ? "rgba(239,68,68,0.5)" : focused ? "var(--color-brand-blue)" : "rgba(15,35,64,0.1)"}`,
            color: "var(--color-brand-text)",
            boxShadow: focused
              ? `0 0 0 3px ${hasError ? "rgba(239,68,68,0.08)" : "rgba(26,82,200,0.08)"}`
              : "none",
          }}
        />
      </div>
      <AnimatePresence>
        {hasError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5"
            style={{ fontSize: "0.6875rem", color: "#EF4444" }}
          >
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── OTP Input ──────────────────────────────────────────── */
function OtpInput({
  value,
  onChange,
  disabled,
  error,
  onComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  error?: string;
  onComplete?: () => void;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").slice(0, 6).split("");

  const handleChange = (i: number, val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = cleaned;
    const newVal = next.join("").slice(0, 6);
    onChange(newVal);
    if (cleaned && i < 5) {
      inputs.current[i + 1]?.focus();
    }
    if (newVal.length === 6 && !newVal.includes(" ")) {
      onComplete?.();
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
      const next = [...digits];
      next[i - 1] = "";
      onChange(next.join(""));
    }
    if (e.key === "ArrowLeft" && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted) {
      onChange(pasted);
      const focusIdx = Math.min(pasted.length, 5);
      inputs.current[focusIdx]?.focus();
      if (pasted.length === 6) onComplete?.();
    }
    e.preventDefault();
  };

  const hasError = Boolean(error);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[i] || ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={disabled}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.04, duration: 0.2, ease: EASE }}
            className="w-11 h-14 text-center font-display font-bold rounded-xl outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontSize: "1.375rem",
              border: `2px solid ${hasError ? "rgba(239,68,68,0.5)" : digits[i] ? "var(--color-brand-blue)" : "rgba(15,35,64,0.12)"}`,
              background: digits[i] ? "rgba(26,82,200,0.04)" : "#F8FAFC",
              color: "var(--color-brand-text)",
              boxShadow: digits[i]
                ? `0 0 0 3px rgba(26,82,200,0.08)`
                : hasError
                  ? `0 0 0 3px rgba(239,68,68,0.06)`
                  : "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = `2px solid ${hasError ? "rgba(239,68,68,0.6)" : "var(--color-brand-blue)"}`;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${hasError ? "rgba(239,68,68,0.08)" : "rgba(26,82,200,0.1)"}`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = `2px solid ${hasError ? "rgba(239,68,68,0.5)" : digits[i] ? "var(--color-brand-blue)" : "rgba(15,35,64,0.12)"}`;
              e.currentTarget.style.boxShadow = digits[i]
                ? `0 0 0 3px rgba(26,82,200,0.08)`
                : "none";
            }}
          />
        ))}
      </div>
      <AnimatePresence>
        {hasError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center gap-1.5"
            style={{ fontSize: "0.6875rem", color: "#EF4444" }}
          >
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Method Selector ────────────────────────────────────── */
function MethodSelector({
  method,
  onChange,
  disabled,
}: {
  method: AuthMethod;
  onChange: (m: AuthMethod) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 mb-5">
      {(["password", "otp"] as AuthMethod[]).map((m) => {
        const active = method === m;
        const Icon = m === "password" ? Lock : Smartphone;
        const label = m === "password" ? "Kata Sandi" : "Kode OTP";
        const sub = m === "password" ? "Email & password" : "Tanpa password";
        return (
          <motion.button
            key={m}
            onClick={() => !disabled && onChange(m)}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className="relative flex flex-col items-center gap-1.5 py-3.5 px-3 rounded-xl transition-all duration-200 cursor-pointer text-center overflow-hidden"
            style={{
              border: active
                ? "1.5px solid var(--color-brand-blue)"
                : "1.5px solid rgba(15,35,64,0.1)",
              background: active ? "rgba(26,82,200,0.05)" : "#F8FAFC",
              boxShadow: active ? "0 0 0 3px rgba(26,82,200,0.08)" : "none",
              opacity: disabled ? 0.6 : 1,
            }}
          >
            {active && (
              <motion.div
                layoutId="method-bg"
                className="absolute inset-0 rounded-xl"
                style={{ background: "rgba(26,82,200,0.04)" }}
                transition={SPRING}
              />
            )}
            <div
              className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200"
              style={{
                background: active
                  ? "rgba(26,82,200,0.12)"
                  : "rgba(15,35,64,0.06)",
              }}
            >
              <Icon
                className="w-4 h-4 transition-colors duration-200"
                style={{
                  color: active ? "var(--color-brand-blue)" : "#94A3B8",
                }}
              />
            </div>
            <div className="relative">
              <p
                className="font-display font-bold leading-tight"
                style={{
                  fontSize: "0.75rem",
                  color: active
                    ? "var(--color-brand-blue)"
                    : "var(--color-brand-text)",
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontSize: "0.5625rem",
                  color: active ? "rgba(26,82,200,0.6)" : "#94A3B8",
                  marginTop: "2px",
                }}
              >
                {sub}
              </p>
            </div>
            {active && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: "var(--color-brand-blue)" }}
              >
                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ─── Countdown Timer ────────────────────────────────────── */
function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(0);
  const startCountdown = useCallback(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [remaining]);

  return { remaining, startCountdown, canResend: remaining <= 0 };
}

function Divider({ label }: { label: string }) {
  return (
    <div className="relative flex items-center gap-3 my-5">
      <div
        className="flex-1 h-px"
        style={{ background: "rgba(15,35,64,0.08)" }}
      />
      <span
        className="font-body"
        style={{
          fontSize: "0.6875rem",
          color: "#94A3B8",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </span>
      <div
        className="flex-1 h-px"
        style={{ background: "rgba(15,35,64,0.08)" }}
      />
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

/* ─── Main Component ─────────────────────────────────────── */
export function AuthForm({
  variant,
  defaultTab = "login",
  onSuccess,
  onClose,
  tab: controlledTab,
  onTabChange,
}: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || "/dashboard";

  const [internalTab, setInternalTab] = useState<AuthTab>(defaultTab);
  const tab = controlledTab ?? internalTab;

  const [method, setMethod] = useState<AuthMethod>("password");
  const [otpStep, setOtpStep] = useState<OtpStep>("idle");
  const [step, setStep] = useState<AuthStep>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [otpError, setOtpError] = useState("");

  const { remaining, startCountdown, canResend } = useCountdown(OTP_COOLDOWN);

  const isLoading = step === "loading" || isPending;

  const switchTab = (t: AuthTab) => {
    if (onTabChange) {
      onTabChange(t);
    } else {
      setInternalTab(t);
    }
    resetForm();
  };

  const resetForm = () => {
    setStep("idle");
    setErrorMsg("");
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setOtpError("");
    setName("");
    setEmail("");
    setPassword("");
    setOtp("");
    setOtpStep("idle");
    setMethod("password");
  };

  const switchMethod = (m: AuthMethod) => {
    setMethod(m);
    setOtpStep("idle");
    setOtp("");
    setOtpError("");
    setEmailError("");
    setErrorMsg("");
    setStep("idle");
  };

  const validateEmail = () => {
    setEmailError("");
    if (!email.trim()) {
      setEmailError("Email wajib diisi");
      return false;
    }
    if (!isValidEmail(email)) {
      setEmailError("Format email tidak valid");
      return false;
    }
    return true;
  };

  const validate = useCallback(() => {
    let valid = true;
    setNameError("");
    setEmailError("");
    setPasswordError("");

    if (tab === "signup" && !name.trim()) {
      setNameError("Nama lengkap wajib diisi");
      valid = false;
    }
    if (!email.trim()) {
      setEmailError("Email wajib diisi");
      valid = false;
    } else if (!isValidEmail(email)) {
      setEmailError("Format email tidak valid");
      valid = false;
    }
    if (!password) {
      setPasswordError("Kata sandi wajib diisi");
      valid = false;
    } else if (password.length < 8) {
      setPasswordError("Minimal 8 karakter");
      valid = false;
    }
    return valid;
  }, [tab, name, email, password]);

  const handleGoogle = useCallback(async () => {
    try {
      setStep("loading");
      await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectTo,
      });
    } catch {
      setStep("error");
      setErrorMsg("Gagal masuk dengan Google. Coba lagi.");
      AppToast.error("Gagal masuk dengan Google");
    } finally {
      setStep("idle");
    }
  }, [redirectTo]);

  const handleSendOtp = useCallback(async () => {
    if (!validateEmail()) return;
    setStep("loading");
    setErrorMsg("");
    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: tab === "login" ? "sign-in" : "sign-in",
      });
      setOtpStep("sent");
      startCountdown();
      AppToast.success("Kode OTP terkirim ke email kamu!");
    } catch (err: unknown) {
      setStep("error");
      const message =
        err instanceof Error ? err.message : "Gagal mengirim OTP.";
      setErrorMsg(message);
      AppToast.error(message);
    } finally {
      setStep("idle");
    }
  }, [email, tab, startCountdown]);

  const handleVerifyOtp = useCallback(async () => {
    setOtpError("");
    if (!otp || otp.length < 6) {
      setOtpError("Masukkan 6 digit kode OTP");
      return;
    }
    setStep("loading");
    setErrorMsg("");
    try {
      const result =
        tab === "login"
          ? await authClient.signIn.emailOtp({ email, otp })
          : await authClient.emailOtp.verifyEmail({ email, otp });

      if ((result as any)?.error)
        throw new Error((result as any).error.message);

      setOtpStep("verified");
      AppToast.success(
        tab === "login" ? "Login berhasil!" : "Akun berhasil dibuat!",
      );
      onSuccess?.();
      startTransition(() => {
        router.push(redirectTo);
        router.refresh();
      });
    } catch (err: unknown) {
      setStep("error");
      const message =
        err instanceof Error ? err.message : "Kode OTP tidak valid.";
      setOtpError(message);
      setErrorMsg(message);
    } finally {
      setStep("idle");
    }
  }, [otp, email, tab, onSuccess, redirectTo, router]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setStep("loading");
    setErrorMsg("");
    try {
      const action =
        tab === "login"
          ? authClient.signIn.email({
              email,
              password,
              callbackURL: redirectTo,
            })
          : authClient.signUp.email({
              name,
              email,
              password,
              callbackURL: redirectTo,
            });

      const result = await AppToast.promise(action, {
        loading: tab === "login" ? "Logging in..." : "Creating account...",
        success: tab === "login" ? "Login berhasil!" : "Akun berhasil dibuat!",
        error: tab === "login" ? "Login gagal" : "Pendaftaran gagal",
      });

      if ((result as any)?.error)
        throw new Error((result as any).error.message);

      onSuccess?.();
      startTransition(() => {
        router.push(redirectTo);
        router.refresh();
      });
    } catch (err: unknown) {
      setStep("error");
      const message = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setErrorMsg(message);
      AppToast.error(message);
    } finally {
      setStep("idle");
    }
  }, [validate, tab, email, password, name, redirectTo, onSuccess, router]);

  /* ─── Render OTP Step ───────────────────────────────────── */
  const renderOtpVerify = () => (
    <motion.div
      key="otp-verify"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.28, ease: EASE }}
      className="space-y-5"
    >
      {/* Back + Email info */}
      <div
        className="flex items-center gap-3 p-3.5 rounded-xl"
        style={{
          background: "rgba(26,82,200,0.04)",
          border: "1px solid rgba(26,82,200,0.12)",
        }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(26,82,200,0.1)" }}
        >
          <Shield
            className="w-4 h-4"
            style={{ color: "var(--color-brand-blue)" }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="font-display font-semibold"
            style={{ fontSize: "0.75rem", color: "var(--color-brand-text)" }}
          >
            Kode dikirim ke
          </p>
          <p
            className="truncate"
            style={{
              fontSize: "0.6875rem",
              color: "var(--color-brand-blue)",
              fontWeight: 600,
            }}
          >
            {email}
          </p>
        </div>
        <button
          onClick={() => {
            setOtpStep("idle");
            setOtp("");
            setOtpError("");
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors duration-150 hover:bg-blue-50 cursor-pointer"
          style={{
            fontSize: "0.625rem",
            color: "var(--color-brand-blue)",
            fontWeight: 600,
          }}
        >
          <ChevronLeft className="w-3 h-3" />
          Ubah
        </button>
      </div>

      <div className="space-y-2">
        <p
          className="text-center font-display font-semibold"
          style={{
            fontSize: "0.75rem",
            color: "var(--color-brand-text-muted)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Masukkan 6-Digit Kode OTP
        </p>
        <OtpInput
          value={otp}
          onChange={setOtp}
          disabled={isLoading}
          error={otpError}
          onComplete={handleVerifyOtp}
        />
      </div>

      {/* Resend */}
      <div className="text-center">
        {canResend ? (
          <button
            onClick={handleSendOtp}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 font-display font-semibold transition-colors duration-150 hover:underline cursor-pointer disabled:opacity-60"
            style={{ fontSize: "0.75rem", color: "var(--color-brand-blue)" }}
          >
            <RefreshCw className="w-3 h-3" />
            Kirim ulang kode
          </button>
        ) : (
          <p style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
            Kirim ulang dalam{" "}
            <span
              className="font-display font-bold tabular-nums"
              style={{ color: "var(--color-brand-blue)" }}
            >
              {remaining}s
            </span>
          </p>
        )}
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {step === "error" && errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl"
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p style={{ fontSize: "0.8125rem", color: "#DC2626" }}>
              {errorMsg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verify Button */}
      <motion.button
        onClick={handleVerifyOtp}
        disabled={isLoading || otp.length < 6}
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.99 }}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-display font-bold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        style={{
          fontSize: "0.9375rem",
          color: "var(--color-brand-blue-abyss)",
          background:
            "linear-gradient(135deg, #E8940A 0%, var(--color-brand-gold-mid) 50%, var(--color-brand-gold-vivid) 100%)",
          boxShadow: "var(--shadow-glow-gold-btn)",
        }}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <span>Verifikasi & {tab === "login" ? "Masuk" : "Daftar"}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </motion.button>
    </motion.div>
  );

  /* ─── Render OTP Request Step ────────────────────────────── */
  const renderOtpRequest = () => (
    <motion.div
      key="otp-request"
      initial={{ opacity: 0, x: tab === "signup" ? 16 : -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: tab === "signup" ? -16 : 16 }}
      transition={{ duration: 0.22, ease: EASE }}
      className="space-y-4"
    >
      {tab === "signup" && (
        <InputField
          id={`auth-name-${variant}`}
          type="text"
          label="Nama Lengkap"
          placeholder="Masukkan nama lengkap"
          value={name}
          onChange={setName}
          icon={User}
          error={nameError}
          autoComplete="name"
          disabled={isLoading}
        />
      )}

      <InputField
        id={`auth-otp-email-${variant}`}
        type="email"
        label="Email"
        placeholder="nama@email.com"
        value={email}
        onChange={setEmail}
        icon={Mail}
        error={emailError}
        autoComplete="email"
        disabled={isLoading}
        onEnter={handleSendOtp}
      />

      {/* Info badge */}
      <div
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
        style={{
          background: "rgba(26,82,200,0.04)",
          border: "1px solid rgba(26,82,200,0.1)",
        }}
      >
        <KeyRound
          className="w-3.5 h-3.5 flex-shrink-0"
          style={{ color: "var(--color-brand-blue)" }}
        />
        <p
          style={{ fontSize: "0.6875rem", color: "#64748B", lineHeight: "1.4" }}
        >
          Kode 6 digit akan dikirim ke email kamu. Berlaku{" "}
          <strong>5 menit</strong>.
        </p>
      </div>

      <AnimatePresence>
        {step === "error" && errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl"
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p style={{ fontSize: "0.8125rem", color: "#DC2626" }}>
              {errorMsg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleSendOtp}
        disabled={isLoading}
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.99 }}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-display font-bold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-2"
        style={{
          fontSize: "0.9375rem",
          color: "var(--color-brand-blue-abyss)",
          background:
            "linear-gradient(135deg, #E8940A 0%, var(--color-brand-gold-mid) 50%, var(--color-brand-gold-vivid) 100%)",
          boxShadow: "var(--shadow-glow-gold-btn)",
        }}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <span>Kirim Kode OTP</span>
            <Mail className="w-4 h-4" />
          </>
        )}
      </motion.button>
    </motion.div>
  );

  /* ─── Render Password Form ────────────────────────────────── */
  const renderPasswordForm = () => (
    <motion.div
      key={tab + "-password"}
      initial={{ opacity: 0, x: tab === "signup" ? 16 : -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: tab === "signup" ? -16 : 16 }}
      transition={{ duration: 0.22, ease: EASE }}
      className="space-y-4"
    >
      {tab === "signup" && (
        <InputField
          id={`auth-name-${variant}`}
          type="text"
          label="Nama Lengkap"
          placeholder="Masukkan nama lengkap"
          value={name}
          onChange={setName}
          icon={User}
          error={nameError}
          autoComplete="name"
          disabled={isLoading}
        />
      )}

      <InputField
        id={`auth-email-${variant}`}
        type="email"
        label="Email"
        placeholder="nama@email.com"
        value={email}
        onChange={setEmail}
        icon={Mail}
        error={emailError}
        autoComplete="email"
        disabled={isLoading}
      />

      <InputField
        id={`auth-password-${variant}`}
        type="password"
        label="Kata Sandi"
        placeholder={
          tab === "signup" ? "Minimal 8 karakter" : "Masukkan kata sandi"
        }
        value={password}
        onChange={setPassword}
        icon={Lock}
        error={passwordError}
        autoComplete={tab === "login" ? "current-password" : "new-password"}
        disabled={isLoading}
        onEnter={handleSubmit}
      />

      {tab === "login" && (
        <div className="flex justify-end -mt-2">
          <button
            className="font-body transition-colors duration-150 cursor-pointer hover:underline"
            style={{ fontSize: "0.75rem", color: "var(--color-brand-blue)" }}
          >
            Lupa kata sandi?
          </button>
        </div>
      )}

      <AnimatePresence>
        {step === "error" && errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl"
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p style={{ fontSize: "0.8125rem", color: "#DC2626" }}>
              {errorMsg}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleSubmit}
        disabled={isLoading}
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.99 }}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-display font-bold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-2"
        style={{
          fontSize: "0.9375rem",
          color: "var(--color-brand-blue-abyss)",
          background:
            "linear-gradient(135deg, #E8940A 0%, var(--color-brand-gold-mid) 50%, var(--color-brand-gold-vivid) 100%)",
          boxShadow: "var(--shadow-glow-gold-btn)",
        }}
      >
        {isLoading ? (
          <Loader2 className="w-4.5 h-4.5 animate-spin" />
        ) : (
          <>
            <span>
              {tab === "login" ? "Masuk Sekarang" : "Buat Akun Gratis"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </motion.button>

      {tab === "signup" && (
        <p
          className="text-center font-body leading-relaxed"
          style={{ fontSize: "0.6875rem", color: "#94A3B8" }}
        >
          Dengan mendaftar, kamu menyetujui{" "}
          <a
            href="/terms"
            className="hover:underline"
            style={{ color: "var(--color-brand-blue)" }}
          >
            Syarat & Ketentuan
          </a>{" "}
          dan{" "}
          <a
            href="/privacy"
            className="hover:underline"
            style={{ color: "var(--color-brand-blue)" }}
          >
            Kebijakan Privasi
          </a>
          .
        </p>
      )}
    </motion.div>
  );

  return (
    <div className="w-full">
      {/* Tab Switch */}
      <div
        className="flex rounded-xl p-1 mb-5"
        style={{ background: "#F1F5F9" }}
        role="tablist"
      >
        {(["login", "signup"] as AuthTab[]).map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            role="tab"
            aria-selected={tab === t}
            className="relative flex-1 py-2 rounded-lg font-display font-bold transition-all duration-200 cursor-pointer"
            style={{
              fontSize: "0.8125rem",
              color: tab === t ? "white" : "#64748B",
            }}
          >
            {tab === t && (
              <motion.div
                layoutId={`auth-tab-bg-${variant}`}
                className="absolute inset-0 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, var(--color-brand-blue-navy) 0%, var(--color-brand-blue) 100%)`,
                  boxShadow: "0 2px 8px rgba(10,45,135,0.25)",
                }}
                transition={SPRING}
              />
            )}
            <span className="relative z-10">
              {t === "login" ? "Masuk" : "Daftar"}
            </span>
          </button>
        ))}
      </div>

      {/* Google OAuth */}
      <motion.button
        onClick={handleGoogle}
        disabled={isLoading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-display font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        style={{
          fontSize: "0.875rem",
          background: "white",
          border: "1.5px solid rgba(15,35,64,0.1)",
          color: "var(--color-brand-text)",
          boxShadow: "0 1px 6px rgba(15,35,64,0.06)",
        }}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        {tab === "login" ? "Lanjutkan dengan Google" : "Daftar dengan Google"}
      </motion.button>

      <Divider label="atau" />

      {/* Method Selector — only shown when not in OTP verify step */}
      <AnimatePresence>
        {otpStep !== "sent" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MethodSelector
              method={method}
              onChange={switchMethod}
              disabled={isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Body */}
      <AnimatePresence mode="wait">
        {method === "otp" && otpStep === "sent"
          ? renderOtpVerify()
          : method === "otp"
            ? renderOtpRequest()
            : renderPasswordForm()}
      </AnimatePresence>
    </div>
  );
}
