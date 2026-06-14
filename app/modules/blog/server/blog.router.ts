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
  SQL,
} from "drizzle-orm";
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

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  status: string;
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
  tags: { id: string; name: string; slug: string }[];
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

async function getTagsForPost(postId: string) {
  return db
    .select({ id: tag.id, name: tag.name, slug: tag.slug })
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
    .select({ count: count() })
    .from(postLike)
    .where(eq(postLike.postId, postId));
  return row?.count ?? 0;
}

async function getUserLiked(postId: string, userId: string): Promise<boolean> {
  const row = await db.query.postLike.findFirst({
    where: and(eq(postLike.postId, postId), eq(postLike.userId, userId)),
    columns: { id: true },
  });
  return !!row;
}

async function assertUserExists(userId: string): Promise<void> {
  const row = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: { id: true },
  });
  if (!row) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Akun tidak ditemukan. Silakan logout dan login kembali.",
    });
  }
}

/* Minimal shape every select query passes into enrichPost.
   Must match exactly the columns selected in getPublished, getRelated, etc. */
type RawPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  isFeatured: boolean;
  publishedAt: Date | null;
  readTime: number | null;
  viewCount: number | null;
  categoryId: string | null;
};

/* Enrich a raw post row with tags, category, and likeCount */
async function enrichPost(p: RawPostRow) {
  const [tags, category, likeCount] = await Promise.all([
    getTagsForPost(p.id),
    getCategoryForPost(p.categoryId),
    getLikeCount(p.id),
  ]);
  return { ...p, tags, category, likeCount };
}

/** Convenience type — derive LivePost from enrichPost's return shape */
export type EnrichedPost = Awaited<ReturnType<typeof enrichPost>>;

/* =========================================================
   ROUTER
========================================================= */

