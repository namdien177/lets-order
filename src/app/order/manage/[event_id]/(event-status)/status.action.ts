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
import { db } from "@/server/db";
import { CartTable, EventTable, CartItemTable } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ORDER_EVENT_STATUS } from "@/server/db/constant";

export const updateEventToStatus = async (event: EventStatusPayload) => {
  const validatePayload = eventStatusSchema.safeParse(event);

  if (!validatePayload.success) {
    return {
      type: BaseResponseType.invalid,
      error: "Invalid payload",
    } as InvalidErrorResponse;
  }

  const { userId } = auth();
  if (!userId) {
    return {
      type: BaseResponseType.unAuthenticated,
      error: "Unauthenticated",
    } as AuthErrorResponse;
  }

  const { id, status: newStatus } = validatePayload.data;

  const needClearCarts = newStatus <= ORDER_EVENT_STATUS.DRAFT;

  try {
    const updateSuccess = await db.transaction(async (tx) => {
      const updatedEvent = await tx
        .update(EventTable)
        .set({
          status: newStatus,
        })
        .where(and(eq(EventTable.id, id), eq(EventTable.clerkId, userId)));

      if (updatedEvent.rowsAffected === 0) {
        tx.rollback();
        return false;
      }

      if (!needClearCarts) {
        return true;
      }

      // clear carts
      const clearedCartIds = await tx
        .delete(CartTable)
        .where(eq(CartTable.eventId, id))
        .returning({
          id: CartTable.id,
        });

      if (clearedCartIds.length === 0) {
        // no cart to clear
        // and no cart = no item
        return true;
      }

      // clear items
      const result = await tx.delete(CartItemTable).where(
        inArray(
          CartItemTable.cartId,
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
      data: {
        id: id,
      },
    } as SuccessResponseData<{ id: number }>;
  } catch (e) {
    return {
      type: BaseResponseType.serverError,
      error: "Server error occurred. Please try again later.",
    } as ServerErrorResponse;
  }
};
