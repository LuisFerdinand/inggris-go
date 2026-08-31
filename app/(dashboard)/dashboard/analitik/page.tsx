import { HydrateClient } from "@/lib/trpc/server";

import { AnalitikView } from "./_modules/AnalitikView";

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <HydrateClient>
      <AnalitikView></AnalitikView>
    </HydrateClient>
  );
}
