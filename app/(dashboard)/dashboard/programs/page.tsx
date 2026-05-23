
import { HydrateClient } from "@/lib/trpc/server";
import { ProgramsView } from "./_modules/ui/views/ProgramsView";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <HydrateClient>
      <ProgramsView></ProgramsView>
    </HydrateClient>
  );
}
