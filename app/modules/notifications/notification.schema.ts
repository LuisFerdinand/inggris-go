// app/modules/notifications/notification.schema.ts
import { z } from "zod";

export const listNotificationsInput = z
  .object({
    limit: z.number().int().min(1).max(50).default(20),
  })
  .optional();

export const markReadInput = z.object({
  id: z.string().min(1),
});
