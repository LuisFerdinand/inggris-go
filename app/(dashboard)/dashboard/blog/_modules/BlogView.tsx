// app/(dashboard)/dashboard/blog/_modules/BlogView.tsx
"use client";

import { useState } from "react";
import { FileText, Pencil, Plus } from "lucide-react";

import { PageNav, PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

import { BlogManager } from "./BlogManager";

export function BlogView() {
  return (
    <div className="flex flex-col gap-y-5 pt-2.5">
      <PageNav sticky>
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Blog", icon: <FileText /> },
          ]}
          title="Manajemen Blog"
          description="Tulis, edit, dan atur semua artikel blog dari satu tempat."
          actions={
            <Button
              size="sm"
              variant="dashboard"
              className="gap-1.5 rounded-lg"
              asChild
            >
              <a href="/dashboard/blog/new">
                <Plus className="size-3.5" />
                Artikel Baru
              </a>
            </Button>
          }
        />
      </PageNav>

      <BlogManager />
    </div>
  );
}