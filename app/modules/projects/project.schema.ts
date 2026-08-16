// app/modules/projects/project.schema.ts
import { z } from "zod";

import { PROJECT_STATUS } from "@/lib/enums/enums";

export const createProjectInput = z.object({
  name: z.string().trim().min(1, "Nama proyek wajib diisi").max(200),
  description: z.string().trim().max(5000).optional(),
  picId: z.string().min(1).optional(),
  status: z.enum(PROJECT_STATUS).optional(),
});

export const updateProjectInput = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  picId: z.string().min(1).nullable().optional(),
});

export const updateProjectStatusInput = z.object({
  id: z.string().min(1),
  status: z.enum(PROJECT_STATUS),
});

export const deleteProjectInput = z.object({
  id: z.string().min(1),
});

export const getProjectInput = z.object({
  id: z.string().min(1),
});

export const listProjectsInput = z
  .object({
    status: z.enum(PROJECT_STATUS).optional(),
  })
  .optional();
