// app/(dashboard)/dashboard/blog/[id]/page.tsx
"use client";

import { use } from "react";
import { FileText, Pencil, Loader2, AlertCircle } from "lucide-react";

import { PageNav, PageHeader } from "@/components/PageHeader";
import { trpc } from "@/lib/trpc/client";
import { BlogPostForm } from "../_modules/BlogPostForm";

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

function EditBlogPostContent({ id }: { id: string }) {
  const { data: post, isLoading, error } = trpc.blog.getById.useQuery({ id });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-neutral-400">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center py-24 text-center text-neutral-400">
        <AlertCircle className="mb-3 size-8 text-red-400" />
        <p className="text-[13px] font-semibold text-neutral-600">
          Artikel tidak ditemukan
        </p>
        <p className="mt-1 text-[12px]">
          ID: <span className="font-mono">{id}</span>
        </p>
      </div>
    );
  }

  return (
    <BlogPostForm
      mode="edit"
      postId={post.id}
      defaultValues={{
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? "",
        contentHtml: post.contentHtml ?? "",
        coverImage: post.coverImage ?? "",
        coverImageLayout:
          (post.coverImageLayout as "cover" | "auto" | "custom") ?? "cover",
        coverImageHeight: post.coverImageHeight ?? undefined,
        status: (post.status as "draft" | "published" | "archived") ?? "draft",
        readTime: post.readTime ?? undefined,
        authorId: post.authorId,
        tagIds: post.tags.map((t) => t.id),
        publishedAt: post.publishedAt
          ? new Date(post.publishedAt).toISOString().split("T")[0]
          : undefined,
      }}
    />
  );
}

export default function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = use(params);

  return (
    <div className="flex flex-col gap-y-5 pt-2.5">
      <PageNav sticky>
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Blog", href: "/dashboard/blog", icon: <FileText /> },
            { label: "Edit Artikel", icon: <Pencil /> },
          ]}
          title="Edit Artikel"
          description="Perbarui konten, status, dan metadata artikel."
        />
      </PageNav>

      <div className="px-4 pb-8">
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <EditBlogPostContent id={id} />
        </div>
      </div>
    </div>
  );
}