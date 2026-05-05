import { HydrateClient } from "@/lib/trpc/server";
import React from "react";
import ProgramsView from "./_modules/ui/views/ProgramsView";
export const dynamic = "force-dynamic";

const ProgramsPage = () => {
  return (
    <HydrateClient>
      <ProgramsView></ProgramsView>
    </HydrateClient>
  );
};

export default ProgramsPage;
