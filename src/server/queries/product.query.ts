import { type UnSafePaginationParams } from "@/lib/types/pagination.types";
import { db } from "@/server/db";
import { ProductTable } from "@/server/db/schema";
import { and, count, eq, isNull, like, or, type SQLWrapper } from "drizzle-orm";
import { extractPaginationParams } from "@/lib/utils";

type SearchProps = UnSafePaginationParams & {
  clerkId: string;
  withDelete?: boolean;
  additionalWhere?: (SQLWrapper | undefined)[];
};

export const searchOwnProduct = async ({
  clerkId,
  additionalWhere = [],
  withDelete,
  ...paginationParams
}: SearchProps) => {
  const { page, limit, keyword } = extractPaginationParams(paginationParams);
  const offset = (page - 1) * limit;

  const queryBuilder = db
    .select()
    .from(ProductTable)
    .where(
      and(
        eq(ProductTable.clerkId, clerkId),
        !withDelete ? isNull(ProductTable.deletedAt) : undefined,
        keyword
          ? or(
              like(ProductTable.name, `%${keyword}%`),
              like(ProductTable.description, `%${keyword}%`),
            )
          : undefined,
        ...additionalWhere,
      ),
    )
    .as("productQueryBuilder");

  const data = await db.select().from(queryBuilder).offset(offset).limit(limit);
  const [{ total } = { total: 0 }] = await db
    .select({ total: count() })
    .from(queryBuilder);

  return { data, total };
};
