// app/(home)/blog/[slug]/page.tsx
import { cache } from "react";
import type { Metadata } from "next";

import { HydrateClient, trpc } from "@/lib/trpc/server";
import { buildPageMetadata } from "@/lib/seo";
import { getPublicCaller } from "@/app/(home)/programs/[categorySlug]/_adapters";
import BlogDetailPage from "./client";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

// One DB read shared by generateMetadata; null for unknown / unpublished posts.
const getPost = cache(async (slug: string) => {
  try {
    const caller = await getPublicCaller();
    return await caller.blog.getBySlug({ slug });
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  // Unknown article: the page renders its own "not found" state.
  if (!post) return {};

  return buildPageMetadata({
    path: `/blog/${post.slug}`,
    title: post.title,
    description: post.excerpt ?? undefined,
    image: post.coverImage,
    type: "article",
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  // Ship the article in the first HTML (readable by search engines and shown
  // instantly) — the client view reuses this exact query.
  await trpc.blog.getBySlug.prefetch({ slug });

  return (
    <HydrateClient>
      <BlogDetailPage params={params} />
    </HydrateClient>
  );
}
