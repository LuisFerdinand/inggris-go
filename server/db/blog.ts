import {
  pgTable,
  text,
  timestamp,
  jsonb,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./users";
import { relations } from "drizzle-orm";

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

  status: text("status").default("draft"),
  // draft | published | archived

  publishedAt: timestamp("published_at"),

  readTime: integer("read_time"), // optional (minutes)

  viewCount: integer("view_count").default(0), // cached

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const postCategory = pgTable("post_category", {
  id: text("id").primaryKey(),

  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),

  description: text("description"),

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

  userId: text("user_id"), // nullable (guest view allowed)

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
    // prevent duplicate likes
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

export const postRelations = relations(post, ({ one, many }) => ({
  author: one(user, {
    fields: [post.authorId],
    references: [user.id],
  }),
  likes: many(postLike),
  saves: many(postSave),
  views: many(postView),
  tags: many(postTag),
}));

export const postLikeRelations = relations(postLike, ({ one }) => ({
  post: one(post, {
    fields: [postLike.postId],
    references: [post.id],
  }),
  user: one(user, {
    fields: [postLike.userId],
    references: [user.id],
  }),
}));

export const postSaveRelations = relations(postSave, ({ one }) => ({
  post: one(post, {
    fields: [postSave.postId],
    references: [post.id],
  }),
  user: one(user, {
    fields: [postSave.userId],
    references: [user.id],
  }),
}));
