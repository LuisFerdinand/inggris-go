"use client";

import { trpc } from "@/lib/trpc/client";
import { useRef } from "react";

import { OverviewHero } from "./overview/OverviewHero";
import { OverviewHealth } from "./overview/OverviewHealth";

import { TabSkeleton } from "../ui/sections/ProgramDetailSection";
import { motion } from "framer-motion";
import { OverviewMetrics } from "./overview/OverviewMetrics";
import {
  OverviewWorkspaceMeta,
  OverviewActivity,
  OverviewConfiguration,
  OverviewQuickActions,
} from "./overview/OverviewSections";

interface OverviewTabProps {
  programId: string;
  overviewInfoRef?: React.RefObject<{ startEditing: () => void } | null>;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  },
};
export default function OverviewTab({
  programId,
  overviewInfoRef,
}: OverviewTabProps) {
  const { data, isLoading } = trpc.programs.getOverview.useQuery(
    { id: programId },
    { staleTime: 30_000, placeholderData: (prev) => prev },
  );

  if (isLoading) return <TabSkeleton />;
  if (!data) return null;

  const onEditDetails = () => {
    overviewInfoRef?.current?.startEditing();
    const el = document.getElementById("overview-info");
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 220;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-4"
    >
      {/* HERO */}
      <motion.div variants={itemVariants}>
        <OverviewHero
          data={data}
          programId={programId}
          onEditDetails={onEditDetails}
        />
      </motion.div>

      {/* METRICS */}
      <motion.div variants={itemVariants}>
        <OverviewMetrics metrics={data.metrics} />
      </motion.div>

      {/* TWO COLUMN: LEFT (health + actions) | RIGHT (config + activity + meta) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-4 items-start">
        {/* LEFT */}
        <div className="flex flex-col gap-4">
          <motion.div variants={itemVariants}>
            <OverviewHealth
              health={data.health}
              scheduleType={data.configuration.scheduleType}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <OverviewQuickActions
              quickActions={data.quickActions}
              scheduleType={data.configuration.scheduleType}
              status={data.identity.status}
              programId={programId}
            />
          </motion.div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-[88px]">
          <motion.div variants={itemVariants}>
            <OverviewConfiguration configuration={data.configuration} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <OverviewActivity
              activity={data.activity}
              publishedAt={data.publishing.publishedAt}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <OverviewWorkspaceMeta
              programId={programId}
              slug={data.identity.slug}
              publicUrl={data.publishing.publicUrl}
              categorySlug={data.identity.category.slug}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
