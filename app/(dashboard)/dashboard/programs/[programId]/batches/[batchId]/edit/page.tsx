// app/(dashboard)/dashboard/programs/[programId]/batches/[batchId]/edit/page.tsx
import { redirect } from "next/navigation";

export default async function BatchEditPage({
  params,
}: {
  params: Promise<{ programId: string; batchId: string }>;
}) {
  const { programId, batchId } = await params;
  redirect(`/dashboard/programs/${programId}?tab=commerce&drawer=batch-edit&batchId=${batchId}`);
}
