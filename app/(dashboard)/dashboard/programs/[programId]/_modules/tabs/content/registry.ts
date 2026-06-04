// app/(dashboard)/dashboard/programs/[programId]/_modules/tabs/content/registry.ts
import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  AlertCircle,
  Gift,
  ListOrdered,
  CalendarRange,
  Images,
  GraduationCap,
  Building2,
  HeartHandshake,
  Tags,
  Quote,
  HelpCircle,
  MousePointerClick,
  Layers3,
} from "lucide-react";

export interface SectionMeta {
  type: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

/**
 * Order here = the order sections are offered in the "Add section" picker.
 * Mirrors SECTION_PRESETS from the previous ProgramSectionsSection.
 */
export const SECTION_META: SectionMeta[] = [
  { type: "hero", label: "Hero", description: "Section pembuka utama landing page.", icon: Sparkles },
  { type: "why", label: "Why / Problem", description: "Masalah utama yang dialami calon peserta.", icon: AlertCircle },
  { type: "benefits", label: "Benefits", description: "Manfaat & hasil yang akan didapat peserta.", icon: Gift },
  { type: "steps", label: "Steps", description: "Cara kerja atau proses belajar program.", icon: ListOrdered },
  { type: "timeline", label: "Timeline", description: "Jadwal belajar, minggu, atau rutinitas harian.", icon: CalendarRange },
  { type: "gallery", label: "Gallery", description: "Dokumentasi foto kegiatan atau suasana kelas.", icon: Images },
  { type: "classes", label: "Classes", description: "Pilihan kelas, level, atau kelompok belajar.", icon: GraduationCap },
  { type: "facilities", label: "Facilities", description: "Fasilitas program (cocok untuk offline/camp).", icon: Building2 },
  { type: "mentorship", label: "Mentorship", description: "Pendampingan, tutor, atau pembimbing program.", icon: HeartHandshake },
  { type: "pricing", label: "Pricing", description: "Harga, paket, bonus, dan urgency program.", icon: Tags },
  { type: "testimonials", label: "Testimonials", description: "Testimoni peserta, alumni, atau orang tua.", icon: Quote },
  { type: "faq", label: "FAQ", description: "Pertanyaan umum tentang program.", icon: HelpCircle },
  { type: "cta", label: "CTA", description: "Section penutup untuk mengarahkan pendaftaran.", icon: MousePointerClick },
];

const META_BY_TYPE = new Map(SECTION_META.map((m) => [m.type, m]));

export function getSectionMeta(type: string): SectionMeta {
  return (
    META_BY_TYPE.get(type) ?? {
      type,
      label: type,
      description: "Section kustom.",
      icon: Layers3,
    }
  );
}