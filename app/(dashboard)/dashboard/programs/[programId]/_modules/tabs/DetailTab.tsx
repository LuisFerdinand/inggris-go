"use client";

import { trpc } from "@/lib/trpc/client";
import { TabSkeleton } from "../ui/sections/ProgramDetailSection";
import { motion } from "framer-motion";
import {
  CommercePreviewSection,
  PublishingSection,
} from "./detail/CommercePreviewSection";
import { IdentitySection } from "./detail/IdentitySection";
import { StructureSection } from "./detail/StructureSection";
import { MarketingSection } from "./detail/MarketingSection";
import { BrandingSection } from "./detail/BrandingSection";

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
      className="flex flex-col gap-4 max-w-4xl"
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
