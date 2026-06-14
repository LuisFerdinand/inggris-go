// app/(dashboard)/dashboard/blog/comments/_modules/CommentsView.tsx
"use client";

import { FileText, MessageSquare } from "lucide-react";

import { PageNav, PageHeader } from "@/components/PageHeader";

import { CommentsManager } from "./CommentsManager";

export function CommentsView() {
  return (
    <div className="flex flex-col gap-y-5 pt-2.5">
      <PageNav sticky>
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Blog", href: "/dashboard/blog", icon: <FileText /> },
            { label: "Komentar", icon: <MessageSquare /> },
          ]}
          title="Moderasi Komentar"
          description="Tinjau, setujui, atau hapus komentar dari pembaca blog."
        />
      </PageNav>

      <CommentsManager />
    </div>
  );
}