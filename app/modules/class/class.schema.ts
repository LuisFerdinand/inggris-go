// app/modules/class/class.schema.ts
import { z } from "zod";

export const createClassInput = z.object({
  batchId: z.string().min(1),
  teacherId: z.string().min(1),
  title: z.string().min(1),
  periodLabel: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  enrollmentIds: z.array(z.string().min(1)).default([]),
});

export const updateClassInput = z.object({
  id: z.string().min(1),
  teacherId: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  periodLabel: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const addStudentsInput = z.object({
  classId: z.string().min(1),
  enrollmentIds: z.array(z.string().min(1)).min(1),
});

export const createSessionInput = z.object({
  classId: z.string().min(1),
  sessionDate: z.coerce.date(),
  label: z.string().optional(),
});

export const attendanceRecordInput = z.object({
  classEnrollmentId: z.string().min(1),
  status: z.enum(["present", "absent", "late", "excused"]),
  note: z.string().optional(),
});

export const recordAttendanceInput = z.object({
  classSessionId: z.string().min(1),
  records: z.array(attendanceRecordInput).min(1),
  googleDriveLink: z.string().trim().max(500).optional(),
  sessionNote: z.string().trim().max(3000).optional(),
});

export const scoreInput = z.object({
  classEnrollmentId: z.string().min(1),

  grammarAccuracy: z.number().int().min(1).max(5),
  pronunciation: z.number().int().min(1).max(5),
  vocabulary: z.number().int().min(1).max(5),
  fluency: z.number().int().min(1).max(5),
  confidence: z.number().int().min(1).max(5),
  listening: z.number().int().min(1).max(5),
  participation: z.number().int().min(1).max(5),

  summary: z.string().optional(),
  strengths: z.string().optional(),
  areasToImprove: z.string().optional(),
  tutorNotes: z.string().optional(),
  parentRecommendation: z.string().optional(),
  tutorCoordinatorName: z.string().optional(),
});

export const reviewScoreInput = z.discriminatedUnion("decision", [
  z.object({
    classEnrollmentId: z.string().min(1),
    decision: z.literal("approve"),
  }),
  z.object({
    classEnrollmentId: z.string().min(1),
    decision: z.literal("reject"),
    reviewNote: z
      .string()
      .trim()
      .min(1, "Alasan penolakan wajib diisi")
      .max(1000),
  }),
]);
