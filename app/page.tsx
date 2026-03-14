import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import WAButton from "@/components/ui/WAButton";
import HeroAnimated from "@/components/sections/HeroAnimated";
import StatsBar from "@/components/sections/StatsBar";
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
      <StatsBar />
      <ProblemSection />
      <MethodSection />
      <ProgramsGrid />
      <WhyUsSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
