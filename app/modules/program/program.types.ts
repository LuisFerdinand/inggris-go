// app/modules/program/program.types.ts
// Central source of truth for program/category landing-page CMS data.

/* =========================================================
   SHARED SMALL TYPES
========================================================= */

export type PriceTier = {
  label: string;
  price: string;
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

export type Benefit = {
  title: string;
  description?: string;
  icon: string;
};

export type Bonus = {
  title: string;
  description?: string;
  highlight?: string;
  icon: string;
};

export type ProgramTheme = {
  primary?: string;
  accent?: string;
  background?: string;
  foreground?: string;
  gradient?: {
    from: string;
    to: string;
  };
};

/* =========================================================
   CATEGORY CMS TYPES
========================================================= */

export type ProgramMeta = {
  title: string;
  slug: string;
  description: string;
  shortDesc?: string;

  price: string;
  originalPrice?: string;
  priceTiers?: PriceTier[];

  badge?: string;
  highlight?: string;
  tags: string[];
  icon: string;

  href: string;

  benefits?: Benefit[];
  duration?: string;
  format?: string;
  level?: string;
};

export type CategoryMeta = {
  key: string;
  label: string;
  shortLabel?: string;
  href: string;

  icon?: string;
  heroImage?: string;

  theme: {
    primary: string;
  };

  quickDecisionLabel: string;
  quickDecisionDesc: string;

  tagline: string;
  taglineAccent?: string;
  description: string;
  forWho: string;

  programs: ProgramMeta[];

  painPoints?: PainPoint[];
  benefits?: Benefit[];
  steps?: Step[];
  experience?: ExperienceItem[];
  comparison?: ComparisonItem[];
  socialProof?: SocialProof[];
  cta: CategoryCTA;

  emptyState?: {
    title: string;
    description: string;
  };
};

/* =========================================================
   PROGRAM DETAIL CMS TYPES
========================================================= */

export type ProgramCTA = {
  title: string;
  titleAccent?: string;
  subtitle?: string;
  highlight?: string;
  cta: {
    label: string;
    href: string;
    note?: string;
  };
  urgency?: string;
};

export const PROGRAM_SECTION_TYPES = [
  "hero",
  "why",
  "fit",
  "steps",
  "benefits",
  "timeline",
  "gallery",
  "batches",        // ← add
  "pricing",
  "bonus",
  "faq",
  "testimonials",
  "classes",
  "facilities",
  "mentorship",
  "cta",
] as const;

export type ProgramSectionType = (typeof PROGRAM_SECTION_TYPES)[number];

export type ProgramSectionTheme = {
  variant?: "light" | "dark" | "primary" | "accent";
  background?: string;
};

export type BaseSection<TType extends ProgramSectionType, TContent> = {
  id: string;
  type: TType;

  /**
   * CMS visibility toggle.
   * undefined is treated as true for old imported/static data.
   */
  visible?: boolean;

  theme?: ProgramSectionTheme;
  content: TContent;
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

export type HeroSection = BaseSection<"hero", HeroContent>;

export type WhySection = BaseSection<
  "why",
  {
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
  }
>;

export type StepsSection = BaseSection<
  "steps",
  {
    title: string;
    subtitle?: string;
    icon?: string;
    tagline: string;
    taglineAccent?: string;
    items: Step[];
  }
>;

export type BenefitImage = {
  src: string;
  caption?: string;
  tag?: string;
  highlight?: boolean;
};

export type BenefitsSection = BaseSection<
  "benefits" | "fit",
  {
    title: string;
    subtitle?: string;
    icon?: string;
    tagline: string;
    taglineAccent?: string;
    conclusion?: { tagline: string; taglineAccent?: string };
    images?: BenefitImage[];
    items: Benefit[];
  }
>;

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

export type TimelineSection = BaseSection<
  "timeline",
  {
    icon?: string;
    tagline: string;
    taglineAccent?: string;
    title: string;
    subtitle?: string;
    meta?: TimelineMetaItem[];
    weeks: TimelineWeek[];
  }
>;

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

export type GallerySection = BaseSection<"gallery", GalleryContent>;

export type ClassItem = {
  title: string;
  duration?: string;
  description?: string;
  highlight?: string;
  icon?: string;
  schedules?: string[];
  meta?: {
    label: string;
    value: string;
  }[];
  tag?: string;
};

export type ClassesSection = BaseSection<
  "classes",
  {
    title: string;
    subtitle?: string;
    tagline?: string;
    taglineAccent?: string;
    layout?: "grid" | "timeline" | "card";
    info?: {
      label: string;
      value: string;
    }[];
    items: ClassItem[];
  }
>;

export type PricingPackage = {
  label: string;
  price: string;
  originalPrice?: string;
  highlight?: string;
  note?: string;
};

export type PricingGroup = {
  title: string;
  subtitle?: string;
  icon?: string;
  features: string[];
  packages: PricingPackage[];
};

export type PricingSection = BaseSection<
  "pricing",
  {
    globalNote?: string;
    title?: string;
    description?: string;
    groups: PricingGroup[];
    bonusTitle?: string;
    bonusNote?: string;
    bonus?: Bonus[];
    urgency?: string;
  }
>;

export type BonusSection = BaseSection<
  "bonus",
  {
    title?: string;
    items: Bonus[];
  }
>;

export type FAQSection = BaseSection<
  "faq",
  {
    q: string;
    a: string;
  }[]
>;

export type TestimonialSection = BaseSection<
  "testimonials",
  {
    title?: string;
    items: SocialProof[];
  }
>;

export type FacilityItem = {
  title: string;
  description?: string;
  icon: string;
};

export type SectionVisual = {
  type: "image" | "icon";
  src?: string;
  icon?: string;
  alt?: string;
  caption?: string;
  tag?: string;
};

export type FacilitiesSection = BaseSection<
  "facilities",
  {
    title: string;
    subtitle?: string;
    tagline?: string;
    taglineAccent?: string;
    visuals: SectionVisual[];
    items: FacilityItem[];
  }
>;

export type MentorshipSection = BaseSection<
  "mentorship",
  {
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
    visuals: SectionVisual[];
  }
>;

export type CTASection = BaseSection<"cta", ProgramCTA>;

export type ProgramSection =
  | HeroSection
  | WhySection
  | StepsSection
  | BenefitsSection
  | TimelineSection
  | GallerySection
  | BatchesSection
  | ClassesSection
  | PricingSection
  | BonusSection
  | FAQSection
  | TestimonialSection
  | FacilitiesSection
  | MentorshipSection
  | CTASection;

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
  brochure?: {
    url: string;
    label?: string;
  };
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  primaryCtaIcon?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  secondaryCtaIcon?: string;
};

export type ProgramDetail = {
  slug: string;
  theme?: ProgramTheme;
  hasBatch?: boolean;
  batches?: ProgramBatch[];
  sections: ProgramSection[];
};

export function isSectionVisible(section: Pick<ProgramSection, "visible">) {
  return section.visible !== false;
}

export type BatchesContent = {
  variant?: "card" | "list";
  tagline: string;
  taglineAccent?: string;
  title: string;
  subtitle?: string;
  emptyMessage?: string;
};

export type BatchesSection = BaseSection<"batches", BatchesContent>;