export type Benefit = {
  title: string;
  description?: string;
  icon: string;
};

export type ComparisonItem = {
  label: string;
  value: string;
};

export type PainPoint = {
  title: string;
  description: string;
  icon?: string;
};

export type Step = {
  n?: string;
  title: string;
  description: string;
  icon?: string;
};

export type ExperienceItem = {
  title: string;
  description: string;
  icon?: string;
};

export type SocialProof = {
  quote: string;
  name?: string;
  role?: string;
  meta?: string;
};

export type CategoryCTA = {
  title: string;
  titleAccent?: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};
export type HeroCTA = {
  label: string;
  href?: string;
  icon?: string;
};

export type Tag = {
  title: string;
  icon?: string;
};

export type PriceTier = { label: string; price: string };

export type ProgramSection =
  | HeroSection
  | WhySection
  | StepsSection
  | BenefitsSection
  | TimelineSection
  | ClassesSection
  | GallerySection
  | PricingSection
  | BonusSection
  | FAQSection
  | TestimonialSection
  | CTASection;

export type ProgramBatch = {
  id: string;
  label: string;
  startDate?: string;
  endDate?: string;
  schedule?: string;
  note?: string;
  status: "open" | "full" | "coming_soon" | "closed";
  isOpen: boolean;
  capacity?: number;
  enrolled?: number;
  ctaLabel?: string;
  ctaHref?: string;
};
type ProgramSectionType =
  | "hero"
  | "why"
  | "fit"
  | "steps"
  | "benefits"
  | "timeline"
  | "gallery"
  | "pricing"
  | "faq"
  | "testimonials"
  | "classes"
  | "cta";
type BaseSection = {
  id: string;
  type: ProgramSectionType;
  visible?: boolean;

  theme?: {
    variant?: "light" | "dark" | "primary" | "accent";
    background?: string;
  };
};

export type HeroContent = {
  label: string;
  tagline: string;
  taglineAccent?: string;
  description?: string;
  subtitle: string;
  highlight?: string;
  tags?: Tag[];
  cta: HeroCTA[];
  socialProof?: { text: string; count?: string };
  image?: string;
};

type HeroSection = BaseSection & {
  type: "hero";
  content: HeroContent;
};

type WhySection = BaseSection & {
  type: "why";
  content: {
    title: string;
    subtitle?: string;
    icon?: string;
    tagline: string;
    taglineAccent?: string;
    items: Benefit[];
  };
};

type ClassItem = {
  title: string;
  description?: string;

  highlight?: string; // date, age, label
  icon?: string;

  meta?: {
    label: string; // e.g. "Usia", "Jadwal", "Durasi"
    value: string;
  }[];

  tag?: string; // e.g. "Recommended", "Popular"
};

type ClassesSection = BaseSection & {
  type: "classes";
  content: {
    title: string;
    subtitle?: string;

    tagline?: string;
    taglineAccent?: string;

    layout?: "grid" | "timeline" | "card"; // optional UI control

    items: ClassItem[];
  };
};

type StepsSection = BaseSection & {
  type: "steps";
  content: {
    title: string;
    subtitle?: string;
    icon?: string;
    tagline: string;
    taglineAccent?: string;
    items: Step[];
  };
};

type PricingPackage = {
  label: string; // e.g. "5x Pertemuan"
  price: string;
  originalPrice?: string;
  highlight?: string; // e.g. "Paling Populer"
  note?: string;
};

type PricingGroup = {
  title: string; // "Exclusive" | "Intensive"
  subtitle?: string; // "Flexible & Personal"
  icon?: string; // 💎 or ⚡

  features: string[];
  packages: PricingPackage[];
};

type PricingSection = BaseSection & {
  type: "pricing";
  content: {
    globalNote?: string;
    title?: string;
    description?: string;

    groups: PricingGroup[];

    bonus?: Bonus[]; // 👈 MOVE BONUS HERE

    urgency?: string; // limited slots
  };
};

type FAQSection = BaseSection & {
  type: "faq";
  content: {
    q: string;
    a: string;
  }[];
};
type ProgramCTA = {
  title: string;
  titleAccent?: string;
  subtitle?: string;

  highlight?: string; // key sentence (pain/reframe)

  cta: {
    label: string;
    href: string;
    note?: string;
  };

  urgency?: string;
};
type CTASection = BaseSection & {
  type: "cta";
  content: ProgramCTA;
};

type BenefitsSection = BaseSection & {
  type: "benefits";
  content: {
    title: string;
    subtitle?: string;
    icon?: string;
    tagline: string;
    taglineAccent?: string;
    items: Benefit[];
  };
};

type TimelineDay = {
  range: string;
  title: string;
  highlight?: boolean;
};

type TimelineWeek = {
  icon: string;
  week: string;
  title: string;
  points?: string[];
  days?: TimelineDay[];
};

type TimelineSection = BaseSection & {
  type: "timeline";
  content: {
    icon?: string;
    tagline: string;
    taglineAccent?: string;
    title: string;
    subtitle?: string;
    meta?: Benefit[];
    weeks: TimelineWeek[];
  };
};

export type GalleryPhoto = {
  src: string;
  caption?: string;
  tag?: string;
  highlight?: boolean;
};
export type GalleryContent = {
  icon?: string;

  tagline: string;
  taglineAccent?: string;

  title?: string;
  subtitle?: string;

  photos: GalleryPhoto[];
  trustSignals?: string[];
};

type GallerySection = BaseSection & {
  type: "gallery";
  content: GalleryContent;
};
type Bonus = {
  title: string;
  description?: string;
  highlight?: string;
  icon: string;
};
type BonusSection = BaseSection & {
  type: "bonus";
  content: {
    title?: string;

    items: Bonus[];
  };
};

type TestimonialSection = BaseSection & {
  type: "testimonials";
  content: {
    title?: string;
    items: SocialProof[];
  };
};
