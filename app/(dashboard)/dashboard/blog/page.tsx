// app/(dashboard)/dashboard/blog/page.tsx
import { BlogView } from "./_modules/BlogView";

export const dynamic = "force-dynamic";

export default function BlogPage() {
  return <BlogView />;
}