// lib/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/app/db/db";
import { programs } from "@/app/db/schema";
import { auth } from "@/lib/auth";

export const f = createUploadthing();

export const uploadRouter = {
  // Program thumbnail. onUploadComplete writes url + key back to the program
  // row, so the client only needs to refetch getDetail afterward.
  programThumbnailUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .input(z.object({ programId: z.string() }))
    .middleware(async ({ input }) => {
      // NextAuth: auth() reads the session from the request automatically.
      const session = await auth();
      if (!session?.user?.id) throw new Error("Unauthorized");
      return { programId: input.programId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db
        .update(programs)
        .set({ thumbnailUrl: file.ufsUrl, thumbnailKey: file.key })
        .where(eq(programs.id, metadata.programId));

      // Returned object becomes res[0].serverData on the client.
      return { url: file.ufsUrl, key: file.key };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;