import { ChartAreaInteractive } from "@/components/sidebar/chart-area-interactive";
import { DataTable } from "@/components/sidebar/data-table";
import { SectionCards } from "@/components/sidebar/section-cards";

import { SiteHeader } from "@/components/sidebar/site-header";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { tableData } from "./_modules/ui/views/data";
const CoursesPage = () => {
  return (
    <>
      <SiteHeader
        breadcrumbs={[{ label: "Dashboard" }, { label: "Program" }]}
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 ">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Program</h1>
              <Button variant="dashboard" size="default" asChild>
                <Link href="/dashboard/programs/create">Buat Program</Link>
              </Button>
            </div>
            <SectionCards />
            <div className="">
              <ChartAreaInteractive />
            </div>
            <DataTable data={tableData} />
          </div>
        </div>
      </div>
    </>
  );
};

export default CoursesPage;
