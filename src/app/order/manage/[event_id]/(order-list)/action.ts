"use server";

import {
  type AuthErrorResponse,
  BaseResponseType,
  type NotFoundErrorResponse,
  type ServerErrorResponse,
  type SuccessResponseData,
} from "@/lib/types/response.type";
import { auth } from "@clerk/nextjs";
import { db } from "@/server/db";
import { ORDER_EVENT_STATUS, ORDER_PAYMENT_STATUS } from "@/server/db/constant";
import { OrderEventTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const markEventPaid = async (eventId: number) => {
  const { userId } = auth();

  if (!userId) {
    return {
      type: BaseResponseType.unAuthenticated,
      error: "Unauthorized",
    } as AuthErrorResponse;
  }

  const orderEvent = await db.query.OrderEventTable.findFirst({
    where: (table, { eq, and }) =>
      and(
        eq(table.id, eventId),
        eq(table.clerkId, userId),
        eq(table.status, ORDER_EVENT_STATUS.COMPLETED),
        eq(table.paymentStatus, ORDER_PAYMENT_STATUS.PENDING),
      ),
  });

  if (!orderEvent) {
    return {
      type: BaseResponseType.notFound,
      error: "Order event not found",
    } as NotFoundErrorResponse;
  }

  const updateSuccess = await db.transaction(async (tx) => {
    const updatedResult = await tx
      .update(OrderEventTable)
      .set({
        paymentStatus: ORDER_PAYMENT_STATUS.PAID,
        paymentAt: new Date(),
      })
      .where(eq(OrderEventTable.id, eventId));
    return updatedResult.rowsAffected === 1;
  });

  if (!updateSuccess) {
    return {
      type: BaseResponseType.serverError,
      error: "Failed to update order event",
    } as ServerErrorResponse;
  }

  revalidatePath(`/order/manage/${eventId}`);
  return {
    type: BaseResponseType.success,
    message: "Order event marked as paid",
  } as SuccessResponseData;
};
