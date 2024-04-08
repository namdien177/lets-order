"use server";

import { db } from "@/server/db";
import { ProductTable } from "@/server/db/schema";
import { and, count, eq, isNull, like, notInArray, or } from "drizzle-orm";

type FindProps = {
  keyword?: string;
  clerkId: string;
  excludes?: number[];
  limit?: number;
  page?: number;
};

export const findProducts = async ({
  keyword,
  clerkId,
  excludes,
  limit = 10,
  page = 1,
}: FindProps) => {
  limit = limit > 20 ? 20 : limit < 10 ? 10 : limit;
  page = page < 1 ? 1 : page;
  const offset = (page - 1) * limit;

  keyword = keyword?.trim();

  const queryBuilder = db
    .select()
    .from(ProductTable)
    .where(
      and(
        eq(ProductTable.clerkId, clerkId),
        isNull(ProductTable.deletedAt),
        keyword && keyword.length > 0
          ? or(
              like(ProductTable.name, `%${keyword}%`),
              like(ProductTable.description, `%${keyword}%`),
            )
          : undefined,
        excludes && excludes.length > 0
          ? notInArray(ProductTable.id, excludes)
          : undefined,
      ),
    )
    .as("productQueryBuilder");

  const data = await db.select().from(queryBuilder).offset(offset).limit(limit);
  const [{ total } = { total: 0 }] = await db
    .select({ total: count() })
    .from(queryBuilder);

  return { data, total };
};
