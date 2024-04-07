"use server";

import { db } from "@/server/db";

type FindProps = {
  keyword: string;
  clerkId: string;
  excludes?: number[];
  limit?: number;
};

export const findProducts = async ({
  keyword,
  clerkId,
  excludes,
  limit = 10,
}: FindProps) => {
  limit = limit > 20 ? 20 : limit < 10 ? 10 : limit;
  keyword = keyword.trim();
  if (keyword.length < 3) {
    return { data: [] };
  }

  const data = await db.query.ProductTable.findMany({
    where: (table, { and, or, eq, notInArray, like, isNull }) =>
      and(
        eq(table.clerkId, clerkId),
        isNull(table.deletedAt),
        or(
          like(table.name, `%${keyword}%`),
          like(table.description, `%${keyword}%`),
        ),
        excludes && excludes.length > 0
          ? notInArray(table.id, excludes)
          : undefined,
      ),
    limit,
    columns: {
      id: true,
      name: true,
      description: true,
      price: true,
    },
  });

  return { data };
};
