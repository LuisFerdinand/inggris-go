// app/(dashboard)/dashboard/laporan-harian/page.tsx

import { DailyReportView } from "./_modules/DailyReportView";

export const dynamic = "force-dynamic";

export default function DailyReportPage() {
  return <DailyReportView />;
}
