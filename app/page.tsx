import HeroAnimated from "@/components/sections/HeroAnimated";

import ProblemSection from "@/components/sections/ProblemSection";
import MethodSection from "@/components/sections/MethodSection";
import ProgramsGrid from "@/components/sections/ProgramsGrid";
import WhyUsSection from "@/components/sections/WhyUsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CtaSection from "@/components/sections/CtaSection";

export default function HomePage() {
  return (
    <>
      <HeroAnimated />
      <ProblemSection />
      <MethodSection />
      <ProgramsGrid />
      <WhyUsSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
