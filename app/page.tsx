import HeroAnimated from "@/components/sections/home/HeroAnimated";

import ProblemSection from "@/components/sections/home/ProblemSection";
import MethodSection from "@/components/sections/home/MethodSection";
import ProgramsGrid from "@/components/sections/home/ProgramsGrid";
import WhyUsSection from "@/components/sections/home/WhyUsSection";
import TestimonialsSection from "@/components/sections/home/TestimonialsSection";
import CTASection from "@/components/sections/home/CTASection";

export default function HomePage() {
  return (
    <>
      <HeroAnimated />
      <ProblemSection />
      <MethodSection />
      <ProgramsGrid />
      <WhyUsSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
