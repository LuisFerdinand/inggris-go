// app/db/seed/site-footer.seed.ts

import { sql } from "drizzle-orm";

import { db } from "@/app/db/db";
import { footerSettings } from "../schema/footer";

const FOOTER_SETTINGS_ID = "singleton";

const DEFAULT_PROGRAM_LINKS = [
  { label: "Program Kami", href: "/programs" },
  { label: "Speaking", href: "/programs/speaking" },
  { label: "English Camp", href: "/programs/english-camp" },
  { label: "Private Class", href: "/programs/private-class" },
];

const DEFAULT_FOOTER_SETTINGS = {
  id: FOOTER_SETTINGS_ID,

  tagline: "Belajar Bahasa Inggris Tanpa Takut Salah",
  description:
    "Program speaking untuk pemula dari Kampung Inggris Pare — belajar dengan cara yang sederhana, praktis, dan menyenangkan.",

  instagramUrl: process.env.SEED_FOOTER_INSTAGRAM_URL ?? null,
  tiktokUrl: process.env.SEED_FOOTER_TIKTOK_URL ?? null,
  youtubeUrl: process.env.SEED_FOOTER_YOUTUBE_URL ?? null,
  facebookUrl: process.env.SEED_FOOTER_FACEBOOK_URL ?? null,
  twitterUrl: process.env.SEED_FOOTER_TWITTER_URL ?? null,
  linkedinUrl: process.env.SEED_FOOTER_LINKEDIN_URL ?? null,

  whatsappNumber: process.env.SEED_FOOTER_WHATSAPP_NUMBER ?? "628123456789",
  whatsappLabel: "WhatsApp Admin",
  email: process.env.SEED_FOOTER_EMAIL ?? "admin@inggrisgo.com",
  contactPageHref: "/contact",
  contactPageLabel: "Form Pertanyaan",

  locationAddress:
    "Kampung Inggris Pare, Kec. Pare, Kab. Kediri, Jawa Timur 64212",
  locationMapsUrl:
    process.env.SEED_FOOTER_MAPS_URL ??
    "https://maps.app.goo.gl/Hibvyj6gYGjSTkHE6",

  statAlumniOverride: null,
  statProgramOverride: 12,
  statYearsOverride: 8,
  statRatingOverride: "4.9",

  ctaText: "Siap mulai perjalanan belajar Bahasa Inggris kamu?",
  ctaButtonLabel: "Hubungi Kami",
  ctaButtonHref: null,

  privacyHref: "/privacy",
  privacyLabel: "Privasi",
  termsHref: "/terms",
  termsLabel: "Ketentuan",
  locationTagline: "Kampung Inggris Pare, Kediri",

  programLinks: JSON.stringify(DEFAULT_PROGRAM_LINKS),

  isActive: true,
};

export async function seedFooterSettings() {
  console.log("Seeding Footer Settings...");

  await db
    .insert(footerSettings)
    .values(DEFAULT_FOOTER_SETTINGS)
    .onConflictDoUpdate({
      target: footerSettings.id,
      set: {
        tagline: sql`excluded.tagline`,
        description: sql`excluded.description`,

        instagramUrl: sql`excluded.instagram_url`,
        tiktokUrl: sql`excluded.tiktok_url`,
        youtubeUrl: sql`excluded.youtube_url`,
        facebookUrl: sql`excluded.facebook_url`,
        twitterUrl: sql`excluded.twitter_url`,
        linkedinUrl: sql`excluded.linkedin_url`,

        whatsappNumber: sql`excluded.whatsapp_number`,
        whatsappLabel: sql`excluded.whatsapp_label`,
        email: sql`excluded.email`,
        contactPageHref: sql`excluded.contact_page_href`,
        contactPageLabel: sql`excluded.contact_page_label`,

        locationAddress: sql`excluded.location_address`,
        locationMapsUrl: sql`excluded.location_maps_url`,

        statAlumniOverride: sql`excluded.stat_alumni_override`,
        statProgramOverride: sql`excluded.stat_program_override`,
        statYearsOverride: sql`excluded.stat_years_override`,
        statRatingOverride: sql`excluded.stat_rating_override`,

        ctaText: sql`excluded.cta_text`,
        ctaButtonLabel: sql`excluded.cta_button_label`,
        ctaButtonHref: sql`excluded.cta_button_href`,

        privacyHref: sql`excluded.privacy_href`,
        privacyLabel: sql`excluded.privacy_label`,
        termsHref: sql`excluded.terms_href`,
        termsLabel: sql`excluded.terms_label`,
        locationTagline: sql`excluded.location_tagline`,

        programLinks: sql`excluded.program_links`,

        isActive: sql`excluded.is_active`,

        updatedAt: new Date(),
      },
    });
}