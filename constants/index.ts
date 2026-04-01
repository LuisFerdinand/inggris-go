import { buildWhatsAppUrl } from "@/lib/config";
import {
  BookOpen,
  Home,
  Images,
  Info,
  Laptop,
  LayoutGrid,
  Mic,
  Phone,
  School,
  Tent,
  Users,
  Zap,
} from "lucide-react";

export const CEO = { name: "Yuma Rafi", role: "CEO & Founder", initials: "YR" };

export const tier2 = [
  {
    name: "Marissa",
    role: "Head of Education",
    initials: "MA",
    color: "#2DB8B0",
    bg: "rgba(45,184,176,0.08)",
    border: "rgba(45,184,176,0.22)",
    id: "education",
  },
  {
    name: "Escolastico",
    role: "Head of Marketing",
    initials: "ES",
    color: "#FF6B35",
    bg: "rgba(255,107,53,0.08)",
    border: "rgba(255,107,53,0.22)",
    id: "marketing",
  },
  {
    name: "Devi",
    role: "Finance Manager",
    initials: "DV",
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.08)",
    border: "rgba(124,58,237,0.22)",
    id: "finance",
  },
];

export const instructorTeam = [
  { name: "Efendi", role: "Instructor", initials: "EF" },
  { name: "Alfiyah", role: "Instructor", initials: "AL" },
  { name: "Cecylia", role: "Instructor", initials: "CE" },
  { name: "Aditya", role: "Instructor", initials: "AD" },
  { name: "Nina", role: "Instructor", initials: "NI" },
  { name: "Mery", role: "Instructor", initials: "MY" },
];

export const creativeTeam = {
  creative: {
    label: "Creative Division",
    leader: { name: "Hana", role: "Head of Creative Division", initials: "HN" },
    members: [
      { name: "Kintan", role: "Content Specialist", initials: "KN" },
      { name: "Nadhiera", role: "Content Specialist", initials: "ND" },
    ],
  },
  customer: {
    label: "Customer Division",
    leader: {
      name: "Aliya",
      role: "Head of Customer Division",
      initials: "AL",
    },
    members: [
      { name: "Shafira", role: "Admin Specialist", initials: "SF" },
      { name: "Destya", role: "Admin Specialist", initials: "DS" },
    ],
  },
};

export const marketingStaff = [
  { name: "Ana", role: "Marketing Staff", initials: "AN" },
];

export const leadMagnetPrograms = [
  {
    href: "/speaking-challenge",
    icon: Mic,
    iconBg: "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
    iconShadow: "rgba(255,107,53,0.3)",
    badge: "Terjangkau",
    badgeColor: "#FF6B35",
    title: "Basic Speaking",
    price: "Rp49.000",
    highlights: ["10 pertemuan", "60 mnt/sesi", "Breakout room"],
    cta: "Join Basic Speaking",
    ctaHref: buildWhatsAppUrl("Basic Speaking"),
    ctaExternal: true,
  },
  {
    href: "/speaking-challenge",
    icon: Zap,
    iconBg: "linear-gradient(135deg, #FF6B35 0%, #E8521C 100%)",
    iconShadow: "rgba(255,107,53,0.28)",
    badge: "Populer",
    badgeColor: "#E8521C",
    title: "Speaking Challenge",
    price: "Rp49.000",
    highlights: ["10 hari", "Via WhatsApp", "Feedback harian"],
    cta: "Join Speaking Challenge",
    ctaHref: buildWhatsAppUrl("Speaking Challenge"),
    ctaExternal: true,
  },
];
export const categoryCards = [
  {
    href: "/main-programs",
    icon: Users,
    cardGradient:
      "linear-gradient(145deg, rgba(45,184,176,0.07) 0%, rgba(45,184,176,0.13) 100%)",
    cardBorderDefault: "rgba(45,184,176,0.2)",
    cardBorderHover: "rgba(45,184,176,0.38)",
    iconGradient: "linear-gradient(135deg, #2DB8B0 0%, #1A9990 100%)",
    iconShadow: "rgba(45,184,176,0.35)",
    accentColor: "#1A9990",
    label: "Program Utama",
    desc: "Kelas speaking intensif dengan tutor personal, max 6–8 siswa.",
    ctaLabel: "Lihat Program Utama",
    ctaBg: "rgba(45,184,176,0.12)",
    ctaBgHover: "rgba(45,184,176,0.22)",
    ctaColor: "#0E7B74",
    ctaBorder: "rgba(45,184,176,0.28)",
  },
  {
    href: "/camp-programs",
    icon: Tent,
    cardGradient:
      "linear-gradient(145deg, rgba(15,35,64,0.04) 0%, rgba(15,35,64,0.09) 100%)",
    cardBorderDefault: "rgba(15,35,64,0.13)",
    cardBorderHover: "rgba(15,35,64,0.28)",
    iconGradient: "linear-gradient(135deg, #0F2340 0%, #1A365D 100%)",
    iconShadow: "rgba(15,35,64,0.25)",
    accentColor: "#0F2340",
    label: "Camp Program",
    desc: "VIP English Camp for Kids di Kampung Inggris Pare.",
    ctaLabel: "Lihat Camp Program",
    ctaBg: "rgba(15,35,64,0.07)",
    ctaBgHover: "rgba(15,35,64,0.14)",
    ctaColor: "#0F2340",
    ctaBorder: "rgba(15,35,64,0.16)",
  },
  {
    href: "/school-group-programs",
    icon: School,
    cardGradient:
      "linear-gradient(145deg, rgba(124,58,237,0.05) 0%, rgba(124,58,237,0.11) 100%)",
    cardBorderDefault: "rgba(124,58,237,0.18)",
    cardBorderHover: "rgba(124,58,237,0.35)",
    iconGradient: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
    iconShadow: "rgba(124,58,237,0.3)",
    accentColor: "#6D28D9",
    label: "Grup Sekolah",
    desc: "Program rombongan sekolah & pesantren, customizable.",
    ctaLabel: "Request Proposal",
    ctaBg: "rgba(124,58,237,0.09)",
    ctaBgHover: "rgba(124,58,237,0.18)",
    ctaColor: "#6D28D9",
    ctaBorder: "rgba(124,58,237,0.22)",
  },
];

export const PROGRAM_CATEGORIES = [
  {
    key: "online",
    label: "Kelas Online",
    desc: "Belajar intensif via Zoom",
    items: [
      {
        title: "Daily Conversation",
        href: "/programs/daily-conversation",
      },
      {
        title: "English for Kids",
        href: "/programs/english-for-kids",
      },
      {
        title: "Basic TOEFL",
        href: "/programs/basic-toefl",
      },
      {
        title: "Grammar for Speaking",
        href: "/programs/grammar-speaking",
      },
      {
        title: "Private Class",
        href: "/programs/private-class",
      },
    ],
  },
  {
    key: "camp",
    label: "Holiday Camp",
    desc: "Belajar langsung di Pare",
    items: [
      {
        title: "VIP English for Kids",
        href: "/programs/vip-kids-camp",
      },
      {
        title: "Program Rombongan",
        href: "/programs/group-program",
      },
    ],
  },
];

export const NAV_ICONS: Record<string, React.ElementType> = {
  "/": Home,
  "/program-kami": LayoutGrid,
  "/speaking-challenge": Mic,
  "/go-private": Laptop,
  "/vip-camp": Tent,
  "/school-camp": School,
  "/tentang-kami": Info,
  "/hubungi-kami": Phone,
  "/blog": Images,
};
