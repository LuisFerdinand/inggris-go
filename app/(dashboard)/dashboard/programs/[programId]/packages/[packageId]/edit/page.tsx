// app/(dashboard)/dashboard/programs/[programId]/packages/[packageId]/edit/page.tsx
import { redirect } from "next/navigation";

export default async function PackageEditPage({
  params,
}: {
  params: Promise<{ programId: string; packageId: string }>;
}) {
  const { programId, packageId } = await params;
  redirect(`/dashboard/programs/${programId}?tab=commerce&drawer=package-edit&packageId=${packageId}`);
}
