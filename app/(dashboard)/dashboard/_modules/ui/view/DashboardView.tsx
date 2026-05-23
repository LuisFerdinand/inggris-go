"use client";
import { ChartAreaInteractive } from "@/components/sidebar/chart-area-interactive";
import { DataTable } from "@/components/sidebar/data-table";
import { SectionCards } from "@/components/sidebar/section-cards";

import { SiteHeader } from "@/components/sidebar/site-header";
import { tableData } from "./data";
import { trpc } from "@/lib/trpc/client";
export const DashboardView = () => {
  const { data: categories, isLoading } =
    trpc.programs.getCategories.useQuery();

  return (
    <>
      <main className="bg-white">
        {isLoading ? (
          <>Loading</>
        ) : categories ? (
          categories.map((category) => {
            return <>{category.label}</>;
          })
        ) : (
          <>No data</>
        )}

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <SectionCards />
              <div className="">
                <ChartAreaInteractive />
              </div>
              <DataTable data={tableData} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
