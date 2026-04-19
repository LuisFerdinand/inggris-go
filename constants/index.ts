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

export const PROGRAM_CATEGORIES = [
  {
    key: "online",
    label: "Program Online",
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
    key: "offline",
    label: "Program Offline",
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
