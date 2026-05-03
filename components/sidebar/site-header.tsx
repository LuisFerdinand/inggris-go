"use client";

import * as React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  rightSlot?: React.ReactNode;
};

export function SiteHeader({
  title = "Dashboard",
  breadcrumbs,
  rightSlot,
}: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full",
        "border-b border-border/60",
        "bg-white",
        "transition-all duration-200",
      )}
    >
      <div className="flex h-(--header-height) items-center justify-between px-4 lg:px-6">
        {/* LEFT */}
        <div className="flex items-center gap-3 min-w-0">
          <SidebarTrigger className="shrink-0" />

          {/* TRUE CENTERED SEPARATOR */}
          <div className="flex h-6 items-center">
            <Separator orientation="vertical" className="h-full" />
          </div>

          {/* CONTENT (Breadcrumb / Title) */}
          <div className="flex min-w-0 flex-col">
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <Breadcrumb>
                <BreadcrumbList className="flex items-center gap-1 text-sm">
                  {breadcrumbs.map((item, i) => (
                    <React.Fragment key={i}>
                      <BreadcrumbItem>
                        {i === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage className="font-medium text-foreground">
                            {item.label}
                          </BreadcrumbPage>
                        ) : (
                          <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                            {item.label}
                          </span>
                        )}
                      </BreadcrumbItem>

                      {i < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            ) : (
              <h1 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
                {title}
              </h1>
            )}
          </div>
        </div>

        {/* RIGHT (actions slot) */}
        <div className="flex items-center gap-2">{rightSlot}</div>
      </div>
    </header>
  );
}
