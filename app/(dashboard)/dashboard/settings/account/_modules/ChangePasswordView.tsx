// app/(dashboard)/dashboard/settings/account/_modules/ChangePasswordView.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  User as UserIcon,
} from "lucide-react";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   PASSWORD STRENGTH
───────────────────────────────────────────────────────────── */

function getPasswordStrength(pw: string): {
  score: number; // 0-4
  label: string;
  color: string;
} {
  if (!pw) return { score: 0, label: "", color: "var(--border-soft)" };

  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;

  const labels = ["Sangat Lemah", "Lemah", "Cukup", "Kuat", "Sangat Kuat"];
  const colors = ["#ef4444", "#f59e0b", "#eab308", "#22c55e", "#16a34a"];

  return { score, label: labels[score], color: colors[score] };
}

function PasswordStrengthBar({ password }: { password: string }) {
  const { score, label, color } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{
              background: i < score ? color : "var(--border-soft)",
            }}
          />
        ))}
      </div>
      <p className="mt-1 text-[11px] font-medium" style={{ color }}>
        {label}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PASSWORD INPUT
───────────────────────────────────────────────────────────── */

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label
        className="mb-1.5 block text-[12.5px] font-semibold"
        style={{ color: "var(--text-main)" }}
      >
        {label}
      </label>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
          style={{ color: "var(--text-faint)" }}
        />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cn(
            "w-full rounded-xl border bg-white py-3 pl-10 pr-11 text-[14px] outline-none transition-colors",
            "focus:ring-2",
          )}
          style={{
            borderColor: error ? "#fca5a5" : "var(--border-soft)",
            color: "var(--text-main)",
          }}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          tabIndex={-1}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error ? (
        <p className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-medium text-red-500">
          <AlertCircle className="size-3" />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[11.5px]" style={{ color: "var(--text-faint)" }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN VIEW
───────────────────────────────────────────────────────────── */

export function ChangePasswordView() {
  const accountQuery = trpc.users.getMyAccount.useQuery();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updatePassword = trpc.users.updatePassword.useMutation({
    onSuccess: () => {
      toast.success("Password berhasil diperbarui");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    },
    onError: (err) => {
      toast.error(err.message || "Gagal memperbarui password");
    },
  });

  const hasPassword = accountQuery.data?.hasPassword ?? true;

  function validate() {
    const next: Record<string, string> = {};

    if (hasPassword && !currentPassword) {
      next.currentPassword = "Password saat ini wajib diisi";
    }
    if (newPassword.length < 6) {
      next.newPassword = "Minimal 6 karakter";
    }
    if (confirmPassword !== newPassword) {
      next.confirmPassword = "Konfirmasi password tidak cocok";
    }
    if (hasPassword && currentPassword && newPassword === currentPassword) {
      next.newPassword = "Password baru tidak boleh sama dengan password lama";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    updatePassword.mutate({
      currentPassword: hasPassword ? currentPassword : undefined,
      newPassword,
      confirmPassword,
    });
  }

  const account = accountQuery.data;

  return (
    <div className="flex flex-col gap-4 px-4 pb-10 pt-4 sm:px-6">
      {/* Header */}
      <div>
        <h1
          className="text-[18px] font-extrabold sm:text-[20px]"
          style={{ color: "var(--text-main)" }}
        >
          Keamanan Akun
        </h1>
        <p className="mt-0.5 text-[12.5px]" style={{ color: "var(--text-faint)" }}>
          Kelola password untuk menjaga keamanan akunmu.
        </p>
      </div>

      {/* Account summary */}
      {account && (
        <div
          className="flex items-center gap-3 rounded-2xl border bg-white p-4"
          style={{ borderColor: "var(--border-soft)" }}
        >
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full"
            style={{ background: "var(--surface-soft)", color: "var(--blue)" }}
          >
            <UserIcon className="size-5" />
          </div>
          <div className="min-w-0">
            <p
              className="truncate text-[13.5px] font-bold"
              style={{ color: "var(--text-main)" }}
            >
              {account.name}
            </p>
            <p
              className="truncate text-[12px]"
              style={{ color: "var(--text-faint)" }}
            >
              {account.email}
            </p>
          </div>
        </div>
      )}

      {/* Form card */}
      <div
        className="overflow-hidden rounded-2xl border bg-white shadow-sm"
        style={{ borderColor: "var(--border-soft)" }}
      >
        <div
          className="flex items-center gap-2.5 border-b px-5 py-4"
          style={{ borderColor: "var(--border-soft)" }}
        >
          <div
            className="flex size-8 items-center justify-center rounded-xl"
            style={{ background: "var(--surface-soft)", color: "var(--blue)" }}
          >
            <KeyRound className="size-4" />
          </div>
          <div>
            <p
              className="font-display text-[14px] font-bold"
              style={{ color: "var(--text-main)" }}
            >
              {hasPassword ? "Ubah Password" : "Buat Password"}
            </p>
            <p className="text-[11.5px]" style={{ color: "var(--text-faint)" }}>
              {hasPassword
                ? "Masukkan password lama dan password baru."
                : "Akun ini belum punya password. Buat sekarang untuk login dengan email & password."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          {hasPassword && (
            <PasswordField
              label="Password Saat Ini"
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Masukkan password saat ini"
              error={errors.currentPassword}
              autoComplete="current-password"
            />
          )}

          <div>
            <PasswordField
              label="Password Baru"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Minimal 6 karakter"
              error={errors.newPassword}
              autoComplete="new-password"
            />
            <PasswordStrengthBar password={newPassword} />
          </div>

          <PasswordField
            label="Konfirmasi Password Baru"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Ulangi password baru"
            error={errors.confirmPassword}
            autoComplete="new-password"
          />

          {/* Security tips */}
          <div
            className="flex items-start gap-2.5 rounded-xl px-3.5 py-3"
            style={{ background: "var(--bg-soft)" }}
          >
            <ShieldCheck
              className="mt-0.5 size-4 shrink-0"
              style={{ color: "var(--blue)" }}
            />
            <p className="text-[11.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol
              agar password lebih sulit ditebak.
            </p>
          </div>

          <button
            type="submit"
            disabled={updatePassword.isPending || accountQuery.isLoading}
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-[13.5px] font-bold text-white shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: "var(--blue-navy)" }}
          >
            {updatePassword.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Menyimpan…
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                {hasPassword ? "Simpan Password Baru" : "Buat Password"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}