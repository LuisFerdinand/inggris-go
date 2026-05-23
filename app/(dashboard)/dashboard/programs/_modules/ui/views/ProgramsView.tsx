"use client";

import { BookOpen } from "lucide-react";
import { PageNav, PageHeader } from "@/components/PageHeader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProgramsSection } from "../sections/ProgamsSection";

export const ProgramsView = () => {
  return (
    <div className="flex flex-col gap-y-5 pt-2.5">
      <PageNav sticky>
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Program", icon: <BookOpen /> },
          ]}
          title="Manajemen Program"
          description="Lihat dan kelola semua program pembelajaran."
          actions={
            <Button
              size="sm"
              variant={"dashboard"}
              className="gap-1.5 rounded-lg"
              asChild
            >
              <Link href="/dashboard/programs/create">
                <Plus className="size-3.5" />
                Program Baru
              </Link>
            </Button>
          }
        />
      </PageNav>

      <ProgramsSection />
    </div>
  );
};
