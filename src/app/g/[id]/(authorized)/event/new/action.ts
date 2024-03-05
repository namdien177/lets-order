"use server";

import {
  type OrderEvent,
  type OrderEventInsert,
  OrderEvents,
} from "@/server/db/schema";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

type CreateEventResponse =
  | {
      success: true;
      data: OrderEvent;
    }
  | {
      success: false;
      message: string;
    };

export const createEvent = async (
  data: OrderEventInsert,
): Promise<CreateEventResponse> => {
  // ensure user has permission to create event
  const { userId } = auth();
  if (!userId) {
    return {
      success: false,
      message: "You must be logged in to create an event",
    };
  }
  const isOwner = await db.query.OrderGroups.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.ownerClerkId, userId), eq(table.id, data.orderGroupId)),
  });

  if (!isOwner) {
    return {
      success: false,
      message: "You do not have permission to create an event for this group",
    };
  }

  // create event
  const [event] = await db.insert(OrderEvents).values(data).returning();

  if (!event) {
    return {
      success: false,
      message: "Failed to create event",
    };
  }

  revalidatePath(`/g/${event.orderGroupId}/event`);

  return {
    success: true,
    data: event,
  };
};
