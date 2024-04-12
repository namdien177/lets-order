"use server";

import { type OrderEventPayload } from "@/app/order/create/schema";
import { db } from "@/server/db";
import { OrderEventProductTable, OrderEventTable } from "@/server/db/schema";
import { generateRandomString } from "@/lib/utils";
import { redirect } from "next/navigation";

export const createOrderEvent = async (payload: OrderEventPayload) => {
  const createdOrder = await db.transaction(async (tx) => {
    const [orderEvent] = await tx
      .insert(OrderEventTable)
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
      .insert(OrderEventProductTable)
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
    const params = new URLSearchParams();
    params.append("error", "Failed to create order");
    return redirect(`/order/create?${params.toString()}`);
  }

  return redirect(`/order`);
};
