// components/UserNav.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  Eye,
  EyeOff,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Mail,
  Settings,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { logout } from "@/lib/auth/actions";
import { useEffect, useRef, useState } from "react";

import { BRAND } from "@/constants/brand";
import { Button } from "./ui/button";

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", damping: 28, stiffness: 240 } as const;

type AuthTab = "login" | "signup";

type AuthUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
};

type AuthModalPortalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: AuthTab;
};

type UserNavProps = {
  onOpenAuthModal: () => void;
};

export const NAV_MENU_ITEMS = [
  {
    label: "Dashboard",
    shortLabel: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    desc: "Ringkasan aktivitas",
    color: "#1a52c8",
    bg: "rgba(26,82,200,0.08)",
  },
  {
    label: "Program Saya",
    shortLabel: "Program",
    href: "/dashboard/program-saya",
    icon: BookOpen,
    desc: "Akses kelas terdaftar",
    color: "#0a9e8a",
    bg: "rgba(10,158,138,0.08)",
  },
  {
    label: "Pengaturan",
    shortLabel: "Pengaturan",
    href: "/dashboard/settings",
    icon: Settings,
    desc: "Akun & preferensi",
    color: "#7c5fcf",
    bg: "rgba(124,95,207,0.08)",
  },
] as const;

function getInitials(name?: string | null): string {
  if (!name) return "U";

  const initials = name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return initials || "U";
}

function canOpenDashboard(role?: string | null) {
  return role === "admin" || role === "super_admin";
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
        alt={user.name ?? "User"}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size, flexShrink: 0 }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
        background: `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.blueNavy} 100%)`,
      }}
    >
      {getInitials(user.name)}
    </div>
  );
}

