"use server";

import { type OrderEventPayload } from "@/app/order/create/schema";
import { db } from "@/server/db";
import { EventProductTable, EventTable } from "@/server/db/schema";
import { generateRandomString } from "@/lib/utils";
import {
  BaseResponseType,
  type ServerErrorResponse,
  type SuccessResponseData,
} from "@/lib/types/response.type";

export const createOrderEvent = async (payload: OrderEventPayload) => {
  const createdOrder = await db.transaction(async (tx) => {
    const [orderEvent] = await tx
      .insert(EventTable)
      .values({
        code: generateRandomString(12),
        clerkId: payload.clerkId,
        name: payload.name,
        endingAt: payload.endingAt,
      })
      .returning();

    if (!orderEvent) {
      tx.rollback();
      console.log("[ROLLBACK] !orderEvent");
      return null;
    }

    const productsInEvent = await tx
      .insert(EventProductTable)
      .values(
        payload.items.map((item) => ({
          eventId: orderEvent.id,
          productId: item.id,
        })),
      )
      .returning();

    if (productsInEvent.length !== payload.items.length) {
      tx.rollback();
      console.log("[ROLLBACK] productsInEvent.length !== payload.items.length");
      return null;
    }

    return orderEvent;
  });

  if (!createdOrder) {
    return {
      type: BaseResponseType.serverError,
      error: "Failed to create order",
    } as ServerErrorResponse;
  }

  return {
    type: BaseResponseType.success,
    message: "Order created",
    data: {
      id: createdOrder.id,
    },
  } as SuccessResponseData<{ id: number }>;
};
