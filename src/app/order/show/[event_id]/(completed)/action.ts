"use server";

import { auth } from "@clerk/nextjs/server";
import { assertAsType } from "@/lib/types/helper";
import { db } from "@/server/db";
import { ORDER_PAYMENT_STATUS } from "@/server/db/constant";
import {
  BaseResponseType,
  type NotFoundErrorResponse,
  type ServerErrorResponse,
  type SuccessResponseData,
} from "@/lib/types/response.type";
import { type Cart, CartTable } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type Props = {
  cartId: number;
};

export const markOrderAsPaid = async ({ cartId }: Props) => {
  const { userId } = auth();
  assertAsType<string>(userId);

  const findTheCart = await db.query.CartTable.findFirst({
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
      .update(CartTable)
      .set({
        paymentStatus: ORDER_PAYMENT_STATUS.PAID,
        paymentAt: new Date(),
      })
      .where(and(eq(CartTable.id, cartId), eq(CartTable.clerkId, userId)))
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
  } as SuccessResponseData<Pick<Cart, "id">>;
};
