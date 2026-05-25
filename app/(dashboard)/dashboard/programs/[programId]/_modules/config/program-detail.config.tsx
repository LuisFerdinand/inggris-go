import { Tab } from "@/components/PageTabs";
import {
  BookOpen,
  BarChart2,
  Users,
  Package,
  Layers,
  FileText,
  Megaphone,
  Settings2,
} from "lucide-react";

export type ProgramTab =
  | "overview"
  | "content"
  | "batches"
  | "packages"
  | "enrollments"
  | "analytics"
  | "marketing"
  | "settings";

/* =========================================================
   TAB REGISTRY
   Ordered intentionally by workflow priority:
   overview → content → commerce → operations → system
========================================================= */

export const PROGRAM_TAB_REGISTRY: Record<ProgramTab, Tab> = {
  overview: {
    label: "Ringkasan",
    value: "overview",
    icon: <BookOpen />,
  },

  content: {
    label: "Konten",
    value: "content",
    icon: <FileText />,
  },

  batches: {
    label: "Batch",
    value: "batches",
    icon: <Layers />,
  },

  packages: {
    label: "Paket",
    value: "packages",
    icon: <Package />,
  },

  enrollments: {
    label: "Pendaftaran",
    value: "enrollments",
    icon: <Users />,
  },

  analytics: {
    label: "Analitik",
    value: "analytics",
    icon: <BarChart2 />,
  },

  marketing: {
    label: "Marketing",
    value: "marketing",
    icon: <Megaphone />,
  },

  settings: {
    label: "Pengaturan",
    value: "settings",
    icon: <Settings2 />,
  },
};

/* =========================================================
   LABEL MAP
========================================================= */

export const TAB_LABELS: Record<ProgramTab, string> = {
  overview: "Ringkasan",
  content: "Konten",
  batches: "Batch",
  packages: "Paket",
  enrollments: "Pendaftaran",
  analytics: "Analitik",
  marketing: "Marketing",
  settings: "Pengaturan",
};

/* =========================================================
   ICON MAP
========================================================= */

export const TAB_ICONS: Record<ProgramTab, React.ReactNode> = {
  overview: <BookOpen />,
  content: <FileText />,
  batches: <Layers />,
  packages: <Package />,
  enrollments: <Users />,
  analytics: <BarChart2 />,
  marketing: <Megaphone />,
  settings: <Settings2 />,
};

/* =========================================================
   DEFAULT TAB
========================================================= */

export const DEFAULT_TAB: ProgramTab = "overview";

interface ProgramDetailShell {
  scheduleType: "permanent" | "scheduled";

  stats?: {
    batchesCount?: number;
    enrollmentsCount?: number;
  };

  features?: {
    hasBatches?: boolean;
    hasPackages?: boolean;
    hasContent?: boolean;
  };
}

export function buildProgramTabs(program?: ProgramDetailShell | null) {
  if (!program) {
    return [PROGRAM_TAB_REGISTRY.overview, PROGRAM_TAB_REGISTRY.content];
  }

  const tabs: ProgramTab[] = ["overview", "content"];

  /*
    Scheduled programs own batches.
    Permanent programs skip them entirely.
  */
  if (program.scheduleType === "scheduled") {
    tabs.push("batches");
  }

  tabs.push("packages", "enrollments", "analytics", "marketing", "settings");

  return tabs.map((tab) => {
    const config = PROGRAM_TAB_REGISTRY[tab];

    /*
      Optional dynamic badges
      (future-ready)
    */
    if (tab === "batches") {
      return {
        ...config,
        badge: program.stats?.batchesCount,
      };
    }

    if (tab === "enrollments") {
      return {
        ...config,
        badge: program.stats?.enrollmentsCount,
      };
    }

    return config;
  });
}

export function isProgramTab(value: string): value is ProgramTab {
  return value in PROGRAM_TAB_REGISTRY;
}
