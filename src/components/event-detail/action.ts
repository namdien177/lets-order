"use server";

import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import {
  ORDER_EVENT_STATUS,
  ORDER_EVENT_VALUES,
  type OrderEvent,
  OrderEvents,
  type OrderEventStatus,
  OrderGroups,
} from "@/server/db/schema";
import { and, eq, or } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { type EventBasicInfoSchema } from "@/components/event-detail/schema";
import { isAfter } from "date-fns";

export const deleteEvent = async (
  id: number,
): Promise<
  {
    message: string;
  } & (
    | {
        success: true;
        data: Pick<OrderEvent, "id" | "orderGroupId">;
      }
    | {
        success: false;
      }
  )
> => {
  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  const [availableEvent] = await db
    .select()
    .from(OrderGroups)
    .leftJoin(OrderEvents, eq(OrderEvents.orderGroupId, OrderGroups.id))
    .where(
      and(
        eq(OrderEvents.id, id),
        eq(OrderGroups.ownerClerkId, userId),
        or(
          eq(OrderEvents.status, ORDER_EVENT_STATUS.DRAFT),
          eq(OrderEvents.status, ORDER_EVENT_STATUS.CANCELLED),
        ),
      ),
    );

  if (!availableEvent?.order_events) {
    return {
      success: false,
      message: "Event not found",
    };
  }

  const [deleted] = await db
    .delete(OrderEvents)
    .where(eq(OrderEvents.id, id))
    .returning();

  if (!deleted) {
    return {
      success: false,
      message: "You cannot delete this event",
    };
  }

  return {
    success: true,
    message: "Event deleted",
    data: {
      id: deleted.id,
      orderGroupId: deleted.orderGroupId,
    },
  };
};

export const updateEventStatus = async (
  id: number,
  status: OrderEventStatus,
) => {
  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  const validateStatus = z.enum(ORDER_EVENT_VALUES).safeParse(status);

  if (!validateStatus.success) {
    return {
      success: false,
      message: "Invalid status",
    };
  }

  const event = await db.query.OrderEvents.findFirst({
    where: (table, { and, eq }) => and(eq(table.id, id)),
  });

  if (!event) {
    return {
      success: false,
      message: "Event not found",
    };
  }

  if (event.endingAt && isAfter(new Date(), new Date(event.endingAt))) {
    if (status === ORDER_EVENT_STATUS.ACTIVE) {
      return {
        success: false,
        message:
          "Event has ended, cannot set to active. You have to update the ending date first.",
      };
    }
  }

  const [updated] = await db
    .update(OrderEvents)
    .set({ status })
    .where(eq(OrderEvents.id, id))
    .returning();

  if (!updated) {
    return {
      success: false,
      message: "Failed to update event status",
    };
  }

  revalidatePath(
    `/g/${updated.orderGroupId}/(authorized)/event/detail/${updated.id}`,
  );

  return {
    success: true,
    data: {
      id: updated.id,
      status: updated.status,
    },
  };
};

export const updateEventInfo = async (payload: EventBasicInfoSchema) => {
  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  const [validOrderGroup] = await db
    .select()
    .from(OrderEvents)
    .leftJoin(OrderGroups, eq(OrderEvents.orderGroupId, OrderGroups.id))
    .where(
      and(
        eq(OrderEvents.id, payload.event_id),
        eq(OrderGroups.id, payload.id),
        eq(OrderGroups.ownerClerkId, userId),
      ),
    );

  if (!validOrderGroup?.order_events) {
    return {
      success: false,
      message: "Event not found",
    };
  }

  try {
    const result = await db
      .update(OrderEvents)
      .set({
        name: payload.name,
        endingAt: payload.endingAt,
      })
      .where(eq(OrderEvents.id, payload.event_id))
      .returning();

    revalidatePath(
      `/g/${payload.id}/(authorized)/event/detail/${payload.event_id}`,
    );

    return {
      success: true,
      data: {
        id: validOrderGroup.order_events.id,
        name: validOrderGroup.order_events.name,
        endingAt: validOrderGroup.order_events.endingAt,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      message: "Failed to update event info",
    };
  }
};
