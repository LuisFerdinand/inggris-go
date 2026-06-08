"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  Layers3,
  Package,
  CalendarRange,
  ShoppingCart,
  CreditCard,
  Users,
  FileText,
  Tags,
  FolderTree,
  Newspaper,
  Settings2,
  BarChart3,
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

export const routes = {
  dashboard: "/dashboard",

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

  orders: {
    root: "/dashboard/orders",
  },

  payments: {
    root: "/dashboard/payments",
  },

  analitik: {
    root: "/dashboard/analitik",
  },

  blog: {
    root: "/dashboard/blog",
    create: "/dashboard/blog/create",

    categories: "/dashboard/blog/categories",
    tags: "/dashboard/blog/tags",
    playlists: "/dashboard/blog/playlists",
  },

  settings: {
    root: "/dashboard/settings",
  },
};

function isActive(pathname: string, url: string) {
  if (url === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === url || pathname.startsWith(url + "/");
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const mainItems: MainNavItem[] = [
    {
      title: "Dashboard",
      href: routes.dashboard,
      icon: LayoutDashboard,
      isActive: pathname === routes.dashboard,
    },
  ];

  // =========================================================
  // PROGRAM CMS
  // =========================================================

  const programItems: GroupNavItem[] = [
    {
      title: "Program",
      icon: BookOpen,
      url: routes.programs.root,

      isActive:
        pathname === routes.programs.root ||
        (pathname.startsWith(routes.programs.root + "/") &&
          !pathname.startsWith(routes.programs.categories)),
    },

    {
      title: "Kategori Program",
      url: routes.programs.categories,

      isActive: isActive(pathname, routes.programs.categories),
    },

  ];

  // =========================================================
  // CONTENT CMS
  // =========================================================

  const contentItems: GroupNavItem[] = [
    {
      title: "Blog",
      icon: Newspaper,

      isActive:
        isActive(pathname, routes.blog.root) ||
        isActive(pathname, routes.blog.categories) ||
        isActive(pathname, routes.blog.tags),

      items: [
        {
          title: "Semua Artikel",
          url: routes.blog.root,

          isActive:
            pathname === routes.blog.root ||
            (pathname.startsWith(routes.blog.root + "/") &&
              !pathname.startsWith(routes.blog.categories) &&
              !pathname.startsWith(routes.blog.tags)),
        },

        {
          title: "Kategori",
          url: routes.blog.categories,

          isActive: isActive(pathname, routes.blog.categories),
        },

        {
          title: "Tag",
          url: routes.blog.tags,

          isActive: isActive(pathname, routes.blog.tags),
        },
      ],
    },
  ];

  // =========================================================
  // OPERATIONS
  // =========================================================

  const operationalItems: GroupNavItem[] = [
    {
      title: "Pesanan",
      icon: ShoppingCart,

      url: routes.orders.root,

      isActive: isActive(pathname, routes.orders.root),
    },

    {
      title: "Pembayaran",
      icon: CreditCard,

      url: routes.payments.root,

      isActive: isActive(pathname, routes.payments.root),
    },

    {
      title: "Pengguna",
      icon: Users,

      url: routes.users.root,

      isActive: isActive(pathname, routes.users.root),
    },
  ];

  // =========================================================
  // BUSINESS
  // =========================================================

  const businessItems: GroupNavItem[] = [
    {
      title: "Analitik",
      icon: BarChart3,

      url: routes.analitik.root,

      isActive: isActive(pathname, routes.analitik.root),
    },

    {
      title: "Pengaturan",
      icon: Settings2,

      url: routes.settings.root,

      isActive: isActive(pathname, routes.settings.root),
    },
  ];

  // =========================================================
  // RECENT PROGRAMS
  // =========================================================

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

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppBrand />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainItems} />

        <NavGroups label="Program CMS" items={programItems} />

        <NavGroups label="Konten" items={contentItems} />

        <NavGroups label="Operasional" items={operationalItems} />

        <NavGroups label="Bisnis" items={businessItems} />

        <NavProject items={recentPrograms} />
      </SidebarContent>

      <SidebarFooter>
        <DashboardNavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
