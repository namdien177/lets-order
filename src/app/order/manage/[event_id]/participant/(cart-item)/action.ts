"use server";

import { auth } from "@clerk/nextjs/server";
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
import { type Cart, CartTable, EventTable } from "@/server/db/schema";
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
      id: CartTable.id,
      eventId: CartTable.eventId,
      eventStatus: EventTable.status,
      eventPaymentStatus: EventTable.paymentStatus,
      paymentStatus: CartTable.paymentStatus,
    })
    .from(CartTable)
    .innerJoin(EventTable, eq(CartTable.eventId, EventTable.id))
    .where(
      and(
        eq(CartTable.id, cartId),
        // must be the owner to mark the payment complete
        eq(EventTable.clerkId, userId),
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
        .update(CartTable)
        .set({
          paymentStatus: ORDER_PAYMENT_STATUS.PAID,
          paymentAt: new Date(),
          paymentConfirmationAt: new Date(),
        })
        .where(
          and(
            eq(CartTable.id, cartId),
            eq(CartTable.eventId, userCart.eventId),
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
    } as SuccessResponseData<Cart>;
  }

  const updatedCart = await db.transaction(async (tx) => {
    const [updatedCustomerCartPayment] = await tx
      .update(CartTable)
      .set({
        paymentConfirmationAt: new Date(),
      })
      .where(
        and(eq(CartTable.id, cartId), eq(CartTable.eventId, userCart.eventId)),
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
  } as SuccessResponseData<Cart>;
};
