// app/modules/blog/server/blog.router.ts

import { z } from "zod";
import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  ne,
  inArray,
  or,
} from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  baseProcedure,
} from "@/lib/trpc/init";
import { db } from "@/app/db/db";
import {
  post,
  postCategory,
  postComment,
  postLike,
  postSave,
  postTag,
  postView,
  tag,
} from "@/app/db/schema";
import { user } from "@/app/db/schema/auth-schema";

import {
  postFilterSchema,
  postInsertSchema,
  postUpdateSchema,
} from "../blog.schema";

/* =========================================================
   TYPES
========================================================= */

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  createdAt: Date;
};

export type BlogTagRow = {
  id: string;
  name: string;
  slug: string;
};

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: unknown;
  contentHtml: string | null;
  coverImage: string | null;
  status: string | null;
  isFeatured: boolean;
  publishedAt: Date | null;
  readTime: number | null;
  viewCount: number | null;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date | null;
  authorId: string;
  categoryId: string | null;
  category: CategoryRow | null;
  tags: BlogTagRow[];
};

const idInput = z.object({ id: z.string().min(1) });

/* =========================================================
   PRIVATE HELPERS
========================================================= */

function makeSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-");
}

function getRequiredAuthUserId(ctx: unknown): string {
  const c = ctx as {
    authUserId?: string | null;
    auth?: { userId?: string | null };
    session?: { user?: { id?: string | null } };
  };

  const userId =
    c.authUserId ?? c.auth?.userId ?? c.session?.user?.id ?? null;

  if (!userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Anda harus login terlebih dahulu.",
    });
  }

  return userId;
}

function getOptionalAuthUserId(ctx: unknown): string | null {
  const c = ctx as {
    authUserId?: string | null;
    auth?: { userId?: string | null };
    session?: { user?: { id?: string | null } };
  };

  return c.authUserId ?? c.auth?.userId ?? c.session?.user?.id ?? null;
}

async function uniquePostSlug(base: string, excludeId?: string) {
  let attempt = 0;
  const slug = makeSlug(base);

  while (true) {
    const candidate = attempt === 0 ? slug : `${slug}-${attempt}`;

    const existing = await db.query.post.findFirst({
      where: eq(post.slug, candidate),
    });

    if (!existing || existing.id === excludeId) return candidate;

    attempt++;
  }
}

async function uniqueCategorySlug(base: string, excludeId?: string) {
  let attempt = 0;
  const slug = makeSlug(base);

  while (true) {
    const candidate = attempt === 0 ? slug : `${slug}-${attempt}`;

    const existing = await db.query.postCategory.findFirst({
      where: eq(postCategory.slug, candidate),
    });

    if (!existing || existing.id === excludeId) return candidate;

    attempt++;
  }
}

async function getTagsForPost(postId: string): Promise<BlogTagRow[]> {
  return db
    .select({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    })
    .from(postTag)
    .innerJoin(tag, eq(postTag.tagId, tag.id))
    .where(eq(postTag.postId, postId));
}

async function getCategoryForPost(
  categoryId: string | null,
): Promise<CategoryRow | null> {
  if (!categoryId) return null;

  const row = await db.query.postCategory.findFirst({
    where: eq(postCategory.id, categoryId),
  });

  return row ?? null;
}

async function getLikeCount(postId: string): Promise<number> {
  const [row] = await db
    .select({
      count: count(),
    })
    .from(postLike)
    .where(eq(postLike.postId, postId));

  return row?.count ?? 0;
}

async function getUserLiked(postId: string, userId: string): Promise<boolean> {
  const row = await db.query.postLike.findFirst({
    where: and(eq(postLike.postId, postId), eq(postLike.userId, userId)),
    columns: {
      id: true,
    },
  });

  return !!row;
}

async function getUserSaved(postId: string, userId: string): Promise<boolean> {
  const row = await db.query.postSave.findFirst({
    where: and(eq(postSave.postId, postId), eq(postSave.userId, userId)),
    columns: {
      id: true,
    },
  });

  return !!row;
}

