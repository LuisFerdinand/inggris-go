// app/(dashboard)/dashboard/teaching/classes/[classId]/page.tsx
import { ClassDetailView } from "./_modules/ClassDetailView";

export const dynamic = "force-dynamic";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  return <ClassDetailView classId={classId} />;
}
