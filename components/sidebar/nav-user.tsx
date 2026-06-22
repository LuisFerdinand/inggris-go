// components/sidebar/nav-user.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

import {
  BadgeCheck,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  Home,
  Loader2,
  LogOut,
  Settings,
  ShieldCheck,
} from "lucide-react";

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
import type { Role } from "@/app/db/schema/roles";
import {
  ROLE_LABELS,
  SWITCHABLE_ROLES,
  canAccessPath,
  getDashboardHome,
} from "@/lib/auth/permissions";

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function DashboardAvatar({
  src,
  name,
  size = 34,
}: {
  src: string;
  name: string;
  size?: number;
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
          className="flex items-center justify-center rounded-xl font-bold text-white"
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
    </div>
  );
}

function RolePreviewSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const { data: session, update } = useSession();
  const [pendingRole, setPendingRole] = useState<Role | null>(null);

  if (!session?.user?.canSwitchRole) {
    return null;
  }

  const activeRole = session.user.role;

  async function handleSwitchRole(nextRole: Role) {
    if (nextRole === activeRole || pendingRole) return;

    setPendingRole(nextRole);

    try {
      await update({
        activeRole: nextRole,
      });

      router.refresh();

      if (!canAccessPath(pathname, nextRole)) {
        router.replace(getDashboardHome(nextRole));
      }
    } finally {
      setPendingRole(null);
    }
  }

  return (
    <>
      <DropdownMenuSeparator
        style={{ margin: "4px 0", background: "rgba(10,45,135,0.07)" }}
      />

      <DropdownMenuLabel className="px-4 py-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-3.5 text-blue-700" />

          <span className="text-[0.7rem] font-bold uppercase tracking-wide text-slate-500">
            Mode Tampilan Role
          </span>
        </div>

        <p className="mt-1 text-[0.68rem] font-normal leading-relaxed text-slate-400">
          Hanya untuk preview dashboard berdasarkan role. Tidak mengubah role di
          database.
        </p>
      </DropdownMenuLabel>

      <DropdownMenuGroup className="space-y-0.5 px-2 py-1">
        {SWITCHABLE_ROLES.map((role) => {
          const isActive = activeRole === role;
          const isPending = pendingRole === role;

          return (
            <DropdownMenuItem
              key={role}
              disabled={!!pendingRole}
              onClick={() => handleSwitchRole(role)}
              className="cursor-pointer rounded-xl px-3 py-2 transition-all duration-150 focus:bg-blue-50/60"
              style={{ outline: "none" }}
            >
              <div className="flex w-full items-center gap-2.5">
                <div
                  className="flex size-7 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: isActive
                      ? "rgba(10,45,135,0.1)"
                      : "rgba(10,45,135,0.06)",
                  }}
                >
                  {isPending ? (
                    <Loader2 className="size-3.5 animate-spin text-blue-700" />
                  ) : isActive ? (
                    <Check className="size-3.5 text-blue-700" />
                  ) : (
                    <ShieldCheck className="size-3.5 text-slate-500" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[0.8125rem] font-semibold leading-tight text-slate-900">
                    {ROLE_LABELS[role]}
                  </p>

                  <p className="text-[0.625rem] text-slate-400">
                    {isActive ? "Sedang digunakan" : "Lihat sebagai role ini"}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuGroup>
    </>
  );
}

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

  const quickLinks = [
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
      icon: Bell,
      label: "Notifikasi",
      desc: "Kelola pemberitahuan",
      href: "/dashboard/settings/notifications",
    },
    {
      icon: Settings,
      label: "Pengaturan",
      desc: "Preferensi akun",
      href: "/dashboard/settings",
    },
  ].filter((item) => canAccessPath(item.href, user.role));

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
              onMouseEnter={(event) => {
                event.currentTarget.style.background = "rgba(10,45,135,0.06)";
                event.currentTarget.style.border =
                  "1px solid rgba(10,45,135,0.08)";
              }}
              onMouseLeave={(event) => {
                if (!event.currentTarget.dataset.state) {
                  event.currentTarget.style.background = "transparent";
                  event.currentTarget.style.border = "1px solid transparent";
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

                  <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="truncate font-semibold"
                        style={{ fontSize: "0.8125rem", color: "#0f172a" }}
                      >
                        {user.name ?? "User"}
                      </span>
                    </div>

                    <div className="flex min-w-0 items-center gap-1.5">
                      <span
                        className="truncate"
                        style={{ fontSize: "0.6875rem", color: "#64748B" }}
                      >
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <ChevronDown className="ml-auto size-3.5 shrink-0 opacity-40" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="overflow-hidden rounded-2xl p-0"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
            style={{
              width: "285px",
              border: "1px solid rgba(10,45,135,0.1)",
              boxShadow:
                "0 20px 60px rgba(10,45,135,0.16), 0 4px 16px rgba(10,45,135,0.06)",
              background: "white",
            }}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div
                className="relative overflow-hidden px-4 py-4"
                style={{
                  background:
                    "linear-gradient(140deg, #060f2e 0%, #0a2d87 60%, #1a52c8 100%)",
                }}
              >
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
                    backgroundSize: "14px 14px",
                  }}
                />

                <div
                  className="pointer-events-none absolute bottom-0 left-0 right-0 h-[1.5px]"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(247,181,0,0.55), transparent)",
                  }}
                />

                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32"
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

                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate font-bold text-white"
                      style={{
                        fontSize: "0.9375rem",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {user.name ?? "User"}
                    </p>

                    <p
                      className="truncate"
                      style={{
                        fontSize: "0.6875rem",
                        color: "rgba(255,255,255,0.55)",
                      }}
                    >
                      {user.email}
                    </p>

                    <div
                      className="mt-2 inline-flex items-center rounded-full px-2 py-0.5"
                      style={{
                        background: "rgba(255,255,255,0.12)",
                        border: "1px solid rgba(255,255,255,0.14)",
                      }}
                    >
                      <span
                        className="text-[0.625rem] font-semibold"
                        style={{ color: "rgba(255,255,255,0.85)" }}
                      >
                        Viewing as {ROLE_LABELS[user.role]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>

            {quickLinks.length > 0 && (
              <DropdownMenuGroup className="space-y-0.5 px-2 py-1">
                {quickLinks.map(({ icon: Icon, label, desc, href }) => (
                  <DropdownMenuItem
                    key={href}
                    asChild
                    className="cursor-pointer rounded-xl px-3 py-2 transition-all duration-150 focus:bg-blue-50/60"
                    style={{ outline: "none" }}
                  >
                    <Link href={href} style={{ textDecoration: "none" }}>
                      <div className="flex w-full items-center gap-2.5">
                        <div
                          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                          style={{ background: "rgba(10,45,135,0.06)" }}
                        >
                          <Icon
                            className="h-3.5 w-3.5"
                            style={{ color: "#64748B" }}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className="font-semibold leading-tight"
                            style={{ fontSize: "0.8125rem", color: "#0f172a" }}
                          >
                            {label}
                          </p>

                          <p
                            style={{ fontSize: "0.625rem", color: "#94A3B8" }}
                          >
                            {desc}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            )}

            <RolePreviewSwitcher />

            <DropdownMenuSeparator
              style={{ margin: "4px 0", background: "rgba(10,45,135,0.07)" }}
            />

            <div className="px-2 pb-1">
              <DropdownMenuItem
                asChild
                className="cursor-pointer rounded-xl px-3 py-2 transition-all duration-150 focus:bg-blue-50/60"
              >
                <Link href="/" style={{ textDecoration: "none" }}>
                  <div className="flex w-full items-center gap-2.5">
                    <div
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ background: "rgba(10,45,135,0.06)" }}
                    >
                      <Home
                        className="h-3.5 w-3.5"
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
                className="group cursor-pointer rounded-xl px-3 py-2 transition-all duration-150 focus:bg-red-50"
                style={{ outline: "none" }}
              >
                <div className="flex w-full items-center gap-2.5">
                  <div
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-150 group-hover:bg-red-100"
                    style={{ background: "rgba(239,68,68,0.07)" }}
                  >
                    {isSigningOut ? (
                      <Loader2
                        className="h-3.5 w-3.5 animate-spin"
                        style={{ color: "#EF4444" }}
                      />
                    ) : (
                      <LogOut
                        className="h-3.5 w-3.5"
                        style={{ color: "#EF4444" }}
                      />
                    )}
                  </div>

                  <p
                    className="font-semibold transition-colors duration-150 group-hover:text-red-600"
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