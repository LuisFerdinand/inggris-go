// components/sidebar/app-sidebar.tsx
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  LayoutDashboard,
  BookOpen,
  ShoppingCart,
  CreditCard,
  Users,
  Newspaper,
  BarChart3,
  Globe2,
  Bookmark,
  KeyRound,
  LayoutTemplate,
  GraduationCap,
  ClipboardList,
  KanbanSquare,
  Wallet,
  Store,
  ClipboardCheck,
  Gauge,
  NotebookPen,
  ShieldCheck,
  Gavel,
  Users2,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { MainNavItem, NavMain } from "@/components/sidebar/nav-main";
import { GroupNavItem, NavGroups } from "./nav-group";

import { AppBrand } from "./app-brand";
import { DashboardNavUser } from "./nav-user";
import { NavProject } from "./nav-projects";
import { NavTeamProjects } from "./nav-team-projects";

import type { Role } from "@/app/db/schema/roles";
import { canUseRole } from "@/lib/auth/permissions";
import { trpc } from "@/lib/trpc/client";

export const routes = {
  dashboard: "/dashboard",

  myPrograms: {
    root: "/dashboard/program-saya",
  },

  koleksi: {
    root: "/dashboard/koleksi",
  },

  teaching: {
    root: "/dashboard/teaching",

    classes: {
      root: "/dashboard/teaching/classes",
      create: "/dashboard/teaching/classes/create",
      approval: "/dashboard/teaching/classes/persetujuan",
      detail: (id: string) => `/dashboard/teaching/classes/${id}`,
    },
  },

  tasks: {
    root: "/dashboard/tasks",
    approval: "/dashboard/tasks/persetujuan",
    directorDecision: "/dashboard/tasks/keputusan-direktur",
    doneApproval: "/dashboard/tasks/persetujuan-done",
    mine: "/dashboard/tasks/tugas-saya",
  },

  projects: {
    root: "/dashboard/projects",
    detail: (id: string) => `/dashboard/projects/${id}`,
  },

  programs: {
    root: "/dashboard/programs",
    create: "/dashboard/programs/create",

    detail: (id: string) => `/dashboard/programs/${id}`,
    edit: (id: string) => `/dashboard/programs/${id}/edit`,

    categories: "/dashboard/programs/categories",
    batches: "/dashboard/program-batches",
    packages: "/dashboard/program-packages",
  },

  users: {
    root: "/dashboard/users",
  },

  students: {
    root: "/dashboard/data-siswa",
  },

  orders: {
    root: "/dashboard/orders",
  },

  analitik: {
    root: "/dashboard/analitik",
  },

  blog: {
    root: "/dashboard/blog",
    create: "/dashboard/blog/new",
  },

  comments: {
    root: "/dashboard/blog/comments",
  },

  settings: {
    account: "/dashboard/settings/account",
    header: "/dashboard/settings/header",
    footer: "/dashboard/settings/footer",
    paymentGateway: "/dashboard/settings/payment-gateway",
    merchantRequests: "/dashboard/settings/merchant-requests",
  },

  merchant: {
    root: "/dashboard/merchant",
  },

  tim: {
    kinerja: "/dashboard/tim/kinerja",
  },

  dailyReport: {
    root: "/dashboard/laporan-harian",
  },
};

