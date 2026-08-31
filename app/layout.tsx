// app/layout.tsx

import type { Metadata } from "next";
import Script from "next/script";
import { Geist } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";

import { Toaster } from "react-hot-toast";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { AuthProvider } from "@/components/AuthProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";
import { TRPCProvider } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { getSiteHeaderSettings } from "@/app/modules/site-header/server/site-header.service";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteHeaderSettings();

  const title = settings.metaTitle;
  const description = settings.metaDescription;

  return {
    title,
    description,
    keywords: settings.metaKeywords
      ? settings.metaKeywords
          .split(",")
          .map((keyword) => keyword.trim())
          .filter(Boolean)
      : undefined,

    metadataBase: settings.canonicalUrl
      ? new URL(settings.canonicalUrl)
      : undefined,

    alternates: settings.canonicalUrl
      ? {
          canonical: settings.canonicalUrl,
        }
      : undefined,

    openGraph: {
      title: settings.ogTitle || title,
      description: settings.ogDescription || description,
      type: "website",
      images: settings.ogImageUrl
        ? [
            {
              url: settings.ogImageUrl,
            },
          ]
        : undefined,
    },

    icons: {
      icon: settings.faviconUrl
        ? [
            {
              url: settings.faviconUrl,
            },
          ]
        : undefined,

      apple: settings.appleTouchIconUrl
        ? [
            {
              url: settings.appleTouchIconUrl,
            },
          ]
        : undefined,
    },

    other: {
      ...(settings.themeColor
        ? {
            "theme-color": settings.themeColor,
          }
        : {}),
    },
  };
}

function GoogleAnalytics({ id }: { id: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />

      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}

function GoogleTagManager({ id }: { id: string }) {
  return (
    <>
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${id}');
        `}
      </Script>

      <noscript
        dangerouslySetInnerHTML={{
          __html: `
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=${id}"
              height="0"
              width="0"
              style="display:none;visibility:hidden"
            ></iframe>
          `,
        }}
      />
    </>
  );
}

function MetaPixel({ id }: { id: string }) {
  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${id}');
          fbq('track', 'PageView');
        `}
      </Script>

      <noscript
        dangerouslySetInnerHTML={{
          __html: `
            <img
              height="1"
              width="1"
              style="display:none"
              src="https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1"
            />
          `,
        }}
      />
    </>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteHeaderSettings();

  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn("h-full font-sans", geist.variable)}
    >
      <body suppressHydrationWarning className="font-body h-full antialiased">
        {settings.isActive && settings.googleTagManagerId ? (
          <GoogleTagManager id={settings.googleTagManagerId} />
        ) : null}

        {settings.isActive && settings.metaPixelId ? (
          <MetaPixel id={settings.metaPixelId} />
        ) : null}

        {settings.isActive && settings.customBodyStartHtml ? (
          <div
            dangerouslySetInnerHTML={{
              __html: settings.customBodyStartHtml,
            }}
          />
        ) : null}

        <AuthProvider>
          <TRPCProvider>
            <NuqsAdapter>
              <TooltipProvider delayDuration={0}>
                <ConfirmProvider>
                  <main>
                    {children}

                    <Toaster
                      position="bottom-right"
                      gutter={10}
                      toastOptions={{
                        duration: 4000,
                        style: {
                          borderRadius: "16px",
                          fontSize: "13px",
                          fontWeight: 500,
                          padding: "14px 16px",
                          backdropFilter: "blur(10px)",
                          boxShadow:
                            "0 10px 30px rgba(15,23,42,0.08), 0 2px 8px rgba(15,23,42,0.06)",
                        },
                        success: {
                          iconTheme: {
                            primary: "#1a52c8",
                            secondary: "#ffffff",
                          },
                          style: {
                            background: "#f8fbff",
                            color: "#163b8f",
                            border: "1px solid #d7e5ff",
                          },
                        },
                        error: {
                          iconTheme: {
                            primary: "#dc2626",
                            secondary: "#ffffff",
                          },
                          style: {
                            background: "#fff7f7",
                            color: "#991b1b",
                            border: "1px solid #ffd5d5",
                          },
                        },
                        loading: {
                          iconTheme: {
                            primary: "#1a52c8",
                            secondary: "#ffffff",
                          },
                          style: {
                            background: "#ffffff",
                            color: "#334155",
                            border: "1px solid #e2e8f0",
                          },
                        },
                      }}
                    />
                  </main>
                </ConfirmProvider>
              </TooltipProvider>
            </NuqsAdapter>
          </TRPCProvider>
        </AuthProvider>

        {settings.isActive && settings.googleAnalyticsId ? (
          <GoogleAnalytics id={settings.googleAnalyticsId} />
        ) : null}

        {settings.isActive && settings.customHeadScript ? (
          <Script id="custom-head-script" strategy="afterInteractive">
            {settings.customHeadScript}
          </Script>
        ) : null}

        {settings.isActive && settings.customBodyEndScript ? (
          <Script id="custom-body-end-script" strategy="afterInteractive">
            {settings.customBodyEndScript}
          </Script>
        ) : null}
      </body>
    </html>
  );
}
