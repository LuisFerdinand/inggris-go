"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Bell,
  BookOpen,
  CheckCheck,
  ClipboardList,
  Clock,
  CreditCard,
  GraduationCap,
  Hourglass,
  Home,
  KanbanSquare,
  Library,
  Loader2,
  LogOut,
  MessageCircle,
  Settings,
  ShoppingCart,
  UserPlus,
  XCircle,
  ShieldCheck,
  Undo2,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/react";
import { ROLE_LABELS, canAccessPath, getDashboardHome } from "@/lib/auth/permissions";
import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { signOut, useSession } from "next-auth/react";
import { Skeleton } from "../ui/skeleton";

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/* ─── Avatar ─────────────────────────────────────────────────── */
function HeaderAvatar({
  src,
  name,
  size = 30,
}: {
  src: string;
  name: string;
  size?: number;
}) {
  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-lg object-cover"
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className="rounded-lg flex items-center justify-center font-semibold text-white bg-slate-700"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {getInitials(name)}
    </div>
  );
}

type NotificationItem = RouterOutputs["notifications"]["list"][number];
type NotificationCategory = NotificationItem["category"];

// Category owns the color family (task vs order must read as different at a
// glance); the specific `type` within that category picks the icon shape.
const CATEGORY_STYLE: Record<NotificationCategory, { bg: string; color: string }> = {
  task: { bg: "bg-indigo-50", color: "text-indigo-600" },
  order: { bg: "bg-emerald-50", color: "text-emerald-600" },
  class: { bg: "bg-purple-50", color: "text-purple-600" },
};

const CATEGORY_FALLBACK_ICON: Record<NotificationCategory, React.ElementType> = {
  task: KanbanSquare,
  order: ShoppingCart,
  class: GraduationCap,
};

const TYPE_ICON: Record<string, React.ElementType> = {
  task_pending_review: Hourglass,
  task_assigned: ClipboardList,
  task_verified: CheckCheck,
  task_rejected: XCircle,
  task_done: CheckCheck,
  task_comment: MessageCircle,
  order_new: UserPlus,
  order_paid: CreditCard,
  class_assigned: GraduationCap,
  score_pending_review: Clock,
  score_approved: ShieldCheck,
  score_rejected: XCircle,
};

function NotifIconBox({
  category,
  type,
}: {
  category: NotificationCategory;
  type: string;
}) {
  const style = CATEGORY_STYLE[category];
  const Icon = TYPE_ICON[type] ?? CATEGORY_FALLBACK_ICON[category];

  return (
    <div
      className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
        style.bg,
      )}
    >
      <Icon className={cn("w-4 h-4", style.color)} />
    </div>
  );
}

