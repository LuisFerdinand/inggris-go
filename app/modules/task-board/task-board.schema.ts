// app/modules/task-board/task-board.schema.ts
import { z } from "zod";

import { TASK_PRIORITY, TASK_STATUS } from "@/lib/enums/enums";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);
const emptyToNull = (v: unknown) => (v === "" ? null : v);

// Only these three columns are freely draggable both ways — moving into
// "pending_review" (from rejected) or approving into "direncanakan" goes
// through verify/resubmit, and moving "review" -> "done" goes through
// confirmDone. All three require super_admin.
export const BOARD_COLUMN_STATUS = ["direncanakan", "in_progress", "review"] as const;
export const boardColumnStatusEnum = z.enum(BOARD_COLUMN_STATUS);

export const createTaskInput = z.object({
  projectId: z.string().min(1, "Proyek wajib dipilih"),
  title: z.string().trim().min(1, "Judul wajib diisi").max(200),
  description: z.string().trim().max(5000).optional(),
  priority: z.enum(TASK_PRIORITY).default("medium"),
  assigneeId: z.string().min(1).optional(),
  startDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  coverImageUrl: z.string().url().optional(),
  link: z.preprocess(emptyToUndefined, z.string().trim().url("Link harus berupa URL yang valid").optional()),
  checklistItems: z
    .array(z.object({ text: z.string().trim().min(1).max(300) }))
    .max(20)
    .optional(),
});

export const updateTaskInput = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  priority: z.enum(TASK_PRIORITY).optional(),
  assigneeId: z.string().min(1).nullable().optional(),
  startDate: z.coerce.date().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  link: z.preprocess(emptyToNull, z.string().trim().url("Link harus berupa URL yang valid").nullable().optional()),
  progress: z.number().int().min(0).max(100).optional(),
});

export const moveTaskInput = z.object({
  id: z.string().min(1),
  status: boardColumnStatusEnum,
  position: z.number().int().min(0),
});

export const verifyTaskInput = z.discriminatedUnion("decision", [
  z.object({
    id: z.string().min(1),
    decision: z.literal("approve"),
  }),
  z.object({
    id: z.string().min(1),
    decision: z.literal("reject"),
    reviewNote: z.string().trim().min(1, "Alasan penolakan wajib diisi").max(1000),
  }),
]);

export const resubmitTaskInput = z.object({
  id: z.string().min(1),
});

export const escalateTaskInput = z.object({
  id: z.string().min(1),
});

export const confirmDoneInput = z.object({
  id: z.string().min(1),
});

// Plain admin asks the director (super_admin) to approve a reviewed task as
// done — super_admin can already confirm done directly via confirmDone.
export const requestDoneApprovalInput = z.object({
  id: z.string().min(1),
});

// Admin or super_admin sends a "review" / "pending_director_approval" task
// back to the assignee/creator for fixes.
export const markNeedsFixingInput = z.object({
  id: z.string().min(1),
  reviewNote: z.string().trim().max(1000).optional(),
});

// The creator/assignee (or admin) re-submits a "needs_fixing" task for review.
export const resubmitReviewInput = z.object({
  id: z.string().min(1),
});

export const deleteTaskInput = z.object({
  id: z.string().min(1),
});

export const listTasksInput = z
  .object({
    projectId: z.string().min(1).optional(),
    assigneeId: z.string().min(1).optional(),
    priority: z.enum(TASK_PRIORITY).optional(),
    status: z.enum(TASK_STATUS).optional(),
    mine: z.boolean().optional(),
  })
  .optional();

export const addCommentInput = z.object({
  taskId: z.string().min(1),
  body: z.string().trim().min(1, "Komentar tidak boleh kosong").max(3000),
  attachmentUrls: z.array(z.string().url()).max(6).default([]),
});

export const deleteCommentInput = z.object({
  commentId: z.string().min(1),
});

export const addChecklistItemInput = z.object({
  taskId: z.string().min(1),
  text: z.string().trim().min(1, "Item checklist tidak boleh kosong").max(300),
});

export const toggleChecklistItemInput = z.object({
  id: z.string().min(1),
  done: z.boolean(),
});

export const updateChecklistItemInput = z.object({
  id: z.string().min(1),
  text: z.string().trim().min(1, "Item checklist tidak boleh kosong").max(300),
});

export const deleteChecklistItemInput = z.object({
  id: z.string().min(1),
});

export const reorderChecklistItemsInput = z.object({
  taskId: z.string().min(1),
  orderedIds: z.array(z.string().min(1)).min(1),
});
