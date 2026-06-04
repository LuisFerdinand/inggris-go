// app/(dashboard)/dashboard/programs/[programId]/packages/new/page.tsx
import { redirect } from "next/navigation";

export default async function PackageCreatePage({
  params,
  searchParams,
}: {
  params: Promise<{ programId: string }>;
  searchParams: Promise<{ batchId?: string }>;
}) {
  const { programId } = await params;
  const { batchId } = await searchParams;
  const qs = new URLSearchParams({ tab: "commerce", drawer: "package-new" });
  if (batchId) qs.set("batchId", batchId);

  redirect(`/dashboard/programs/${programId}?${qs.toString()}`);
}
