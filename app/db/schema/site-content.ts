// app/db/schema/site-content.ts
//
// Singleton settings tables for the landing-page CMS (Home / About /
// Contact) plus the one shared CTA. Only one row per table ever exists,
// keyed by id = "default". Run `npm run db:push` after editing.
//
// Convention mirrors app/db/schema/footer.ts + app/db/schema/programs.ts:
// scalar columns for simple fields, jsonb().$type<...>() for repeatable
// arrays. Every column is nullable / defaulted so the service can merge a
// partial row over DEFAULT_* fallbacks.

import { pgTable, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

import type {
  AboutHeroEditorial,
  AboutMission,
  AdvantageFeature,
  ContactHeroStat,
  ContactInfoItem,
  ContactMethod,
  FaqItem,
  HeroFloatingText,
  HeroStatLabel,
  ProgramShowcase,
  IconTag,
  LabelValue,
  MethodStep,
  ProblemCard,
  TeamMemberOverrideMap,
  WhyChooseItem,
} from "@/app/modules/site-content/site-content.types";

const SINGLETON_ID = "default";

/* =========================================================
   HOME
========================================================= */

export const homePageSettings = pgTable("home_page_settings", {
  id: text("id").primaryKey().default(SINGLETON_ID),

  /* Hero */
  heroBadgeText: text("hero_badge_text"),
  heroTitle: text("hero_title"),
  heroTitleAccent: text("hero_title_accent"),
  heroSubtitle: text("hero_subtitle"),
  heroSubtitleHighlight: text("hero_subtitle_highlight"),
  heroDescription: text("hero_description"),
  heroImageUrl: text("hero_image_url"),
  heroImageAlt: text("hero_image_alt"),
  heroPrimaryCtaLabel: text("hero_primary_cta_label"),
  heroPrimaryCtaHref: text("hero_primary_cta_href"),
  heroSecondaryCtaLabel: text("hero_secondary_cta_label"),
  heroSecondaryCtaHref: text("hero_secondary_cta_href"),
  heroFloatingText: jsonb("hero_floating_text").$type<HeroFloatingText>(),
  heroStatLabels: jsonb("hero_stat_labels").$type<HeroStatLabel[]>(),

  /* Masalah Umum */
  problemEyebrow: text("problem_eyebrow"),
  problemTitle: text("problem_title"),
  problemTitleAccent: text("problem_title_accent"),
  problemDescription: text("problem_description"),
  problemCards: jsonb("problem_cards").$type<ProblemCard[]>(),
  problemCalloutText: text("problem_callout_text"),
  problemCalloutHighlight: text("problem_callout_highlight"),
  problemCalloutIcon: text("problem_callout_icon"),

  /* Methods */
  methodEyebrow: text("method_eyebrow"),
  methodTitle: text("method_title"),
  methodTitleAccent: text("method_title_accent"),
  methodDescription: text("method_description"),
  methodSteps: jsonb("method_steps").$type<MethodStep[]>(),
  methodFootnotePrefix: text("method_footnote_prefix"),
  methodFootnoteHighlight: text("method_footnote_highlight"),
  methodFootnoteSuffix: text("method_footnote_suffix"),

  /* Advantages */
  advantageEyebrow: text("advantage_eyebrow"),
  advantageTitle: text("advantage_title"),
  advantageTitleAccent: text("advantage_title_accent"),
  advantageDescription: text("advantage_description"),
  advantageFeatures: jsonb("advantage_features").$type<AdvantageFeature[]>(),

  /* Program showcase (Beranda "Program Kami": tabs + layouts) */
  programShowcase: jsonb("program_showcase").$type<ProgramShowcase>(),

  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type HomePageSettings = typeof homePageSettings.$inferSelect;
export type HomePageSettingsInsert = typeof homePageSettings.$inferInsert;

/* =========================================================
   ABOUT
========================================================= */

export const aboutPageSettings = pgTable("about_page_settings", {
  id: text("id").primaryKey().default(SINGLETON_ID),

  /* Hero */
  heroLocationBadge: text("hero_location_badge"),
  heroSectionBadge: text("hero_section_badge"),
  heroOverline: text("hero_overline"),
  heroTitle: text("hero_title"),
  heroTitleAccent: text("hero_title_accent"),
  heroDescription: text("hero_description"),
  heroStatLabels: jsonb("hero_stat_labels").$type<HeroStatLabel[]>(),
  heroTeamStripLabel: text("hero_team_strip_label"),
  heroEditorial: jsonb("hero_editorial").$type<AboutHeroEditorial>(),

  /* Who are we */
  whoEyebrow: text("who_eyebrow"),
  whoTitle: text("who_title"),
  whoParagraphs: jsonb("who_paragraphs").$type<string[]>(),
  whoTags: jsonb("who_tags").$type<IconTag[]>(),
  whoImageUrl: text("who_image_url"),
  whoFilosofiQuote: text("who_filosofi_quote"),
  whoFilosofiDescription: text("who_filosofi_description"),
  whoFounderName: text("who_founder_name"),
  whoFounderRole: text("who_founder_role"),
  whoFounderInitials: text("who_founder_initials"),
  whoFounderImageUrl: text("who_founder_image_url"),
  whoLocationLine: text("who_location_line"),

  /* Vision & Mission */
  vmEyebrow: text("vm_eyebrow"),
  vmTitle: text("vm_title"),
  vmTitleAccent: text("vm_title_accent"),
  visionBadge: text("vision_badge"),
  visionStatement: text("vision_statement"),
  visionStatementAccent: text("vision_statement_accent"),
  visionFooterNote: text("vision_footer_note"),
  missions: jsonb("missions").$type<AboutMission[]>(),

  /* Team — drives the "Tim Inggris Go" avatar strip in the About hero */
  teamMemberOverrides: jsonb(
    "team_member_overrides",
  ).$type<TeamMemberOverrideMap>(),

  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type AboutPageSettings = typeof aboutPageSettings.$inferSelect;
export type AboutPageSettingsInsert = typeof aboutPageSettings.$inferInsert;

/* =========================================================
   CONTACT
========================================================= */

export const contactPageSettings = pgTable("contact_page_settings", {
  id: text("id").primaryKey().default(SINGLETON_ID),

  /* Hero */
  heroBadgeText: text("hero_badge_text"),
  heroTitle: text("hero_title"),
  heroTitleAccent: text("hero_title_accent"),
  heroDescription: text("hero_description"),
  heroTrustPills: jsonb("hero_trust_pills").$type<IconTag[]>(),
  heroStats: jsonb("hero_stats").$type<ContactHeroStat[]>(),
  heroImageUrl: text("hero_image_url"),

  /* How to contact us */
  methodsEyebrow: text("methods_eyebrow"),
  methodsTitle: text("methods_title"),
  methodsSubtitle: text("methods_subtitle"),
  methods: jsonb("methods").$type<ContactMethod[]>(),

  /* Contact info + FAQ + form */
  formRecipientEmail: text("form_recipient_email"),
  formEyebrow: text("form_eyebrow"),
  formTitle: text("form_title"),
  formSubtitle: text("form_subtitle"),
  formCategories: jsonb("form_categories").$type<LabelValue[]>(),
  infoItems: jsonb("info_items").$type<ContactInfoItem[]>(),
  faqItems: jsonb("faq_items").$type<FaqItem[]>(),
  faqSeeAllHref: text("faq_see_all_href"),
  sidebarCtaTitle: text("sidebar_cta_title"),
  sidebarCtaText: text("sidebar_cta_text"),
  sidebarCtaButtonLabel: text("sidebar_cta_button_label"),
  sidebarCtaButtonHref: text("sidebar_cta_button_href"),

  /* Why choose us */
  whyChooseEyebrow: text("why_choose_eyebrow"),
  whyChooseBadgeText: text("why_choose_badge_text"),
  whyChooseTitle: text("why_choose_title"),
  whyChooseDescription: text("why_choose_description"),
  whyChooseItems: jsonb("why_choose_items").$type<WhyChooseItem[]>(),

  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type ContactPageSettings = typeof contactPageSettings.$inferSelect;
export type ContactPageSettingsInsert = typeof contactPageSettings.$inferInsert;

/* =========================================================
   SHARED CTA
========================================================= */

export const siteCtaSettings = pgTable("site_cta_settings", {
  id: text("id").primaryKey().default(SINGLETON_ID),

  eyebrow: text("eyebrow"),
  title: text("title"),
  titleAccent: text("title_accent"),
  description: text("description"),
  primaryLabel: text("primary_label"),
  primaryHref: text("primary_href"),
  secondaryLabel: text("secondary_label"),
  secondaryHref: text("secondary_href"),
  secondaryIsWhatsapp: boolean("secondary_is_whatsapp").default(true).notNull(),
  trustPoints: jsonb("trust_points").$type<string[]>(),

  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type SiteCtaSettings = typeof siteCtaSettings.$inferSelect;
export type SiteCtaSettingsInsert = typeof siteCtaSettings.$inferInsert;
