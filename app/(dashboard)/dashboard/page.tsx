import { HydrateClient } from "@/lib/trpc/server";
import { ProgramsView } from "./programs/_modules/ui/views/ProgramView";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <HydrateClient>
      <ProgramsView></ProgramsView>
    </HydrateClient>
  );
}