function isActive(pathname: string, url: string) {
  if (url === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === url || pathname.startsWith(url + "/");
}

type RoleMainNavItem = MainNavItem & {
  roles: Role[];
};

type RoleGroupNavItem = GroupNavItem & {
  roles: Role[];
};

function filterMainItems(
  items: RoleMainNavItem[],
  activeRole: Role,
): MainNavItem[] {
  return items
    .filter((item) => canUseRole(item.roles, activeRole))
    .map(({ roles: _roles, ...item }) => item);
}

function filterGroupItems(
  items: RoleGroupNavItem[],
  activeRole: Role,
): GroupNavItem[] {
  return items
    .filter((item) => canUseRole(item.roles, activeRole))
    .map(({ roles: _roles, ...item }) => item);
}

function hasItems(items: unknown[]) {
  return items.length > 0;
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const activeRole: Role = session?.user.role ?? "guest";

  const hasTaskBoardAccess = canUseRole(
    ["user", "teacher", "author", "admin", "super_admin"],
    activeRole,
  );
  const canManageProjects = canUseRole(["admin", "super_admin"], activeRole);
  const taskBadgeCounts = trpc.taskBoard.badgeCounts.useQuery(undefined, {
    enabled: hasTaskBoardAccess,
  });

  const mainItems = filterMainItems(
    [
      {
        title: "Dashboard",
        href: routes.dashboard,
        icon: LayoutDashboard,
        isActive: pathname === routes.dashboard,
        roles: ["admin", "super_admin"],
      },
    ],
    activeRole,
  );

  const accountItems = filterGroupItems(
    [
      {
        title: "Program Saya",
        icon: BookOpen,
        url: routes.myPrograms.root,
        isActive: isActive(pathname, routes.myPrograms.root),
        roles: ["user", "student", "teacher", "admin", "super_admin"],
      },
      {
        title: "Koleksi Saya",
        icon: Bookmark,
        url: routes.koleksi.root,
        isActive: isActive(pathname, routes.koleksi.root),
        roles: ["user", "student", "teacher", "author", "admin", "super_admin"],
      },
      {
        title: "Ubah Password",
        icon: KeyRound,
        url: routes.settings.account,
        isActive: isActive(pathname, routes.settings.account),
        roles: ["user", "student", "teacher", "author", "admin", "super_admin"],
      },
    ],
    activeRole,
  );

  const teamItems = filterGroupItems(
    [
      {
        title: "Papan Tugas",
        icon: KanbanSquare,
        url: routes.tasks.root,
        isActive:
          isActive(pathname, routes.tasks.root) &&
          !isActive(pathname, routes.tasks.approval) &&
          !isActive(pathname, routes.tasks.directorDecision) &&
          !isActive(pathname, routes.tasks.doneApproval),
        roles: ["user", "teacher", "author", "admin", "super_admin"],
      },
      {
        title: "Tugas Saya",
        icon: ClipboardList,
        url: routes.tasks.mine,
        isActive: isActive(pathname, routes.tasks.mine),
        roles: ["user", "teacher", "author", "admin", "super_admin"],
      },
      {
        title: "Persetujuan Tugas",
        icon: ShieldCheck,
        url: routes.tasks.approval,
        isActive: isActive(pathname, routes.tasks.approval),
        roles: ["admin", "super_admin"],
        badge: taskBadgeCounts.data?.pendingReview,
      },
      {
        title: "Laporan Harian",
        icon: NotebookPen,
        url: routes.dailyReport.root,
        isActive: isActive(pathname, routes.dailyReport.root),
        roles: ["teacher", "author", "admin", "super_admin"],
      },
      {
        title: "Kinerja Tim",
        icon: Gauge,
        url: routes.tim.kinerja,
        isActive: isActive(pathname, routes.tim.kinerja),
        roles: ["admin", "super_admin"],
      },
    ],
    activeRole,
  );

  const teachingItems = filterGroupItems(
    [
      {
        title: "Dashboard Mengajar",
        icon: GraduationCap,
        url: routes.teaching.root,
        isActive: pathname === routes.teaching.root,
        roles: ["teacher", "author", "admin", "super_admin"],
      },
      {
        title: "Kelas Saya",
        icon: ClipboardList,
        url: routes.teaching.classes.root,
        isActive: isActive(pathname, routes.teaching.classes.root),
        roles: ["teacher", "author", "admin", "super_admin"],
      },
      {
        title: "Persetujuan Nilai",
        icon: ShieldCheck,
        url: routes.teaching.classes.approval,
        isActive: isActive(pathname, routes.teaching.classes.approval),
        roles: ["author", "admin", "super_admin"],
      },
    ],
    activeRole,
  );

  const programItems = filterGroupItems(
    [
      {
        title: "Program",
        icon: BookOpen,
        url: routes.programs.root,
        isActive:
          pathname === routes.programs.root ||
          (pathname.startsWith(routes.programs.root + "/") &&
            !pathname.startsWith(routes.programs.categories)),
        roles: ["admin", "super_admin"],
      },
      {
        title: "Kategori Program",
        url: routes.programs.categories,
        isActive: isActive(pathname, routes.programs.categories),
        roles: ["admin", "super_admin"],
      },
    ],
    activeRole,
  );

  const contentItems = filterGroupItems(
    [
      {
        title: "Blog",
        icon: Newspaper,
        url: routes.blog.root,
        isActive:
          isActive(pathname, routes.blog.root) &&
          !isActive(pathname, routes.comments.root),
        roles: ["author", "admin", "super_admin"],
      },
      {
        title: "Comments",
        icon: CreditCard,
        url: routes.comments.root,
        isActive: isActive(pathname, routes.comments.root),
        roles: ["author", "admin", "super_admin"],
      },
    ],
    activeRole,
  );

  const operationalItems = filterGroupItems(
    [
      {
        title: "Pesanan",
        icon: ShoppingCart,
        url: routes.orders.root,
        isActive: isActive(pathname, routes.orders.root),
        roles: ["admin", "author", "super_admin"],
      },
      {
        title: "Data Siswa",
        icon: Users2,
        url: routes.students.root,
        isActive: isActive(pathname, routes.students.root),
        roles: ["admin", "author", "super_admin"],
      },
    ],
    activeRole,
  );

  const businessItems = filterGroupItems(
    [
      {
        title: "Analitik",
        icon: BarChart3,
        url: routes.analitik.root,
        isActive: isActive(pathname, routes.analitik.root),
        roles: ["admin", "super_admin"],
      },
      {
        title: "Site Header",
        icon: Globe2,
        url: routes.settings.header,
        isActive: isActive(pathname, routes.settings.header),
        roles: ["admin", "super_admin"],
      },
      {
        title: "Footer",
        icon: LayoutTemplate,
        url: routes.settings.footer,
        isActive: isActive(pathname, routes.settings.footer),
        roles: ["admin", "super_admin"],
      },
      {
        title: "Daftar Merchant",
        icon: Store,
        url: routes.merchant.root,
        isActive: isActive(pathname, routes.merchant.root),
        roles: ["super_admin"],
      },
    ],
    activeRole,
  );

  const directorItems = filterGroupItems(
    [
      {
        title: "Pengguna",
        icon: Users,
        url: routes.users.root,
        isActive: isActive(pathname, routes.users.root),
        roles: ["super_admin"],
      },
      {
        title: "Payment Gateway",
        icon: Wallet,
        url: routes.settings.paymentGateway,
        isActive: isActive(pathname, routes.settings.paymentGateway),
        roles: ["super_admin"],
      },
      {
        title: "Permintaan Merchant",
        icon: ClipboardCheck,
        url: routes.settings.merchantRequests,
        isActive: isActive(pathname, routes.settings.merchantRequests),
        roles: ["super_admin"],
      },
      {
        title: "Butuh Keputusan Direktur",
        icon: Gavel,
        url: routes.tasks.directorDecision,
        isActive: isActive(pathname, routes.tasks.directorDecision),
        roles: ["super_admin"],
        badge: taskBadgeCounts.data?.butuhKeputusan,
      },
      {
        title: "Persetujuan Done Direktur",
        icon: ShieldCheck,
        url: routes.tasks.doneApproval,
        isActive: isActive(pathname, routes.tasks.doneApproval),
        roles: ["super_admin"],
        badge: taskBadgeCounts.data?.pendingDoneApproval,
      },
    ],
    activeRole,
  );

  const recentPrograms = [
    {
      name: "IELTS Mastery Bootcamp",
      url: routes.programs.detail("1"),
      updatedAt: "2 jam lalu",
    },
    {
      name: "TOEFL Intensive Class",
      url: routes.programs.detail("2"),
      updatedAt: "5 jam lalu",
    },
    {
      name: "SAT Advanced Preparation",
      url: routes.programs.detail("3"),
      updatedAt: "Kemarin",
    },
  ];

  const showRecentPrograms = canUseRole(["admin", "super_admin"], activeRole);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader
        style={{ borderBottom: "1px solid rgba(10,45,135,0.08)" }}
      >
        <AppBrand />
      </SidebarHeader>

      <SidebarContent className="py-1">
        {hasItems(mainItems) && <NavMain items={mainItems} />}

        {hasItems(accountItems) && (
          <NavGroups label="Akun" items={accountItems} />
        )}

        {hasItems(teamItems) && (
          <NavGroups label="Tim" items={teamItems} />
        )}

        <NavTeamProjects enabled={hasTaskBoardAccess} canCreate={canManageProjects} />

        {hasItems(teachingItems) && (
          <NavGroups label="Pengajaran" items={teachingItems} />
        )}

        {hasItems(programItems) && (
          <NavGroups label="Program CMS" items={programItems} />
        )}

        {hasItems(contentItems) && (
          <NavGroups label="Konten" items={contentItems} />
        )}

        {hasItems(operationalItems) && (
          <NavGroups label="Operasional" items={operationalItems} />
        )}

        {hasItems(businessItems) && (
          <NavGroups label="Bisnis" items={businessItems} />
        )}

        {hasItems(directorItems) && (
          <NavGroups label="Menu Direktur" items={directorItems} />
        )}

        {showRecentPrograms && <NavProject items={recentPrograms} />}
      </SidebarContent>

      <SidebarFooter style={{ borderTop: "1px solid rgba(10,45,135,0.08)" }}>
        <DashboardNavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}