// app/(dashboard)/dashboard/blog/new/page.tsx
"use client";

import { FileText, Plus } from "lucide-react";

import { PageNav, PageHeader } from "@/components/PageHeader";
import { BlogPostForm } from "../_modules/BlogPostForm";

export default function NewBlogPostPage() {
  return (
    <div className="flex flex-col gap-y-5 pt-2.5">
      <PageNav sticky>
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Blog", href: "/dashboard/blog", icon: <FileText /> },
            { label: "Artikel Baru", icon: <Plus /> },
          ]}
          title="Artikel Baru"
          description="Tulis dan terbitkan artikel baru untuk blog."
        />
      </PageNav>

      <div className="px-4 pb-8">
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <BlogPostForm mode="create" />
        </div>
      </div>
    </div>
  );
}