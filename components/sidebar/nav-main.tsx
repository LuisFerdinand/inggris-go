"use client";

import Link from "next/link";
import { LayoutDashboard, LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export type MainNavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  isActive?: boolean;
};

export function NavMain({ items }: { items: MainNavItem[] }) {
  return (
    <SidebarGroup className="px-2 pt-2 pb-1">
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon ?? LayoutDashboard;
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={item.isActive}
                className={[
                  "relative h-9 rounded-lg text-[0.8125rem] font-medium transition-all duration-150",
                  "hover:bg-[rgba(10,45,135,0.07)] hover:text-[var(--blue-navy)] border rounded-md",
                  item.isActive
                    ? [
                        "bg-[rgba(26,82,200,0.1)] text-[var(--blue)]",
                        "font-semibold",
                        "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
                        "before:h-5 before:w-[3px] before:rounded-r-full",
                        "before:bg-[var(--blue)]",
                        "shadow-[inset_0_0_0_1px_rgba(26,82,200,0.15)]",
                      ].join(" ")
                    : "text-[var(--text-main)]",
                ].join(" ")}
              >
                <Link href={item.href}>
                  <Icon
                    className={[
                      "!size-4 transition-colors",
                      item.isActive
                        ? "text-[var(--blue)]"
                        : "text-[var(--text-main)]",
                    ].join(" ")}
                  />
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
