// app/db/schema/blog.ts
//
// MIGRATION NEEDED after updating this file:
//   npm run db:push
//
// New columns added to `post`:
//   - is_featured  boolean  default false
//   - category_id  text     FK → post_category(id)  ON DELETE SET NULL
//
// New table added:
//   - post_comment (id, post_id, user_id, content, status, created_at, updated_at)
//     status: pending | approved | rejected

import {
  pgTable,
  text,
  timestamp,
  jsonb,
  integer,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema";

export const post = pgTable("post", {
  id: text("id").primaryKey(),

  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),

  excerpt: text("excerpt"),
  content: jsonb("content"),
  contentHtml: text("content_html"),

  coverImage: text("cover_image"),

  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Category (optional — can be ungrouped)
  categoryId: text("category_id").references(() => postCategory.id, {
    onDelete: "set null",
  }),

  status: text("status").default("draft"),
  // draft | published | archived

  // Mark as featured to appear in the hero slider on the blog index page
  isFeatured: boolean("is_featured").default(false).notNull(),

  publishedAt: timestamp("published_at"),

  readTime: integer("read_time"),

  viewCount: integer("view_count").default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const postCategory = pgTable("post_category", {
  id: text("id").primaryKey(),

  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),

  description: text("description"),

  // Display order in the filter bar
  order: integer("order").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tag = pgTable("tag", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const postTag = pgTable("post_tag", {
  id: text("id").primaryKey(),

  postId: text("post_id")
    .notNull()
    .references(() => post.id, { onDelete: "cascade" }),

  tagId: text("tag_id")
    .notNull()
    .references(() => tag.id, { onDelete: "cascade" }),
});

export const postView = pgTable("post_view", {
  id: text("id").primaryKey(),

  postId: text("post_id")
    .notNull()
    .references(() => post.id, { onDelete: "cascade" }),

  userId: text("user_id"),

  ipAddress: text("ip_address"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const postLike = pgTable(
  "post_like",
  {
    id: text("id").primaryKey(),

    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("post_like_unique").on(table.postId, table.userId),
  ],
);

export const postSave = pgTable(
  "post_save",
  {
    id: text("id").primaryKey(),

    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("post_save_unique").on(table.postId, table.userId)],
);

export const postComment = pgTable("post_comment", {
  id: text("id").primaryKey(),

  postId: text("post_id")
    .notNull()
    .references(() => post.id, { onDelete: "cascade" }),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  content: text("content").notNull(),

  // Moderation: pending → approved | rejected
  status: text("status").default("approved").notNull(),
  // pending | approved | rejected

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

/* ── Relations ─────────────────────────────────────────── */

export const postRelations = relations(post, ({ one, many }) => ({
  author: one(user, { fields: [post.authorId], references: [user.id] }),
  category: one(postCategory, {
    fields: [post.categoryId],
    references: [postCategory.id],
  }),
  likes: many(postLike),
  saves: many(postSave),
  views: many(postView),
  tags: many(postTag),
  comments: many(postComment),
}));

export const postCategoryRelations = relations(postCategory, ({ many }) => ({
  posts: many(post),
}));

export const postLikeRelations = relations(postLike, ({ one }) => ({
  post: one(post, { fields: [postLike.postId], references: [post.id] }),
  user: one(user, { fields: [postLike.userId], references: [user.id] }),
}));

export const postSaveRelations = relations(postSave, ({ one }) => ({
  post: one(post, { fields: [postSave.postId], references: [post.id] }),
  user: one(user, { fields: [postSave.userId], references: [user.id] }),
}));

export const postCommentRelations = relations(postComment, ({ one }) => ({
  post: one(post, { fields: [postComment.postId], references: [post.id] }),
  user: one(user, { fields: [postComment.userId], references: [user.id] }),
}));