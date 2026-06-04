// app/(dashboard)/dashboard/programs/[programId]/page.tsx
import { ProgramDetailView } from "./_modules/ui/views/ProgramDetailView";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  return <ProgramDetailView programId={programId} />;
}