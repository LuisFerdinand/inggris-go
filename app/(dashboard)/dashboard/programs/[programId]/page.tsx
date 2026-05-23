import { HydrateClient } from "@/lib/trpc/server";
import ProgramDetailPageView from "./_modules/ui/views/ProgramDetailPageView";

export const dynamic = "force-dynamic";

interface Props {
  params: { programId: string };
}
export default async function ProgramDetailPage({ params }: Props) {
  const { programId } = await params;
  return (
    <HydrateClient>
      <ProgramDetailPageView programId={programId}></ProgramDetailPageView>
    </HydrateClient>
  );
}
