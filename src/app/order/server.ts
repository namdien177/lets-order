import { type PaginationParams } from "@/lib/types/pagination.types";
import { db } from "@/server/db";
import { OrderCartTable, OrderEventTable } from "@/server/db/schema";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";

export const queryOrders = async ({
  keyword,
  page = 1,
  limit = 10,
  clerkId,
}: PaginationParams & {
  clerkId: string;
}) => {
  let eventHasUserCartQuery = db
    .selectDistinct({
      eventId: OrderEventTable.id,
      clerkId: OrderCartTable.clerkId,
    })
    .from(OrderCartTable)
    .innerJoin(OrderEventTable, eq(OrderEventTable.id, OrderCartTable.eventId))
    .orderBy(desc(OrderEventTable.id), desc(OrderEventTable.endingAt))
    .$dynamic();

  if (keyword?.trim()) {
    eventHasUserCartQuery = eventHasUserCartQuery.where(
      and(
        or(
          ilike(OrderEventTable.name, `%${keyword}%`),
          ilike(OrderEventTable.id, `%${keyword}%`),
        ),
        eq(OrderCartTable.clerkId, clerkId),
      ),
    );
  } else {
    eventHasUserCartQuery = eventHasUserCartQuery.where(
      eq(OrderCartTable.clerkId, clerkId),
    );
  }

  const queryBuilder$ = eventHasUserCartQuery.as("eventHasUserCartQuery");

  const data = await db
    .select({
      id: OrderEventTable.id,
      name: OrderEventTable.name,
      eventStatus: OrderEventTable.eventStatus,
      paymentStatus: OrderEventTable.paymentStatus,
      endingAt: OrderEventTable.endingAt,
      createdAt: OrderEventTable.createdAt,
    })
    .from(OrderEventTable)
    .innerJoin(queryBuilder$, eq(queryBuilder$.eventId, OrderEventTable.id))
    .offset(Math.max(0, page - 1) * limit)
    .limit(Math.min(limit, 100));

  const [{ total } = { total: 0 }] = await db
    .select({ total: count() })
    .from(OrderEventTable)
    .innerJoin(queryBuilder$, eq(queryBuilder$.eventId, OrderEventTable.id));

  return {
    total,
    data,
  };
};
