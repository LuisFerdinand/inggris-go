import Reveal from "./Reveal";

interface PageHeroProps {
  badge: string;
  badgeBg?: string;
  title: string;
  titleHighlight?: string;
  subtitle: string;
  cta?: React.ReactNode;
}

export default function PageHero({
  badge,
  badgeBg = "pill-orange",
  title,
  titleHighlight,
  subtitle,
  cta,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-brand-cream pt-14 pb-20 lg:pt-20 lg:pb-28">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-hero-mesh pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-brand-orange/5 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10 text-center relative z-10">
        <Reveal>
          <span className={`pill ${badgeBg} mb-6 inline-flex`}>{badge}</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="font-display text-display-lg text-brand-navy mb-6">
            {title}{" "}
            {titleHighlight && (
              <span className="text-orange-gradient">{titleHighlight}</span>
            )}
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-brand-charcoal/60 text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            {subtitle}
          </p>
        </Reveal>
        {cta && <Reveal delay={0.3}>{cta}</Reveal>}
      </div>
    </section>
  );
}
