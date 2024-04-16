"use server";

import { auth } from "@clerk/nextjs";
import { assertAsType } from "@/lib/types/helper";
import { db } from "@/server/db";
import { ORDER_PAYMENT_STATUS } from "@/server/db/constant";
import {
  BaseResponseType,
  type NotFoundErrorResponse,
  type ServerErrorResponse,
  type SuccessResponseData,
} from "@/lib/types/response.type";
import { type OrderCart, OrderCartTable } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type Props = {
  cartId: number;
};

export const markOrderAsPaid = async ({ cartId }: Props) => {
  const { userId } = auth();
  assertAsType<string>(userId);

  const findTheCart = await db.query.OrderCartTable.findFirst({
    where: (table, { and, isNull, eq }) =>
      and(
        eq(table.id, cartId),
        eq(table.clerkId, userId),
        eq(table.paymentStatus, ORDER_PAYMENT_STATUS.PENDING),
        isNull(table.paymentAt),
      ),
  });

  if (!findTheCart) {
    return {
      type: BaseResponseType.notFound,
      error: "Cart not found",
    } as NotFoundErrorResponse;
  }

  const updatedValue = await db.transaction(async (tx) => {
    const [result] = await tx
      .update(OrderCartTable)
      .set({
        paymentStatus: ORDER_PAYMENT_STATUS.PAID,
        paymentAt: new Date(),
      })
      .where(
        and(eq(OrderCartTable.id, cartId), eq(OrderCartTable.clerkId, userId)),
      )
      .returning();

    if (!result) {
      return null;
    }

    return result;
  });

  if (!updatedValue) {
    return {
      type: BaseResponseType.serverError,
      error: "Failed to update cart",
    } as ServerErrorResponse;
  }

  revalidatePath(`/order/show/${updatedValue.eventId}`);
  return {
    type: BaseResponseType.success,
    message: "Order has been marked as paid",
    data: {
      id: updatedValue.id,
    },
  } as SuccessResponseData<Pick<OrderCart, "id">>;
};
