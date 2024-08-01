import db from "@/database";
import { ORDER_STATUS, orders } from "@/database/schema/order";
import { and, eq, isNull, or } from "drizzle-orm";
import { orderCarts } from "@/database/schema/order-cart";

export const dbActiveOrders = (userId: number) =>
  db
    .select({ id: orders.id })
    .from(orders)
    .where(
      and(
        isNull(orders.deletedAt),
        eq(orders.ownerId, userId),
        or(
          eq(orders.status, ORDER_STATUS.OPEN),
          eq(orders.status, ORDER_STATUS.CLOSED),
        ),
      ),
    );
export const dbParticipatedOrders = (userId: number) =>
  db
    .select({ id: orderCarts.orderId })
    .from(orderCarts)
    .where(and(isNull(orderCarts.deletedAt), eq(orderCarts.userId, userId)));
