import { eq } from "drizzle-orm";

import { UploadThingError, UTApi } from "uploadthing/server";

import { z } from "zod";

import { db } from "@/app/db/db";

import type { Role } from "@/app/db/schema";

import { requireRole } from "@/lib/auth/roles";

import { getUploadthingAuth } from "../auth";

import { f } from "../core";

type CreateImageUploaderOptions = {
  table: any;
  idField: string;

  keyColumn: string;

  urlColumn: string;

  allowedRoles: Role[];

  maxFileSize?: string;
};

export function createImageUploader({
  table,
  idField,
  keyColumn,
  urlColumn,
  allowedRoles,
  maxFileSize = "4MB",
}: CreateImageUploaderOptions) {
  return f({
    image: {
      maxFileSize: maxFileSize as any,
      maxFileCount: 1,
      contentDisposition: "inline",
    },
  })
    .input(
      z.object({
        [idField]: z.string(),
      }),
    )

    .middleware(async ({ req, input }) => {
      const authData = await getUploadthingAuth(req);

      const userId = authData?.user.id;

      const roles = authData?.roles ?? [];

      try {
        requireRole({
          userId,
          roles,
          allowedRoles,
        });
      } catch (error: any) {
        throw new UploadThingError(error.message);
      }

      const entityId = (input as any)[idField];

      const [record] = await db
        .select({
          key: table[keyColumn],
        })
        .from(table)
        .where(eq(table.id, entityId));

      if (!record) {
        throw new UploadThingError("Record not found");
      }

      return {
        userId,
        roles,
        entityId,
        previousFileKey: record.key,
      };
    })

    .onUploadComplete(async ({ metadata, file }) => {
      const utapi = new UTApi();

      try {
        if (metadata.previousFileKey) {
          await utapi.deleteFiles(metadata.previousFileKey);
        }

        await db
          .update(table)
          .set({
            [urlColumn]: file.url,
            [keyColumn]: file.key,
          })
          .where(eq(table.id, metadata.entityId));

        return {
          uploadedBy: metadata.userId,
          url: file.url,
          key: file.key,
        };
      } catch (error) {
        await utapi.deleteFiles(file.key);

        throw new UploadThingError("Failed to save uploaded file");
      }
    });
}
