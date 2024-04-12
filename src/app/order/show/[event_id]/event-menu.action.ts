"use server";

import { db } from "@/server/db";
import {
  type OrderEvent,
  OrderEventProductTable,
  ProductTable,
} from "@/server/db/schema";
import { and, asc, eq, like } from "drizzle-orm";

export const getAllProductsInEvent = async (
  event: Pick<OrderEvent, "id">,
  keyword = "",
) => {
  return db
    .select({
      id: ProductTable.id,
      eventProductId: OrderEventProductTable.id,
      name: ProductTable.name,
      description: ProductTable.description,
      price: ProductTable.price,
      createdAt: ProductTable.createdAt,
    })
    .from(OrderEventProductTable)
    .innerJoin(
      ProductTable,
      eq(OrderEventProductTable.productId, ProductTable.id),
    )
    .where(
      and(
        eq(OrderEventProductTable.eventId, event.id),
        keyword.trim().length >= 3
          ? like(ProductTable.name, `%${keyword.toLowerCase().trim()}%`)
          : undefined,
      ),
    )
    .orderBy(asc(OrderEventProductTable.createdAt));
};
