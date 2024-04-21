import { db } from "@/server/db";
import { and, count, eq, sql, sum } from "drizzle-orm";
import {
  OrderCartTable,
  OrderEventProductTable,
  OrderEventTable,
  OrderItemTable,
  ProductTable,
} from "@/server/db/schema";
import { auth } from "@clerk/nextjs";
import { assertAsNonNullish } from "@/lib/types/helper";
import { ORDER_PAYMENT_STATUS } from "@/server/db/constant";
import { unflatten } from "flat";

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
    .where((table) => eq(table.eventId, eventId))
    .groupBy((table) => table.cartId)
    .as("cartInformation$");

  const totalParticipants$ = db
    .select({
      eventId: cartInformation$.eventId,
      totalParticipants: count().as("totalParticipants"),
      totalPrice: sum(cartInformation$.totalPrice)
        .mapWith(Number)
        .as("totalPrice"),
    })
    .from(cartInformation$)
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
    .innerJoin(
      totalParticipants$,
      eq(OrderEventTable.id, totalParticipants$.eventId),
    )
    .innerJoin(
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
