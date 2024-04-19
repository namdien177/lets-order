import { db } from "@/server/db";
import {
  type OrderCart,
  type OrderEvent,
  OrderEventProductTable,
  OrderEventTable,
  type Product,
  ProductTable,
} from "@/server/db/schema";
import { and, eq, gte, or } from "drizzle-orm";
import { ORDER_EVENT_STATUS } from "@/server/db/constant";
import { type Nullable } from "@/lib/types/helper";
import { type CartItemPayload } from "@/app/order/show/[event_id]/schema";

export type QueryEventWithProductsResult = Pick<
  OrderEvent,
  | "id"
  | "code"
  | "clerkId"
  | "name"
  | "status"
  | "paymentStatus"
  | "paymentAt"
  | "endingAt"
  | "createdAt"
  | "updatedAt"
> & {
  items: Array<Pick<Product, "id" | "name" | "description" | "price">>;
};

export const queryEventWithProducts = async (
  eventId: number,
  clerkId: string,
): Promise<QueryEventWithProductsResult | null> => {
  const result = await db
    .select({
      id: OrderEventTable.id,
      code: OrderEventTable.code,
      clerkId: OrderEventTable.clerkId,
      name: OrderEventTable.name,
      status: OrderEventTable.status,
      paymentStatus: OrderEventTable.paymentStatus,
      paymentAt: OrderEventTable.paymentAt,
      endingAt: OrderEventTable.endingAt,
      createdAt: OrderEventTable.createdAt,
      updatedAt: OrderEventTable.updatedAt,
      "items.id": ProductTable.id,
      "items.name": ProductTable.name,
      "items.description": ProductTable.description,
      "items.price": ProductTable.price,
    })
    .from(OrderEventTable)
    .leftJoin(
      OrderEventProductTable,
      eq(OrderEventTable.id, OrderEventProductTable.eventId),
    )
    .innerJoin(
      ProductTable,
      eq(OrderEventProductTable.productId, ProductTable.id),
    )
    .where(
      and(
        eq(OrderEventTable.id, eventId),
        // if the user is the creator of the event || the event is in active/locked/completed state
        or(
          eq(OrderEventTable.clerkId, clerkId),
          gte(OrderEventTable.status, ORDER_EVENT_STATUS.ACTIVE),
        ),
      ),
    );
  const eventInfo = result[0];

  if (!eventInfo) {
    return null;
  }

  return {
    id: eventInfo.id,
    code: eventInfo.code,
    clerkId: eventInfo.clerkId,
    name: eventInfo.name,
    status: eventInfo.status,
    paymentStatus: eventInfo.paymentStatus,
    paymentAt: eventInfo.paymentAt,
    endingAt: eventInfo.endingAt,
    createdAt: eventInfo.createdAt,
    updatedAt: eventInfo.updatedAt,
    items: result.map((row) => ({
      id: row["items.id"],
      name: row["items.name"],
      description: row["items.description"],
      price: row["items.price"],
    })),
  };
};

export type QueryUserCartReturn = Pick<
  OrderCart,
  | "id"
  | "eventId"
  | "clerkId"
  | "paymentAt"
  | "paymentConfirmationAt"
  | "paymentStatus"
  | "note"
  | "createdAt"
  | "updatedAt"
> & {
  items: Array<CartItemPayload>;
};

export const queryUserCart = async (
  eventId: number,
  userId: string,
): Promise<Nullable<QueryUserCartReturn>> => {
  const result = await db.query.OrderCartTable.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.eventId, eventId), eq(table.clerkId, userId)),
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

  if (!result) {
    return null;
  }

  return {
    id: result.id,
    eventId: result.eventId,
    clerkId: result.clerkId,
    paymentAt: result.paymentAt,
    paymentConfirmationAt: result.paymentConfirmationAt,
    paymentStatus: result.paymentStatus,
    note: result.note,
    updatedAt: result.updatedAt,
    createdAt: result.createdAt,
    items: result.itemsInCart.map((item) => ({
      id: item.registeredProduct.productId,
      eventProductId: item.registeredProduct.id,
      name: item.registeredProduct.product.name,
      description: item.registeredProduct.product.description,
      price: item.registeredProduct.product.price,
    })),
  };
};
