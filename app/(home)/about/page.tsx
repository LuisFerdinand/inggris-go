"use client";

import { HeroSection } from "@/components/sections/about/HeroSection";
import { CompanySection } from "@/components/sections/about/CompanySection";
import { VisionMissionSection } from "@/components/sections/about/VisionMissionSection";
import { OrgSection } from "@/components/sections/about/OrgSection";
import CtaSection from "@/components/sections/home/CTASection";

const ease = [0.22, 1, 0.36, 1] as const;

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection></HeroSection>
      <CompanySection></CompanySection>
      <VisionMissionSection></VisionMissionSection>
      {/* <OrgSection></OrgSection> */}
      <CtaSection></CtaSection>
    </main>
  );
}
