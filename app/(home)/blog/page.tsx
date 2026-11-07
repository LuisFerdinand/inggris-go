// app/(home)/blog/page.tsx
import { HydrateClient, trpc } from "@/lib/trpc/server";
import { buildPageMetadata } from "@/lib/seo";
import BlogView from "./_modules/BlogView";
import { POSTS_PER_PAGE } from "./blog-constants";

export const dynamic = "force-dynamic";

export const generateMetadata = () =>
  buildPageMetadata({
    path: "/blog",
    title: "Blog & Pusat Belajar",
    description:
      "Tips speaking, grammar, kosakata, dan motivasi belajar bahasa Inggris untuk anak — artikel gratis dari tim Inggris Go.",
  });

/**
 * The article list is fetched here on the server and handed to the client
 * (same pattern as Beranda). Before, the page rendered with no data and the
 * browser fetched everything afterwards, so the first HTML — and anything that
 * reads it before the fetch finishes — said "0 artikel" and "–+ Artikel
 * Gratis" even with 7 published posts. The inputs below must match the ones
 * BlogView uses, otherwise the client re-fetches instead of reusing them.
 */
export default async function BlogPage() {
  await Promise.all([
    trpc.blog.getPublished.prefetch({
      isFeatured: true,
      sort: "newest",
      limit: 5,
      page: 1,
    }),
    trpc.blog.getPublished.prefetch({
      page: 1,
      limit: POSTS_PER_PAGE,
      sort: "newest",
    }),
    trpc.blog.getPublished.prefetch({ sort: "popular", limit: 4, page: 1 }),
    trpc.blog.getCategories.prefetch(),
    trpc.blog.getTagsPublic.prefetch(),
  ]);

  return (
    <HydrateClient>
      <BlogView />
    </HydrateClient>
  );
}
