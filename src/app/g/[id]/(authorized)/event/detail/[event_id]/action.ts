"use server";

import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import {
  ORDER_EVENT_VALUES,
  OrderEvents,
  type OrderEventStatus,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";

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
