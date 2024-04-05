"use server";

import { type FormOrderEvent } from "./schema";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { isBefore } from "date-fns";
import { ORDER_EVENT_STATUS, OrderEventProducts } from "@/server/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";

export const upsertOrder = async ({
  groupId,
  userId,
  items,
  eventId,
}: FormOrderEvent) => {
  const { userId: clerkId } = auth();

  if (!userId || !clerkId) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (clerkId !== userId) {
    throw NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const eventInformation = await db.query.OrderEvents.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, eventId), eq(table.orderGroupId, groupId)),
    with: {
      orderGroup: true,
      receivedOrders: true,
    },
  });

  if (!eventInformation) {
    throw NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOrderOverdue = eventInformation.endingAt
    ? isBefore(new Date(), eventInformation.endingAt)
    : false;
  if (!isOrderOverdue) {
    throw NextResponse.json({ error: "Order is overdue" }, { status: 403 });
  }

  const isOrderInvalidStatus =
    eventInformation.status !== ORDER_EVENT_STATUS.ACTIVE;
  if (isOrderInvalidStatus) {
    throw NextResponse.json({ error: "Order is not active" }, { status: 403 });
  }

  const existingOrder = eventInformation.receivedOrders;

  const { toBeUpsert, toBeDeleted } = items.reduce(
    (acc, item) => {
      if (item.amount === 0) {
        if (existingOrder.find((i) => i.orderProductId === item.id)) {
          acc.toBeDeleted.push(item);
        }
      } else {
        acc.toBeUpsert.push(item);
      }
      return acc;
    },
    {
      toBeUpsert: [] as FormOrderEvent["items"],
      toBeDeleted: [] as FormOrderEvent["items"],
    },
  );

  if (toBeUpsert.length === 0 && toBeDeleted.length === 0) {
    return;
  }

  // start transaction
  await db.transaction(async (db) => {
    if (toBeUpsert.length > 0) {
      await db
        .insert(OrderEventProducts)
        .values(
          toBeUpsert.map((item) => ({
            orderEventId: eventId,
            orderProductId: item.id,
            clerkId,
            amount: item.amount,
          })),
        )
        .onConflictDoUpdate({
          set: {
            amount: sql.raw(`excluded.${OrderEventProducts.amount.name}`),
          },
          target: [
            OrderEventProducts.orderEventId,
            OrderEventProducts.orderProductId,
            OrderEventProducts.clerkId,
          ],
        });
    }

    if (toBeDeleted.length > 0) {
      await db.delete(OrderEventProducts).where(
        and(
          inArray(
            OrderEventProducts.orderProductId,
            toBeDeleted.map((item) => item.id),
          ),
          eq(OrderEventProducts.orderEventId, eventId),
          eq(OrderEventProducts.clerkId, clerkId),
        ),
      );
    }
  });

  // end transaction
};
