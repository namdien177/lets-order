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
      eventId: OrderCartTable.eventId,
      clerkId: OrderCartTable.clerkId,
    })
    .from(OrderCartTable)
    .where(eq(OrderCartTable.clerkId, clerkId))
    .$dynamic();

  let eventYouOwnedQuery = db
    .selectDistinct({
      eventId: OrderEventTable.id,
      clerkId: OrderEventTable.clerkId,
    })
    .from(OrderEventTable)
    .where(eq(OrderEventTable.clerkId, clerkId))
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
    eventYouOwnedQuery = eventYouOwnedQuery.where(
      and(
        eq(OrderEventTable.clerkId, clerkId),
        or(
          ilike(OrderEventTable.name, `%${keyword}%`),
          ilike(OrderEventTable.id, `%${keyword}%`),
        ),
      ),
    );
  } else {
    eventHasUserCartQuery = eventHasUserCartQuery.where(
      eq(OrderCartTable.clerkId, clerkId),
    );
    eventYouOwnedQuery = eventYouOwnedQuery.where(
      eq(OrderEventTable.clerkId, clerkId),
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
