"use client";

import Link from "next/link";
import { LayoutDashboard, LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { navIconClass, navItemClass } from "./nav-styles";

export type MainNavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  isActive?: boolean;
};

export function NavMain({ items }: { items: MainNavItem[] }) {
  return (
    <SidebarGroup className="px-2 pt-2 pb-0.5">
      <SidebarMenu className="gap-0.5">
        {items.map((item) => {
          const Icon = item.icon ?? LayoutDashboard;
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={item.isActive}
                className={navItemClass(item.isActive)}
              >
                <Link href={item.href}>
                  <Icon className={navIconClass(item.isActive)} />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
