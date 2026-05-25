import { HydrateClient } from "@/lib/trpc/server";
import { ProgramDetailView } from "./_modules/ui/views/ProgramDetailView";


export const dynamic = "force-dynamic";

interface Props {
  params: { programId: string };
}
export default async function ProgramDetail({ params }: Props) {
  const { programId } = await params;
  return (
    <HydrateClient>
      <ProgramDetailView programId={programId}></ProgramDetailView>
    </HydrateClient>
  );
}
