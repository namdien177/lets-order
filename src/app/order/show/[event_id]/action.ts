"use server";
import { type CreateCartPayload } from "@/app/order/show/[event_id]/schema";
import { auth } from "@clerk/nextjs";
import {
  type AuthErrorResponse,
  BaseResponseType,
  type InvalidResponse,
  type SuccessResponseData,
} from "@/lib/types/response.type";
import { db } from "@/server/db";
import { OrderCartTable, OrderItemTable } from "@/server/db/schema";
import { ORDER_EVENT_STATUS } from "@/server/db/constant";
import { type Nullish } from "@/lib/types/helper";
import { and, eq, inArray } from "drizzle-orm";

async function queryProductInfo(orderItem: Nullish<CreateCartPayload["item"]>) {
  if (!orderItem) {
    return [];
  }

  return db.query.OrderEventProductTable.findMany({
    where: (table, { inArray }) =>
      inArray(table.id, [orderItem.eventProductId]),
  });
}

export const upsertOrder = async (payload: CreateCartPayload) => {
  const { userId } = auth();

  if (!userId) {
    return {
      type: BaseResponseType.unAuthenticated,
      error: "User not authenticated",
    } as AuthErrorResponse;
  }

  const eventInfo = await db.query.OrderEventTable.findFirst({
    where: (table, { eq, and, isNull }) =>
      and(
        eq(table.id, payload.eventId),
        isNull(table.endingAt),
        eq(table.eventStatus, ORDER_EVENT_STATUS.ACTIVE),
      ),
  });

  if (!eventInfo) {
    return {
      type: BaseResponseType.notFound,
      error: "Event not found",
    };
  }

  const findExistingCart = await db.query.OrderCartTable.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.clerkId, userId), eq(table.eventId, payload.eventId)),
    with: {
      itemsInCart: true,
    },
  });

  const newOrderingItems = payload.item;
  const ensureProductExists = await queryProductInfo(newOrderingItems);

  if (!findExistingCart) {
    // TODO: fixed product length = 1
    if (!newOrderingItems || ensureProductExists.length !== 1) {
      return {
        type: BaseResponseType.notFound,
        error: "Product not found",
      };
    }

    // create cart and order item
    const cartData = await db.transaction(async (transaction) => {
      const [inserted] = await transaction
        .insert(OrderCartTable)
        .values({
          eventId: payload.eventId,
          clerkId: userId,
        })
        .returning();

      if (!inserted) {
        transaction.rollback();
        return null;
      }

      // insert items
      const items = await transaction
        .insert(OrderItemTable)
        .values({
          cartId: inserted.id,
          orderEventProductId: newOrderingItems.eventProductId,
          amount: 1, // TODO: temporary fixed 1
        })
        .returning();

      if (!items || items.length !== ensureProductExists.length) {
        transaction.rollback();
        return null;
      }

      return inserted;
    });

    if (!cartData) {
      return {
        type: BaseResponseType.serverError,
        error: "Failed to create cart",
      };
    }

    return {
      type: BaseResponseType.success,
      data: {
        id: cartData.id,
      },
    };
  }

  if (!newOrderingItems) {
    // remove all ordered item and cart
    const removedStatus = await db.transaction(async (transaction) => {
      await transaction
        .delete(OrderItemTable)
        .where(eq(OrderItemTable.cartId, findExistingCart.id));
      await transaction
        .delete(OrderCartTable)
        .where(eq(OrderCartTable.id, findExistingCart.id));
      return true;
    });

    if (!removedStatus) {
      return {
        type: BaseResponseType.serverError,
        error: "Failed to remove cart",
      };
    }
    return {
      type: BaseResponseType.success,
      data: {
        id: findExistingCart.id,
      },
      message: "You have removed your order in this event",
    } as SuccessResponseData<{ id: number }>;
  }

  // TODO: fixed product length = 1
  if (ensureProductExists.length !== 1) {
    return {
      type: BaseResponseType.notFound,
      error: "Product not found",
    };
  }

  // find existing items
  const orderedItems = await db.query.OrderItemTable.findMany({
    where: (table, { eq }) => eq(table.cartId, findExistingCart.id),
  });

  if (!orderedItems || orderedItems.length === 0) {
    // insert order items
    const insertedStatus = await db.transaction(async (transaction) => {
      const items = await transaction
        .insert(OrderItemTable)
        .values({
          cartId: findExistingCart.id,
          orderEventProductId: newOrderingItems.eventProductId,
          amount: 1, // TODO: temporary fixed 1
        })
        .returning();

      if (!items || items.length !== 1) {
        transaction.rollback();
        return false;
      }

      return true;
    });

    if (!insertedStatus) {
      return {
        type: BaseResponseType.serverError,
        error: "Failed to insert items",
      };
    }

    return {
      type: BaseResponseType.success,
      data: {
        id: findExistingCart.id,
      },
    };
  }

  // upsert order items
  const itemsInCartToBeDeleted = orderedItems.filter(
    (item) => item.orderEventProductId !== newOrderingItems.eventProductId,
  );
  const itemsInCartToBeInserted = [newOrderingItems].filter(
    (newItem) =>
      !orderedItems.find(
        (item) => item.orderEventProductId === newItem.eventProductId,
      ),
  );

  const updateTransaction = await db.transaction(async (transaction) => {
    const deletedItems = await transaction.delete(OrderItemTable).where(
      and(
        eq(OrderItemTable.cartId, findExistingCart.id),
        inArray(
          OrderItemTable.orderEventProductId,
          itemsInCartToBeDeleted.map((item) => item.orderEventProductId),
        ),
      ),
    );

    if (deletedItems.rows.length !== itemsInCartToBeDeleted.length) {
      transaction.rollback();
      return false;
    }

    const insertedItems = await transaction
      .insert(OrderItemTable)
      .values(
        itemsInCartToBeInserted.map((item) => ({
          cartId: findExistingCart.id,
          orderEventProductId: item.eventProductId,
          amount: 1, // TODO: temporary fixed 1
        })),
      )
      .returning();
    if (insertedItems.length !== itemsInCartToBeInserted.length) {
      transaction.rollback();
      return false;
    }

    return true;
  });

  if (!updateTransaction) {
    return {
      type: BaseResponseType.serverError,
      error: "Failed to update items",
    };
  }

  return {
    type: BaseResponseType.success,
    data: {
      id: findExistingCart.id,
    },
    message: "Order updated",
  } as SuccessResponseData<{ id: number }>;
};

