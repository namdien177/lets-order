"use server";

import { db } from "@/server/db";
import { and, count, eq, like, or, sql, sum } from "drizzle-orm";
import {
  OrderCartTable,
  OrderEventProductTable,
  OrderEventTable,
  OrderItemTable,
  ProductTable,
} from "@/server/db/schema";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { assertAsNonNullish, type Nullable } from "@/lib/types/helper";
import {
  ORDER_PAYMENT_STATUS,
  type OrderPaymentStatus,
} from "@/server/db/constant";
import { unflatten } from "flat";
import { type PaginationParams } from "@/lib/types/pagination.types";
import {
  extractPaginationParams,
  getClerkPublicData,
  isNullish,
} from "@/lib/utils";
import { type ResultSet } from "@libsql/client";

type EventParticipantStatsReturn = {
  id: number;
  name: string;
  clerkId: number;
  paymentStatus: number;
  paymentAt: Date;
  status: number;
  statistics: {
    totalParticipants: number;
    totalPrice: number;
    paidParticipants: number;
    pendingParticipants: number;
  };
};

export const getEventParticipantStats = async (eventId: number) => {
  const { userId } = auth();
  assertAsNonNullish(userId);

  const cartInformation$ = db
    .select({
      cartId: OrderCartTable.id,
      eventId: OrderCartTable.eventId,
      clerkId: OrderCartTable.clerkId,
      paymentStatus: OrderCartTable.paymentStatus,
      paymentConfirmationAt: OrderCartTable.paymentConfirmationAt,
      amount: sum(OrderItemTable.amount).as("amount"),
      totalPrice: sql`sum(${ProductTable.price} * ${OrderItemTable.amount})`
        .mapWith(Number)
        .as("totalPrice"),
    })
    .from(OrderCartTable)
    .innerJoin(OrderItemTable, eq(OrderCartTable.id, OrderItemTable.cartId))
    .innerJoin(
      OrderEventProductTable,
      eq(OrderItemTable.orderEventProductId, OrderEventProductTable.id),
    )
    .innerJoin(
      ProductTable,
      eq(OrderEventProductTable.productId, ProductTable.id),
    )
    .groupBy((table) => table.cartId)
    .as("cartInformation$");

  const totalParticipants$ = db
    .select({
      eventId: cartInformation$.eventId,
      totalParticipants: count(cartInformation$.clerkId).as(
        "totalParticipants",
      ),
      totalPrice: sum(cartInformation$.totalPrice)
        .mapWith(Number)
        .as("totalPrice"),
    })
    .from(cartInformation$)
    .groupBy((table) => [table.eventId])
    .as("totalParticipants$");

  const cartPaymentStatus$ = db
    .select({
      eventId: cartInformation$.eventId,
      paidCount:
        sql<number>`SUM(case when ${cartInformation$.paymentStatus} = ${ORDER_PAYMENT_STATUS.PAID} then 1 else 0 end)`.as(
          "paidCount",
        ),
      pendingCount:
        sql<number>`SUM(case when ${cartInformation$.paymentStatus} = ${ORDER_PAYMENT_STATUS.PENDING} then 1 else 0 end)`.as(
          "pendingCount",
        ),
    })
    .from(cartInformation$)
    .groupBy((table) => table.eventId)
    .as("cartPaymentStatus$");

  const [eventInfo] = await db
    .select({
      id: OrderEventTable.id,
      name: OrderEventTable.name,
      clerkId: OrderEventTable.clerkId,
      paymentStatus: OrderEventTable.paymentStatus,
      paymentAt: OrderEventTable.paymentAt,
      status: OrderEventTable.status,
      "statistics.totalParticipants": totalParticipants$.totalParticipants,
      "statistics.totalPrice": totalParticipants$.totalPrice,
      "statistics.paidParticipants": cartPaymentStatus$.paidCount,
      "statistics.pendingParticipants": cartPaymentStatus$.pendingCount,
    })
    .from(OrderEventTable)
    .leftJoin(
      totalParticipants$,
      eq(OrderEventTable.id, totalParticipants$.eventId),
    )
    .leftJoin(
      cartPaymentStatus$,
      eq(OrderEventTable.id, cartPaymentStatus$.eventId),
    )
    .where((table) => and(eq(table.id, eventId), eq(table.clerkId, userId)));

  return eventInfo
    ? unflatten<NonNullable<typeof eventInfo>, EventParticipantStatsReturn>(
        eventInfo,
      )
    : null;
};

type GetUsersInEventProps = {
  query?: PaginationParams;
  eventId: number;
};

export type UserCartInEvent = {
  id: number;
  clerkId: string;
  clerkName: Nullable<string>;
  clerkEmail: Nullable<string>;
  paymentStatus: OrderPaymentStatus;
  paymentAt: Nullable<Date>;
  paymentConfirmationAt: Nullable<Date>;
  item: Array<{
    id: number;
    name: string;
    description: Nullable<string>;
    price: number;
    amount: number;
  }>;
};

