import { type PaginationParams } from "@/lib/types/pagination.types";
import { db } from "@/server/db";
import { ProductTable } from "@/server/db/schema";
import { and, count, eq, isNull, like, or, type SQLWrapper } from "drizzle-orm";

type SearchProps = PaginationParams & {
  clerkId: string;
  additionalWhere?: (SQLWrapper | undefined)[];
};

export const searchOwnProduct = async ({
  keyword,
  page = 1,
  limit = 10,
  clerkId,
  additionalWhere = [],
}: SearchProps) => {
  limit = limit > 20 ? 20 : limit < 10 ? 10 : limit;
  page = page < 1 ? 1 : page;
  keyword = keyword?.trim();

  const offset = (page - 1) * limit;

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
