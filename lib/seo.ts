// lib/seo.ts
//
// Per-page SEO metadata for the public site.
//
// Why this exists: the root layout used to put the site-wide "Canonical URL"
// from the CMS into `alternates.canonical`, and Next.js hands that to every
// page that does not set its own — so every page told Google "my canonical is
// the Beranda" and none of the program pages could be indexed. The root layout
// now only provides `metadataBase` (the domain); every page declares its own
// canonical *path* through `buildPageMetadata()`, which Next resolves against
// that domain.

import type { Metadata } from "next";

import { getSiteHeaderSettings } from "@/app/modules/site-header/server/site-header.service";

/**
 * Lenient URL parse for the CMS "Canonical URL" field: a missing scheme
 * ("inggrisgo.id") is tolerated, garbage returns null instead of throwing.
 */
export function parseSiteUrl(raw: string | null | undefined): URL | null {
  const value = raw?.trim();
  if (!value) return null;
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  } catch {
    return null;
  }
}

/** Domain that relative canonical / OG urls are resolved against. */
export function getSiteOrigin(
  canonicalUrlSetting?: string | null,
): URL | undefined {
  const candidates = [
    canonicalUrlSetting,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.AUTH_URL,
  ];

  for (const candidate of candidates) {
    const parsed = parseSiteUrl(candidate);
    if (parsed) return new URL(parsed.origin);
  }
  return undefined;
}

/** "/programs/online/x/" → "/programs/online/x"; "" → "/". */
export function normalizePath(path: string): string {
  const trimmed = path.trim().replace(/[?#].*$/, "").replace(/\/+$/, "");
  if (!trimmed) return "/";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

type PageMetadataInput = {
  /** Path of this page, e.g. "/about". Query strings are dropped. */
  path: string;
  /** Short page title; the site name is appended by the root title template. */
  title?: string;
  description?: string;
  /** Absolute or site-relative image for link previews. */
  image?: string | null;
  /** "article" for blog posts. */
  type?: "website" | "article";
};

/**
 * Metadata for one public page: its own title/description and, above all,
 * its own canonical URL.
 */
export async function buildPageMetadata({
  path,
  title,
  description,
  image,
  type = "website",
}: PageMetadataInput): Promise<Metadata> {
  const settings = await getSiteHeaderSettings();
  const canonicalPath = normalizePath(path);

  const metadata: Metadata = {
    alternates: { canonical: canonicalPath },
  };

  if (title) metadata.title = title;
  if (description) metadata.description = description;

  // Only pages with their own copy override the site-wide Open Graph card,
  // and they then carry the image along (Next replaces `openGraph` wholesale).
  if (title || description || image) {
    const ogImage = image || settings.ogImageUrl;
    const fullTitle = title
      ? `${title} | ${settings.siteName || "Inggris Go"}`
      : settings.ogTitle || settings.metaTitle;

    metadata.openGraph = {
      title: fullTitle,
      description: description || settings.ogDescription || settings.metaDescription,
      type,
      url: canonicalPath,
      siteName: settings.siteName || undefined,
      images: ogImage ? [{ url: ogImage }] : undefined,
    };
  }

  return metadata;
}
