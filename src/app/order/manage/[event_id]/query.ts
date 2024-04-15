import { db } from "@/server/db";
import {
  OrderCartTable,
  OrderEventProductTable,
  OrderItemTable,
  ProductTable,
} from "@/server/db/schema";
import { and, eq, gt } from "drizzle-orm";

export const queryItemsFromCarts = async (eventId: number) => {
  return db
    .select({
      "product.id": OrderEventProductTable.productId,
      "product.name": ProductTable.name,
      "product.description": ProductTable.description,
      "product.price": ProductTable.price,
      clerkId: OrderCartTable.clerkId,
      eventId: OrderEventProductTable.eventId,
      cartId: OrderCartTable.id,
      paymentAt: OrderCartTable.paymentAt,
      paymentStatus: OrderCartTable.paymentStatus,
      amount: OrderItemTable.amount,
    })
    .from(OrderEventProductTable)
    .innerJoin(
      OrderCartTable,
      eq(OrderCartTable.eventId, OrderEventProductTable.eventId),
    )
    .innerJoin(
      OrderItemTable,
      eq(OrderItemTable.orderEventProductId, OrderEventProductTable.id),
    )
    .innerJoin(
      ProductTable,
      eq(ProductTable.id, OrderEventProductTable.productId),
    )
    .where(
      and(
        eq(OrderEventProductTable.eventId, eventId),
        gt(OrderItemTable.amount, 0),
      ),
    );
};
