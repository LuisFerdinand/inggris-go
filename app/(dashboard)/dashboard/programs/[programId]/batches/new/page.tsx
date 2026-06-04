// app/(dashboard)/dashboard/programs/[programId]/batches/new/page.tsx
import { redirect } from "next/navigation";

export default async function BatchCreatePage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  redirect(`/dashboard/programs/${programId}?tab=commerce&drawer=batch-new`);
}
