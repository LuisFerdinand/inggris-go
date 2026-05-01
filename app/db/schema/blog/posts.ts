import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  index,
  pgEnum,
  primaryKey,
  jsonb,
  integer,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "../auth-schema";

export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "published",
  "archived",
]);

export const post = pgTable(
  "post",
  {
    id: text("id").primaryKey(),

    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    contentJson: jsonb("content_json").notNull(), // editor state
    contentHtml: text("content_html"), // pre-rendered HTML
    excerpt: text("excerpt"),

    coverImage: text("cover_image"),

    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    categoryId: text("category_id").references(() => category.id, {
      onDelete: "set null",
    }),

    status: postStatusEnum("status").default("draft").notNull(),
    readingTime: integer("reading_time"), // in minutes

    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    canonicalUrl: text("canonical_url"),
    ogImage: text("og_image"),

    publishedAt: timestamp("published_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("post_slug_idx").on(table.slug),
    index("post_author_idx").on(table.authorId),
    index("post_category_idx").on(table.categoryId),
    index("post_status_idx").on(table.status),
    index("post_published_idx").on(table.publishedAt),
  ],
);

export const postLike = pgTable(
  "post_like",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.postId] })],
);

export const playlist = pgTable(
  "playlist",
  {
    id: text("id").primaryKey(),

    name: text("name").notNull(),
    description: text("description"),

    // owner (nullable for system playlists)
    userId: text("user_id").references(() => user.id, {
      onDelete: "cascade",
    }),

    isSystem: boolean("is_system").default(false).notNull(),
    isDefault: boolean("is_default").default(false).notNull(),

    isPublic: boolean("is_public").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("playlist_user_name_unique").on(table.userId, table.name),
  ],
);

export const playlistItem = pgTable(
  "playlist_item",
  {
    playlistId: text("playlist_id")
      .notNull()
      .references(() => playlist.id, { onDelete: "cascade" }),

    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),

    position: integer("position"), // ordering

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.playlistId, table.postId] })],
);

export const postView = pgTable(
  "post_view",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),

    viewedAt: timestamp("viewed_at").defaultNow().notNull(),
  },
  (table) => [index("post_view_post_idx").on(table.postId)],
);

export const category = pgTable(
  "category",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    icon: text("icon"),
  },
  (table) => [index("category_slug_idx").on(table.slug)],
);

export const categoryRelations = relations(category, ({ many }) => ({
  posts: many(post),
}));

export const tag = pgTable(
  "tag",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    icon: text("icon"),
  },
  (table) => [index("tag_slug_idx").on(table.slug)],
);

export const postTag = pgTable(
  "post_tag",
  {
    postId: text("post_id")
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),

    tagId: text("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.postId, table.tagId] })],
);

export const postTagRelations = relations(postTag, ({ one }) => ({
  post: one(post, {
    fields: [postTag.postId],
    references: [post.id],
  }),
  tag: one(tag, {
    fields: [postTag.tagId],
    references: [tag.id],
  }),
}));

export const tagRelations = relations(tag, ({ many }) => ({
  posts: many(postTag),
}));

export const postRelations = relations(post, ({ one, many }) => ({
  author: one(user, {
    fields: [post.authorId],
    references: [user.id],
  }),
  category: one(category, {
    fields: [post.categoryId],
    references: [category.id],
  }),
  tags: many(postTag),
}));

export const postLikeRelations = relations(postLike, ({ one }) => ({
  user: one(user, {
    fields: [postLike.userId],
    references: [user.id],
  }),
  post: one(post, {
    fields: [postLike.postId],
    references: [post.id],
  }),
}));

export const postViewRelations = relations(postView, ({ one }) => ({
  user: one(user, {
    fields: [postView.userId],
    references: [user.id],
  }),
  post: one(post, {
    fields: [postView.postId],
    references: [post.id],
  }),
}));

export const playlistRelations = relations(playlist, ({ one, many }) => ({
  user: one(user, {
    fields: [playlist.userId],
    references: [user.id],
  }),
  items: many(playlistItem),
}));

export const playlistItemRelations = relations(playlistItem, ({ one }) => ({
  playlist: one(playlist, {
    fields: [playlistItem.playlistId],
    references: [playlist.id],
  }),
  post: one(post, {
    fields: [playlistItem.postId],
    references: [post.id],
  }),
}));
