import React from "react";
import { AppSidebar } from "@/components/sidebar/app-sidebar";

import { SiteHeader } from "@/components/sidebar/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/sidebar/app-header";
import { requireSession } from "@/lib/auth/guards";
export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireSession();
  return (
    <>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <AppHeader></AppHeader>
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col ">{children}</div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
