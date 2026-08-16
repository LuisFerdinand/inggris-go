// app/(dashboard)/dashboard/projects/[projectId]/page.tsx
import { ProjectDetailView } from "./_modules/ProjectDetailView";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectDetailView projectId={projectId} />;
}