const upsertItemsInCart = async (payload: CreateCartPayload) => {
  const { userId } = auth();

  if (!userId) {
    return {
      type: BaseResponseType.unAuthenticated,
      error: "User not authenticated",
    } as AuthErrorResponse;
  }
  const cartId = payload.cartId;
  const newOrderItems = payload.item ? [payload.item] : [];
  if (!cartId) {
    return {
      type: BaseResponseType.invalid,
      error: "Invalid cart id",
      meta: payload,
    } as InvalidResponse<CreateCartPayload>;
  }

  const cartInfo = await db.query.OrderCartTable.findFirst({
    where: (table, { eq, and }) =>
      and(
        eq(table.eventId, payload.eventId),
        eq(table.clerkId, userId),
        eq(table.id, cartId),
      ),
    with: {
      itemsInCart: true,
      event: true,
    },
  });

  if (!cartInfo) {
    return {
      type: BaseResponseType.notFound,
      error: "Cart not found",
    };
  }

  if (cartInfo.event.eventStatus !== ORDER_EVENT_STATUS.ACTIVE) {
    return {
      type: BaseResponseType.forbidden,
      error: "Event is not active",
    };
  }

  const { itemToDelete, itemToUpdate } = cartInfo.itemsInCart.reduce(
    (acc, item) => {
      const newItem = newOrderItems.find(
        (newItem) => newItem.eventProductId === item.orderEventProductId,
      );
      if (!newItem) {
        acc.itemToDelete.push(item);
        // } else {
        // TODO: since we are fixed 1, no compare for this
        // acc.itemToUpdate.push(newItem);
      }
      return acc;
    },
    {
      itemToDelete: [] as typeof cartInfo.itemsInCart,
      itemToUpdate: [] as typeof newOrderItems,
    },
  );
  //
  const itemToInsert = newOrderItems.filter(
    (newItem) =>
      !cartInfo.itemsInCart.find(
        (oldItem) => oldItem.orderEventProductId === newItem.eventProductId,
      ),
  );

  const transactionStatus = await db.transaction(async (tx) => {
    const deletedItems = await tx.delete(OrderItemTable).where(
      and(
        eq(OrderItemTable.cartId, cartId),
        inArray(
          OrderItemTable.orderEventProductId,
          itemToDelete.map((item) => item.orderEventProductId),
        ),
      ),
    );

    if (deletedItems.rows.length !== itemToDelete.length) {
      tx.rollback();
      return false;
    }

    const insertedItems = await tx
      .insert(OrderItemTable)
      .values(
        itemToInsert.map((item) => ({
          cartId,
          orderEventProductId: item.eventProductId,
          amount: 1,
        })),
      )
      .returning();

    if (insertedItems.length !== itemToInsert.length) {
      tx.rollback();
      return false;
    }

    const updatedItems = await tx
      .update(OrderItemTable)
      .set({
        // TODO: fixed 1
        amount: 1,
      })
      .where(
        and(
          eq(OrderItemTable.cartId, cartId),
          inArray(
            OrderItemTable.orderEventProductId,
            itemToUpdate.map((item) => item.eventProductId),
          ),
        ),
      )
      .returning();

    if (updatedItems.length !== itemToUpdate.length) {
      tx.rollback();
      return false;
    }
    return true;
  });

  if (!transactionStatus) {
    return {
      type: BaseResponseType.serverError,
      error: "Failed to update cart",
    };
  }

  return {
    type: BaseResponseType.success,
    data: {
      id: cartId,
    },
    message: "Cart updated",
  } as SuccessResponseData<{ id: number }>;
};
