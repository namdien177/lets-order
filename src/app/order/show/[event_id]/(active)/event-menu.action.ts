"use server";

import { type CreateCartPayload } from "@/app/order/show/[event_id]/schema";
import { auth } from "@clerk/nextjs";
import {
  type AuthErrorResponse,
  BaseResponseType,
  type InvalidErrorResponse,
  type NotFoundErrorResponse,
  type ServerErrorResponse,
  type SuccessResponseData,
} from "@/lib/types/response.type";
import { db } from "@/server/db";
import {
  type OrderCart,
  OrderCartTable,
  type OrderEvent,
  OrderEventProductTable,
  type OrderItem,
  OrderItemTable,
  ProductTable,
} from "@/server/db/schema";
import { and, asc, eq, inArray, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isNullish } from "@/lib/utils";

const createCart = async (clerkId: string, orderPayload: CreateCartPayload) => {
  const cart = await db.transaction(async (ctx) => {
    const [inserted] = await ctx
      .insert(OrderCartTable)
      .values({
        eventId: orderPayload.eventId,
        clerkId,
      })
      .returning();

    if (!inserted) {
      ctx.rollback();
      return null;
    }
    return inserted;
  });

  if (!cart) {
    throw {
      type: BaseResponseType.serverError,
      error: "Failed to create cart",
    } as ServerErrorResponse;
  }

  // ensure items are valid
  const items = await db.query.OrderEventProductTable.findMany({
    where: (table, { and, eq, inArray }) =>
      and(
        eq(table.eventId, orderPayload.eventId),
        inArray(
          table.productId,
          orderPayload.items.map((item) => item.id),
        ),
      ),
  });

  if (items.length !== orderPayload.items.length) {
    throw {
      type: BaseResponseType.invalid,
      error: "Some items are not valid, try to refresh the page and try again",
    } as InvalidErrorResponse;
  }

  // insert items
  const insertItems = await db.transaction(async (ctx) => {
    const result = await ctx
      .insert(OrderItemTable)
      .values(
        items.map((item) => ({
          cartId: cart.id,
          orderEventProductId: item.id,
          amount: 1,
        })),
      )
      .returning();

    if (result.length !== items.length) {
      ctx.rollback();
      return null;
    }
    return result;
  });

  if (!insertItems) {
    throw {
      type: BaseResponseType.serverError,
      error: "Failed to insert items",
    } as ServerErrorResponse;
  }

  return cart;
};

const deleteCart = async (cartId: number) => {
  return db.transaction(async (ctx) => {
    await ctx.delete(OrderItemTable).where(eq(OrderItemTable.cartId, cartId));

    const result = await ctx
      .delete(OrderCartTable)
      .where(eq(OrderCartTable.id, cartId));

    if (result.rowsAffected !== 1) {
      ctx.rollback();
      return false;
    }

    return true;
  });
};

const upsertCart = async (
  cartDataId: number,
  cartItems: OrderItem[],
  orderPayload: CreateCartPayload,
) => {
  const toDeleteItems: Pick<OrderItem, "orderEventProductId">[] = [];
  const toUpdateItems: Pick<OrderItem, "orderEventProductId" | "amount">[] = [];
  const toInsertItems: Pick<OrderItem, "orderEventProductId" | "amount">[] = [
    ...orderPayload.items.map((item) => ({
      orderEventProductId: item.eventProductId,
      amount: 1,
    })),
  ];

  cartItems.forEach((existItem) => {
    const foundIndex = orderPayload.items.findIndex(
      (inPayload) => inPayload.eventProductId === existItem.orderEventProductId,
    );
    const fromPayload = orderPayload.items[foundIndex];

    if (foundIndex === -1) {
      toDeleteItems.push(existItem);
    } else {
      // since we are mocking the value of amount to 1, therefore
      // we don't need to update the amount -> no action here;

      // updateItems.push(existItem);
      // remove from insertItems
      toInsertItems.splice(foundIndex, 1);
    }
  });

  // transaction upsert
  return db.transaction(async (ctx) => {
    if (toDeleteItems.length > 0) {
      const deleted = await ctx.delete(OrderItemTable).where(
        and(
          eq(OrderItemTable.cartId, cartDataId),
          inArray(
            OrderItemTable.orderEventProductId,
            toDeleteItems.map((item) => item.orderEventProductId),
          ),
        ),
      );

      if (deleted.rowsAffected !== toDeleteItems.length) {
        ctx.rollback();
        return false;
      }
    }

    if (toInsertItems.length > 0) {
      const insertedResult = await ctx.insert(OrderItemTable).values(
        toInsertItems.map((item) => ({
          cartId: cartDataId,
          orderEventProductId: item.orderEventProductId,
          // TODO: update amount in next feature release
          amount: item.amount,
        })),
      );

      if (insertedResult.rowsAffected !== toInsertItems.length) {
        ctx.rollback();
        return false;
      }
    }
    return true;
  });
};

