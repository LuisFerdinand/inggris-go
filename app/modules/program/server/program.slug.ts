// app/modules/program/server/program.slug.ts
import {
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  lt,
  lte,
  ne,
  SQL,
} from "drizzle-orm";
import type { AnyPgColumn, AnyPgTable } from "drizzle-orm/pg-core";

import { db } from "@/app/db/db";
import { generateSlug } from "@/lib/utils";

type GenerateUniqueSlugOptions = {
  table: AnyPgTable;
  slugColumn: AnyPgColumn;
  idColumn?: AnyPgColumn;
  title: string;
  excludeId?: string;
  where?: SQL;
};

export async function generateUniqueSlug({
  table,
  slugColumn,
  idColumn,
  title,
  excludeId,
  where,
}: GenerateUniqueSlugOptions) {
  const baseSlug = generateSlug(title);

  const conditions: SQL[] = [ilike(slugColumn, `${baseSlug}%`)];

  if (where) conditions.push(where);
  if (excludeId && idColumn) conditions.push(ne(idColumn, excludeId));

  const existing = await db
    .select({ slug: slugColumn })
    .from(table)
    .where(and(...conditions));

  const existingSlugs = new Set(existing.map((item) => String(item.slug)));

  if (!existingSlugs.has(baseSlug)) return baseSlug;

  let counter = 1;
  let slug = `${baseSlug}-${counter}`;

  while (existingSlugs.has(slug)) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}

type ScopedOptions = {
  where?: SQL;
};

type GetNextOrderOptions = ScopedOptions & {
  table: AnyPgTable;
  orderColumn: AnyPgColumn;
};

type NormalizeOrdersOptions = ScopedOptions & {
  table: AnyPgTable;
  idColumn: AnyPgColumn;
  orderColumn: AnyPgColumn;
};

type MoveOrderOptions = ScopedOptions & {
  table: AnyPgTable;
  idColumn: AnyPgColumn;
  orderColumn: AnyPgColumn;
  itemId: string;
  fromOrder: number;
  toOrder: number;
};

type SwapOrderOptions = ScopedOptions & {
  table: AnyPgTable;
  idColumn: AnyPgColumn;
  orderColumn: AnyPgColumn;
  firstId: string;
  secondId: string;
};

function setColumnValue(column: AnyPgColumn, value: unknown) {
  return {
    [column.name]: value,
  };
}

export async function getNextOrder({
  table,
  orderColumn,
  where,
}: GetNextOrderOptions) {
  const query = db
    .select({ order: orderColumn })
    .from(table)
    .orderBy(desc(orderColumn))
    .limit(1);

  const lastItem = where ? await query.where(where) : await query;

  return ((lastItem[0]?.order as number | undefined) ?? -1) + 1;
}

export async function normalizeOrders({
  table,
  idColumn,
  orderColumn,
  where,
}: NormalizeOrdersOptions) {
  const query = db
    .select({
      id: idColumn,
      order: orderColumn,
    })
    .from(table)
    .orderBy(asc(orderColumn));

  const items = where ? await query.where(where) : await query;

  await db.transaction(async (tx) => {
    for (let index = 0; index < items.length; index++) {
      const item = items[index];

      if (item.order !== index) {
        await tx
          .update(table)
          .set(setColumnValue(orderColumn, index))
          .where(eq(idColumn, item.id));
      }
    }
  });
}

export async function moveOrder({
  table,
  idColumn,
  orderColumn,
  itemId,
  fromOrder,
  toOrder,
  where,
}: MoveOrderOptions) {
  if (fromOrder === toOrder) return;

  await db.transaction(async (tx) => {
    if (fromOrder < toOrder) {
      const conditions: SQL[] = [
        gt(orderColumn, fromOrder),
        lte(orderColumn, toOrder),
      ];

      if (where) conditions.push(where);

      const affectedItems = await tx
        .select({
          id: idColumn,
          order: orderColumn,
        })
        .from(table)
        .where(and(...conditions));

      for (const item of affectedItems) {
        await tx
          .update(table)
          .set(setColumnValue(orderColumn, Number(item.order) - 1))
          .where(eq(idColumn, item.id));
      }
    } else {
      const conditions: SQL[] = [
        gte(orderColumn, toOrder),
        lt(orderColumn, fromOrder),
      ];

      if (where) conditions.push(where);

      const affectedItems = await tx
        .select({
          id: idColumn,
          order: orderColumn,
        })
        .from(table)
        .where(and(...conditions));

      for (const item of affectedItems) {
        await tx
          .update(table)
          .set(setColumnValue(orderColumn, Number(item.order) + 1))
          .where(eq(idColumn, item.id));
      }
    }

    await tx
      .update(table)
      .set(setColumnValue(orderColumn, toOrder))
      .where(eq(idColumn, itemId));
  });
}

export async function swapOrders({
  table,
  idColumn,
  orderColumn,
  firstId,
  secondId,
  where,
}: SwapOrderOptions) {
  if (firstId === secondId) return;

  const conditions: SQL[] = [inArray(idColumn, [firstId, secondId])];
  if (where) conditions.push(where);

  const items = await db
    .select({
      id: idColumn,
      order: orderColumn,
    })
    .from(table)
    .where(and(...conditions));

  const firstItem = items.find((x) => x.id === firstId);
  const secondItem = items.find((x) => x.id === secondId);

  if (!firstItem || !secondItem) {
    throw new Error("Items not found");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(table)
      .set(setColumnValue(orderColumn, secondItem.order))
      .where(eq(idColumn, firstId));

    await tx
      .update(table)
      .set(setColumnValue(orderColumn, firstItem.order))
      .where(eq(idColumn, secondId));
  });
}