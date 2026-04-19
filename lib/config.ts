export const siteConfig = {
  name: "Inggris Go",
  tagline: "Belajar Bahasa Inggris Tanpa Takut Salah",
  description:
    "Program speaking, English camp, dan kelas privat dari Kampung Inggris Pare.",
  location: "Kampung Inggris Pare, Kediri, Jawa Timur",
  whatsapp: "6281234567890",
  email: "hello@inggrisgo.id",
  instagram: "inggrisgo",
} as const;

export const navLinks = [
  { label: "Beranda", href: "/" },
  { label: "Tentang Kami", href: "/tentang-kami" },
  { label: "Program Kami", href: "/programs" },
  { label: "Blog", href: "/blog" },
] as const;

type WhatsAppContactData = {
  title: string;
  price?: string;
  duration?: string;
  format?: string;
  highlight?: string;
  message?: string; // optional override
};

export function buildWhatsAppUrl(data: WhatsAppContactData) {
  const message =
    data.message ??
    `Halo Inggris Go! 👋

Saya tertarik dengan program *${data.title}*.

${data.duration ? `- Durasi: ${data.duration}\n` : ""}${
      data.price ? `- Harga: ${data.price}\n` : ""
    }${data.format ? `- Format: ${data.format}\n` : ""}${
      data.highlight ? `- Highlight: ${data.highlight}\n` : ""
    }
Boleh minta info cara join dan pembayarannya?`;

  const encoded = encodeURIComponent(message);

  return `https://wa.me/${siteConfig.whatsapp}?text=${encoded}`;
}
