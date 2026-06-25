// app/db/schema/footer.ts
//
// Single-row settings table for the public footer.
// Run `npm run db:push` after adding this file and
// exporting it from schema/index.ts.

import { pgTable, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";

export const footerSettings = pgTable("footer_settings", {
  // Always use id = "singleton" — only one row ever exists.
  id: text("id").primaryKey().default("singleton"),

  /* ── Brand / Tagline ─────────────────────────────────── */
  tagline: text("tagline"),
  description: text("description"),

  /* ── Social links ────────────────────────────────────── */
  // Leave blank to hide that icon.
  instagramUrl: text("instagram_url"),
  tiktokUrl: text("tiktok_url"),
  youtubeUrl: text("youtube_url"),
  facebookUrl: text("facebook_url"),
  twitterUrl: text("twitter_url"),
  linkedinUrl: text("linkedin_url"),

  /* ── Contact ─────────────────────────────────────────── */
  whatsappNumber: text("whatsapp_number"),   // raw number, e.g. "628123456789"
  whatsappLabel: text("whatsapp_label"),     // e.g. "WhatsApp Admin"
  email: text("email"),
  contactPageHref: text("contact_page_href"), // e.g. "/contact"
  contactPageLabel: text("contact_page_label"), // e.g. "Form Pertanyaan"

  /* ── Location ────────────────────────────────────────── */
  locationAddress: text("location_address"),
  locationMapsUrl: text("location_maps_url"), // Google Maps full URL

  /* ── Stats band ──────────────────────────────────────── */
  // Override the auto-computed stats with custom values.
  // Leave null to use dynamic values from DB.
  statAlumniOverride: integer("stat_alumni_override"),
  statProgramOverride: integer("stat_program_override"),
  statYearsOverride: integer("stat_years_override"),
  statRatingOverride: text("stat_rating_override"), // e.g. "4.9"

  /* ── CTA strip ───────────────────────────────────────── */
  ctaText: text("cta_text"),
  ctaButtonLabel: text("cta_button_label"),
  ctaButtonHref: text("cta_button_href"),

  /* ── Bottom bar links ────────────────────────────────── */
  privacyHref: text("privacy_href"),
  privacyLabel: text("privacy_label"),
  termsHref: text("terms_href"),
  termsLabel: text("terms_label"),
  locationTagline: text("location_tagline"), // e.g. "Kampung Inggris Pare, Kediri"

  /* ── Program nav links (JSON array) ─────────────────── */
  // Stored as JSON string: [{ label: string, href: string }]
  programLinks: text("program_links"),

  /* ── Active flag ─────────────────────────────────────── */
  // When false, the footer falls back to hardcoded defaults.
  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type FooterSettings = typeof footerSettings.$inferSelect;
export type FooterSettingsInsert = typeof footerSettings.$inferInsert;