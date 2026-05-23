import { BookOpen, Layers, Package, Users, FileText, BarChart2 } from "lucide-react";
import { createRegistry } from "../nav-registry";

export type ProgramTab =
  | "overview" | "batches" | "packages"
  | "enrollments" | "content" | "analytics";

export const programRegistry = createRegistry<ProgramTab>(
  [
    { value: "overview",    label: "Ringkasan",    icon: <BookOpen /> },
    { value: "batches",     label: "Batch",        icon: <Layers /> },
    { value: "packages",    label: "Paket",        icon: <Package /> },
    { value: "enrollments", label: "Pendaftaran",  icon: <Users /> },
    { value: "content",     label: "Konten",       icon: <FileText /> },
    { value: "analytics",   label: "Analitik",     icon: <BarChart2 /> },
  ],
  "overview",
);