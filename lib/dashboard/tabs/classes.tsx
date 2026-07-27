import { Users, CalendarCheck, ClipboardCheck, FileDown } from "lucide-react";
import { createRegistry } from "../nav-registry";

export type ClassDetailTab = "roster" | "sessions" | "scores" | "reports";

export const classDetailRegistry = createRegistry<ClassDetailTab>(
  [
    { value: "roster", label: "Roster", icon: <Users /> },
    { value: "sessions", label: "Sesi & Kehadiran", icon: <CalendarCheck /> },
    { value: "scores", label: "Penilaian", icon: <ClipboardCheck /> },
    { value: "reports", label: "Laporan", icon: <FileDown /> },
  ],
  "roster",
);
