import { db } from "@/server/db";
import {
  CartTable,
  EventProductTable,
  CartItemTable,
  ProductTable,
} from "@/server/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { type ItemsFromCartsQuery } from "@/app/order/manage/[event_id]/type";

export const queryItemsFromCarts = async (
  eventId: number,
): Promise<ItemsFromCartsQuery[]> => {
  return db
    .select({
      "product.id": EventProductTable.productId,
      "product.name": ProductTable.name,
      "product.description": ProductTable.description,
      "product.price": ProductTable.price,
      clerkId: CartTable.clerkId,
      eventId: EventProductTable.eventId,
      cartId: CartTable.id,
      paymentAt: CartTable.paymentAt,
      paymentStatus: CartTable.paymentStatus,
      confirmationAt: CartTable.paymentConfirmationAt,
      amount: CartItemTable.amount,
    })
    .from(EventProductTable)
    .innerJoin(CartTable, eq(CartTable.eventId, EventProductTable.eventId))
    .innerJoin(
      CartItemTable,
      and(
        eq(CartItemTable.orderEventProductId, EventProductTable.id),
        eq(CartItemTable.cartId, CartTable.id),
      ),
    )
    .innerJoin(ProductTable, eq(ProductTable.id, EventProductTable.productId))
    .where(
      and(eq(EventProductTable.eventId, eventId), gt(CartItemTable.amount, 0)),
    );
};
