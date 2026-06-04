// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/DetailTab.tsx
"use client";

import { motion } from "framer-motion";

import { trpc } from "@/lib/trpc/client";
import { TabSkeleton } from "../ui/sections/ProgramDetailSection";

import {
  CommercePreviewSection,
  PublishingSection,
} from "./detail/CommercePreviewSection";
import { BrandingSection } from "./detail/BrandingSection";
import { IdentitySection } from "./detail/IdentitySection";
import { MarketingSection } from "./detail/MarketingSection";
import { StructureSection } from "./detail/StructureSection";

import type { DetailData as ProgramDetailData } from "@/app/modules/program/server/program.router";

/* ─────────────────────────────────────────────────────────────
   TYPES — inferred from the tRPC getDetail procedure so this can
   never drift from the actual API response again.
───────────────────────────────────────────────────────────── */

export type DetailData = ProgramDetailData;
export type DetailCategory = DetailData["category"];

/* ─────────────────────────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────────────────────────── */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] as const },
  },
};

/* ─────────────────────────────────────────────────────────────
   DETAIL TAB
───────────────────────────────────────────────────────────── */

interface DetailTabProps {
  programId: string;
}

export default function DetailTab({ programId }: DetailTabProps) {
  const { data, isLoading } = trpc.programs.getDetail.useQuery(
    { id: programId },
    { staleTime: 30_000, placeholderData: (prev) => prev },
  );

  if (isLoading && !data) return <TabSkeleton />;
  if (!data) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex max-w-4xl flex-col gap-4"
    >
      {/* 1 — Identity */}
      <motion.div variants={itemVariants}>
        <IdentitySection data={data} programId={programId} />
      </motion.div>

      {/* 2 — Structure */}
      <motion.div variants={itemVariants}>
        <StructureSection data={data} programId={programId} />
      </motion.div>

      {/* 3 — Marketing */}
      <motion.div variants={itemVariants}>
        <MarketingSection data={data} programId={programId} />
      </motion.div>

      {/* 4 — Branding */}
      <motion.div variants={itemVariants}>
        <BrandingSection data={data} programId={programId} />
      </motion.div>

      {/* 5 — Publishing */}
      <motion.div variants={itemVariants}>
        <PublishingSection data={data} programId={programId} />
      </motion.div>

      {/* 6 — Commerce Preview (read-only) */}
      <motion.div variants={itemVariants}>
        <CommercePreviewSection data={data} programId={programId} />
      </motion.div>
    </motion.div>
  );
}