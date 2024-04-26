"use server";

import type { PaginationParams } from "@/lib/types/pagination.types";
import { auth } from "@clerk/nextjs/server";
import { assertAsNonNullish, type Nullable } from "@/lib/types/helper";
import { extractPaginationParams, isNullish } from "@/lib/utils";
import { db } from "@/server/db";
import {
  type Cart,
  CartItemTable,
  CartTable,
  type Event,
  EventProductTable,
  EventTable,
  ProductTable,
} from "@/server/db/schema";
import { and, count, desc, eq, like, or, sql } from "drizzle-orm";
import { unflatten } from "flat";

type QueryInvolvedOrdersProps = {
  query?: PaginationParams;
  clerkId?: string;
};

export type InvolvedOrder = Pick<
  Event,
  | "id"
  | "clerkId"
  | "name"
  | "code"
  | "paymentStatus"
  | "paymentAt"
  | "status"
  | "createdAt"
> & {
  cart: Nullable<
    Pick<
      Cart,
      "id" | "paymentStatus" | "paymentAt" | "paymentConfirmationAt"
    > & {
      price: number;
    }
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

  const eventsYouInvolved$ = db
    .selectDistinct({
      eventId: EventTable.id,
    })
    .from(EventTable)
    .leftJoin(CartTable, eq(EventTable.id, CartTable.eventId))
    .leftJoin(CartItemTable, eq(CartTable.id, CartItemTable.cartId))
    .leftJoin(
      EventProductTable,
      eq(CartItemTable.orderEventProductId, EventProductTable.id),
    )
    .leftJoin(ProductTable, eq(EventProductTable.productId, ProductTable.id))
    .where(
      and(
        or(eq(EventTable.clerkId, clerkId), eq(CartTable.clerkId, clerkId)),
        isNullish(keyword)
          ? undefined
          : or(
              like(ProductTable.name, `%${keyword}%`),
              like(ProductTable.description, `%${keyword}%`),
              like(EventTable.name, `%${keyword}%`),
              like(EventTable.code, `%${keyword}%`),
            ),
      ),
    )
    .as("eventsYouInvolved");

  const totalPriceInEvent$ = db
    .select({
      eventId: eventsYouInvolved$.eventId,
      cartId: CartTable.id,
      total:
        sql<number>`SUM( CASE WHEN ${CartItemTable.amount} IS NULL THEN 0 ELSE (${CartItemTable.amount} * ${ProductTable.price}) END)`.as(
          "total",
        ),
    })
    .from(eventsYouInvolved$)
    .leftJoin(
      CartTable,
      and(
        eq(eventsYouInvolved$.eventId, CartTable.eventId),
        eq(CartTable.clerkId, clerkId),
      ),
    )
    .leftJoin(CartItemTable, eq(CartTable.id, CartItemTable.cartId))
    .leftJoin(
      EventProductTable,
      eq(CartItemTable.orderEventProductId, EventProductTable.id),
    )
    .leftJoin(ProductTable, eq(EventProductTable.productId, ProductTable.id))
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
      clerkId: EventTable.clerkId,
      code: EventTable.code,
      name: EventTable.name,
      status: EventTable.status,
      paymentStatus: EventTable.paymentStatus,
      endingAt: EventTable.endingAt,
      createdAt: EventTable.createdAt,
      "cart.id": totalPriceInEvent$.cartId,
      "cart.price": totalPriceInEvent$.total,
      "cart.paymentStatus": CartTable.paymentStatus,
      "cart.paymentAt": CartTable.paymentAt,
      "cart.paymentConfirmationAt": CartTable.paymentConfirmationAt,
    })
    .from(totalPriceInEvent$)
    .innerJoin(EventTable, eq(totalPriceInEvent$.eventId, EventTable.id))
    .leftJoin(
      CartTable,
      and(eq(CartTable.eventId, EventTable.id), eq(CartTable.clerkId, clerkId)),
    )
    .orderBy((table) => [desc(table.status), desc(table.createdAt)])
    .limit(limit)
    .offset(Math.max(0, page - 1) * limit);

  const data: Array<InvolvedOrder> = rawData.map((row) => unflatten(row));

  return {
    total,
    data,
  };
};
