// app/api/reports/student-score/[scoreId]/route.tsx
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { auth } from "@/lib/auth";
import { getStudentReportData } from "@/app/modules/class/server/report.service";
import { StudentReportDocument } from "@/lib/pdf/StudentReportDocument";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ scoreId: string }> },
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { scoreId } = await params;
  const data = await getStudentReportData(scoreId);

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const role = session.user.role;
  const isOversight = role === "author" || role === "admin" || role === "super_admin";
  const isOwningTeacher = data.classTeacherId === session.user.id;
  const isOwningStudent =
    !!data.finalizedAt && data.studentUserId === session.user.id;

  if (!isOversight && !isOwningTeacher && !isOwningStudent) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const buffer = await renderToBuffer(
    <StudentReportDocument reports={[data]} />,
  );

  const filename = `laporan-${data.studentName.replace(/\s+/g, "-")}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
