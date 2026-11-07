import { HydrateClient, trpc } from "@/lib/trpc/server";
import { buildPageMetadata } from "@/lib/seo";

import { HeroSection } from "@/components/sections/about/HeroSection";
import { CompanySection } from "@/components/sections/about/CompanySection";
import { VisionMissionSection } from "@/components/sections/about/VisionMissionSection";
import SharedCta from "@/components/sections/shared/SharedCta";

export const dynamic = "force-dynamic";

export const generateMetadata = () =>
  buildPageMetadata({
    path: "/about",
    title: "Tentang Kami",
    description:
      "Kenali Inggris Go: lembaga belajar bahasa Inggris dari Kampung Inggris Pare, Kediri — cerita, tim, visi, dan misi kami.",
  });

export default async function AboutPage() {
  await Promise.all([
    trpc.siteContent.getAbout.prefetch(),
    trpc.siteContent.getSiteStats.prefetch(),
    trpc.siteContent.getCta.prefetch(),
  ]);

  return (
    <HydrateClient>
      <div className="min-h-screen bg-white">
        <HeroSection />
        <CompanySection />
        <VisionMissionSection />
        <SharedCta />
      </div>
    </HydrateClient>
  );
}
