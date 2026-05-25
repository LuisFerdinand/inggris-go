import {
  BarChart2,
  Eye,
  Megaphone,
  Pencil,
  Plus,
  Settings2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { ProgramTab } from "./program-detail.config";
import { PROGRAM_STATUS_META, ProgramStatus } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { ProgramStatusBadge } from "../../../_modules/ui/components";

interface ProgramDetailShell {
  status: ProgramStatus;
  scheduleType: "permanent" | "scheduled";
}

interface GetProgramHeaderActionsOptions {
  tab: ProgramTab;
  shell?: ProgramDetailShell | null;

  onEdit?: () => void;
  onCreateBatch?: () => void;
  onCreatePackage?: () => void;
}

export function getProgramHeaderActions({
  tab,
  shell,
  onEdit,
  onCreateBatch,
  onCreatePackage,
}: GetProgramHeaderActionsOptions) {
  const actions: React.ReactNode[] = [];

  /*
    Status badge is global.
  */
  if (shell?.status) {
    actions.push(<ProgramStatusBadge key="status" status={shell.status} />);
  }

  /*
    Contextual actions.
  */

  switch (tab) {
    case "overview":
    case "content":
    case "marketing":
    case "settings":
      actions.push(
        <Button
          key="edit"
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs rounded-lg"
          onClick={onEdit}
        >
          <Pencil className="size-3" />
          Edit
        </Button>,
      );

      break;

    case "batches":
      actions.push(
        <Button
          key="create-batch"
          size="sm"
          className="gap-1.5 text-xs rounded-lg"
          onClick={onCreateBatch}
        >
          <Plus className="size-3" />
          New Batch
        </Button>,
      );

      break;

    case "packages":
      actions.push(
        <Button
          key="create-package"
          size="sm"
          className="gap-1.5 text-xs rounded-lg"
          onClick={onCreatePackage}
        >
          <Plus className="size-3" />
          New Package
        </Button>,
      );

      break;

    case "analytics":
      actions.push(
        <Button
          key="analytics"
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs rounded-lg"
        >
          <BarChart2 className="size-3" />
          Export
        </Button>,
      );

      break;

    case "enrollments":
      actions.push(
        <Button
          key="view-public"
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs rounded-lg"
        >
          <Eye className="size-3" />
          View Public Page
        </Button>,
      );

      break;
  }

  return <div className="flex items-center gap-2">{actions}</div>;
}
