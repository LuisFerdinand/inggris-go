import { Tab } from "@/components/PageTabs";
import {
  BookOpen,
  BarChart2,
  Users,
  Package,
  Layers,
  FileText,
  Pencil,
} from "lucide-react";

export type ProgramTab =
  | "overview"
  | "batches"
  | "packages"
  | "enrollments"
  | "content"
  | "analytics";

export const PROGRAM_TABS: Tab[] = [
  { label: "Ringkasan", value: "overview", icon: <BookOpen /> },
  { label: "Batch", value: "batches", icon: <Layers /> },
  { label: "Paket", value: "packages", icon: <Package /> },
  { label: "Pendaftaran", value: "enrollments", icon: <Users /> },
  { label: "Konten", value: "content", icon: <FileText /> },
  { label: "Analitik", value: "analytics", icon: <BarChart2 /> },
];

export const TAB_LABELS: Record<ProgramTab, string> = {
  overview: "Ringkasan",
  batches: "Batch",
  packages: "Paket",
  enrollments: "Pendaftaran",
  content: "Konten",
  analytics: "Analitik",
};

export const TAB_ICONS: Record<ProgramTab, React.ReactNode> = {
  overview: <BookOpen />,
  batches: <Layers />,
  packages: <Package />,
  enrollments: <Users />,
  content: <FileText />,
  analytics: <BarChart2 />,
};

export const DEFAULT_TAB: ProgramTab = "overview";
