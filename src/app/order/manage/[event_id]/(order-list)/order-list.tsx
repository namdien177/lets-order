import { db } from "@/server/db";
import { and, eq, sql } from "drizzle-orm";
import {
  OrderCartTable,
  OrderItemTable,
  ProductTable,
} from "@/server/db/schema";

type Props = {
  viewAs?: "by-product" | "by-user";
  eventId: number;
  clerkId: string;
};

const OrderList = async ({ eventId, clerkId }: Props) => {
  const orderByProductList = await db.query.OrderEventProductTable.findMany({
    where: (eventTable, { and, eq }) => and(eq(eventTable.eventId, eventId)),
    with: {
      product: true,
      event: true,
    },
  });

  const orderedAmount = db
    .select({
      productId: OrderItemTable.orderEventProductId,
      eventId: OrderCartTable.eventId,
      amount: sql`sum(${OrderItemTable.amount}) as 'amount'`.mapWith(Number),
    })
    .from(OrderCartTable)
    .leftJoin(OrderItemTable, eq(OrderCartTable.id, OrderItemTable.cartId))
    .where(and(eq(OrderCartTable.eventId, eventId)))
    .groupBy(OrderItemTable.orderEventProductId, OrderCartTable.eventId)
    .as("sq");

  const listOrdering = db
    .select({
      id: ProductTable.id,
      name: ProductTable.name,
      price: ProductTable.price,
      totalAmount: orderedAmount.amount,
    })
    .from(ProductTable)
    .leftJoin(orderedAmount, eq(ProductTable.id, orderedAmount.productId));

  console.log(listOrdering.toSQL());

  return <></>;
};

export default OrderList;