export function UserNav({ onOpenAuthModal }: UserNavProps) {
  const { data: session, status } = useSession();

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const loading = status === "loading";
  const user = session?.user as AuthUser | undefined;

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) {
    return (
      <Button variant="brand-outline" size="sm" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading
      </Button>
    );
  }

  if (!user) {
    return (
      <Button
        variant="brand"
        size="sm"
        onClick={onOpenAuthModal}
        className="font-semibold"
      >
        <LogIn className="mr-2 h-4 w-4" />
        Login
      </Button>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 transition hover:bg-[var(--surface-soft)]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <UserAvatar user={user} size={32} />

        <div className="hidden xl:block min-w-0 text-left">
          <p className="max-w-[120px] truncate text-sm font-bold leading-none text-[var(--blue-navy)]">
            {user.name ?? "User"}
          </p>

          <p className="mt-1 max-w-[120px] truncate text-xs text-muted-foreground">
            {user.role ?? "user"}
          </p>
        </div>

        <ChevronDown
          className={[
            "h-4 w-4 text-muted-foreground transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: EASE }}
            className="absolute right-0 top-[calc(100%+12px)] z-[1200] w-80 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
          >
            <div className="relative overflow-hidden px-4 py-4">
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  background:
                    "radial-gradient(circle at 20% 20%, var(--gold-vivid), transparent 38%), radial-gradient(circle at 85% 15%, var(--blue-navy), transparent 35%)",
                }}
              />

              <div className="relative flex items-center gap-3">
                <UserAvatar user={user} size={46} />

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--blue-navy)]">
                    {user.name ?? "User"}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>

                  <p className="mt-1 inline-flex rounded-full bg-[var(--surface-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--blue-navy)]">
                    {user.role ?? "user"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--border)] p-2">
              {NAV_MENU_ITEMS.map((item) => {
                if (
                  item.href === "/dashboard" &&
                  !canOpenDashboard(user.role)
                ) {
                  return null;
                }

                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-[var(--surface-soft)]"
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ color: item.color, background: item.bg }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>

                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-[var(--blue-navy)]">
                        {item.label}
                      </span>

                      <span className="block text-xs text-muted-foreground">
                        {item.desc}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-[var(--border)] p-2">
              <form action={logout}>
                <button
                  type="submit"
                  role="menuitem"
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <LogOut className="h-4 w-4" />
                  </span>
                  Logout
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MobileUserSection({
  onClose,
  onOpenAuthModal,
}: {
  onClose: () => void;
  onOpenAuthModal: () => void;
}) {
  const { data: session, status } = useSession();

  const user = session?.user as AuthUser | undefined;
  const loading = status === "loading";

  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
        <div className="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading akun...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Button
        variant="brand"
        size="brand-full"
        className="py-3"
        onClick={() => {
          onClose();
          onOpenAuthModal();
        }}
      >
        <LogIn className="size-5" />
        Login / Register
      </Button>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="mb-3 flex items-center gap-3">
        <UserAvatar user={user} size={42} />

        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[var(--blue-navy)]">
            {user.name ?? "User"}
          </p>

          <p className="truncate text-xs text-muted-foreground">
            {user.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/dashboard/programs"
          onClick={onClose}
          className="rounded-xl bg-[var(--surface-soft)] px-3 py-2 text-center text-xs font-bold text-[var(--blue-navy)]"
        >
          Program
        </Link>

        {canOpenDashboard(user.role) ? (
          <Link
            href="/dashboard"
            onClick={onClose}
            className="rounded-xl bg-[var(--surface-soft)] px-3 py-2 text-center text-xs font-bold text-[var(--blue-navy)]"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            href="/dashboard/settings"
            onClick={onClose}
            className="rounded-xl bg-[var(--surface-soft)] px-3 py-2 text-center text-xs font-bold text-[var(--blue-navy)]"
          >
            Pengaturan
          </Link>
        )}
      </div>

      <form action={logout} className="mt-2">
        <button
          type="submit"
          className="w-full rounded-xl bg-red-50 px-3 py-2 text-center text-xs font-bold text-red-600"
        >
          Logout
        </button>
      </form>
    </div>
  );
}

export function AuthModalPortal({
  isOpen,
  onClose,
  defaultTab = "login",
}: AuthModalPortalProps) {
  return (
    <AnimatePresence>
      {isOpen && <AuthModal onClose={onClose} defaultTab={defaultTab} isOpen={false} />}
    </AnimatePresence>
  );
}

function AuthModal({ onClose, defaultTab = "login" }: AuthModalPortalProps) {
  const [tab, setTab] = useState<AuthTab>(defaultTab);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab, open]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[2000] flex items-start justify-center overflow-y-auto p-4"
      style={{
        background: "rgba(6,15,46,0.65)",
        backdropFilter: "blur(12px)",
      }}
      onClick={(event) => {
        if (event.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={tab === "login" ? "Masuk ke akun" : "Buat akun baru"}
    >
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={SPRING}
        className="relative flex max-h-[90vh] w-full max-w-[440px] flex-col overflow-hidden rounded-3xl"
        style={{
          background: "var(--surface)",
          boxShadow:
            "0 40px 100px rgba(6,15,46,0.4), 0 8px 24px rgba(6,15,46,0.15)",
          border: "1px solid var(--border-soft)",
        }}
      >
        <ModalHeader onClose={onClose} tab={tab} />

        <div className="px-7 py-6 overflow-y-auto">
          <div className="mb-5 grid grid-cols-2 rounded-2xl bg-[var(--surface-soft)] p-1">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={[
                "rounded-xl px-4 py-2 text-sm font-bold transition",
                tab === "login"
                  ? "bg-white text-[var(--blue-navy)] shadow-sm"
                  : "text-muted-foreground",
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
                  ? "bg-white text-[var(--blue-navy)] shadow-sm"
                  : "text-muted-foreground",
              ].join(" ")}
            >
              Register
            </button>
          </div>

          <GoogleAuthButton
            label={tab === "login" ? "Login dengan Google" : "Register dengan Google"}
          />

          <AuthDivider />

          {tab === "login" ? (
            <LoginForm onSuccess={onClose} />
          ) : (
            <RegisterForm onSuccess={onClose} />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function ModalHeader({
  onClose,
  tab,
}: {
  onClose: () => void;
  tab: AuthTab;
}) {
  return (
    <div
      className="relative min-h-[140px] overflow-hidden px-7 pb-6 pt-8"
      style={{
        background:
          "linear-gradient(135deg, var(--blue-abyss) 0%, var(--blue-navy) 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          opacity: 0.6,
        }}
      />

      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
        aria-label="Close auth modal"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative z-10">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20">
          <Sparkles className="h-5 w-5" />
        </div>

        <h2 className="text-2xl font-bold text-white">
          {tab === "login" ? "Login Akun" : "Buat Akun Baru"}
        </h2>

        <p className="mt-1 text-sm text-white/70">
          {tab === "login"
            ? "Masuk menggunakan email dan password."
            : "Daftar akun baru untuk mulai belajar."}
        </p>
      </div>
    </div>
  );
}

function GoogleAuthButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false);

  async function handleGoogleAuth() {
    setLoading(true);

    await signIn("google", {
      callbackUrl: "/dashboard/program-saya",
    });
  }

  return (
    <Button
      type="button"
      variant="brand-outline"
      className="w-full py-3 font-bold"
      disabled={loading}
      onClick={handleGoogleAuth}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-black text-[var(--blue-navy)]">
          G
        </span>
      )}
      {label}
    </Button>
  );
}

function AuthDivider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-[var(--border)]" />
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        atau
      </span>
      <div className="h-px flex-1 bg-[var(--border)]" />
    </div>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
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

    setLoading(false);

    if (result?.error) {
      setError("Email atau password salah.");
      return;
    }

    onSuccess();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <AuthField
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
        icon={Mail}
      />

      <PasswordField
        label="Password"
        value={password}
        onChange={setPassword}
        showPassword={showPassword}
        onToggle={() => setShowPassword((value) => !value)}
      />

      <Button
        type="submit"
        variant="brand"
        className="w-full py-3"
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Login
      </Button>
    </form>
  );
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
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
      headers: {
        "Content-Type": "application/json",
      },
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

    setLoading(false);

    if (loginResult?.error) {
      setError("Akun berhasil dibuat, tapi auto-login gagal. Silakan login manual.");
      return;
    }

    onSuccess();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <AuthField
        label="Nama"
        type="text"
        value={name}
        onChange={setName}
        placeholder="Nama kamu"
        icon={UserRound}
      />

      <AuthField
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
        icon={Mail}
      />

      <PasswordField
        label="Password"
        value={password}
        onChange={setPassword}
        showPassword={showPassword}
        onToggle={() => setShowPassword((value) => !value)}
      />

      <PasswordField
        label="Konfirmasi Password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        showPassword={showPassword}
        onToggle={() => setShowPassword((value) => !value)}
      />

      <Button
        type="submit"
        variant="brand"
        className="w-full py-3"
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Register
      </Button>
    </form>
  );
}

function AuthField({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon: React.ElementType;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-[var(--blue-navy)]">
        {label}
      </span>

      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <input
          required
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-[var(--gold-dark)] focus:ring-4 focus:ring-[var(--gold-vivid)]/15"
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-bold text-[var(--blue-navy)]">
        {label}
      </span>

      <div className="relative">
        <input
          required
          type={showPassword ? "text" : "password"}
          value={value}
          placeholder="Minimal 6 karakter"
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-white py-3 pl-4 pr-12 text-sm outline-none transition placeholder:text-muted-foreground focus:border-[var(--gold-dark)] focus:ring-4 focus:ring-[var(--gold-vivid)]/15"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-[var(--blue-navy)]"
          aria-label={showPassword ? "Hide password" : "Show password"}
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