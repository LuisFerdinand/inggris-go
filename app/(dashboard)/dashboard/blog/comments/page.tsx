// app/(dashboard)/dashboard/blog/comments/page.tsx
import { CommentsView } from "./_modules/CommentsView";

export const dynamic = "force-dynamic";

export default function BlogCommentsPage() {
  return <CommentsView />;
}