function formatRelativeTime(date: Date | string) {
  const d = new Date(date);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return "Kemarin";
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

/* ─── Notification Popover ───────────────────────────────────── */
function NotificationBell() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const listQuery = trpc.notifications.list.useQuery(
    { limit: 20 },
    { refetchInterval: 30000 },
  );
  const unreadCountQuery = trpc.notifications.unreadCount.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const notifications = listQuery.data ?? [];
  const unreadCount = unreadCountQuery.data ?? 0;

  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      void utils.notifications.list.invalidate();
      void utils.notifications.unreadCount.invalidate();
    },
  });

  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      void utils.notifications.list.invalidate();
      void utils.notifications.unreadCount.invalidate();
    },
  });

  function handleNotificationClick(n: NotificationItem) {
    if (!n.isRead) markRead.mutate({ id: n.id });
    if (n.link) router.push(n.link);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "relative h-8 w-8 rounded-lg flex items-center justify-center",
            "text-muted-foreground hover:text-foreground hover:bg-muted",
            "transition-colors duration-150",
          )}
          aria-label="Notifikasi"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[340px] p-0 rounded-xl border border-border/60 shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">Notifikasi</p>
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="h-5 px-1.5 text-xs bg-red-50 text-red-600 border-red-100"
              >
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              Tandai semua dibaca
            </button>
          )}
        </div>

        {/* List */}
        <div className="divide-y divide-border/40 max-h-[360px] overflow-y-auto">
          {listQuery.isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/50" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                Belum ada notifikasi
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-3 text-left",
                  "hover:bg-muted/50 transition-colors duration-100",
                  !n.isRead && "bg-blue-50/40",
                )}
              >
                <NotifIconBox category={n.category} type={n.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-xs leading-snug",
                        n.isRead
                          ? "font-normal text-foreground"
                          : "font-semibold text-foreground",
                      )}
                    >
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                    )}
                  </div>
                  {n.body && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                      {n.body}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {formatRelativeTime(n.createdAt)}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ─── User Nav Dropdown ──────────────────────────────────────── */
function UserNav() {
  const { data: session, status } = useSession();

  const [isSigningOut, setIsSigningOut] = useState(false);

  const isPending = status === "loading";

  if (isPending) return <UserNavSkeleton />;

  if (!session?.user) {
    return (
      <Link
        href="/"
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 h-8",
          "text-xs font-medium text-muted-foreground",
          "hover:bg-muted hover:text-foreground transition-colors duration-150",
        )}
      >
        Masuk
      </Link>
    );
  }

  const user = session.user;

  const avatarSrc =
    user.image ?? `https://avatar.vercel.sh/${user.email || "user"}`;

  const NAV_ITEMS = [
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
      icon: Settings,
      label: "Pengaturan",
      desc: "Preferensi akun",
      href: "/dashboard/settings",
    },
  ] as const;

  async function handleSignOut() {
    setIsSigningOut(true);

    await signOut({
      callbackUrl: "/",
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 rounded-lg px-2 h-8",
            "hover:bg-muted transition-colors duration-150",
          )}
        >
          <HeaderAvatar src={avatarSrc} name={user.name ?? "User"} size={24} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 p-0 rounded-xl border border-border/60 shadow-lg overflow-hidden"
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-3 px-4 py-3.5 bg-muted/40 border-b border-border/60">
            <HeaderAvatar
              src={avatarSrc}
              name={user.name ?? "User"}
              size={36}
            />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user.name ?? "User"}
              </p>

              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuGroup className="p-1.5">
          {NAV_ITEMS.map(({ icon: Icon, label, desc, href }) => (
            <DropdownMenuItem
              key={href}
              asChild
              className="rounded-lg px-3 py-2 cursor-pointer"
            >
              <Link href={href}>
                <div className="flex items-center gap-2.5 w-full">
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">
                      {label}
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      {desc}
                    </p>
                  </div>
                </div>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-0" />

        <div className="p-1.5">
          <DropdownMenuItem
            asChild
            className="rounded-lg px-3 py-2 cursor-pointer"
          >
            <Link href="/">
              <div className="flex items-center gap-2.5 w-full">
                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Home className="w-3.5 h-3.5 text-muted-foreground" />
                </div>

                <p className="text-xs font-semibold text-foreground">
                  Kembali ke Beranda
                </p>
              </div>
            </Link>
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator className="my-0" />

        <div className="p-1.5">
          <DropdownMenuItem
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="rounded-lg px-3 py-2 cursor-pointer focus:bg-red-50 group"
          >
            <div className="flex items-center gap-2.5 w-full">
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                {isSigningOut ? (
                  <Loader2 className="w-3.5 h-3.5 text-red-500 animate-spin" />
                ) : (
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                )}
              </div>

              <p className="text-xs font-semibold text-red-500">
                {isSigningOut ? "Keluar..." : "Keluar dari akun"}
              </p>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-slate-100",
        className,
      )}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}

function UserNavSkeleton() {
  return (
    <div
      className="flex items-center gap-2 px-2 h-8"
      aria-label="Memuat profil"
    >
      {/* Avatar placeholder */}
      <Shimmer className="h-6 w-6 rounded-lg shrink-0" />
    </div>
  );
}

/* ─── Role preview banner ─────────────────────────────────────── */
function RolePreviewBanner() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSwitching, setIsSwitching] = useState(false);

  if (!session?.user?.canSwitchRole) return null;

  const activeRole = session.user.role;
  const realRole = session.user.realRole ?? activeRole;

  if (activeRole === realRole) return null;

  async function handleReturn() {
    setIsSwitching(true);

    try {
      await update({ activeRole: realRole });
      router.refresh();

      if (!canAccessPath(pathname, realRole)) {
        router.replace(getDashboardHome(realRole));
      }
    } finally {
      setIsSwitching(false);
    }
  }

  return (
    <div
      className="flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium"
      style={{
        background:
          "linear-gradient(90deg, rgba(245,158,11,0.12), rgba(245,158,11,0.18), rgba(245,158,11,0.12))",
        color: "#92400e",
      }}
    >
      <ShieldCheck className="size-3.5 shrink-0" />
      <span>
        Melihat sebagai <strong>{ROLE_LABELS[activeRole]}</strong> — tampilan
        pratinjau, tidak mengubah role di database.
      </span>
      <button
        type="button"
        onClick={handleReturn}
        disabled={isSwitching}
        className="ml-1 inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-0.5 font-semibold hover:bg-white transition-colors duration-150 disabled:opacity-60 cursor-pointer"
      >
        {isSwitching ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Undo2 className="size-3" />
        )}
        Kembali ke {ROLE_LABELS[realRole]}
      </button>
    </div>
  );
}

export function AppHeader() {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full",
        "border-b border-border/60",
        "bg-white",
        "transition-all duration-200",
      )}
    >
      <RolePreviewBanner />

      <div className="flex h-(--header-height) items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <SidebarTrigger className="shrink-0" />

          {/* TRUE CENTERED SEPARATOR */}
          <div className="flex h-6 items-center">
            <Separator orientation="vertical" className="h-full" />
          </div>

          {/* CONTENT (Breadcrumb / Title) */}
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-semibold">InggrisGo</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <NotificationBell />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
