// app/(dashboard)/dashboard/projects/page.tsx
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { ProjectsListView } from "./_modules/ProjectsListView";

export const dynamic = "force-dynamic";

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center py-16 text-slate-300">
          <Loader2 className="size-5 animate-spin" />
        </div>
      }
    >
      <ProjectsListView />
    </Suspense>
  );
}
