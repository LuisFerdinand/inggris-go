import { OrgChart } from "@/components/org/OrgChart";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { BRAND } from "@/constants/brand";

export const OrgSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 xl:px-12">
        <SectionHeading
          className="mb-10 sm:mb-12"
          eyebrow="Struktur Organisasi"
          title="Tim"
          accent="Inggris Go"
          description="Orang-orang luar biasa di balik program yang diikuti anak Ayah/Bunda."
        />

        <Reveal delay={0.1}>
          <OrgChart />
        </Reveal>
      </div>
    </section>
  );
};
