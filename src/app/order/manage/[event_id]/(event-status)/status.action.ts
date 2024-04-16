"use server";

import {
  type EventStatusPayload,
  eventStatusSchema,
} from "@/app/order/manage/[event_id]/(event-status)/status.schema";
import {
  type AuthErrorResponse,
  BaseResponseType,
  type InvalidErrorResponse,
  type ServerErrorResponse,
  type SuccessResponseData,
} from "@/lib/types/response.type";
import { type ZodIssue } from "zod";
import { db } from "@/server/db";
import {
  OrderCartTable,
  OrderEventTable,
  OrderItemTable,
} from "@/server/db/schema";
import { auth } from "@clerk/nextjs";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  ORDER_EVENT_STATUS,
  type OrderEventStatus,
} from "@/server/db/constant";

export const updateEventToStatus = async (event: EventStatusPayload) => {
  const validatePayload = eventStatusSchema.safeParse(event);

  if (!validatePayload.success) {
    return {
      type: BaseResponseType.invalid,
      error: "Invalid payload",
      meta: validatePayload.error.errors,
    } as InvalidErrorResponse<ZodIssue[]>;
  }

  const { userId } = auth();
  if (!userId) {
    return {
      type: BaseResponseType.unAuthenticated,
      error: "Unauthenticated",
    } as AuthErrorResponse;
  }

  const { id, status: newStatus } = validatePayload.data;

  const needClearCarts = (
    [
      ORDER_EVENT_STATUS.CANCELLED,
      ORDER_EVENT_STATUS.DRAFT,
    ] as OrderEventStatus[]
  ).includes(newStatus);

  try {
    const updateSuccess = await db.transaction(async (tx) => {
      const updatedEvent = await tx
        .update(OrderEventTable)
        .set({
          eventStatus: newStatus,
        })
        .where(
          and(eq(OrderEventTable.id, id), eq(OrderEventTable.clerkId, userId)),
        );

      if (updatedEvent.rowsAffected === 0) {
        tx.rollback();
        return false;
      }

      if (!needClearCarts) {
        return true;
      }

      // clear carts
      const clearedCartIds = await tx
        .delete(OrderCartTable)
        .where(eq(OrderCartTable.eventId, id))
        .returning({
          id: OrderCartTable.id,
        });

      if (clearedCartIds.length === 0) {
        // no cart to clear
        // and no cart = no item
        return true;
      }

      // clear items
      const result = await tx.delete(OrderItemTable).where(
        inArray(
          OrderItemTable.cartId,
          clearedCartIds.map((cart) => cart.id),
        ),
      );

      if (result.rowsAffected === 0) {
        tx.rollback();
        return false;
      }
      return true;
    });

    if (!updateSuccess) {
      return {
        type: BaseResponseType.forbidden,
        error: "Event cannot be updated. Please try again later.",
      };
    }

    revalidatePath(`/order/manage/${id}`);
    return {
      type: BaseResponseType.success,
      message: "Event status updated successfully.",
    } as SuccessResponseData<undefined>;
  } catch (e) {
    return {
      type: BaseResponseType.serverError,
      error: "Server error occurred. Please try again later.",
    } as ServerErrorResponse;
  }
};