export const getUsersInEvent = async ({
  query,
  eventId,
}: GetUsersInEventProps) => {
  const { userId } = auth();
  assertAsNonNullish(userId);
  const { page, limit, keyword } = extractPaginationParams(query);

  const userWithCartInfo$ = db
    .select({
      cartId: OrderCartTable.id,
      eventId: OrderCartTable.eventId,
      clerkId: OrderCartTable.clerkId,
      clerkName: OrderCartTable.clerkName,
      clerkEmail: OrderCartTable.clerkEmail,
      productId: ProductTable.id,
      productName: ProductTable.name,
      productDescription: ProductTable.description,
      productPrice: ProductTable.price,
    })
    .from(OrderCartTable)
    .innerJoin(OrderItemTable, eq(OrderCartTable.id, OrderItemTable.cartId))
    .innerJoin(
      OrderEventProductTable,
      eq(OrderItemTable.orderEventProductId, OrderEventProductTable.id),
    )
    .innerJoin(
      ProductTable,
      eq(OrderEventProductTable.productId, ProductTable.id),
    )
    .where((table) => eq(table.eventId, eventId))
    .as("userWithCartInfo$");

  const userQuery$ = db
    .select({
      id: userWithCartInfo$.cartId,
      clerkId: OrderCartTable.clerkId,
      clerkName: OrderCartTable.clerkName,
      clerkEmail: OrderCartTable.clerkEmail,
      paymentStatus: OrderCartTable.paymentStatus,
      paymentAt: OrderCartTable.paymentAt,
      paymentConfirmationAt: OrderCartTable.paymentConfirmationAt,
      "item.id": ProductTable.id,
      "item.name": ProductTable.name,
      "item.description": ProductTable.description,
      "item.price": ProductTable.price,
      "item.amount": OrderItemTable.amount,
    })
    .from(userWithCartInfo$)
    .innerJoin(OrderCartTable, eq(OrderCartTable.id, userWithCartInfo$.cartId))
    .innerJoin(OrderItemTable, eq(OrderItemTable.cartId, OrderCartTable.id))
    .innerJoin(
      OrderEventProductTable,
      eq(OrderItemTable.orderEventProductId, OrderEventProductTable.id),
    )
    .innerJoin(
      ProductTable,
      eq(OrderEventProductTable.productId, ProductTable.id),
    )
    .where(() =>
      and(
        keyword
          ? or(
              like(userWithCartInfo$.clerkName, `%${keyword}%`),
              like(userWithCartInfo$.clerkEmail, `%${keyword}%`),
              like(userWithCartInfo$.productName, `%${keyword}%`),
              like(userWithCartInfo$.productDescription, `%${keyword}%`),
            )
          : undefined,
      ),
    )
    .$dynamic();

  const [{ total } = { total: 0 }] = await db
    .select({ total: count() })
    .from(userWithCartInfo$);

  const rawData = await userQuery$.limit(limit).offset((page - 1) * limit);
  const data = new Map<string, UserCartInEvent>();

  const needClerkInformation: string[] = [];

  rawData.forEach((row) => {
    const existData = data.get(row.clerkId);
    if (existData) {
      const isProductExist = existData.item.find(
        (item) => item.id === row["item.id"],
      );
      if (!isProductExist) {
        existData.item.push({
          id: row["item.id"],
          name: row["item.name"],
          description: row["item.description"],
          price: row["item.price"],
          amount: row["item.amount"],
        });
      }
    } else {
      data.set(row.clerkId, {
        id: row.id,
        clerkId: row.clerkId,
        clerkName: row.clerkName,
        clerkEmail: row.clerkEmail,
        paymentStatus: row.paymentStatus,
        paymentAt: row.paymentAt,
        paymentConfirmationAt: row.paymentConfirmationAt,
        item: [
          {
            id: row["item.id"],
            name: row["item.name"],
            description: row["item.description"],
            price: row["item.price"],
            amount: row["item.amount"],
          },
        ],
      });

      if (isNullish(row.clerkName) || isNullish(row.clerkEmail)) {
        needClerkInformation.push(row.clerkId);
      }
    }
  });

  if (needClerkInformation.length > 0) {
    const additionalClerkInformation = await clerkClient.users.getUserList({
      userId: needClerkInformation,
    });

    const updateCartInfo: Array<{
      cartId: number;
      clerkName: Nullable<string>;
      clerkEmail: Nullable<string>;
    }> = [];

    additionalClerkInformation.data.forEach((clerk) => {
      const cart = data.get(clerk.id);
      if (cart) {
        const { clerkName, clerkEmail } = getClerkPublicData(clerk);
        let hasUpdate = false;

        if (!isNullish(clerkName) && clerkName !== cart.clerkName) {
          cart.clerkName = clerkName;
          hasUpdate = true;
        }

        if (!isNullish(clerkEmail) && clerkEmail !== cart.clerkEmail) {
          cart.clerkEmail = clerkEmail;
          hasUpdate = true;
        }

        if (hasUpdate) {
          updateCartInfo.push({
            cartId: cart.id,
            clerkName,
            clerkEmail,
          });
        }
      }
    });

    if (updateCartInfo.length > 0) {
      await db.transaction(async (ctx) => {
        const updatePromise: Promise<ResultSet>[] = [];
        for (const { cartId, clerkName, clerkEmail } of updateCartInfo) {
          updatePromise.push(
            ctx
              .update(OrderCartTable)
              .set({
                clerkName,
                clerkEmail,
              })
              .where(eq(OrderCartTable.id, cartId)),
          );
        }

        await Promise.allSettled(updatePromise);
      });
    }
  }

  return {
    data: Array.from(data.values()),
    total,
  };
};
