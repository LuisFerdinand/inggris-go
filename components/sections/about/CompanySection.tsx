"use client";

import Image from "next/image";

import Reveal from "@/components/ui/Reveal";
import { Icon } from "@/components/Icon";
import SectionHeading from "@/components/ui/SectionHeading";
import { trpc } from "@/lib/trpc/client";
import { BRAND } from "@/constants/brand";
import { DEFAULT_ABOUT } from "@/app/modules/site-content/site-content.defaults";

export const CompanySection = () => {
  const { data } = trpc.siteContent.getAbout.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const c = data && data.isActive !== false ? data : DEFAULT_ABOUT;

  const eyebrow = c.whoEyebrow || DEFAULT_ABOUT.whoEyebrow;
  const title = c.whoTitle || DEFAULT_ABOUT.whoTitle;
  const paragraphs =
    c.whoParagraphs && c.whoParagraphs.length > 0
      ? c.whoParagraphs
      : DEFAULT_ABOUT.whoParagraphs;
  const tags =
    c.whoTags && c.whoTags.length > 0 ? c.whoTags : DEFAULT_ABOUT.whoTags;
  const imageUrl = c.whoImageUrl || DEFAULT_ABOUT.whoImageUrl;
  const filosofiQuote = c.whoFilosofiQuote || DEFAULT_ABOUT.whoFilosofiQuote;
  const filosofiDescription =
    c.whoFilosofiDescription || DEFAULT_ABOUT.whoFilosofiDescription;
  const founderName = c.whoFounderName || DEFAULT_ABOUT.whoFounderName;
  const founderRole = c.whoFounderRole || DEFAULT_ABOUT.whoFounderRole;
  const founderInitials =
    c.whoFounderInitials || DEFAULT_ABOUT.whoFounderInitials;
  const founderImageUrl = c.whoFounderImageUrl ?? "";
  const locationLine = c.whoLocationLine || DEFAULT_ABOUT.whoLocationLine;

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-stretch">
          {/* ── LEFT ── */}
          <Reveal>
            <div className="flex flex-col h-full">
              <SectionHeading
                as="h2"
                align="left"
                className="mb-6"
                eyebrow={eyebrow}
                title={title}
              />

              <div
                className="space-y-4 flex-1"
                style={{
                  fontSize: "1rem",
                  color: "#334155",
                  lineHeight: "1.75",
                }}
              >
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-2.5">
                {tags.map((tag) => (
                  <div
                    key={tag.text}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl"
                    style={{
                      background: BRAND.background,
                      border: "1px solid rgba(255,107,53,0.14)",
                      fontSize: "0.875rem",
                      color: BRAND.blueNavy,
                    }}
                  >
                    <Icon
                      name={tag.icon}
                      className="w-3.5 h-3.5 flex-shrink-0"
                      style={{ color: BRAND.blueNavy }}
                    />
                    {tag.text}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* ── RIGHT ── */}
          <Reveal delay={0.12}>
            <div
              className="relative rounded-3xl overflow-hidden flex flex-col"
              style={{
                background:
                  "linear-gradient(145deg, #0C1B30 0%, #0F2340 45%, #1A365D 100%)",
                boxShadow: "0 28px 72px rgba(15,35,64,0.28)",
                minHeight: "460px",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='1' fill='%23ffffff' fill-opacity='0.04'/%3E%3C/svg%3E")`,
                  backgroundSize: "24px 24px",
                }}
              />

              <div
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  bottom: "-40px",
                  right: "-40px",
                  width: "240px",
                  height: "240px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255,107,53,0.16) 0%, transparent 65%)",
                  filter: "blur(30px)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  top: "-30px",
                  left: "-30px",
                  width: "180px",
                  height: "180px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(45,184,176,0.1) 0%, transparent 65%)",
                  filter: "blur(24px)",
                }}
              />

              <div className="relative z-10 flex flex-col flex-1 px-8 py-10 lg:px-10">
                <div className="flex-1 flex items-center justify-center py-6">
                  <div className="relative">
                    <div
                      aria-hidden
                      style={{
                        position: "absolute",
                        inset: "-28px",
                        borderRadius: "50%",
                        background:
                          "radial-gradient(circle, rgba(255,107,53,0.1) 0%, transparent 70%)",
                        filter: "blur(14px)",
                      }}
                    />
                    <Image
                      src={imageUrl}
                      alt="Inggris Go"
                      width={220}
                      height={220}
                      priority
                      className="relative z-10 w-auto"
                      style={{
                        height: "clamp(150px, 18vw, 210px)",
                        objectFit: "contain",
                        filter: "drop-shadow(0 8px 32px rgba(255,107,53,0.22))",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    height: "1px",
                    background: "rgba(255,255,255,0.07)",
                    marginBottom: "20px",
                  }}
                />

                <div className="mb-5">
                  <p
                    className="font-display font-extrabold text-white mb-2"
                    style={{
                      fontSize: "clamp(1rem, 2vw, 1.125rem)",
                      letterSpacing: "-0.015em",
                      lineHeight: "1.35",
                    }}
                  >
                    &ldquo;{filosofiQuote}&rdquo;
                  </p>

                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "rgba(255,255,255,0.38)",
                      lineHeight: "1.6",
                    }}
                  >
                    {filosofiDescription}
                  </p>

                  <div className="mt-3 flex items-center gap-2.5">
                    {founderImageUrl ? (
                      <Image
                        src={founderImageUrl}
                        alt={founderName}
                        width={32}
                        height={32}
                        className="size-8 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex size-8 items-center justify-center rounded-full text-xs font-black text-white"
                        style={{ background: "#1B4FDB" }}
                      >
                        {founderInitials}
                      </div>
                    )}
                    <p className="leading-snug" style={{ fontSize: "0.75rem" }}>
                      <span className="block text-white/70">
                        — {founderName}
                      </span>
                      <span className="block text-white/30">{founderRole}</span>
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-2"
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    paddingTop: "14px",
                  }}
                >
                  <div
                    style={{
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: BRAND.problem.teal.accent,
                      opacity: 0.55,
                      flexShrink: 0,
                    }}
                  />
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "rgba(255,255,255,0.25)",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {locationLine}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default CompanySection;
