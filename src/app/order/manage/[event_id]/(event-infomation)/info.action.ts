"use server";

import {
  type EditEventInfoPayload,
  editEventInfoSchema,
} from "@/app/order/manage/[event_id]/(event-infomation)/info.schema";
import { auth } from "@clerk/nextjs/server";
import {
  type AuthErrorResponse,
  BaseResponseType,
  type InvalidErrorResponse,
  type NotFoundErrorResponse,
  type ServerErrorResponse,
  type SuccessResponseData,
} from "@/lib/types/response.type";
import { db } from "@/server/db";
import { EventTable } from "@/server/db/schema";
import { and, eq, ne, or } from "drizzle-orm";
import { ORDER_EVENT_STATUS } from "@/server/db/constant";
import { revalidatePath } from "next/cache";
import { type ZodIssue } from "zod";

export const updateOrderEventInfo = async (
  rawPayload: EditEventInfoPayload,
) => {
  const validatePayload = editEventInfoSchema.safeParse(rawPayload);

  if (!validatePayload.success) {
    return {
      type: BaseResponseType.invalid,
      error: "Invalid payload",
      meta: validatePayload.error.errors,
    } as InvalidErrorResponse<ZodIssue[]>;
  }
  const payload = validatePayload.data;

  const { userId } = auth();

  if (!userId) {
    return {
      type: BaseResponseType.unAuthenticated,
      error: "Unauthenticated",
    } as AuthErrorResponse;
  }

  try {
    const updatedEvent = await db
      .update(EventTable)
      .set({
        name: payload.name.trim(),
      })
      .where(
        and(
          eq(EventTable.id, payload.id),
          eq(EventTable.clerkId, userId),
          or(
            ne(EventTable.status, ORDER_EVENT_STATUS.COMPLETED),
            ne(EventTable.status, ORDER_EVENT_STATUS.LOCKED),
            ne(EventTable.status, ORDER_EVENT_STATUS.CANCELLED),
          ),
        ),
      );

    if (updatedEvent.rowsAffected === 0) {
      return {
        type: BaseResponseType.notFound,
        error: "Event not found",
      } as NotFoundErrorResponse;
    }
    revalidatePath(`/order/manage/${payload.id}`);
    return {
      type: BaseResponseType.success,
      data: payload,
      message: "Event info updated successfully",
    } as SuccessResponseData<EditEventInfoPayload>;
  } catch (error) {
    return {
      type: BaseResponseType.serverError,
      error: "Failed to update event info. Please try again later.",
    } as ServerErrorResponse;
  }
};