async function assertUserExists(userId: string): Promise<void> {
  const row = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: {
      id: true,
    },
  });

  if (!row) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Akun tidak ditemukan. Silakan logout dan login kembali.",
    });
  }
}

/**
 * Minimal shape needed by enrichPost.
 *
 * Important:
 * Keep this generic so extra fields from admin queries are preserved.
 * Example: contentHtml, status, authorId, content, createdAt, updatedAt.
 */
type RawPostBase = {
  id: string;
  categoryId: string | null;
};

export type EnrichedPost<T extends RawPostBase = RawPostBase> = T & {
  tags: BlogTagRow[];
  category: CategoryRow | null;
  likeCount: number;
};

async function enrichPost<T extends RawPostBase>(
  p: T,
): Promise<EnrichedPost<T>> {
  const [tags, category, likeCount] = await Promise.all([
    getTagsForPost(p.id),
    getCategoryForPost(p.categoryId),
    getLikeCount(p.id),
  ]);

  return {
    ...p,
    tags,
    category,
    likeCount,
  };
}

/* =========================================================
   ROUTER
========================================================= */

export const blogRouter = createTRPCRouter({
  /* ─────────────────────────────────────────────────────
     CATEGORIES
  ───────────────────────────────────────────────────── */

  getCategories: baseProcedure.query(async () => {
    return db
      .select()
      .from(postCategory)
      .orderBy(asc(postCategory.order), asc(postCategory.name));
  }),

  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(80),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const slug = await uniqueCategorySlug(input.name);

      const [row] = await db
        .insert(postCategory)
        .values({
          id: crypto.randomUUID(),
          name: input.name,
          slug,
          description: input.description ?? null,
          order: 0,
        })
        .returning();

      return row;
    }),

  deleteCategory: protectedProcedure
    .input(idInput)
    .mutation(async ({ input }) => {
      await db
        .update(post)
        .set({
          categoryId: null,
        })
        .where(eq(post.categoryId, input.id));

      await db.delete(postCategory).where(eq(postCategory.id, input.id));

      return {
        success: true,
      };
    }),

  /* ─────────────────────────────────────────────────────
     TAGS
  ───────────────────────────────────────────────────── */

  getTags: protectedProcedure.query(async () => {
    return db.select().from(tag).orderBy(asc(tag.name));
  }),

  getTagsPublic: baseProcedure.query(async () => {
    return db.select().from(tag).orderBy(asc(tag.name));
  }),

  createTag: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const slug = makeSlug(input.name);

      const [row] = await db
        .insert(tag)
        .values({
          id: crypto.randomUUID(),
          name: input.name,
          slug,
        })
        .returning();

      return row;
    }),

  /* ─────────────────────────────────────────────────────
     ADMIN — POSTS
  ───────────────────────────────────────────────────── */

  getFiltered: protectedProcedure
    .input(postFilterSchema)
    .query(async ({ input }) => {
      const conditions: SQL[] = [];

      if (input.status) {
        conditions.push(eq(post.status, input.status));
      }

      if (input.searchQuery) {
        conditions.push(ilike(post.title, `%${input.searchQuery}%`));
      }

      if (input.categoryId) {
        conditions.push(eq(post.categoryId, input.categoryId));
      }

      if (input.isFeatured !== undefined) {
        conditions.push(eq(post.isFeatured, input.isFeatured));
      }

      const limit = input.limit ?? 20;
      const page = input.page ?? 1;
      const offset = (page - 1) * limit;
      const whereClause = conditions.length ? and(...conditions) : undefined;

      const rows = await db
        .select({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          contentHtml: post.contentHtml,
          coverImage: post.coverImage,
          status: post.status,
          isFeatured: post.isFeatured,
          publishedAt: post.publishedAt,
          readTime: post.readTime,
          viewCount: post.viewCount,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          authorId: post.authorId,
          categoryId: post.categoryId,
        })
        .from(post)
        .where(whereClause)
        .orderBy(desc(post.createdAt))
        .limit(limit)
        .offset(offset);

      const [totalRow] = await db
        .select({
          count: count(),
        })
        .from(post)
        .where(whereClause);

      const posts = await Promise.all(rows.map(enrichPost));

      return {
        posts,
        total: totalRow?.count ?? 0,
        page,
        limit,
      };
    }),

  getById: protectedProcedure.input(idInput).query(async ({ input }) => {
    const row = await db.query.post.findFirst({
      where: eq(post.id, input.id),
      columns: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        contentHtml: true,
        coverImage: true,

        authorId: true,
        categoryId: true,

        status: true,
        isFeatured: true,

        publishedAt: true,
        readTime: true,
        viewCount: true,

        createdAt: true,
        updatedAt: true,
      },
    });

    if (!row) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Artikel tidak ditemukan",
      });
    }

    return enrichPost(row);
  }),

  create: protectedProcedure
    .input(postInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const actorUserId = getRequiredAuthUserId(ctx);

      const { tagIds, slug: inputSlug, ...values } = input;

      const slug = await uniquePostSlug(inputSlug || values.title);
      const id = crypto.randomUUID();

      const authorId = values.authorId || actorUserId;

      await assertUserExists(authorId);

      const [row] = await db
        .insert(post)
        .values({
          ...values,
          id,
          slug,
          authorId,
          publishedAt:
            values.status === "published" && !values.publishedAt
              ? new Date()
              : values.publishedAt
                ? new Date(values.publishedAt)
                : null,
        })
        .returning();

      if (!row) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Gagal membuat artikel.",
        });
      }

      if (tagIds?.length) {
        await db.insert(postTag).values(
          tagIds.map((tagId) => ({
            id: crypto.randomUUID(),
            postId: id,
            tagId,
          })),
        );
      }

      return enrichPost(row);
    }),

  update: protectedProcedure
    .input(postUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, tagIds, slug: inputSlug, ...rest } = input;

      const existing = await db.query.post.findFirst({
        where: eq(post.id, id),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artikel tidak ditemukan",
        });
      }

      if (rest.authorId) {
        await assertUserExists(rest.authorId);
      }

      const slugSource = inputSlug || rest.title;

      const nextSlug = slugSource
        ? await uniquePostSlug(slugSource, id)
        : undefined;

      let publishedAt = rest.publishedAt
        ? new Date(rest.publishedAt)
        : existing.publishedAt;

      if (
        rest.status === "published" &&
        !existing.publishedAt &&
        !rest.publishedAt
      ) {
        publishedAt = new Date();
      }

      const [row] = await db
        .update(post)
        .set({
          ...rest,
          ...(nextSlug ? { slug: nextSlug } : {}),
          publishedAt,
        })
        .where(eq(post.id, id))
        .returning();

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artikel tidak ditemukan",
        });
      }

      if (tagIds !== undefined) {
        await db.delete(postTag).where(eq(postTag.postId, id));

        if (tagIds.length) {
          await db.insert(postTag).values(
            tagIds.map((tagId) => ({
              id: crypto.randomUUID(),
              postId: id,
              tagId,
            })),
          );
        }
      }

      return enrichPost(row);
    }),

  setStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        status: z.enum(["draft", "published", "archived"]),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await db.query.post.findFirst({
        where: eq(post.id, input.id),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artikel tidak ditemukan",
        });
      }

      const publishedAt =
        input.status === "published" && !existing.publishedAt
          ? new Date()
          : existing.publishedAt;

      const [row] = await db
        .update(post)
        .set({
          status: input.status,
          publishedAt,
        })
        .where(eq(post.id, input.id))
        .returning();

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artikel tidak ditemukan",
        });
      }

      return row;
    }),

  remove: protectedProcedure.input(idInput).mutation(async ({ input }) => {
    await db.delete(postTag).where(eq(postTag.postId, input.id));
    await db.delete(post).where(eq(post.id, input.id));

    return {
      success: true,
    };
  }),

  getStats: protectedProcedure.query(async () => {
    const rows = await db
      .select({
        status: post.status,
        count: count(),
      })
      .from(post)
      .groupBy(post.status);

    const stats = {
      total: 0,
      published: 0,
      draft: 0,
      archived: 0,
    };

    for (const r of rows) {
      const c = r.count ?? 0;

      stats.total += c;

      if (r.status === "published") {
        stats.published = c;
      } else if (r.status === "draft") {
        stats.draft = c;
      } else if (r.status === "archived") {
        stats.archived = c;
      }
    }

    return stats;
  }),

  /* ─────────────────────────────────────────────────────
     PUBLIC — POSTS
  ───────────────────────────────────────────────────── */

  getPublished: baseProcedure
    .input(
      z.object({
        categorySlug: z.string().optional(),
        tagSlug: z.string().optional(),
        search: z.string().optional(),
        isFeatured: z.boolean().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(20).default(9),
        sort: z
          .enum(["newest", "popular", "liked", "quickread"])
          .default("newest"),
      }),
    )
    .query(async ({ input }) => {
      const conditions: SQL[] = [eq(post.status, "published")];

      if (input.isFeatured !== undefined) {
        conditions.push(eq(post.isFeatured, input.isFeatured));
      }

      if (input.search) {
        conditions.push(ilike(post.title, `%${input.search}%`));
      }

      if (input.categorySlug) {
        const cat = await db.query.postCategory.findFirst({
          where: eq(postCategory.slug, input.categorySlug),
          columns: {
            id: true,
          },
        });

        if (!cat) {
          return {
            posts: [],
            total: 0,
            page: input.page,
            limit: input.limit,
          };
        }

        conditions.push(eq(post.categoryId, cat.id));
      }

      if (input.tagSlug) {
        const tagRow = await db.query.tag.findFirst({
          where: eq(tag.slug, input.tagSlug),
          columns: {
            id: true,
          },
        });

        if (!tagRow) {
          return {
            posts: [],
            total: 0,
            page: input.page,
            limit: input.limit,
          };
        }

        const ptRows = await db
          .select({
            postId: postTag.postId,
          })
          .from(postTag)
          .where(eq(postTag.tagId, tagRow.id));

        const tagPostIds = ptRows.map((r) => r.postId);

        if (tagPostIds.length === 0) {
          return {
            posts: [],
            total: 0,
            page: input.page,
            limit: input.limit,
          };
        }

        conditions.push(inArray(post.id, tagPostIds));
      }

      let orderBy;

      switch (input.sort) {
        case "popular":
          orderBy = desc(post.viewCount);
          break;

        case "quickread":
          orderBy = asc(post.readTime);
          break;

        default:
          orderBy = desc(post.publishedAt);
          break;
      }

      const limit = input.limit;
      const offset = (input.page - 1) * limit;

      const rows = await db
        .select({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          coverImage: post.coverImage,
          isFeatured: post.isFeatured,
          publishedAt: post.publishedAt,
          readTime: post.readTime,
          viewCount: post.viewCount,
          categoryId: post.categoryId,
        })
        .from(post)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      const [totalRow] = await db
        .select({
          count: count(),
        })
        .from(post)
        .where(and(...conditions));

      const posts = await Promise.all(rows.map(enrichPost));

      if (input.sort === "liked") {
        posts.sort((a, b) => b.likeCount - a.likeCount);
      }

      return {
        posts,
        total: totalRow?.count ?? 0,
        page: input.page,
        limit,
      };
    }),

  getBySlug: baseProcedure
    .input(
      z.object({
        slug: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const row = await db.query.post.findFirst({
        where: eq(post.slug, input.slug),
      });

      if (!row || row.status !== "published") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artikel tidak ditemukan",
        });
      }

      const [tags, category, likeCount] = await Promise.all([
        getTagsForPost(row.id),
        getCategoryForPost(row.categoryId ?? null),
        getLikeCount(row.id),
      ]);

      const userId = getOptionalAuthUserId(ctx);
      const [userLiked, userSaved] = await Promise.all([
        userId ? getUserLiked(row.id, userId) : Promise.resolve(false),
        userId ? getUserSaved(row.id, userId) : Promise.resolve(false),
      ]);

      return {
        ...row,
        tags,
        category,
        likeCount,
        userLiked,
        userSaved,
      };
    }),

  getRelated: baseProcedure
    .input(
      z.object({
        postId: z.string().min(1),
        categoryId: z.string().nullable().optional(),
        limit: z.number().int().min(1).max(6).default(4),
      }),
    )
    .query(async ({ input }) => {
      const conditions: SQL[] = [
        eq(post.status, "published"),
        ne(post.id, input.postId),
      ];

      if (input.categoryId) {
        conditions.push(eq(post.categoryId, input.categoryId));
      }

      const rows = await db
        .select({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          coverImage: post.coverImage,
          isFeatured: post.isFeatured,
          publishedAt: post.publishedAt,
          readTime: post.readTime,
          viewCount: post.viewCount,
          categoryId: post.categoryId,
        })
        .from(post)
        .where(and(...conditions))
        .orderBy(desc(post.publishedAt))
        .limit(input.limit);

      let result = rows;

      if (result.length < input.limit && input.categoryId) {
        const extra = await db
          .select({
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            coverImage: post.coverImage,
            isFeatured: post.isFeatured,
            publishedAt: post.publishedAt,
            readTime: post.readTime,
            viewCount: post.viewCount,
            categoryId: post.categoryId,
          })
          .from(post)
          .where(and(eq(post.status, "published"), ne(post.id, input.postId)))
          .orderBy(desc(post.publishedAt))
          .limit(input.limit - result.length + 5);

        const existingIds = new Set(result.map((r) => r.id));

        const backfill = extra
          .filter((r) => !existingIds.has(r.id))
          .slice(0, input.limit - result.length);

        result = [...result, ...backfill];
      }

      return Promise.all(result.map(enrichPost));
    }),

  /* ─────────────────────────────────────────────────────
     ENGAGEMENT
  ───────────────────────────────────────────────────── */

  recordView: baseProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        ipAddress: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const row = await db.query.post.findFirst({
        where: and(eq(post.slug, input.slug), eq(post.status, "published")),
        columns: {
          id: true,
          viewCount: true,
        },
      });

      if (!row) {
        return {
          success: false,
        };
      }

      const userId = getOptionalAuthUserId(ctx);

      if (userId) {
        const recent = await db.query.postView.findFirst({
          where: and(eq(postView.postId, row.id), eq(postView.userId, userId)),
          columns: {
            id: true,
            createdAt: true,
          },
          orderBy: desc(postView.createdAt),
        });

        const thirtyMins = new Date(Date.now() - 30 * 60 * 1000);

        if (recent && recent.createdAt > thirtyMins) {
          return {
            success: true,
            counted: false,
          };
        }
      }

      await db.insert(postView).values({
        id: crypto.randomUUID(),
        postId: row.id,
        userId,
        ipAddress: input.ipAddress ?? null,
      });

      await db
        .update(post)
        .set({
          viewCount: (row.viewCount ?? 0) + 1,
        })
        .where(eq(post.id, row.id));

      return {
        success: true,
        counted: true,
      };
    }),

  toggleLike: protectedProcedure
    .input(
      z.object({
        postId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = getRequiredAuthUserId(ctx);

      await assertUserExists(userId);

      const postRow = await db.query.post.findFirst({
        where: and(eq(post.id, input.postId), eq(post.status, "published")),
        columns: {
          id: true,
        },
      });

      if (!postRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artikel tidak ditemukan",
        });
      }

      const existing = await db.query.postLike.findFirst({
        where: and(eq(postLike.postId, input.postId), eq(postLike.userId, userId)),
        columns: {
          id: true,
        },
      });

      if (existing) {
        await db.delete(postLike).where(eq(postLike.id, existing.id));

        return {
          liked: false,
          likeCount: await getLikeCount(input.postId),
        };
      }

      await db.insert(postLike).values({
        id: crypto.randomUUID(),
        postId: input.postId,
        userId,
      });

      return {
        liked: true,
        likeCount: await getLikeCount(input.postId),
      };
    }),

  getLikeState: baseProcedure
    .input(
      z.object({
        postId: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const userId = getOptionalAuthUserId(ctx);

      const [likeCount, userLiked] = await Promise.all([
        getLikeCount(input.postId),
        userId ? getUserLiked(input.postId, userId) : Promise.resolve(false),
      ]);

      return {
        likeCount,
        userLiked,
      };
    }),

  /* ─────────────────────────────────────────────────────
     USER DASHBOARD — "Koleksi Saya" (liked / saved posts)
  ───────────────────────────────────────────────────── */

  getMyLikedPosts: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(12),
      }),
    )
    .query(async ({ input, ctx }) => {
      const userId = getRequiredAuthUserId(ctx);
      const limit = input.limit;
      const offset = (input.page - 1) * limit;

      const likeRows = await db
        .select({ postId: postLike.postId, likedAt: postLike.createdAt })
        .from(postLike)
        .where(eq(postLike.userId, userId))
        .orderBy(desc(postLike.createdAt))
        .limit(limit)
        .offset(offset);

      const [totalRow] = await db
        .select({ count: count() })
        .from(postLike)
        .where(eq(postLike.userId, userId));

      if (likeRows.length === 0) {
        return { posts: [], total: totalRow?.count ?? 0, page: input.page, limit };
      }

      const postIds = likeRows.map((r) => r.postId);

      const rows = await db
        .select({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          coverImage: post.coverImage,
          status: post.status,
          publishedAt: post.publishedAt,
          readTime: post.readTime,
          viewCount: post.viewCount,
          categoryId: post.categoryId,
        })
        .from(post)
        .where(inArray(post.id, postIds));

      const enriched = await Promise.all(rows.map(enrichPost));
      const byId = new Map(enriched.map((p) => [p.id, p]));
      const likedAtById = new Map(likeRows.map((r) => [r.postId, r.likedAt]));

      // Preserve "most recently liked first" order, skip posts that
      // may have been deleted since the like was recorded.
      const posts = likeRows
        .map((r) => {
          const p = byId.get(r.postId);
          if (!p) return null;
          return { ...p, likedAt: likedAtById.get(r.postId) ?? null };
        })
        .filter((p): p is NonNullable<typeof p> => p !== null);

      return { posts, total: totalRow?.count ?? 0, page: input.page, limit };
    }),

  getMySavedPosts: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(12),
      }),
    )
    .query(async ({ input, ctx }) => {
      const userId = getRequiredAuthUserId(ctx);
      const limit = input.limit;
      const offset = (input.page - 1) * limit;

      const saveRows = await db
        .select({ postId: postSave.postId, savedAt: postSave.createdAt })
        .from(postSave)
        .where(eq(postSave.userId, userId))
        .orderBy(desc(postSave.createdAt))
        .limit(limit)
        .offset(offset);

      const [totalRow] = await db
        .select({ count: count() })
        .from(postSave)
        .where(eq(postSave.userId, userId));

      if (saveRows.length === 0) {
        return { posts: [], total: totalRow?.count ?? 0, page: input.page, limit };
      }

      const postIds = saveRows.map((r) => r.postId);

      const rows = await db
        .select({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          coverImage: post.coverImage,
          status: post.status,
          publishedAt: post.publishedAt,
          readTime: post.readTime,
          viewCount: post.viewCount,
          categoryId: post.categoryId,
        })
        .from(post)
        .where(inArray(post.id, postIds));

      const enriched = await Promise.all(rows.map(enrichPost));
      const byId = new Map(enriched.map((p) => [p.id, p]));
      const savedAtById = new Map(saveRows.map((r) => [r.postId, r.savedAt]));

      const posts = saveRows
        .map((r) => {
          const p = byId.get(r.postId);
          if (!p) return null;
          return { ...p, savedAt: savedAtById.get(r.postId) ?? null };
        })
        .filter((p): p is NonNullable<typeof p> => p !== null);

      return { posts, total: totalRow?.count ?? 0, page: input.page, limit };
    }),

  /**
   * Toggle save/bookmark state — mirrors `toggleLike` but for
   * `postSave`. Needed because "Koleksi Saya" tracks both liked
   * AND saved posts as distinct lists.
   */
  toggleSave: protectedProcedure
    .input(z.object({ postId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const userId = getRequiredAuthUserId(ctx);
      await assertUserExists(userId);

      const postRow = await db.query.post.findFirst({
        where: and(eq(post.id, input.postId), eq(post.status, "published")),
        columns: { id: true },
      });

      if (!postRow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Artikel tidak ditemukan" });
      }

      const existing = await db.query.postSave.findFirst({
        where: and(eq(postSave.postId, input.postId), eq(postSave.userId, userId)),
        columns: { id: true },
      });

      if (existing) {
        await db.delete(postSave).where(eq(postSave.id, existing.id));
        return { saved: false };
      }

      await db.insert(postSave).values({
        id: crypto.randomUUID(),
        postId: input.postId,
        userId,
      });

      return { saved: true };
    }),

  getMyComments: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(12),
      }),
    )
    .query(async ({ input, ctx }) => {
      const userId = getRequiredAuthUserId(ctx);
      const limit = input.limit;
      const offset = (input.page - 1) * limit;

      const conditions = [eq(postComment.userId, userId)];

      const rows = await db
        .select({
          id: postComment.id,
          content: postComment.content,
          status: postComment.status,
          createdAt: postComment.createdAt,

          postId: postComment.postId,
          postTitle: post.title,
          postSlug: post.slug,
          postCoverImage: post.coverImage,
          postStatus: post.status,
        })
        .from(postComment)
        .innerJoin(post, eq(postComment.postId, post.id))
        .where(and(...conditions))
        .orderBy(desc(postComment.createdAt))
        .limit(limit)
        .offset(offset);

      const [totalRow] = await db
        .select({ count: count() })
        .from(postComment)
        .where(and(...conditions));

      const comments = rows.map((r) => ({
        id: r.id,
        content: r.content,
        status: r.status,
        createdAt: r.createdAt,
        post: {
          id: r.postId,
          title: r.postTitle,
          slug: r.postSlug,
          coverImage: r.postCoverImage,
          status: r.postStatus,
        },
      }));

      return { comments, total: totalRow?.count ?? 0, page: input.page, limit };
    }),

  /* ─────────────────────────────────────────────────────
     PUBLIC — COMMENTS
  ───────────────────────────────────────────────────── */

  getComments: baseProcedure
    .input(
      z.object({
        postId: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      const rows = await db
        .select({
          id: postComment.id,
          content: postComment.content,
          createdAt: postComment.createdAt,
          userId: postComment.userId,
          userName: user.name,
          userImage: user.image,
        })
        .from(postComment)
        .innerJoin(user, eq(postComment.userId, user.id))
        .where(
          and(
            eq(postComment.postId, input.postId),
            eq(postComment.status, "approved"),
          ),
        )
        .orderBy(desc(postComment.createdAt));

      return rows.map((r) => ({
        id: r.id,
        content: r.content,
        createdAt: r.createdAt,
        user: {
          id: r.userId,
          name: r.userName,
          image: r.userImage,
        },
      }));
    }),

  addComment: protectedProcedure
    .input(
      z.object({
        postId: z.string().min(1),
        content: z.string().min(1).max(1000),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = getRequiredAuthUserId(ctx);

      await assertUserExists(userId);

      const postRow = await db.query.post.findFirst({
        where: and(eq(post.id, input.postId), eq(post.status, "published")),
        columns: {
          id: true,
        },
      });

      if (!postRow) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artikel tidak ditemukan",
        });
      }

      const [row] = await db
        .insert(postComment)
        .values({
          id: crypto.randomUUID(),
          postId: input.postId,
          userId,
          content: input.content,
          status: "approved",
        })
        .returning();

      return row!;
    }),

  /* ─────────────────────────────────────────────────────
     ADMIN — COMMENT MODERATION
  ───────────────────────────────────────────────────── */

  getCommentsAdmin: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "approved", "rejected"]).optional(),
        searchQuery: z.string().optional(),
        postId: z.string().optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      }),
    )
    .query(async ({ input }) => {
      const conditions: SQL[] = [];

      if (input.status) {
        conditions.push(eq(postComment.status, input.status));
      }

      if (input.postId) {
        conditions.push(eq(postComment.postId, input.postId));
      }

      if (input.searchQuery) {
        const q = `%${input.searchQuery}%`;

        conditions.push(
          or(ilike(postComment.content, q), ilike(user.name, q), ilike(post.title, q))!,
        );
      }

      const limit = input.limit;
      const offset = (input.page - 1) * limit;
      const whereClause = conditions.length ? and(...conditions) : undefined;

      const rows = await db
        .select({
          id: postComment.id,
          content: postComment.content,
          status: postComment.status,
          createdAt: postComment.createdAt,
          updatedAt: postComment.updatedAt,

          userId: postComment.userId,
          userName: user.name,
          userImage: user.image,
          userEmail: user.email,

          postId: postComment.postId,
          postTitle: post.title,
          postSlug: post.slug,
        })
        .from(postComment)
        .innerJoin(user, eq(postComment.userId, user.id))
        .innerJoin(post, eq(postComment.postId, post.id))
        .where(whereClause)
        .orderBy(desc(postComment.createdAt))
        .limit(limit)
        .offset(offset);

      const [totalRow] = await db
        .select({
          count: count(),
        })
        .from(postComment)
        .innerJoin(user, eq(postComment.userId, user.id))
        .innerJoin(post, eq(postComment.postId, post.id))
        .where(whereClause);

      const comments = rows.map((r) => ({
        id: r.id,
        content: r.content,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        user: {
          id: r.userId,
          name: r.userName,
          image: r.userImage,
          email: r.userEmail,
        },
        post: {
          id: r.postId,
          title: r.postTitle,
          slug: r.postSlug,
        },
      }));

      return {
        comments,
        total: totalRow?.count ?? 0,
        page: input.page,
        limit,
      };
    }),

  getCommentStats: protectedProcedure.query(async () => {
    const rows = await db
      .select({
        status: postComment.status,
        count: count(),
      })
      .from(postComment)
      .groupBy(postComment.status);

    const stats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    for (const r of rows) {
      const c = r.count ?? 0;

      stats.total += c;

      if (r.status === "pending") {
        stats.pending = c;
      } else if (r.status === "approved") {
        stats.approved = c;
      } else if (r.status === "rejected") {
        stats.rejected = c;
      }
    }

    return stats;
  }),

  setCommentStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        status: z.enum(["pending", "approved", "rejected"]),
      }),
    )
    .mutation(async ({ input }) => {
      const [row] = await db
        .update(postComment)
        .set({
          status: input.status,
        })
        .where(eq(postComment.id, input.id))
        .returning();

      if (!row) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Komentar tidak ditemukan",
        });
      }

      return row;
    }),

  bulkSetCommentStatus: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string().min(1)).min(1),
        status: z.enum(["pending", "approved", "rejected"]),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .update(postComment)
        .set({
          status: input.status,
        })
        .where(inArray(postComment.id, input.ids));

      return {
        success: true,
        count: input.ids.length,
      };
    }),

  deleteComment: protectedProcedure
    .input(idInput)
    .mutation(async ({ input }) => {
      await db.delete(postComment).where(eq(postComment.id, input.id));

      return {
        success: true,
      };
    }),

  bulkDeleteComments: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string().min(1)).min(1),
      }),
    )
    .mutation(async ({ input }) => {
      await db.delete(postComment).where(inArray(postComment.id, input.ids));

      return {
        success: true,
        count: input.ids.length,
      };
    }),
});