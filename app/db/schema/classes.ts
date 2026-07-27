// app/db/schema/classes.ts
// Teaching LMS: a teacher runs a Class off one of their assigned program
// batches, rosters registered students into it, tracks attendance across
// dated sessions, and — once the class is finished — records a fixed
// 7-competency score per student that feeds the generated PDF report.

import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { programs, programBatches } from "./programs";
import { enrollments } from "./orders";

import { ATTENDANCE_STATUS, CLASS_STATUS } from "@/lib/enums/enums";

/* =========================================================
   ENUMS
========================================================= */

export const classStatusEnum = pgEnum("class_status", CLASS_STATUS);
export const attendanceStatusEnum = pgEnum(
  "attendance_status",
  ATTENDANCE_STATUS,
);

/* =========================================================
   CLASSES
========================================================= */

export const classes = pgTable(
  "classes",
  {
    id: text("id").primaryKey(),

    batchId: text("batch_id")
      .references(() => programBatches.id, { onDelete: "cascade" })
      .notNull(),

    // Denormalized for convenient querying without joining through batches.
    programId: text("program_id")
      .references(() => programs.id, { onDelete: "cascade" })
      .notNull(),

    teacherId: text("teacher_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),

    title: text("title").notNull(),

    // Free-text period label, e.g. "20-25 Juni 2026".
    periodLabel: text("period_label"),

    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),

    status: classStatusEnum("status").default("draft").notNull(),

    notes: text("notes"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    batchIdx: index("classes_batch_id_idx").on(table.batchId),
    teacherIdx: index("classes_teacher_id_idx").on(table.teacherId),
  }),
);

/* =========================================================
   CLASS ENROLLMENTS (ROSTER)
========================================================= */

export const classEnrollments = pgTable(
  "class_enrollments",
  {
    id: text("id").primaryKey(),

    classId: text("class_id")
      .references(() => classes.id, { onDelete: "cascade" })
      .notNull(),

    // Links back to the original program registration/purchase record.
    enrollmentId: text("enrollment_id")
      .references(() => enrollments.id, { onDelete: "cascade" })
      .notNull(),

    // Snapshots for fast display without joining `enrollments`.
    studentName: text("student_name").notNull(),
    studentUserId: text("student_user_id").references(() => user.id, {
      onDelete: "set null",
    }),

    isRemoved: boolean("is_removed").default(false).notNull(),

    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (table) => ({
    classIdx: index("class_enrollments_class_id_idx").on(table.classId),
    enrollmentIdx: index("class_enrollments_enrollment_id_idx").on(
      table.enrollmentId,
    ),
    uniqueRoster: unique("class_enrollments_class_enrollment_unique").on(
      table.classId,
      table.enrollmentId,
    ),
  }),
);

/* =========================================================
   CLASS SESSIONS
========================================================= */

export const classSessions = pgTable(
  "class_sessions",
  {
    id: text("id").primaryKey(),

    classId: text("class_id")
      .references(() => classes.id, { onDelete: "cascade" })
      .notNull(),

    sessionDate: timestamp("session_date").notNull(),

    // e.g. "Hari 1"
    label: text("label"),

    order: integer("order").default(0).notNull(),

    // Optional link to session recording/materials (e.g. Google Drive),
    // and a free-text class-wide note — both filled in by the teacher
    // alongside attendance, typically after the session has happened.
    googleDriveLink: text("google_drive_link"),
    note: text("note"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    classIdx: index("class_sessions_class_id_idx").on(table.classId),
  }),
);

/* =========================================================
   ATTENDANCE RECORDS
========================================================= */

export const attendanceRecords = pgTable(
  "attendance_records",
  {
    id: text("id").primaryKey(),

    classSessionId: text("class_session_id")
      .references(() => classSessions.id, { onDelete: "cascade" })
      .notNull(),

    classEnrollmentId: text("class_enrollment_id")
      .references(() => classEnrollments.id, { onDelete: "cascade" })
      .notNull(),

    status: attendanceStatusEnum("status").default("present").notNull(),

    note: text("note"),

    recordedAt: timestamp("recorded_at").defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index("attendance_records_session_id_idx").on(
      table.classSessionId,
    ),
    enrollmentIdx: index("attendance_records_enrollment_id_idx").on(
      table.classEnrollmentId,
    ),
    uniqueRecord: unique("attendance_records_session_enrollment_unique").on(
      table.classSessionId,
      table.classEnrollmentId,
    ),
  }),
);

