"use client";

import * as React from "react";
import Image from "next/image";
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function AppBrand() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div
          className={cn(
            "flex items-center transition-all duration-200",
            isCollapsed
              ? "justify-center px-2 py-2"
              : "justify-start gap-2.5 px-3 py-2",
          )}
          aria-label="InggrisGo"
        >
          {/* Logo */}
          <Image
            src="/logo.png"
            alt="InggrisGo"
            width={isCollapsed ? 32 : 30}
            height={isCollapsed ? 32 : 30}
            priority
            className="object-contain flex-shrink-0"
          />

          {/* Text (only when expanded) */}
          {!isCollapsed && (
            <div className="flex flex-col leading-tight animate-fade-in">
              <span className="text-sm font-bold tracking-tight text-slate-800 ">
                InggrisGo
              </span>
              <span className="text-[11px] text-slate-500 ">Learn smarter</span>
            </div>
          )}
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
