// app/modules/class/server/report.service.ts
import { and, eq, isNotNull } from "drizzle-orm";

import { db } from "@/app/db/db";
import { classEnrollments, classes, studentScores } from "@/app/db/schema/classes";
import { programs } from "@/app/db/schema/programs";
import { user } from "@/app/db/schema/auth-schema";
import {
  COMPETENCY_FIELDS,
  computeAverageScore,
  getCompetencyLabel,
  getProgressLabel,
} from "@/lib/lms/scoring";

export type StudentReportData = {
  scoreId: string;
  studentName: string;
  programTitle: string;
  batchTitle: string;
  tutorName: string;
  periodLabel: string | null;
  competencies: { key: string; label: string; score: number; scoreLabel: string }[];
  average: number;
  progressLabel: string;
  summary: string | null;
  strengths: string | null;
  areasToImprove: string | null;
  tutorNotes: string | null;
  parentRecommendation: string | null;
  tutorCoordinatorName: string | null;
  classTeacherId: string;
  studentUserId: string | null;
  finalizedAt: Date | string | null;
};

function buildReportData(params: {
  score: typeof studentScores.$inferSelect;
  studentName: string;
  studentUserId: string | null;
  classRow: typeof classes.$inferSelect;
  programTitle: string;
  tutorName: string;
}): StudentReportData {
  const { score, studentName, studentUserId, classRow, programTitle, tutorName } = params;

  const rawScores = {
    grammarAccuracy: score.grammarAccuracy,
    pronunciation: score.pronunciation,
    vocabulary: score.vocabulary,
    fluency: score.fluency,
    confidence: score.confidence,
    listening: score.listening,
    participation: score.participation,
  };

  const average = computeAverageScore(rawScores);

  return {
    scoreId: score.id,
    studentName,
    programTitle,
    batchTitle: classRow.title,
    tutorName,
    periodLabel: classRow.periodLabel,
    competencies: COMPETENCY_FIELDS.map((field) => ({
      key: field.key,
      label: field.label,
      score: rawScores[field.key],
      scoreLabel: getCompetencyLabel(rawScores[field.key]),
    })),
    average,
    progressLabel: getProgressLabel(average),
    summary: score.summary,
    strengths: score.strengths,
    areasToImprove: score.areasToImprove,
    tutorNotes: score.tutorNotes,
    parentRecommendation: score.parentRecommendation,
    tutorCoordinatorName: score.tutorCoordinatorName,
    classTeacherId: classRow.teacherId,
    studentUserId,
    finalizedAt: score.finalizedAt,
  };
}

export async function getStudentReportData(
  scoreId: string,
): Promise<StudentReportData | null> {
  const score = await db.query.studentScores.findFirst({
    where: eq(studentScores.id, scoreId),
  });
  if (!score) return null;

  const enrollment = await db.query.classEnrollments.findFirst({
    where: eq(classEnrollments.id, score.classEnrollmentId),
  });
  if (!enrollment) return null;

  const classRow = await db.query.classes.findFirst({
    where: eq(classes.id, score.classId),
  });
  if (!classRow) return null;

  const [program] = await db
    .select({ title: programs.title })
    .from(programs)
    .where(eq(programs.id, classRow.programId));

  const [teacher] = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.id, classRow.teacherId));

  return buildReportData({
    score,
    studentName: enrollment.studentName,
    studentUserId: enrollment.studentUserId,
    classRow,
    programTitle: program?.title ?? "",
    tutorName: teacher?.name ?? "",
  });
}

export async function getClassReportData(
  classId: string,
): Promise<StudentReportData[]> {
  const classRow = await db.query.classes.findFirst({
    where: eq(classes.id, classId),
  });
  if (!classRow) return [];

  const [program] = await db
    .select({ title: programs.title })
    .from(programs)
    .where(eq(programs.id, classRow.programId));

  const [teacher] = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.id, classRow.teacherId));

  const finalizedScores = await db.query.studentScores.findMany({
    where: and(eq(studentScores.classId, classId), isNotNull(studentScores.finalizedAt)),
  });

  const results: StudentReportData[] = [];

  for (const score of finalizedScores) {
    const enrollment = await db.query.classEnrollments.findFirst({
      where: eq(classEnrollments.id, score.classEnrollmentId),
    });
    if (!enrollment) continue;

    results.push(
      buildReportData({
        score,
        studentName: enrollment.studentName,
        studentUserId: enrollment.studentUserId,
        classRow,
        programTitle: program?.title ?? "",
        tutorName: teacher?.name ?? "",
      }),
    );
  }

  return results;
}

export async function getClassForAccessCheck(classId: string) {
  return db.query.classes.findFirst({ where: eq(classes.id, classId) });
}
