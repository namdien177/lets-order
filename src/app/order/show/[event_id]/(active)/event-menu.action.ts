"use server";

import { type CreateCartPayload } from "@/app/order/show/[event_id]/schema";
import { currentUser } from "@clerk/nextjs/server";
import {
  BaseResponseType,
  type InvalidErrorResponse,
  type NotFoundErrorResponse,
  type ServerErrorResponse,
  type SuccessResponseData,
} from "@/lib/types/response.type";
import { db } from "@/server/db";
import {
  type Cart,
  CartTable,
  type Event,
  EventProductTable,
  type CartItem,
  CartItemTable,
  ProductTable,
} from "@/server/db/schema";
import { and, asc, eq, inArray, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getClerkPublicData, isNullish } from "@/lib/utils";
import { assertAsNonNullish } from "@/lib/types/helper";
import { type User } from "@clerk/backend";

const createCart = async (clerkUser: User, orderPayload: CreateCartPayload) => {
  const { clerkName, clerkEmail } = getClerkPublicData(clerkUser);

  const cart = await db.transaction(async (ctx) => {
    const [inserted] = await ctx
      .insert(CartTable)
      .values({
        eventId: orderPayload.eventId,
        clerkId: clerkUser.id,
        clerkName,
        clerkEmail,
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
  const items = await db.query.EventProductTable.findMany({
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
      .insert(CartItemTable)
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
    await ctx.delete(CartItemTable).where(eq(CartItemTable.cartId, cartId));

    const result = await ctx.delete(CartTable).where(eq(CartTable.id, cartId));

    if (result.rowsAffected !== 1) {
      ctx.rollback();
      return false;
    }

    return true;
  });
};

const upsertCart = async (
  cartDataId: number,
  cartItems: CartItem[],
  orderPayload: CreateCartPayload,
) => {
  const toDeleteItems: Pick<CartItem, "orderEventProductId">[] = [];
  const toUpdateItems: Pick<CartItem, "orderEventProductId" | "amount">[] = [];
  const toInsertItems: Pick<CartItem, "orderEventProductId" | "amount">[] = [
    ...orderPayload.items.map((item) => ({
      orderEventProductId: item.eventProductId,
      amount: 1,
    })),
  ];

  cartItems.forEach((existItem) => {
    const foundIndex = toInsertItems.findIndex(
      (inPayload) =>
        inPayload.orderEventProductId === existItem.orderEventProductId,
    );

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
      const deleted = await ctx.delete(CartItemTable).where(
        and(
          eq(CartItemTable.cartId, cartDataId),
          inArray(
            CartItemTable.orderEventProductId,
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
      const insertedResult = await ctx.insert(CartItemTable).values(
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
  const user = await currentUser();
  assertAsNonNullish(user);

  const existingCartId = orderPayload.cartId;

  if (isNullish(existingCartId)) {
    if (orderPayload.items.length === 0) {
      return {
        type: BaseResponseType.invalid,
        error: "Cart must have at least one item",
      } as InvalidErrorResponse;
    }

    try {
      const data = await createCart(user, orderPayload);
      revalidatePath(`/order/show/${orderPayload.eventId}`);
      return {
        type: BaseResponseType.success,
        data,
        message: "Cart created successfully",
      } as SuccessResponseData<Cart>;
    } catch (e) {
      console.error(e);
      return {
        type: BaseResponseType.serverError,
        error: "Failed to create cart",
      } as ServerErrorResponse;
    }
  }

  const cartData = await db.query.CartTable.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, existingCartId), eq(table.clerkId, user.id)),
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
  event: Pick<Event, "id">,
  keyword = "",
) => {
  return db
    .select({
      id: ProductTable.id,
      eventProductId: EventProductTable.id,
      name: ProductTable.name,
      description: ProductTable.description,
      price: ProductTable.price,
      createdAt: ProductTable.createdAt,
    })
    .from(EventProductTable)
    .innerJoin(ProductTable, eq(EventProductTable.productId, ProductTable.id))
    .where(
      and(
        eq(EventProductTable.eventId, event.id),
        keyword.trim().length >= 3
          ? like(ProductTable.name, `%${keyword.toLowerCase().trim()}%`)
          : undefined,
      ),
    )
    .orderBy(asc(EventProductTable.createdAt));
};
