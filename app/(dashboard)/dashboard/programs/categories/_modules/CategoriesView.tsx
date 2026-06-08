// app/(dashboard)/dashboard/programs/categories/_modules/CategoriesView.tsx
"use client";

import { useState } from "react";
import { BookOpen, Plus, Tags } from "lucide-react";

import { PageNav, PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

import { CategoriesManager } from "./CategoriesManager";
import { CategoryFormDrawer } from "./CategoryFormDrawer";

/** null = closed · "new" = create · string = edit that category id */
export type CategoryDrawerState = null | "new" | string;

export function CategoriesView() {
  const [drawer, setDrawer] = useState<CategoryDrawerState>(null);

  return (
    <div className="flex flex-col gap-y-5 pt-2.5">
      <PageNav sticky>
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Program", href: "/dashboard/programs", icon: <BookOpen /> },
            { label: "Kategori", icon: <Tags /> },
          ]}
          title="Manajemen Kategori"
          description="Kelola kategori program seperti Online, Offline, dan Leads."
          actions={
            <Button
              size="sm"
              variant="dashboard"
              className="gap-1.5 rounded-lg"
              onClick={() => setDrawer("new")}
            >
              <Plus className="size-3.5" />
              Kategori Baru
            </Button>
          }
        />
      </PageNav>

      <CategoriesManager onEdit={(id) => setDrawer(id)} />

      <CategoryFormDrawer
        state={drawer}
        onClose={() => setDrawer(null)}
      />
    </div>
  );
}