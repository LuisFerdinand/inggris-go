// app/(dashboard)/dashboard/_modules/ui/view/DashboardView.tsx

"use client";

import { AlertCircle, LayoutDashboard, Loader2, RefreshCcw } from "lucide-react";

import { ChartAreaInteractive } from "@/components/sidebar/chart-area-interactive";
import { DataTable } from "@/components/sidebar/data-table";
import { SectionCards } from "@/components/sidebar/section-cards";
import { trpc } from "@/lib/trpc/client";
import { PageHeader, PageNav } from "@/components/PageHeader";

export const DashboardView = () => {
  const dashboardQuery = trpc.orders.getDashboardOverview.useQuery(
    {
      months: 12,
    },
    {
      placeholderData: (prev) => prev,
    },
  );

  const data = dashboardQuery.data;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex flex-col gap-y-4 pt-2.5">
        <PageNav sticky>
          <PageHeader
            breadcrumbs={[
              {
                label: "Dashboard",
                icon: <LayoutDashboard />,
              },
            ]}
            title="Dashboard"
            description="Ringkasan performa pesanan, revenue, dan status pembayaran dari seluruh program."
          />
        </PageNav>

        <div className="flex flex-col gap-4 px-4 pb-10 lg:px-6">
          {dashboardQuery.isLoading && !data ? (
            <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-400 shadow-sm">
              <div className="flex items-center gap-3">
                <Loader2 className="size-5 animate-spin" />
                <p className="text-sm font-semibold">Memuat dashboard…</p>
              </div>
            </div>
          ) : dashboardQuery.isError ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-3xl border border-red-200 bg-red-50 text-center shadow-sm">
              <AlertCircle className="size-8 text-red-500" />

              <div>
                <p className="text-sm font-black text-red-700">
                  Gagal memuat dashboard
                </p>
                <p className="mt-1 max-w-md text-xs font-medium text-red-500">
                  {dashboardQuery.error.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => dashboardQuery.refetch()}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white transition-colors hover:bg-red-700"
              >
                <RefreshCcw className="size-3.5" />
                Coba Lagi
              </button>
            </div>
          ) : data ? (
            <>
              <SectionCards data={data.summary} />

              <ChartAreaInteractive data={data.chart} />

              <DataTable data={data.recentOrders} />
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
};