"use server";

import { type OrderEventPayload } from "@/app/order/create/schema";
import { auth } from "@clerk/nextjs";
import { db } from "@/server/db";
import {
  type OrderEvent,
  OrderEventProductTable,
  OrderEventTable,
  ProductTable,
} from "@/server/db/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";
import {
  type AuthErrorResponse,
  BaseResponseType,
  type InvalidResponse,
  type ServerErrorResponse,
  type SuccessResponseData,
} from "@/lib/types/response.type";
import { ORDER_EVENT_STATUS } from "@/server/db/constant";

export const createOrderEvent = async (payload: OrderEventPayload) => {
  const { userId } = auth();

  if (!userId) {
    return {
      type: BaseResponseType.unAuthenticated,
      error: "You must be logged in to create an order event",
    } as AuthErrorResponse;
  }

  if (payload.clerkId !== userId) {
    return {
      type: BaseResponseType.unAuthorized,
      error: "You can only create an order event for yourself",
    } as AuthErrorResponse;
  }

  const activeOrderEvent = await db.query.OrderEventTable.findFirst({
    where: (table, { and, eq }) =>
      and(
        eq(table.clerkId, userId),
        eq(table.eventStatus, ORDER_EVENT_STATUS.ACTIVE),
      ),
  });
  if (activeOrderEvent) {
    return {
      type: BaseResponseType.invalid,
      error: "You already have an active order event",
      meta: {
        activeEvent: {
          id: activeOrderEvent.id,
          name: activeOrderEvent.name,
        },
      },
    } as InvalidResponse<{ activeEvent: Pick<OrderEvent, "id" | "name"> }>;
  }

  // ensure the list of items is valid
  const itemInformation = await db
    .select()
    .from(ProductTable)
    .where(
      and(
        inArray(ProductTable.id, payload.items),
        isNull(ProductTable.deletedAt),
        eq(ProductTable.clerkId, userId),
      ),
    );

  if (
    payload.items.length > 0 &&
    itemInformation.length !== payload.items.length
  ) {
    // get invalid item ids
    const invalidItems = payload.items.filter(
      (itemId) => !itemInformation.some((item) => item.id === itemId),
    );
    return {
      type: BaseResponseType.invalid,
      error: "Some items are invalid",
      meta: { invalidItems },
    } as InvalidResponse<{ invalidItems: number[] }>;
  }

  const orderEvent = await db.transaction(async (tx) => {
    // create the order event
    const [createdEvent] = await tx
      .insert(OrderEventTable)
      .values({
        ...payload,
      })
      .returning();
    if (!createdEvent) {
      tx.rollback();
      return null;
    }

    // create associated order event products
    const insertedProducts = await tx
      .insert(OrderEventProductTable)
      .values(
        payload.items.map((itemId) => ({
          eventId: createdEvent.id,
          productId: itemId,
        })),
      )
      .returning();

    if (
      insertedProducts.length === 0 ||
      insertedProducts.length !== payload.items.length
    ) {
      tx.rollback();
      return null;
    }

    return createdEvent;
  });

  if (!orderEvent) {
    return {
      type: BaseResponseType.serverError,
      error: "Failed to create order event",
    } as ServerErrorResponse;
  }

  return {
    type: BaseResponseType.success,
    data: orderEvent,
  } as SuccessResponseData<OrderEvent>;
};
