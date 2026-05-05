import { HydrateClient } from "@/lib/trpc/server";
import { ProgramsPageView } from "./_modules/ui/views/ProgramsPageView";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <HydrateClient>
      <ProgramsPageView></ProgramsPageView>
    </HydrateClient>
  );
}
