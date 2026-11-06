// components/sections/home/program-showcase/ProgramShowcase.tsx
//
// Beranda "Program Kami": one long section. Every program group the admin
// added is rendered one below the other (each with its chosen layout), so the
// page grows with the content. Also used for the live preview in the CMS.

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

import { GRADIENT_GOLD_TEXT } from "@/constants/brand";
import type { HomeCatalog } from "@/app/modules/program/home-catalog.types";
import type { ProgramShowcase as ProgramShowcaseConfig } from "@/app/modules/site-content/site-content.types";

import {
  BannerBlock,
  CardsBlock,
  FeatureBlock,
  GroupHeader,
  SpotlightBlock,
} from "./blocks";
import { resolveShowcase, type TabView } from "./resolve";

const ease = [0.22, 1, 0.36, 1] as const;

function TabContent({ tab }: { tab: TabView }) {
  const v = tab.view;
  return (
    <div>
      <GroupHeader
        eyebrow={v.eyebrow}
        heading={v.heading}
        description={v.template === "cards" ? v.description : undefined}
      />
      {v.template === "feature" && <FeatureBlock view={v} />}
      {v.template === "cards" && <CardsBlock view={v} />}
      {v.template === "spotlight" && <SpotlightBlock view={v} />}
      {v.template === "banner" && <BannerBlock view={v} />}
    </div>
  );
}

export default function ProgramShowcase({
  section,
  catalog,
}: {
  section: ProgramShowcaseConfig;
  catalog: HomeCatalog | undefined;
}) {
  const tabs = useMemo(
    () => (catalog ? resolveShowcase(section, catalog) : []),
    [section, catalog],
  );

  if (!catalog) {
    return (
      <div className="space-y-4" aria-busy>
        <div className="h-16 animate-pulse rounded-2xl bg-white/70" />
        <div className="h-72 animate-pulse rounded-3xl bg-white/70" />
      </div>
    );
  }

  if (tabs.length === 0) return null;

  // One long section: every program the admin added is shown one after the
  // other, so the more programs, the longer the page.
  return (
    <div className="space-y-14 sm:space-y-20">
      {tabs.map((tab) => (
        <motion.div
          key={tab.id}
          id={`program-panel-${tab.id}`}
          className="scroll-mt-28"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, ease }}
        >
          <TabContent tab={tab} />
        </motion.div>
      ))}
    </div>
  );
}

/** Heading with the gold-gradient accent, shared by the home section + preview. */
export function ShowcaseHeading({
  title,
  accent,
}: {
  title: string;
  accent: string;
}) {
  return (
    <>
      {title}
      {title && accent ? " " : ""}
      {accent && <span style={GRADIENT_GOLD_TEXT}>{accent}</span>}
    </>
  );
}
