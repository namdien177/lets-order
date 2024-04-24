"use server";

import type { PaginationParams } from "@/lib/types/pagination.types";
import { auth } from "@clerk/nextjs/server";
import { assertAsNonNullish } from "@/lib/types/helper";
import { extractPaginationParams, isNullish } from "@/lib/utils";
import { db } from "@/server/db";
import {
  type OrderCart,
  OrderCartTable,
  type OrderEvent,
  OrderEventProductTable,
  OrderEventTable,
  OrderItemTable,
  ProductTable,
} from "@/server/db/schema";
import { and, count, desc, eq, like, or, sql } from "drizzle-orm";
import { union } from "drizzle-orm/sqlite-core";
import { unflatten } from "flat";

type QueryInvolvedOrdersProps = {
  query?: PaginationParams;
  clerkId?: string;
};

export type InvolvedOrder = Pick<
  OrderEvent,
  | "id"
  | "clerkId"
  | "name"
  | "code"
  | "paymentStatus"
  | "paymentAt"
  | "status"
  | "createdAt"
> & {
  price: number;
  cart: Pick<
    OrderCart,
    "id" | "paymentStatus" | "paymentAt" | "paymentConfirmationAt"
  >;
};

export const queryInvolvedOrders = async ({
  query,
  clerkId: clerkIdFromProps,
}: QueryInvolvedOrdersProps) => {
  const { userId } = auth();
  assertAsNonNullish(userId);

  const { limit, keyword, page } = extractPaginationParams(query);
  const clerkId = clerkIdFromProps ?? userId;

  const yourCarts$ = db
    .selectDistinct({
      eventId: OrderCartTable.eventId,
    })
    .from(OrderCartTable)
    .innerJoin(OrderEventTable, eq(OrderCartTable.eventId, OrderEventTable.id))
    .innerJoin(OrderItemTable, eq(OrderCartTable.id, OrderItemTable.cartId))
    .innerJoin(
      OrderEventProductTable,
      eq(OrderItemTable.orderEventProductId, OrderEventProductTable.id),
    )
    .innerJoin(
      ProductTable,
      eq(OrderEventProductTable.productId, ProductTable.id),
    )
    .where(
      and(
        eq(OrderCartTable.clerkId, clerkId),
        isNullish(keyword)
          ? undefined
          : or(
              like(ProductTable.name, `%${keyword}%`),
              like(ProductTable.description, `%${keyword}%`),
              like(OrderEventTable.name, `%${keyword}%`),
              like(OrderEventTable.code, `%${keyword}%`),
            ),
      ),
    )
    .$dynamic();

  const yourEvents$ = db
    .selectDistinct({
      eventId: OrderEventTable.id,
    })
    .from(OrderEventTable)
    .where(
      and(
        eq(OrderEventTable.clerkId, clerkId),
        isNullish(keyword)
          ? undefined
          : or(
              like(OrderEventTable.name, `%${keyword}%`),
              like(OrderEventTable.code, `%${keyword}%`),
            ),
      ),
    )
    .$dynamic();

  const eventsYouInvolved$ = union(yourEvents$, yourCarts$).as(
    "eventsYouInvolved",
  );

  const totalPriceInEvent$ = db
    .select({
      eventId: eventsYouInvolved$.eventId,
      cartId: OrderCartTable.id,
      total:
        sql<number>`SUM( CASE WHEN ${OrderItemTable.amount} IS NULL THEN 0 ELSE (${OrderItemTable.amount} * ${ProductTable.price}) END)`.as(
          "total",
        ),
    })
    .from(eventsYouInvolved$)
    .leftJoin(
      OrderCartTable,
      and(
        eq(eventsYouInvolved$.eventId, OrderCartTable.eventId),
        eq(OrderCartTable.clerkId, clerkId),
      ),
    )
    .innerJoin(OrderItemTable, eq(OrderCartTable.id, OrderItemTable.cartId))
    .innerJoin(
      OrderEventProductTable,
      eq(OrderItemTable.orderEventProductId, OrderEventProductTable.id),
    )
    .innerJoin(
      ProductTable,
      eq(OrderEventProductTable.productId, ProductTable.id),
    )
    .groupBy((table) => [table.eventId, table.cartId])
    .as("totalPriceInEvent");

  const [{ total } = { total: 0 }] = await db
    .select({
      total: count(),
    })
    .from(eventsYouInvolved$);

  const rawData = await db
    .select({
      id: totalPriceInEvent$.eventId,
      clerkId: OrderEventTable.clerkId,
      code: OrderEventTable.code,
      name: OrderEventTable.name,
      status: OrderEventTable.status,
      paymentStatus: OrderEventTable.paymentStatus,
      endingAt: OrderEventTable.endingAt,
      createdAt: OrderEventTable.createdAt,
      price: totalPriceInEvent$.total,
      "cart.id": OrderCartTable.id,
      "cart.paymentStatus": OrderCartTable.paymentStatus,
      "cart.paymentAt": OrderCartTable.paymentAt,
      "cart.paymentConfirmationAt": OrderCartTable.paymentConfirmationAt,
    })
    .from(totalPriceInEvent$)
    .innerJoin(
      OrderEventTable,
      eq(totalPriceInEvent$.eventId, OrderEventTable.id),
    )
    .innerJoin(
      OrderCartTable,
      and(
        eq(OrderCartTable.eventId, OrderEventTable.id),
        eq(OrderCartTable.clerkId, clerkId),
      ),
    )
    .orderBy((table) => [desc(table.createdAt)])
    .limit(limit)
    .offset(Math.max(0, page - 1) * limit);

  const data: Array<InvolvedOrder> = rawData.map((row) => {
    return unflatten(row);
  });

  return {
    total,
    data,
  };
};
