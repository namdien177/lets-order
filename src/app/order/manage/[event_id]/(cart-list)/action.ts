"use server";

import { auth } from "@clerk/nextjs";
import { assertAsType } from "@/lib/types/helper";
import { db } from "@/server/db";
import {
  BaseResponseType,
  type InvalidErrorResponse,
  type NotFoundErrorResponse,
  type ServerErrorResponse,
  type SuccessResponseData,
} from "@/lib/types/response.type";
import { ORDER_PAYMENT_STATUS } from "@/server/db/constant";
import {
  type OrderCart,
  OrderCartTable,
  OrderEventTable,
} from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type MarkUserCartPaidProps = {
  cartId: number;
  force?: boolean;
};

export const markUserCartCompletePayment = async ({
  cartId,
  force,
}: MarkUserCartPaidProps) => {
  const { userId } = auth();
  assertAsType<string>(userId);

  const [userCart] = await db
    .select({
      id: OrderCartTable.id,
      eventId: OrderCartTable.eventId,
      eventStatus: OrderEventTable.eventStatus,
      eventPaymentStatus: OrderEventTable.paymentStatus,
      paymentStatus: OrderCartTable.paymentStatus,
    })
    .from(OrderCartTable)
    .innerJoin(OrderEventTable, eq(OrderCartTable.eventId, OrderEventTable.id))
    .where(
      and(
        eq(OrderCartTable.id, cartId),
        // must be the owner to mark the payment complete
        eq(OrderEventTable.clerkId, userId),
      ),
    );

  if (!userCart) {
    return {
      type: BaseResponseType.notFound,
      error: "Cart not found",
    } as NotFoundErrorResponse;
  }

  const cartWasNotPaid = userCart.paymentStatus !== ORDER_PAYMENT_STATUS.PAID;

  if (cartWasNotPaid && !force) {
    return {
      type: BaseResponseType.invalid,
      error: "Cart was not paid",
    } as InvalidErrorResponse;
  }

  if (cartWasNotPaid && force) {
    const updatedCart = await db.transaction(async (tx) => {
      const [updatedCustomerCartPayment] = await tx
        .update(OrderCartTable)
        .set({
          paymentStatus: ORDER_PAYMENT_STATUS.PAID,
          paymentAt: new Date(),
          paymentConfirmationAt: new Date(),
        })
        .where(
          and(
            eq(OrderCartTable.id, cartId),
            eq(OrderCartTable.eventId, userCart.eventId),
          ),
        )
        .returning();

      if (!updatedCustomerCartPayment) {
        tx.rollback();
        return null;
      }

      return updatedCustomerCartPayment;
    });

    if (!updatedCart) {
      return {
        type: BaseResponseType.serverError,
        error: "Failed to update cart",
      } as ServerErrorResponse;
    }

    revalidatePath(`/order/manage/${userCart.eventId}`);
    return {
      type: BaseResponseType.success,
      data: updatedCart,
      message: "Cart payment marked as paid",
    } as SuccessResponseData<OrderCart>;
  }

  const updatedCart = await db.transaction(async (tx) => {
    const [updatedCustomerCartPayment] = await tx
      .update(OrderCartTable)
      .set({
        paymentConfirmationAt: new Date(),
      })
      .where(
        and(
          eq(OrderCartTable.id, cartId),
          eq(OrderCartTable.eventId, userCart.eventId),
        ),
      )
      .returning();

    if (!updatedCustomerCartPayment) {
      tx.rollback();
      return null;
    }

    return updatedCustomerCartPayment;
  });

  if (!updatedCart) {
    return {
      type: BaseResponseType.serverError,
      error: "Failed to update cart",
    } as ServerErrorResponse;
  }

  revalidatePath(`/order/manage/${userCart.eventId}`);
  return {
    type: BaseResponseType.success,
    data: updatedCart,
    message: "Cart payment marked as paid",
  } as SuccessResponseData<OrderCart>;
};
