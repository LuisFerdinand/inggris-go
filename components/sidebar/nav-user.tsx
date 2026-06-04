"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CreditCard,
  HelpCircle,
  Home,
  Library,
  Loader2,
  LogOut,
  Settings,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { BRAND } from "@/constants/brand";
import { signOut, useSession } from "next-auth/react";

/* ─── Constants ─────────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  isPro?: boolean;
}

/* ─── Helpers ────────────────────────────────────────────────── */
function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/* ─── Avatar ─────────────────────────────────────────────────── */
function DashboardAvatar({
  src,
  name,
  size = 34,
  showBadge = false,
}: {
  src: string;
  name: string;
  size?: number;
  showBadge?: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      {src && !imgError ? (
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          className="rounded-xl object-cover"
          style={{ width: size, height: size }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="rounded-xl flex items-center justify-center font-bold text-white"
          style={{
            width: size,
            height: size,
            fontSize: size * 0.34,
            background: `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.blueNavy} 100%)`,
          }}
        >
          {getInitials(name)}
        </div>
      )}
      {showBadge && (
        <div
          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center border-2"
          style={{
            background: "linear-gradient(135deg, #f7b500, #ffc107)",
            borderColor: "white",
          }}
        >
          <Star className="w-2 h-2 fill-white text-white" />
        </div>
      )}
    </div>
  );
}

/* ─── Menu Item Row ──────────────────────────────────────────── */
function DropdownRow({
  icon: Icon,
  label,
  desc,
  href,
  danger = false,
  onClick,
  badge,
  isLoading = false,
}: {
  icon: React.ElementType;
  label: string;
  desc?: string;
  href?: string;
  danger?: boolean;
  onClick?: () => void;
  badge?: React.ReactNode;
  isLoading?: boolean;
}) {
  const content = (
    <div className="flex items-center gap-2.5 w-full py-0.5">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-150"
        style={{
          background: danger ? "rgba(239,68,68,0.07)" : "rgba(10,45,135,0.06)",
        }}
      >
        {isLoading ? (
          <Loader2
            className="w-3.5 h-3.5 animate-spin"
            style={{ color: danger ? "#EF4444" : "#64748B" }}
          />
        ) : (
          <Icon
            className="w-3.5 h-3.5"
            style={{ color: danger ? "#EF4444" : "#64748B" }}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold leading-tight"
          style={{
            fontSize: "0.8125rem",
            color: danger ? "#EF4444" : "#0f172a",
          }}
        >
          {label}
        </p>
        {desc && (
          <p
            style={{
              fontSize: "0.625rem",
              color: "#94A3B8",
              lineHeight: "1.4",
            }}
          >
            {desc}
          </p>
        )}
      </div>
      {badge && <div className="flex-shrink-0">{badge}</div>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none", display: "block" }}>
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left"
      style={{ background: "none", border: "none", padding: 0 }}
    >
      {content}
    </button>
  );
}

/* ─── Main: DashboardNavUser ─────────────────────────────────── */
export function DashboardNavUser() {
  const { isMobile, state } = useSidebar();

  const { data: session, status } = useSession();

  const [isSigningOut, setIsSigningOut] = useState(false);

  const isCollapsed = state === "collapsed" && !isMobile;
  const isPending = status === "loading";

  if (isPending) {
    return null;
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;

  const avatarSrc =
    user.image ?? `https://avatar.vercel.sh/${user.email || "User"}`;

  async function handleSignOut() {
    setIsSigningOut(true);

    await signOut({
      callbackUrl: "/",
    });
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="group relative overflow-hidden transition-all duration-200 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              style={{
                background: "transparent",
                border: "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(10,45,135,0.06)";
                e.currentTarget.style.border = "1px solid rgba(10,45,135,0.08)";
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.dataset.state) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.border = "1px solid transparent";
                }
              }}
            >
              {isCollapsed ? (
                <DashboardAvatar
                  src={avatarSrc}
                  name={user.name || "User"}
                  size={28}
                />
              ) : (
                <>
                  <DashboardAvatar
                    src={avatarSrc}
                    name={user.name || "User"}
                    size={34}
                  />

                  <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="truncate font-semibold"
                        style={{ fontSize: "0.8125rem", color: "#0f172a" }}
                      >
                        {user.name ?? "User"}
                      </span>
                    </div>

                    <span
                      className="truncate"
                      style={{ fontSize: "0.6875rem", color: "#64748B" }}
                    >
                      {user.email}
                    </span>
                  </div>

                  <ChevronDown className="ml-auto size-3.5 opacity-40 shrink-0" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="rounded-2xl overflow-hidden p-0"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
            style={{
              width: "270px",
              border: "1px solid rgba(10,45,135,0.1)",
              boxShadow:
                "0 20px 60px rgba(10,45,135,0.16), 0 4px 16px rgba(10,45,135,0.06)",
              background: "white",
            }}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div
                className="relative px-4 py-4 overflow-hidden"
                style={{
                  background:
                    "linear-gradient(140deg, #060f2e 0%, #0a2d87 60%, #1a52c8 100%)",
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
                    backgroundSize: "14px 14px",
                  }}
                />

                <div
                  className="absolute bottom-0 left-0 right-0 h-[1.5px] pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(247,181,0,0.55), transparent)",
                  }}
                />

                <div
                  className="absolute -top-10 -right-10 w-32 h-32 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(247,181,0,0.15), transparent 65%)",
                  }}
                />

                <div className="relative flex items-center gap-3">
                  <DashboardAvatar
                    src={avatarSrc}
                    name={user.name || "User"}
                    size={42}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p
                        className="font-bold text-white truncate"
                        style={{
                          fontSize: "0.9375rem",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {user.name ?? "User"}
                      </p>
                    </div>

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
            </DropdownMenuLabel>

            <DropdownMenuGroup className="px-2 py-1 space-y-0.5">
              {[
                {
                  icon: BadgeCheck,
                  label: "Akun Saya",
                  desc: "Kelola profil & keamanan",
                  href: "/dashboard/settings/account",
                },
                {
                  icon: BookOpen,
                  label: "Program Saya",
                  desc: "Riwayat program saya",
                  href: "/dashboard/program-saya",
                },
                {
                  icon: Library,
                  label: "Koleksi Saya",
                  desc: "Koleksi artikel saya",
                  href: "/dashboard/koleksi",
                },
                {
                  icon: Bell,
                  label: "Notifikasi",
                  desc: "Kelola pemberitahuan",
                  href: "/dashboard/settings/notifications",
                },
              ].map(({ icon: Icon, label, desc, href }) => (
                <DropdownMenuItem
                  key={href}
                  asChild
                  className="cursor-pointer rounded-xl px-3 py-2 transition-all duration-150 focus:bg-blue-50/60"
                  style={{ outline: "none" }}
                >
                  <Link href={href} style={{ textDecoration: "none" }}>
                    <div className="flex items-center gap-2.5 w-full">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(10,45,135,0.06)" }}
                      >
                        <Icon
                          className="w-3.5 h-3.5"
                          style={{ color: "#64748B" }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className="font-semibold leading-tight"
                          style={{ fontSize: "0.8125rem", color: "#0f172a" }}
                        >
                          {label}
                        </p>

                        <p style={{ fontSize: "0.625rem", color: "#94A3B8" }}>
                          {desc}
                        </p>
                      </div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator
              style={{ margin: "4px 0", background: "rgba(10,45,135,0.07)" }}
            />

            <div className="px-2 pb-1">
              <DropdownMenuItem
                asChild
                className="cursor-pointer rounded-xl px-3 py-2 transition-all duration-150 focus:bg-blue-50/60"
              >
                <Link href="/" style={{ textDecoration: "none" }}>
                  <div className="flex items-center gap-2.5 w-full">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(10,45,135,0.06)" }}
                    >
                      <Home
                        className="w-3.5 h-3.5"
                        style={{ color: "#64748B" }}
                      />
                    </div>

                    <p
                      className="font-semibold"
                      style={{ fontSize: "0.8125rem", color: "#0f172a" }}
                    >
                      Kembali ke Beranda
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator
              style={{ margin: "4px 0", background: "rgba(10,45,135,0.07)" }}
            />

            <div className="px-2 pb-2">
              <DropdownMenuItem
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="cursor-pointer rounded-xl px-3 py-2 transition-all duration-150 focus:bg-red-50 group"
                style={{ outline: "none" }}
              >
                <div className="flex items-center gap-2.5 w-full">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors duration-150"
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

                  <p
                    className="font-semibold group-hover:text-red-600 transition-colors duration-150"
                    style={{ fontSize: "0.8125rem", color: "#EF4444" }}
                  >
                    {isSigningOut ? "Keluar..." : "Keluar dari akun"}
                  </p>
                </div>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
