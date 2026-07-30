// app/modules/daily-reports/daily-report.schema.ts
import { z } from "zod";

export const submitReportInput = z.object({
  content: z.string().trim().min(1, "Laporan tidak boleh kosong").max(5000),
});
