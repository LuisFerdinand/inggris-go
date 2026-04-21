export const siteConfig = {
  name: "Inggris Go",
  tagline: "Belajar Bahasa Inggris Tanpa Takut Salah",
  description:
    "Program speaking, English camp, dan kelas privat dari Kampung Inggris Pare.",
  location: "Kampung Inggris Pare, Kediri, Jawa Timur",
  whatsapp: "628113531160",
  email: "hello@inggrisgo.id",
  instagram: "https://www.instagram.com/inggrisgo.id?igsh=NWdwOWcxMm5sa3Fp",
  youtube: "https://youtube.com/@inggrisgoid?si=CUnvE3z4zUhLT0OG",
  tiktok: "https://www.tiktok.com/@inggrisgo.id?_r=1&_t=ZS-95d0La22nZ6",
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

  name?: string;
  email?: string;
  phone?: string;

  intent?: "program" | "consultation" | "enroll" | "simple" | "form";

  message?: string; // override
};

export function buildWhatsAppUrl(data: WhatsAppContactData) {
  const baseIntro = "Halo Inggris Go! 👋";

  const messages: Record<string, string> = {
    simple: `Halo Inggris Go! 👋

Saya ingin ${data.title}.
Boleh minta info lebih lanjut?`,
    form: `Halo Inggris Go! 👋

Saya ingin bertanya tentang program Anda.

*Nama:* ${data.name}
*Email:* ${data.email}
*No. HP:* ${data.phone || "-"}
*Program:* ${data.title}

*Pesan:*
${data.message}`,
    program: `
Saya tertarik dengan program *${data.title}*.

${data.duration ? `- Durasi: ${data.duration}\n` : ""}${
      data.price ? `- Harga: ${data.price}\n` : ""
    }${data.format ? `- Format: ${data.format}\n` : ""}${
      data.highlight ? `- Highlight: ${data.highlight}\n` : ""
    }
Boleh minta info cara join dan pembayarannya?
    `,

    consultation: `
Saya ingin konsultasi terlebih dahulu mengenai belajar Bahasa Inggris di Inggris Go.

Boleh dibantu jelaskan program yang paling cocok untuk saya?
    `,

    enroll: `
Saya ingin langsung mendaftar untuk *${data.title}*.

Mohon info langkah pendaftaran dan pembayaran ya.
    `,
  };

  const message =
    data.message ?? `${baseIntro}\n\n${messages[data.intent ?? "program"]}`;

  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
    message.trim(),
  )}`;
}
