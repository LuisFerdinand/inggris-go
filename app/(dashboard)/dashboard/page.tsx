import { HydrateClient } from "@/lib/trpc/server";

import { DashboardView } from "./_modules/ui/view/DashboardView";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <HydrateClient>
      <DashboardView></DashboardView>
    </HydrateClient>
  );
}
