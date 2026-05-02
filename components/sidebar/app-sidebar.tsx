"use client";

import * as React from "react";

import { MainNavItem, NavMain } from "@/components/sidebar/nav-main";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  TerminalSquareIcon,
  BotIcon,
  BookOpenIcon,
  Settings2Icon,
  FrameIcon,
  PieChartIcon,
  MapIcon,
  LayoutDashboard,
  BookOpen,
  Settings2,
  CreditCard,
  ShoppingCart,
  Users,
  FileText,
} from "lucide-react";
import { AppBrand } from "./app-brand";
import { DashboardNavUser } from "./nav-user";
import { usePathname } from "next/navigation";
import { GroupNavItem, NavGroups } from "./nav-group";
import { NavProject } from "./nav-projects";

export const routes = {
  dashboard: "/dashboard",
  programs: {
    root: "/dashboard/programs",
    create: "/dashboard/programs/create",
    detail: (id: string) => `/dashboard/programs/${id}`,
    edit: (id: string) => `/dashboard/programs/${id}/edit`,
    categories: "/dashboard/programs/categories",
  },
  users: { root: "/dashboard/users" },
  orders: { root: "/dashboard/orders" },
  payments: { root: "/dashboard/payments" },
  blog: {
    root: "/dashboard/blog",
    create: "/dashboard/blog/create",
    categories: "/dashboard/blog/categories",
    tags: "/dashboard/blog/tags",
    playlists: "/dashboard/blog/playlists",
  },
};

function isActive(pathname: string, url: string) {
  if (url === "/dashboard") return pathname === "/dashboard";
  return pathname === url || pathname.startsWith(url + "/");
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const mainItems: MainNavItem[] = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      isActive: isActive(pathname, "/dashboard"),
    },
  ];
  const contentItems: GroupNavItem[] = [
    {
      title: "Program",
      icon: BookOpen,
      isActive:
        isActive(pathname, routes.programs.root) ||
        isActive(pathname, routes.programs.categories),
      items: [
        {
          title: "Semua Program",
          url: routes.programs.root,
          isActive:
            pathname === routes.programs.root ||
            // detail/create pages — but NOT categories
            (pathname.startsWith(routes.programs.root + "/") &&
              !pathname.startsWith(routes.programs.categories)),
        },
        {
          title: "Kategori",
          url: routes.programs.categories,
          isActive: isActive(pathname, routes.programs.categories),
        },
      ],
    },
    {
      title: "Blog",
      icon: FileText,
      isActive:
        isActive(pathname, routes.blog.root) ||
        isActive(pathname, routes.blog.categories) ||
        isActive(pathname, routes.blog.tags),
      items: [
        {
          title: "Semua Post",
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

  const operationalItems: GroupNavItem[] = [
    {
      title: "Pengguna",
      icon: Users,
      url: routes.users.root,
      isActive: isActive(pathname, routes.users.root),
    },
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
  ];
  const recentPrograms = [
    {
      name: "IELTS Mastery",
      url: routes.programs.detail("1"),
      updatedAt: "2j lalu",
    },
    {
      name: "TOEFL Intensive",
      url: routes.programs.detail("2"),
      updatedAt: "5j lalu",
    },
    {
      name: "TOEIC Preparation",
      url: routes.programs.detail("3"),
      updatedAt: "1h lalu",
    },
    {
      name: "SAT Advanced",
      url: routes.programs.detail("4"),
      updatedAt: "2h lalu",
    },
    {
      name: "GRE Complete",
      url: routes.programs.detail("5"),
      updatedAt: "kemarin",
    },
  ];
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppBrand />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={mainItems} />{" "}
        <NavGroups items={contentItems} label="Konten" />
        <NavGroups items={operationalItems} label="Operasional" />
        <NavProject items={recentPrograms}></NavProject>
      </SidebarContent>
      <SidebarFooter>
        <DashboardNavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
