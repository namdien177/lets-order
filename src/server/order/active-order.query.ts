import { union } from "drizzle-orm/pg-core";
import {
  dbActiveOrders,
  dbParticipatedOrders,
} from "@/database/queries/product";
import db from "@/database";
import { orders } from "@/database/schema/order";
import { eq } from "drizzle-orm";

type QueryActiveOrderResult = Awaited<ReturnType<typeof queryActiveOrders>>;

export const queryActiveOrders = (userId: number) => {
  const unionTable = union(
    dbActiveOrders(userId),
    dbParticipatedOrders(userId),
  ).as("active_participated_orders");

  return db
    .select({
      id: orders.id,
      name: orders.name,
      status: orders.status,
      description: orders.description,
      ownerId: orders.ownerId,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
    })
    .from(orders)
    .innerJoin(unionTable, eq(orders.id, unionTable.id))
    .execute();
};