export const PlacingOrderAction = async (orderPayload: CreateCartPayload) => {
  const { userId } = auth();

  if (!userId) {
    return {
      type: BaseResponseType.unAuthenticated,
      error: "User is not authenticated",
    } as AuthErrorResponse;
  }

  const existingCartId = orderPayload.cartId;

  if (isNullish(existingCartId)) {
    if (orderPayload.items.length === 0) {
      return {
        type: BaseResponseType.invalid,
        error: "Cart must have at least one item",
      } as InvalidErrorResponse;
    }

    try {
      const data = await createCart(userId, orderPayload);
      revalidatePath(`/order/show/${orderPayload.eventId}`);
      return {
        type: BaseResponseType.success,
        data,
        message: "Cart created successfully",
      } as SuccessResponseData<OrderCart>;
    } catch (e) {
      return e as ServerErrorResponse;
    }
  }

  const cartData = await db.query.OrderCartTable.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, existingCartId), eq(table.clerkId, userId)),
    with: {
      itemsInCart: {
        with: {
          registeredProduct: {
            with: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!cartData) {
    return {
      type: BaseResponseType.notFound,
      error: "Cart not found",
    } as NotFoundErrorResponse;
  }

  if (orderPayload.items.length === 0) {
    // remove the placing order
    const removed = await deleteCart(cartData.id);

    if (!removed) {
      return {
        type: BaseResponseType.serverError,
        error: "Failed to remove cart",
      } as ServerErrorResponse;
    }

    revalidatePath(`/order/show/${orderPayload.eventId}`);
    return {
      type: BaseResponseType.success,
      data: null,
      message: "Cart removed successfully",
    } as SuccessResponseData<null>;
  }

  const isUpsertSuccess = await upsertCart(
    cartData.id,
    cartData.itemsInCart,
    orderPayload,
  );

  if (!isUpsertSuccess) {
    return {
      type: BaseResponseType.serverError,
      error: "Failed to update cart",
    } as ServerErrorResponse;
  }
  revalidatePath(`/order/show/${orderPayload.eventId}`);
  return {
    type: BaseResponseType.success,
    data: null,
    message: "Cart updated successfully",
  } as SuccessResponseData<null>;
};

export const getAllProductsInEvent = async (
  event: Pick<OrderEvent, "id">,
  keyword = "",
) => {
  return db
    .select({
      id: ProductTable.id,
      eventProductId: OrderEventProductTable.id,
      name: ProductTable.name,
      description: ProductTable.description,
      price: ProductTable.price,
      createdAt: ProductTable.createdAt,
    })
    .from(OrderEventProductTable)
    .innerJoin(
      ProductTable,
      eq(OrderEventProductTable.productId, ProductTable.id),
    )
    .where(
      and(
        eq(OrderEventProductTable.eventId, event.id),
        keyword.trim().length >= 3
          ? like(ProductTable.name, `%${keyword.toLowerCase().trim()}%`)
          : undefined,
      ),
    )
    .orderBy(asc(OrderEventProductTable.createdAt));
};