export const blogRouter = createTRPCRouter({
  /* ─────────────────────────────────────────────────────
     CATEGORIES
  ───────────────────────────────────────────────────── */

  /** List all categories — public (used by filter bar on blog index) */
  getCategories: baseProcedure.query(async () => {
    return db
      .select()
      .from(postCategory)
      .orderBy(asc(postCategory.order), asc(postCategory.name));
  }),

  /** Create a new category — admin only */
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

  /** Delete a category — admin only */
  deleteCategory: protectedProcedure
    .input(idInput)
    .mutation(async ({ input }) => {
      // Detach posts from this category before deleting
      await db
        .update(post)
        .set({ categoryId: null })
        .where(eq(post.categoryId, input.id));
      await db
        .delete(postCategory)
        .where(eq(postCategory.id, input.id));
      return { success: true };
    }),

  /* ─────────────────────────────────────────────────────
     TAGS
  ───────────────────────────────────────────────────── */

  getTags: protectedProcedure.query(async () => {
    return db.select().from(tag).orderBy(asc(tag.name));
  }),

  /** Public tag list — used by filter bars */
  getTagsPublic: baseProcedure.query(async () => {
    return db.select().from(tag).orderBy(asc(tag.name));
  }),

  createTag: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const slug = makeSlug(input.name);
      const [row] = await db
        .insert(tag)
        .values({ id: crypto.randomUUID(), name: input.name, slug })
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
      if (input.status) conditions.push(eq(post.status, input.status));
      if (input.searchQuery)
        conditions.push(ilike(post.title, `%${input.searchQuery}%`));
      if (input.categoryId)
        conditions.push(eq(post.categoryId, input.categoryId));
      if (input.isFeatured !== undefined)
        conditions.push(eq(post.isFeatured, input.isFeatured));

      const limit = input.limit ?? 20;
      const offset = ((input.page ?? 1) - 1) * limit;

      const rows = await db
        .select({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
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
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(post.createdAt))
        .limit(limit)
        .offset(offset);

      const [totalRow] = await db
        .select({ count: count() })
        .from(post)
        .where(conditions.length ? and(...conditions) : undefined);

      const posts = await Promise.all(rows.map(enrichPost));

      return {
        posts,
        total: totalRow?.count ?? 0,
        page: input.page ?? 1,
        limit,
      };
    }),

  getById: protectedProcedure.input(idInput).query(async ({ input }) => {
    const row = await db.query.post.findFirst({
      where: eq(post.id, input.id),
    });
    if (!row)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Artikel tidak ditemukan",
      });

    return enrichPost(row);
  }),

  create: protectedProcedure
    .input(postInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const { tagIds, slug: inputSlug, ...values } = input;
      const slug = await uniquePostSlug(inputSlug || values.title);
      const id = crypto.randomUUID();

      const [row] = await db
        .insert(post)
        .values({
          ...values,
          id,
          slug,
          authorId: values.authorId || ctx.auth.userId,
          publishedAt:
            values.status === "published" && !values.publishedAt
              ? new Date()
              : values.publishedAt
                ? new Date(values.publishedAt)
                : null,
        })
        .returning();

      if (tagIds?.length) {
        await db.insert(postTag).values(
          tagIds.map((tagId) => ({
            id: crypto.randomUUID(),
            postId: id,
            tagId,
          })),
        );
      }

      return enrichPost({ ...row!, categoryId: row!.categoryId ?? null });
    }),

  update: protectedProcedure
    .input(postUpdateSchema)
    .mutation(async ({ input }) => {
      const { id, tagIds, slug: inputSlug, ...rest } = input;

      const existing = await db.query.post.findFirst({
        where: eq(post.id, id),
      });
      if (!existing)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artikel tidak ditemukan",
        });

      const slugSource = inputSlug || rest.title;
      const nextSlug = slugSource
        ? await uniquePostSlug(slugSource, id)
        : undefined;

      let publishedAt =
        rest.publishedAt ? new Date(rest.publishedAt) : existing.publishedAt;
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

      if (!row)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artikel tidak ditemukan",
        });

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

      return enrichPost({ ...row, categoryId: row.categoryId ?? null });
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
      const publishedAt =
        input.status === "published" && !existing?.publishedAt
          ? new Date()
          : existing?.publishedAt;

      const [row] = await db
        .update(post)
        .set({ status: input.status, publishedAt })
        .where(eq(post.id, input.id))
        .returning();
      if (!row)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artikel tidak ditemukan",
        });
      return row;
    }),

  remove: protectedProcedure.input(idInput).mutation(async ({ input }) => {
    await db.delete(postTag).where(eq(postTag.postId, input.id));
    await db.delete(post).where(eq(post.id, input.id));
    return { success: true };
  }),

  getStats: protectedProcedure.query(async () => {
    const rows = await db
      .select({ status: post.status, count: count() })
      .from(post)
      .groupBy(post.status);

    const stats = { total: 0, published: 0, draft: 0, archived: 0 };
    for (const r of rows) {
      const c = r.count ?? 0;
      stats.total += c;
      if (r.status === "published") stats.published = c;
      else if (r.status === "draft") stats.draft = c;
      else if (r.status === "archived") stats.archived = c;
    }
    return stats;
  }),

  /* ─────────────────────────────────────────────────────
     PUBLIC — POSTS
  ───────────────────────────────────────────────────── */

  /**
   * Returns only PUBLISHED posts.
   * Supports filtering by category slug, tag slug, search, isFeatured.
   * Draft / archived → never returned.
   */
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

      // Filter by category slug — join to postCategory
      let categoryId: string | undefined;
      if (input.categorySlug) {
        const cat = await db.query.postCategory.findFirst({
          where: eq(postCategory.slug, input.categorySlug),
          columns: { id: true },
        });
        if (cat) {
          categoryId = cat.id;
          conditions.push(eq(post.categoryId, cat.id));
        } else {
          // No posts match a non-existent category
          return { posts: [], total: 0, page: input.page, limit: input.limit };
        }
      }

      // Filter by tag slug — need posts that have this tag
      let tagPostIds: string[] | undefined;
      if (input.tagSlug) {
        const tagRow = await db.query.tag.findFirst({
          where: eq(tag.slug, input.tagSlug),
          columns: { id: true },
        });
        if (tagRow) {
          const ptRows = await db
            .select({ postId: postTag.postId })
            .from(postTag)
            .where(eq(postTag.tagId, tagRow.id));
          tagPostIds = ptRows.map((r) => r.postId);
          if (tagPostIds.length === 0) {
            return {
              posts: [],
              total: 0,
              page: input.page,
              limit: input.limit,
            };
          }
          conditions.push(inArray(post.id, tagPostIds));
        } else {
          return { posts: [], total: 0, page: input.page, limit: input.limit };
        }
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
        .select({ count: count() })
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
    .input(z.object({ slug: z.string().min(1) }))
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

      const userId = ctx.session?.user?.id ?? null;
      const userLiked = userId ? await getUserLiked(row.id, userId) : false;

      return { ...row, tags, category, likeCount, userLiked };
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

      // Prefer same category
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

      // If not enough from same category, backfill with any post
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
          .where(
            and(
              eq(post.status, "published"),
              ne(post.id, input.postId),
            ),
          )
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
        where: and(
          eq(post.slug, input.slug),
          eq(post.status, "published"),
        ),
        columns: { id: true, viewCount: true },
      });
      if (!row) return { success: false };

      const userId = ctx.session?.user?.id ?? null;
      if (userId) {
        const recent = await db.query.postView.findFirst({
          where: and(
            eq(postView.postId, row.id),
            eq(postView.userId, userId),
          ),
          columns: { id: true, createdAt: true },
          orderBy: desc(postView.createdAt),
        });
        const thirtyMins = new Date(Date.now() - 30 * 60 * 1000);
        if (recent && recent.createdAt > thirtyMins) {
          return { success: true, counted: false };
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
        .set({ viewCount: (row.viewCount ?? 0) + 1 })
        .where(eq(post.id, row.id));

      return { success: true, counted: true };
    }),

  toggleLike: protectedProcedure
    .input(z.object({ postId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.auth.userId;
      await assertUserExists(userId);

      const postRow = await db.query.post.findFirst({
        where: and(
          eq(post.id, input.postId),
          eq(post.status, "published"),
        ),
        columns: { id: true },
      });
      if (!postRow)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artikel tidak ditemukan",
        });

      const existing = await db.query.postLike.findFirst({
        where: and(
          eq(postLike.postId, input.postId),
          eq(postLike.userId, userId),
        ),
        columns: { id: true },
      });

      if (existing) {
        await db.delete(postLike).where(eq(postLike.id, existing.id));
        return { liked: false, likeCount: await getLikeCount(input.postId) };
      } else {
        await db.insert(postLike).values({
          id: crypto.randomUUID(),
          postId: input.postId,
          userId,
        });
        return { liked: true, likeCount: await getLikeCount(input.postId) };
      }
    }),

  getLikeState: baseProcedure
    .input(z.object({ postId: z.string().min(1) }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.session?.user?.id ?? null;
      const [likeCount, userLiked] = await Promise.all([
        getLikeCount(input.postId),
        userId
          ? getUserLiked(input.postId, userId)
          : Promise.resolve(false),
      ]);
      return { likeCount, userLiked };
    }),

  /**
   * Public — list APPROVED comments for a published post.
   * Used on the blog detail page.
   */
  getComments: baseProcedure
    .input(z.object({ postId: z.string().min(1) }))
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
        user: { id: r.userId, name: r.userName, image: r.userImage },
      }));
    }),

  /**
   * Authenticated — post a comment on a published post.
   * Comments are auto-approved by default (status="approved").
   * Admins can moderate via getCommentsAdmin / setCommentStatus.
   */
  addComment: protectedProcedure
    .input(
      z.object({
        postId: z.string().min(1),
        content: z.string().min(1).max(1000),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.auth.userId;
      await assertUserExists(userId);

      const postRow = await db.query.post.findFirst({
        where: and(
          eq(post.id, input.postId),
          eq(post.status, "published"),
        ),
        columns: { id: true },
      });
      if (!postRow)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artikel tidak ditemukan",
        });

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

  /**
   * Paginated comment list for the admin moderation page.
   * Supports filtering by status and searching comment content,
   * commenter name, or post title.
   */
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
      if (input.status) conditions.push(eq(postComment.status, input.status));
      if (input.postId) conditions.push(eq(postComment.postId, input.postId));
      if (input.searchQuery) {
        const q = `%${input.searchQuery}%`;
        conditions.push(
          or(
            ilike(postComment.content, q),
            ilike(user.name, q),
            ilike(post.title, q),
          )!,
        );
      }

      const limit = input.limit;
      const offset = (input.page - 1) * limit;

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
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(postComment.createdAt))
        .limit(limit)
        .offset(offset);

      const [totalRow] = await db
        .select({ count: count() })
        .from(postComment)
        .innerJoin(user, eq(postComment.userId, user.id))
        .innerJoin(post, eq(postComment.postId, post.id))
        .where(conditions.length ? and(...conditions) : undefined);

      const comments = rows.map((r) => ({
        id: r.id,
        content: r.content,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        user: { id: r.userId, name: r.userName, image: r.userImage, email: r.userEmail },
        post: { id: r.postId, title: r.postTitle, slug: r.postSlug },
      }));

      return { comments, total: totalRow?.count ?? 0, page: input.page, limit };
    }),

  /**
   * Counts of comments by status — for the summary strip on the
   * admin comment moderation page.
   */
  getCommentStats: protectedProcedure.query(async () => {
    const rows = await db
      .select({ status: postComment.status, count: count() })
      .from(postComment)
      .groupBy(postComment.status);

    const stats = { total: 0, pending: 0, approved: 0, rejected: 0 };
    for (const r of rows) {
      const c = r.count ?? 0;
      stats.total += c;
      if (r.status === "pending") stats.pending = c;
      else if (r.status === "approved") stats.approved = c;
      else if (r.status === "rejected") stats.rejected = c;
    }
    return stats;
  }),

  /** Approve, reject, or revert a comment to pending — admin only. */
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
        .set({ status: input.status })
        .where(eq(postComment.id, input.id))
        .returning();
      if (!row)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Komentar tidak ditemukan",
        });
      return row;
    }),

  /** Bulk approve/reject — used by the "select all" bar in the admin UI. */
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
        .set({ status: input.status })
        .where(inArray(postComment.id, input.ids));
      return { success: true, count: input.ids.length };
    }),

  /** Delete a comment permanently — admin only. */
  deleteComment: protectedProcedure
    .input(idInput)
    .mutation(async ({ input }) => {
      await db.delete(postComment).where(eq(postComment.id, input.id));
      return { success: true };
    }),

  /** Bulk delete — used by the "select all" bar in the admin UI. */
  bulkDeleteComments: protectedProcedure
    .input(z.object({ ids: z.array(z.string().min(1)).min(1) }))
    .mutation(async ({ input }) => {
      await db.delete(postComment).where(inArray(postComment.id, input.ids));
      return { success: true, count: input.ids.length };
    }),
});