/* =========================================================
   STUDENT SCORES
========================================================= */

export const studentScores = pgTable(
  "student_scores",
  {
    id: text("id").primaryKey(),

    classId: text("class_id")
      .references(() => classes.id, { onDelete: "cascade" })
      .notNull(),

    // One score record per student per class.
    classEnrollmentId: text("class_enrollment_id")
      .references(() => classEnrollments.id, { onDelete: "cascade" })
      .notNull()
      .unique(),

    /* -----------------------------------------
       Fixed 7-competency rubric, 1-5 each.
       See lib/lms/scoring.ts for labels/average/progress-band logic.
    ----------------------------------------- */
    grammarAccuracy: integer("grammar_accuracy").notNull(),
    pronunciation: integer("pronunciation").notNull(),
    vocabulary: integer("vocabulary").notNull(),
    fluency: integer("fluency").notNull(),
    confidence: integer("confidence").notNull(),
    listening: integer("listening").notNull(),
    participation: integer("participation").notNull(),

    // Ringkasan Perkembangan
    summary: text("summary"),
    // Kekuatan Ananda
    strengths: text("strengths"),
    // Area yang Perlu Dikembangkan
    areasToImprove: text("areas_to_improve"),
    // Catatan Tutor
    tutorNotes: text("tutor_notes"),
    // Rekomendasi Orang Tua
    parentRecommendation: text("parent_recommendation"),

    tutorCoordinatorName: text("tutor_coordinator_name"),

    // Set once the teacher finalizes the report; locks further edits.
    finalizedAt: timestamp("finalized_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    classIdx: index("student_scores_class_id_idx").on(table.classId),
  }),
);

/* =========================================================
   RELATIONS
========================================================= */

export const classRelations = relations(classes, ({ one, many }) => ({
  batch: one(programBatches, {
    fields: [classes.batchId],
    references: [programBatches.id],
  }),
  program: one(programs, {
    fields: [classes.programId],
    references: [programs.id],
  }),
  teacher: one(user, {
    fields: [classes.teacherId],
    references: [user.id],
  }),
  roster: many(classEnrollments),
  sessions: many(classSessions),
}));

export const classEnrollmentRelations = relations(
  classEnrollments,
  ({ one }) => ({
    class: one(classes, {
      fields: [classEnrollments.classId],
      references: [classes.id],
    }),
    enrollment: one(enrollments, {
      fields: [classEnrollments.enrollmentId],
      references: [enrollments.id],
    }),
    score: one(studentScores, {
      fields: [classEnrollments.id],
      references: [studentScores.classEnrollmentId],
    }),
  }),
);

export const classSessionRelations = relations(
  classSessions,
  ({ one, many }) => ({
    class: one(classes, {
      fields: [classSessions.classId],
      references: [classes.id],
    }),
    attendanceRecords: many(attendanceRecords),
  }),
);

export const attendanceRecordRelations = relations(
  attendanceRecords,
  ({ one }) => ({
    session: one(classSessions, {
      fields: [attendanceRecords.classSessionId],
      references: [classSessions.id],
    }),
    classEnrollment: one(classEnrollments, {
      fields: [attendanceRecords.classEnrollmentId],
      references: [classEnrollments.id],
    }),
  }),
);

export const studentScoreRelations = relations(studentScores, ({ one }) => ({
  class: one(classes, {
    fields: [studentScores.classId],
    references: [classes.id],
  }),
  classEnrollment: one(classEnrollments, {
    fields: [studentScores.classEnrollmentId],
    references: [classEnrollments.id],
  }),
}));
