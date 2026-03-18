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
  { label: "Program Kami", href: "/program-kami" },
  { label: "Blog", href: "/blog" },
] as const;

export function buildWhatsAppUrl(program: string) {
  const msg = encodeURIComponent(
    `Halo Inggris Go! Saya tertarik dengan program *${program}*. Boleh info lebih lanjut?`,
  );
  return `https://wa.me/${siteConfig.whatsapp}?text=${msg}`;
}
