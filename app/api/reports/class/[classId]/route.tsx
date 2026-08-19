// app/api/reports/class/[classId]/route.tsx
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { auth } from "@/lib/auth";
import {
  getClassForAccessCheck,
  getClassReportData,
} from "@/app/modules/class/server/report.service";
import { StudentReportDocument } from "@/lib/pdf/StudentReportDocument";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ classId: string }> },
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { classId } = await params;
  const classRow = await getClassForAccessCheck(classId);

  if (!classRow) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const role = session.user.role;
  const isOversight =
    role === "author" ||
    role === "operational_manager" ||
    role === "admin" ||
    role === "super_admin";

  if (!isOversight && classRow.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const reports = await getClassReportData(classId);

  if (reports.length === 0) {
    return NextResponse.json(
      { error: "Belum ada laporan yang difinalisasi" },
      { status: 404 },
    );
  }

  const buffer = await renderToBuffer(
    <StudentReportDocument reports={reports} />,
  );

  const filename = `laporan-${classRow.title.replace(/\s+/g, "-")}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
