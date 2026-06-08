import { eq } from "drizzle-orm";
import { UploadThingError, UTApi } from "uploadthing/server";
import { z } from "zod";

import { db } from "@/app/db/db";
import type { Role } from "@/app/db/schema";
import { auth } from "@/lib/auth";

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
    .middleware(async ({ input }) => {
      // NextAuth: auth() reads the session from the request automatically.
      const session = await auth();
      const userId = session?.user?.id;

      if (!userId) {
        throw new UploadThingError("Unauthorized");
      }

      const userRole = (session.user.role ?? "user") as Role;

      if (!allowedRoles.includes(userRole)) {
        throw new UploadThingError("Forbidden");
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
        roles: [userRole],
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

        const result = await db
          .update(table)
          .set({
            [urlColumn]: file.ufsUrl,
            [keyColumn]: file.key,
          })
          .where(eq(table.id, metadata.entityId))
          .returning({ id: table.id });

        console.log("DB write result:", result);

        return {
          uploadedBy: metadata.userId,
          url: file.ufsUrl,
          key: file.key,
        };
      } catch (error) {
        await utapi.deleteFiles(file.key);
        throw new UploadThingError("Failed to save uploaded file");
      }
    });
}