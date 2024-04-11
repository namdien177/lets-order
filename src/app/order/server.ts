import { type PaginationParams } from "@/lib/types/pagination.types";
import { db } from "@/server/db";
import { OrderCartTable, OrderEventTable } from "@/server/db/schema";
import { count, desc, eq, ilike, or } from "drizzle-orm";
import { union } from "drizzle-orm/sqlite-core";

export const queryOrders = async ({
  keyword,
  page = 1,
  limit = 10,
  clerkId,
}: PaginationParams & {
  clerkId: string;
  withDeleted?: boolean;
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
    .$dynamic();

  if (keyword?.trim()) {
    eventHasUserCartQuery = eventHasUserCartQuery.where(
      or(
        ilike(OrderEventTable.name, `%${keyword}%`),
        ilike(OrderEventTable.id, `%${keyword}%`),
      ),
    );
    eventYouOwnedQuery = eventYouOwnedQuery.where(
      or(
        ilike(OrderEventTable.name, `%${keyword}%`),
        ilike(OrderEventTable.id, `%${keyword}%`),
      ),
    );
  }

  const eventYouCreated = eventYouOwnedQuery;
  const eventHasUserCart = eventHasUserCartQuery;

  const subQueriesBuilder$ = union(eventYouCreated, eventHasUserCart).as(
    "subQueriesBuiler",
  );

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
    .innerJoin(
      subQueriesBuilder$,
      eq(subQueriesBuilder$.eventId, OrderEventTable.id),
    )
    .orderBy(desc(OrderEventTable.id), desc(OrderEventTable.endingAt))
    .offset(Math.max(0, page - 1) * limit)
    .limit(Math.min(limit, 100));

  const [{ total } = { total: 0 }] = await db
    .select({ total: count() })
    .from(OrderEventTable)
    .innerJoin(
      subQueriesBuilder$,
      eq(subQueriesBuilder$.eventId, OrderEventTable.id),
    );

  return {
    total,
    data,
  };
};
