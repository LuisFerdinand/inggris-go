import { OrgChart } from "@/components/org/OrgChart";
import Reveal from "@/components/ui/Reveal";
import { BRAND } from "@/constants/brand";

export const OrgSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 xl:px-12">
        <Reveal className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: BRAND.orange }}
            />
            <span
              className="font-display font-bold"
              style={{
                fontSize: "0.6875rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#94A3B8",
              }}
            >
              Struktur Organisasi
            </span>
          </div>
          <h2
            className="font-display font-extrabold mb-3"
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
              letterSpacing: "-0.022em",
              color: BRAND.navy,
            }}
          >
            Tim Inggris Go
          </h2>
          <p
            style={{
              fontSize: "0.9375rem",
              color: "#64748B",
              maxWidth: "400px",
              margin: "0 auto",
            }}
          >
            Orang-orang luar biasa di balik program yang kamu ikuti
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <OrgChart />
        </Reveal>
      </div>
    </section>
  );
};
