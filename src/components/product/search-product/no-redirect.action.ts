"use server";

import { ProductTable } from "@/server/db/schema";
import { notInArray } from "drizzle-orm";
import { searchOwnProduct } from "@/server/queries/product.query";

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
  return searchOwnProduct({
    keyword,
    limit,
    page,
    clerkId,
    additionalWhere: [
      excludes && excludes.length > 0
        ? notInArray(ProductTable.id, excludes)
        : undefined,
    ],
  });
};
