"use client";

import { trpc } from "@/lib/trpc/client";
import { useRef } from "react";

import { OverviewHero } from "./overview/OverviewHero";
import { OverviewHealth } from "./overview/OverviewHealth";
import { OverviewInfo } from "./overview/OverviewInfo";
import { OverviewActions } from "./overview/OverviewActions";
import { TabSkeleton } from "../ui/sections/ProgramDetailSection";

export default function OverviewTab({
  programId,
  overviewInfoRef,
}: {
  programId: string;
  overviewInfoRef?: React.RefObject<{ startEditing: () => void } | null>;
}) {
  const { data, isLoading } = trpc.programs.getOverview.useQuery({
    id: programId,
  });

  if (isLoading) return <TabSkeleton />;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-5 max-w-5xl">
      <OverviewHero
        data={data}
        onEditDetails={() => {
          overviewInfoRef?.current?.startEditing();

          const el = document.getElementById("overview-info");

          if (el) {
            const HEADER_OFFSET = 220;

            const y =
              el.getBoundingClientRect().top +
              window.pageYOffset -
              HEADER_OFFSET;

            window.scrollTo({
              top: y,
              behavior: "smooth",
            });
          }
        }}
      />
      <OverviewHealth health={data.health} scheduleType={data.scheduleType} />
      <OverviewInfo
        ref={overviewInfoRef}
        id="overview-info"
        data={data}
        programId={programId}
      />
      <OverviewActions data={data} programId={programId} />
    </div>
  );
}
