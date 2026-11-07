"use client";

import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { trpc } from "@/lib/trpc/client";
import { BRAND, GRADIENT_GOLD_TEXT } from "@/constants/brand";
import { Eye, Target } from "lucide-react";
import { DEFAULT_ABOUT } from "@/app/modules/site-content/site-content.defaults";

/** Renders `title` with the first occurrence of `accent` gold-highlighted. */
function AccentTitle({ title, accent }: { title: string; accent: string }) {
  if (!accent || !title.includes(accent)) return <>{title}</>;
  const [before, ...rest] = title.split(accent);
  return (
    <>
      {before}
      <span style={GRADIENT_GOLD_TEXT}>{accent}</span>
      {rest.join(accent)}
    </>
  );
}

export const VisionMissionSection = () => {
  const { data } = trpc.siteContent.getAbout.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const c = data && data.isActive !== false ? data : DEFAULT_ABOUT;

  const eyebrow = c.vmEyebrow || DEFAULT_ABOUT.vmEyebrow;
  const title = c.vmTitle || DEFAULT_ABOUT.vmTitle;
  const titleAccent = c.vmTitleAccent ?? DEFAULT_ABOUT.vmTitleAccent;
  const visionBadge = c.visionBadge || DEFAULT_ABOUT.visionBadge;
  const visionStatement = c.visionStatement || DEFAULT_ABOUT.visionStatement;
  const visionStatementAccent =
    c.visionStatementAccent ?? DEFAULT_ABOUT.visionStatementAccent;
  const visionFooterNote =
    c.visionFooterNote || DEFAULT_ABOUT.visionFooterNote;
  const missions =
    c.missions && c.missions.length > 0 ? c.missions : DEFAULT_ABOUT.missions;

  return (
    <section className="py-16 lg:py-24" style={{ background: BRAND.background }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 xl:px-12">
        <SectionHeading
          className="mb-10 sm:mb-12"
          eyebrow={eyebrow}
          title={<AccentTitle title={title} accent={titleAccent} />}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* VISION */}
          <Reveal delay={0.05}>
            <div
              className="relative h-full rounded-3xl overflow-hidden flex flex-col group"
              style={{
                background:
                  "linear-gradient(145deg, #0C1B30 0%, #0F2340 55%, #1A365D 100%)",
                boxShadow: "0 8px 40px rgba(15,35,64,0.22)",
                minHeight: "360px",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Ccircle cx='11' cy='11' r='1' fill='%23ffffff' fill-opacity='0.045'/%3E%3C/svg%3E")`,
                  backgroundSize: "22px 22px",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  bottom: "-40px",
                  right: "-40px",
                  width: "220px",
                  height: "220px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(201,150,58,0.22) 0%, transparent 65%)",
                  filter: "blur(32px)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  top: "-60px",
                  left: "-60px",
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(24,95,165,0.28) 0%, transparent 65%)",
                  filter: "blur(32px)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute select-none"
                style={{
                  bottom: "-14px",
                  right: "14px",
                  fontFamily: "var(--font-syne), sans-serif",
                  fontWeight: 900,
                  fontSize: "6rem",
                  color: "rgba(255,255,255,0.025)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                VISI
              </div>

              <div className="relative z-10 flex flex-col flex-1 p-8 lg:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${BRAND.goldVivid} 0%, ${BRAND.goldMid} 100%)`,
                      boxShadow: "0 6px 20px rgba(201,150,58,0.35)",
                    }}
                  >
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p
                      className="font-display font-bold"
                      style={{
                        fontSize: "0.75rem",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: BRAND.goldVivid,
                      }}
                    >
                      Visi
                    </p>
                    <h3
                      className="font-display font-extrabold text-white"
                      style={{ fontSize: "1.125rem", letterSpacing: "-0.015em" }}
                    >
                      Our Vision
                    </h3>
                  </div>
                </div>

                {visionBadge && (
                  <div
                    className="inline-flex items-center gap-2 mb-6 self-start"
                    style={{
                      background: "rgba(201,150,58,0.1)",
                      border: "1px solid rgba(201,150,58,0.25)",
                      borderRadius: "100px",
                      padding: "5px 14px",
                    }}
                  >
                    <div
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: BRAND.goldVivid,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      className="font-display font-bold"
                      style={{
                        fontSize: "0.75rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: BRAND.goldVivid,
                      }}
                    >
                      {visionBadge}
                    </span>
                  </div>
                )}

                <p
                  className="font-display font-bold flex-1"
                  style={{
                    fontSize: "clamp(1.0625rem, 1.8vw, 1.25rem)",
                    lineHeight: "1.7",
                    color: "rgba(255,255,255,0.88)",
                    marginBottom: "28px",
                  }}
                >
                  {visionStatement}
                  {visionStatementAccent && (
                    <span style={GRADIENT_GOLD_TEXT}>
                      {" "}
                      {visionStatementAccent}
                    </span>
                  )}
                </p>

                <div
                  className="flex items-center gap-3"
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.07)",
                    paddingTop: "20px",
                  }}
                >
                  <div
                    style={{
                      height: "2px",
                      width: "32px",
                      borderRadius: "2px",
                      background: `linear-gradient(90deg, ${BRAND.blue}, ${BRAND.blueNavy})`,
                      flexShrink: 0,
                    }}
                  />
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "rgba(255,255,255,0.25)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {visionFooterNote}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* MISSION */}
          <Reveal delay={0.1}>
            <div
              className="h-full rounded-3xl overflow-hidden flex flex-col"
              style={{
                background: "white",
                border: `1.5px solid rgba(26,58,110,0.12)`,
                boxShadow: "0 8px 40px rgba(26,58,110,0.07)",
              }}
            >
              <div
                className="px-8 py-5 lg:px-10 flex items-center gap-3 flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.blueNavy} 0%, #0C1B30 100%)`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p
                    className="font-display font-bold text-white"
                    style={{
                      fontSize: "0.75rem",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      opacity: 0.5,
                    }}
                  >
                    Misi
                  </p>
                  <h3
                    className="font-display font-extrabold text-white"
                    style={{ fontSize: "1.125rem", letterSpacing: "-0.015em" }}
                  >
                    Our Mission
                  </h3>
                </div>
              </div>

              <ul className="flex-1 flex flex-col">
                {missions.map((m, i) => (
                  <li
                    key={m.num}
                    className="flex items-start gap-4 px-8 lg:px-10 py-5 transition-colors duration-200"
                    style={{
                      borderBottom:
                        i < missions.length - 1
                          ? `1px solid rgba(26,58,110,0.07)`
                          : "none",
                    }}
                  >
                    <span
                      className="font-display font-extrabold flex-shrink-0"
                      style={{
                        fontSize: "0.75rem",
                        color: BRAND.goldVivid,
                        opacity: 0.65,
                        letterSpacing: "0.08em",
                        minWidth: "24px",
                        paddingTop: "3px",
                      }}
                    >
                      {m.num}
                    </span>

                    <div
                      className="flex-shrink-0"
                      style={{
                        width: "3px",
                        minHeight: "38px",
                        borderRadius: "2px",
                        marginTop: "4px",
                        background: `linear-gradient(180deg, ${BRAND.blueNavy} 0%, rgba(26,58,110,0.12) 100%)`,
                      }}
                    />

                    <p
                      style={{
                        fontSize: "0.9375rem",
                        color: "#334155",
                        lineHeight: "1.68",
                      }}
                    >
                      {m.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default VisionMissionSection;
