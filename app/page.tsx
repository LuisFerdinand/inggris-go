import HeroAnimated from "@/components/sections/home/HeroAnimated";

import ProblemSection from "@/components/sections/home/ProblemSection";
import MethodSection from "@/components/sections/home/MethodSection";
import ProgramsGrid from "@/components/sections/home/ProgramsGrid";
import WhyUsSection from "@/components/sections/home/WhyUsSection";
import TestimonialsSection from "@/components/sections/home/TestimonialsSection";
import CTASection from "@/components/sections/home/CTASection";
import {
  Command,
  MessageCircle,
  MessageSquare,
  Phone,
  PlayCircle,
  Send,
  Speaker,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Smartphone,
  Heart,
  Recycle,
  Gift,
  SquareCheck,
  SquareCheckBig,
  Smile,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      <></>
      <MessageCircle></MessageCircle>
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
