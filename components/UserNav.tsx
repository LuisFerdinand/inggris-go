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
  LogIn,
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
import { AuthForm } from "./AuthForm";
import { useSignOut } from "@/hooks/use-sign-out";

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", damping: 28, stiffness: 240 } as const;

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
    href: "/dashboard/programs",
    icon: BookOpen,
    desc: "Akses semua kelas",
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

interface AuthModalProps {
  onClose: () => void;
  defaultTab?: AuthTab;
}
interface AuthModalProps {
  onClose: () => void;
  defaultTab?: AuthTab;
}

function AuthModal({ onClose, defaultTab = "login" }: AuthModalProps) {
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

  return (
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[2000] flex items-start justify-center p-4 overflow-y-auto"
      style={{ background: "rgba(6,15,46,0.65)", backdropFilter: "blur(12px)" }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={defaultTab === "login" ? "Masuk ke akun" : "Buat akun baru"}
    >
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={SPRING}
        className="relative w-full max-w-[440px] rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{
          background: "var(--surface)",
          boxShadow:
            "0 40px 100px rgba(6,15,46,0.4), 0 8px 24px rgba(6,15,46,0.15)",
          border: "1px solid var(--border-soft)",
        }}
      >
        <ModalHeader onClose={onClose} defaultTab={defaultTab} />
        <div className="px-7 py-6 overflow-y-auto">
          <AuthForm
            variant="modal"
            defaultTab={defaultTab}
            onSuccess={onClose}
            onClose={onClose}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

function ModalHeader({
  onClose,
  defaultTab,
}: {
  onClose: () => void;
  defaultTab: AuthTab;
}) {
  return (
    <div
      className="relative px-7 pt-8 pb-6 overflow-hidden min-h-[140px]"
      style={{
        background:
          "linear-gradient(135deg, var(--blue-abyss) 0%, var(--blue-navy) 100%)",
      }}
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          opacity: 0.6,
        }}
      />
      {/* Gold accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #f7b500 30%, #ffc107 70%, transparent 100%)",
          opacity: 0.6,
        }}
      />
      {/* Glow orb */}
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(247,181,0,0.12), transparent 65%)",
        }}
      />

      <div className="relative">
        {/* Top row */}
        <div className="flex items-center justify-between mb-2">
          <div
            className="px-2.5 py-1 rounded-full flex items-center gap-1.5"
            style={{
              background: "rgba(247,181,0,0.15)",
              border: "1px solid rgba(247,181,0,0.25)",
            }}
          >
            <Image
              src={"/logo.png"}
              alt="Logo"
              width={50}
              height={50}
              className="w-3 h-3"
              style={{ color: "var(--gold-vivid)" }}
            />
            <span
              className="font-display font-bold"
              style={{
                fontSize: "0.5625rem",
                color: "var(--gold-vivid)",
                letterSpacing: "0.1em",
              }}
            >
              INGGRIS GO
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-150"
            style={{ background: "rgba(255,255,255,0.08)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.16)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.08)";
            }}
            aria-label="Tutup"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        <h2
          className="font-display font-bold text-white mb-2 whitespace-pre-line"
          style={{
            fontSize: "1.5rem",
            lineHeight: "1.2",
            letterSpacing: "-0.02em",
          }}
        >
          {defaultTab === "login"
            ? "Selamat datang"
            : "Mulai perjalanan\nbahasa Inggrismu 🚀"}
        </h2>
        <p
          style={{
            fontSize: "0.8125rem",
            color: "rgba(255,255,255,0.45)",
            lineHeight: "1.5",
          }}
        >
          {defaultTab === "login"
            ? "Masuk untuk melanjutkan belajar."
            : "Daftar gratis, akses program terbaik."}
        </p>
      </div>
    </div>
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
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      transition={{ duration: 0.2, ease: EASE }}
      className="absolute top-[calc(100%+14px)] right-0 z-50"
      style={{ width: "280px" }}
      role="menu"
    >
      {/* Arrow */}
      <div className="absolute -top-[7px] right-[20px] pointer-events-none z-10">
        <svg width="14" height="7" viewBox="0 0 14 7" fill="none">
          <path
            d="M0 7L7 0L14 7"
            fill="white"
            stroke="rgba(10,45,135,0.08)"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "white",
          border: "1px solid rgba(10,45,135,0.09)",
          boxShadow:
            "0 24px 70px rgba(10,45,135,0.18), 0 4px 16px rgba(10,45,135,0.06)",
        }}
      >
        {/* Identity header */}
        <div
          className="relative px-4 py-4 overflow-hidden"
          style={{
            background: "linear-gradient(140deg, #060f2e 0%, #0a2d87 100%)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "14px 14px",
            }}
          />
          {/* Gold shimmer */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[1.5px] pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(247,181,0,0.5), transparent)",
            }}
          />
          <div
            className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(247,181,0,0.14), transparent 65%)",
            }}
          />

          <div className="relative flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <UserAvatar user={user} size={40} />
              <div
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-[1.5px]"
                style={{ background: "#22C55E", borderColor: "#060f2e" }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="font-bold text-white truncate"
                style={{ fontSize: "0.9rem", letterSpacing: "-0.01em" }}
              >
                {user.name}
              </p>
              <p
                className="truncate"
                style={{
                  fontSize: "0.6875rem",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div className="p-2 space-y-0.5">
          {NAV_MENU_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.04 * i + 0.05,
                  duration: 0.18,
                  ease: EASE,
                }}
                role="menuitem"
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
                  style={{
                    textDecoration: "none",
                    border: "1px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "#F8FAFF";
                    (e.currentTarget as HTMLElement).style.border =
                      "1px solid rgba(26,82,200,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLElement).style.border =
                      "1px solid transparent";
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-150"
                    style={{ background: item.bg }}
                  >
                    <Icon
                      className="w-3.5 h-3.5"
                      style={{ color: item.color }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold"
                      style={{ fontSize: "0.8125rem", color: "#0a2d87" }}
                    >
                      {item.label}
                    </p>
                    <p style={{ fontSize: "0.625rem", color: "#94A3B8" }}>
                      {item.desc}
                    </p>
                  </div>
                  <ChevronRight
                    className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150"
                    style={{ color: BRAND.blue }}
                  />
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Divider + Sign out */}
        <div className="px-2 pb-2">
          <div
            style={{
              borderTop: "1px solid rgba(10,45,135,0.07)",
              paddingTop: 6,
            }}
          >
            <button
              onClick={onSignOut}
              disabled={isSigningOut}
              className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 disabled:opacity-60 cursor-pointer"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#FFF5F5";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
              }}
              role="menuitem"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-150"
                style={{ background: "rgba(239,68,68,0.07)" }}
              >
                {isSigningOut ? (
                  <Loader2
                    className="w-3.5 h-3.5 animate-spin"
                    style={{ color: "#EF4444" }}
                  />
                ) : (
                  <LogOut
                    className="w-3.5 h-3.5"
                    style={{ color: "#EF4444" }}
                  />
                )}
              </div>
              <span
                className="font-semibold group-hover:text-red-600 transition-colors duration-150"
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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session, isPending } = authClient.useSession();

  const { signOut, isSigningOut } = useSignOut();
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
    return <div className="w-20 h-9 rounded-xl bg-white/10 animate-pulse" />;
  }

  if (!session?.user) {
    return <SignInButton onOpen={onOpenAuthModal} />;
  }

  const user = session.user as AuthUser;

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setDropdownOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl pl-1.5 pr-3 py-1.5 transition-all duration-200 cursor-pointer select-none"
        style={{
          background: dropdownOpen
            ? "linear-gradient(135deg, #060f2e 0%, #0a2d87 100%)"
            : "linear-gradient(135deg, #0a2d87 0%, #1a52c8 100%)",
          border: dropdownOpen
            ? "1.5px solid rgba(247,181,0,0.35)"
            : "1.5px solid rgba(255,255,255,0.08)",
          boxShadow: dropdownOpen
            ? "0 6px 20px rgba(10,45,135,0.35), 0 0 0 3px rgba(247,181,0,0.08)"
            : "0 2px 10px rgba(10,45,135,0.2)",
        }}
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
        aria-label="User menu"
      >
        <UserAvatar user={user} size={28} />
        <span
          className="font-semibold hidden xl:block max-w-[100px] truncate text-white"
          style={{ fontSize: "0.8125rem" }}
        >
          {user.name.split(" ")[0]}
        </span>
        <motion.span
          animate={{ rotate: dropdownOpen ? 180 : 0 }}
          transition={{ duration: 0.22, ease: EASE }}
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
            onSignOut={signOut}
            isSigningOut={isSigningOut}
          />
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
        style={{ border: "1.5px solid rgba(10,45,135,0.08)" }}
      >
        <div
          className="flex items-center gap-3 px-3.5 py-3"
          style={{
            background: "linear-gradient(135deg, #0a2d87 0%, #1a52c8 100%)",
          }}
        >
          <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 bg-white/10 rounded-full animate-pulse w-24" />
            <div className="h-2 bg-white/10 rounded-full animate-pulse w-36" />
          </div>
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
        className="w-full flex items-center justify-center gap-2.5 font-bold rounded-2xl py-3.5 transition-all duration-150 active:scale-[0.98] cursor-pointer"
        style={{
          fontSize: "0.875rem",
          color: "white",
          background: "linear-gradient(135deg, #0a2d87 0%, #1a52c8 100%)",
          boxShadow:
            "0 4px 20px rgba(10,45,135,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
          border: "1.5px solid rgba(247,181,0,0.2)",
        }}
      >
        <LogIn className="w-4 h-4 text-white" />
        Masuk / Daftar Akun
      </button>
    );
  }

  const user = session.user as AuthUser;

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        border: expanded
          ? "1.5px solid rgba(26,82,200,0.2)"
          : "1.5px solid rgba(10,45,135,0.09)",
        boxShadow: expanded ? "0 4px 24px rgba(10,45,135,0.1)" : "none",
      }}
    >
      {/* Header row */}
      <button
        onClick={() => setExpanded((o) => !o)}
        className="relative w-full flex items-center gap-2.5 px-3.5 py-3 overflow-hidden cursor-pointer"
        style={{
          background: "linear-gradient(140deg, #060f2e 0%, #0a2d87 100%)",
        }}
        aria-expanded={expanded}
      >
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-[1.5px] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(247,181,0,0.45), transparent)",
            display: expanded ? "block" : "none",
          }}
        />

        <div className="relative flex-shrink-0">
          <UserAvatar user={user} size={32} />
          <div
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-[1.5px]"
            style={{ background: "#22C55E", borderColor: "#060f2e" }}
          />
        </div>

        <div className="flex-1 min-w-0 text-left">
          <p
            className="font-bold text-white truncate leading-tight"
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
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.span>
      </button>

      {/* Expandable grid */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: EASE }}
            style={{ overflow: "hidden", background: "white" }}
          >
            <div className="grid grid-cols-3 px-2 pt-3 pb-1 gap-2">
              {NAV_MENU_ITEMS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="flex flex-col items-center gap-1.5 px-1 py-2.5 rounded-xl transition-all duration-150 active:scale-95"
                    style={{
                      textDecoration: "none",
                      border: "1px solid rgba(10,45,135,0.07)",
                      background: "rgba(248,250,252,0.8)",
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: 0.04 * i,
                        duration: 0.2,
                        ease: EASE,
                      }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{
                        background: item.bg,
                        border: `1px solid ${item.color}18`,
                      }}
                    >
                      <Icon
                        className="w-3.5 h-3.5"
                        style={{ color: item.color }}
                      />
                    </motion.div>
                    <motion.span
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 * i + 0.06, duration: 0.18 }}
                      className="font-semibold text-center leading-tight"
                      style={{ fontSize: "0.5625rem", color: "#475569" }}
                    >
                      {item.shortLabel}
                    </motion.span>
                  </Link>
                );
              })}
            </div>

            <div
              className="px-2 pb-3 pt-2"
              style={{
                borderTop: "1px solid rgba(10,45,135,0.07)",
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
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(239,68,68,0.07)" }}
                >
                  {isSigningOut ? (
                    <Loader2
                      className="w-3.5 h-3.5 animate-spin"
                      style={{ color: "#EF4444" }}
                    />
                  ) : (
                    <LogOut
                      className="w-3.5 h-3.5"
                      style={{ color: "#EF4444" }}
                    />
                  )}
                </div>
                <span
                  className="font-semibold group-hover:text-red-600 transition-colors duration-150"
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
  defaultTab,
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: AuthTab;
}) {
  return (
    <AnimatePresence>
      {isOpen && <AuthModal onClose={onClose} defaultTab={defaultTab} />}
    </AnimatePresence>
  );
}

function SignInButton({ onOpen }: { onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative inline-flex items-center gap-2 font-semibold rounded-xl px-4 py-2 overflow-hidden transition-all duration-200 cursor-pointer"
      style={{
        fontSize: "0.8125rem",
        color: "white",
        background: "linear-gradient(135deg, #0a2d87 0%, #1a52c8 100%)",
        border: "1.5px solid rgba(255,255,255,0.1)",
        boxShadow: hovered
          ? "0 8px 24px rgba(10,45,135,0.35), inset 0 0 0 1px rgba(247,181,0,0.2)"
          : "0 2px 10px rgba(10,45,135,0.22)",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
      }}
    >
      <span>Masuk</span>
      <motion.span
        animate={{ x: hovered ? 2 : 0 }}
        transition={{ duration: 0.18 }}
      >
        <ChevronRight className="w-3.5 h-3.5 opacity-70" />
      </motion.span>
    </button>
  );
}
