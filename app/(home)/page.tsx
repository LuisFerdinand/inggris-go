import { HydrateClient, trpc } from "@/lib/trpc/server";
import { buildPageMetadata } from "@/lib/seo";

import HeroAnimated from "@/components/sections/home/HeroAnimated";
import ProblemSection from "@/components/sections/home/ProblemSection";
import MethodSection from "@/components/sections/home/MethodSection";
import ProgramsGrid from "@/components/sections/home/ProgramsGrid";
import WhyUsSection from "@/components/sections/home/WhyUsSection";
import TestimonialsSection from "@/components/sections/home/TestimonialsSection";
import SharedCta from "@/components/sections/shared/SharedCta";

export const dynamic = "force-dynamic";

// Beranda keeps the site-wide title/description from the CMS; only its
// canonical is declared here (every page now owns its canonical).
export const generateMetadata = () => buildPageMetadata({ path: "/" });

export default async function HomePage() {
  // Await so HydrateClient ships complete data — the client's first render is
  // fully populated, avoiding a re-render that would interrupt the hero's
  // staggered entrance animation.
  await Promise.all([
    trpc.siteContent.getHome.prefetch(),
    trpc.siteContent.getSiteStats.prefetch(),
    trpc.siteContent.getCta.prefetch(),
    trpc.publicPrograms.homeCatalog.prefetch(),
  ]);

  return (
    <HydrateClient>
      <HeroAnimated />
      <ProblemSection />
      <MethodSection />
      <ProgramsGrid />
      <WhyUsSection />
      <TestimonialsSection />
      <SharedCta />
    </HydrateClient>
  );
}
