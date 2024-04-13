"use server";

import {
  type EventStatusPayload,
  eventStatusSchema,
} from "@/app/order/manage/[event_id]/(event-status)/status.schema";
import {
  type AuthErrorResponse,
  BaseResponseType,
  type InvalidResponse,
  type NotFoundErrorResponse,
  type ServerErrorResponse,
  type SuccessResponseData,
} from "@/lib/types/response.type";
import { type ZodIssue } from "zod";
import { db } from "@/server/db";
import { OrderEventTable } from "@/server/db/schema";
import { auth } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const updateEventToStatus = async (event: EventStatusPayload) => {
  const validatePayload = eventStatusSchema.safeParse(event);

  if (!validatePayload.success) {
    return {
      type: BaseResponseType.invalid,
      error: "Invalid payload",
      meta: validatePayload.error.errors,
    } as InvalidResponse<ZodIssue[]>;
  }

  const { userId } = auth();
  if (!userId) {
    return {
      type: BaseResponseType.unAuthenticated,
      error: "Unauthenticated",
    } as AuthErrorResponse;
  }

  const { id, status: newStatus } = validatePayload.data;

  try {
    const updatedEvent = await db
      .update(OrderEventTable)
      .set({
        eventStatus: newStatus,
      })
      .where(
        and(eq(OrderEventTable.id, id), eq(OrderEventTable.clerkId, userId)),
      );

    if (updatedEvent.rowsAffected === 0) {
      return {
        type: BaseResponseType.notFound,
        error: "Event not found",
      } as NotFoundErrorResponse;
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
