// app/(home)/contact/page.tsx
import { HydrateClient, trpc } from "@/lib/trpc/server";
import { buildPageMetadata } from "@/lib/seo";
import ContactView from "./_modules/ContactView";

export const dynamic = "force-dynamic";

export const generateMetadata = () =>
  buildPageMetadata({
    path: "/contact",
    title: "Hubungi Kami",
    description:
      "Tanya program, jadwal, atau biaya ke tim Inggris Go lewat WhatsApp, email, atau formulir kontak. Kami balas secepatnya.",
  });

export default async function ContactPage() {
  await Promise.all([
    trpc.siteContent.getContact.prefetch(),
    trpc.siteContent.getCta.prefetch(),
  ]);

  return (
    <HydrateClient>
      <ContactView />
    </HydrateClient>
  );
}
