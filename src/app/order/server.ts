import { type PaginationParams } from "@/lib/types/pagination.types";
import { db } from "@/server/db";
import {
  OrderEventProductTable,
  OrderEventTable,
  OrderUserTable,
} from "@/server/db/schema";
import { and, count, desc, eq, gt, ilike, or } from "drizzle-orm";

export const queryOrders = async ({
  keyword,
  page = 1,
  limit = 10,
  clerkId,
}: PaginationParams & {
  clerkId: string;
}) => {
  const associateEventSQ = db
    .selectDistinct({
      eventId: OrderEventProductTable.eventId,
      clerkId: OrderUserTable.clerkId,
    })
    .from(OrderUserTable)
    .innerJoin(
      OrderEventProductTable,
      eq(OrderEventProductTable.id, OrderUserTable.orderEventProductId),
    )
    .where(
      and(eq(OrderUserTable.clerkId, clerkId), gt(OrderUserTable.amount, 0)),
    )
    .orderBy(
      desc(OrderEventProductTable.eventId),
      desc(OrderUserTable.updatedAt),
    )
    .as("associateEventSQ");

  let data$ = db
    .select({
      id: OrderEventTable.id,
      name: OrderEventTable.name,
      createdAt: OrderEventTable.createdAt,
      eventStatus: OrderEventTable.eventStatus,
      paymentStatus: OrderEventTable.paymentStatus,
      endingAt: OrderEventTable.endingAt,
    })
    .from(OrderEventTable)
    .innerJoin(
      associateEventSQ,
      eq(associateEventSQ.eventId, OrderEventTable.id),
    )
    .$dynamic();

  if (keyword?.trim()) {
    data$ = data$.where(
      or(
        ilike(OrderEventTable.name, `%${keyword}%`),
        ilike(OrderEventTable.id, `%${keyword}%`),
      ),
    );
  }

  const subQuery = data$.as("queryEventQuery");

  const data = await db
    .select()
    .from(subQuery)
    .offset(Math.max(0, page - 1) * limit)
    .limit(Math.min(limit, 100));
  const [{ total } = { total: 0 }] = await db
    .select({ total: count() })
    .from(subQuery);

  return {
    total,
    data,
  };
};
