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
  | "bonus"
  | "testimonials"
  | "classes"
  | "facilities"
  | "mentorship"
  | "batches"
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

export type HeroCTA = {
  label: string;
  href?: string;
  icon?: string;
};

export type Tag = {
  title: string;
  icon?: string;
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

export type Benefit = {
  title: string;
  description?: string;
  icon: string;
};

type WhySection = BaseSection & {
  type: "why";
  content: {
    title: string;
    subtitle?: string;
    icon?: string;
    tagline: string;
    taglineAccent?: string;
    conclusion?: {
      tagline: string;
      taglineAccent?: string;
    };
    items: Benefit[];
  };
};

type ClassItem = {
  title: string;
  duration?: string;
  description?: string;

  highlight?: string;
  icon?: string;

  /** NEW */
  schedules?: string[];

  meta?: {
    label: string;
    value: string;
  }[];

  tag?: string;
};

type ClassesSection = BaseSection & {
  type: "classes";
  content: {
    title: string;
    subtitle?: string;

    tagline?: string;
    taglineAccent?: string;

    layout?: "grid" | "timeline" | "card";

    /** NEW */
    info?: {
      label: string;
      value: string;
    }[];

    items: ClassItem[];
  };
};

export type PainPoint = {
  title: string;
  description: string;
  icon?: string;
};
export type ExperienceItem = {
  title: string;
  description: string;
  icon?: string;
};
export type ComparisonItem = {
  label: string;
  value: string;
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

export type Step = {
  n?: string;
  title: string;
  description: string;
  icon?: string;
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

export type PricingPackage = {
  label: string; // e.g. "5x Pertemuan"
  price: string;
  originalPrice?: string;
  highlight?: string; // e.g. "Paling Populer"
  note?: string;
};

export type PricingGroup = {
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

    bonusTitle?: string;
    bonusNote?: string;
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

type BenefitImage = {
  src: string;
  caption?: string;
  tag?: string;
  highlight?: boolean;
};

type BenefitsSection = BaseSection & {
  type: "benefits";
  content: {
    title: string;
    subtitle?: string;
    icon?: string;
    tagline: string;
    taglineAccent?: string;
    conclusion?: { tagline: string; taglineAccent?: string };
    images?: BenefitImage[];
    items: Benefit[];
  };
};

export type TimelineDay = {
  startTime: string;
  endTime?: string;
  title: string;
  highlight?: boolean;
};

export type TimelineWeek = {
  icon: string;
  week: string;
  title: string;
  points?: string[];
  days?: TimelineDay[];
};

export type TimelineMetaItem = {
  title: string;
  description?: string;
} & ({ icon: string; image?: never } | { image: string; icon?: never });

export type TimelineSection = BaseSection & {
  type: "timeline";
  content: {
    icon?: string;
    tagline: string;
    taglineAccent?: string;
    title: string;
    subtitle?: string;
    meta?: TimelineMetaItem[];
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

export type Bonus = {
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

export type SocialProof = {
  quote: string;
  name?: string;
  role?: string;
  meta?: string;
};

type TestimonialSection = BaseSection & {
  type: "testimonials";
  content: {
    title?: string;
    items: SocialProof[];
  };
};

type FacilityItem = {
  title: string;
  description?: string;
  icon: string;
};

type FacilitiesSection = BaseSection & {
  type: "facilities";
  content: {
    title: string;
    subtitle?: string;

    tagline?: string;
    taglineAccent?: string;

    visuals: {
      type: "image" | "icon";
      src?: string;
      icon?: string;
      alt?: string;
      caption?: string;
      tag?: string;
    }[];

    items: FacilityItem[];
  };
};

type MentorshipSection = BaseSection & {
  type: "mentorship";
  content: {
    tagline?: string;
    taglineAccent?: string;

    title: string;
    subtitle?: string;

    highlight?: string;

    items: {
      title: string;
      description: string;
      icon: string;
    }[];

    visuals: {
      type: "icon" | "image";
      icon?: string;
      src: string;
      alt?: string;
      caption?: string;
    }[];
  };
};

type BatchesSection = BaseSection & {
  type: "batches";
  content?: {
    title?: string;
    subtitle?: string;
    tagline?: string;
    taglineAccent?: string;
    emptyMessage?: string;
    variant?: "inline" | "card" | "banner" | "table";
  };
};

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
  | FacilitiesSection
  | FAQSection
  | MentorshipSection
  | TestimonialSection
  | CTASection
  | BatchesSection;

export type BatchSchedule = {
  type?: "weekly" | "daily" | "custom";

  label?: string;

  days?: (
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"
  )[];

  startTime?: string;
  endTime?: string;

  location?: string;

  note?: string;
};
