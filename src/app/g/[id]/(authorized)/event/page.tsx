import { db } from "@/server/db";
import {
  ORDER_EVENT_STATUS,
  type OrderEvent,
  OrderGroupMembers,
  OrderGroups,
} from "@/server/db/schema";
import { type NextPageProps } from "@/lib/types/nextjs";
import { z } from "zod";
import { and, desc, eq, or } from "drizzle-orm";
import DataTable from "@/app/g/[id]/(authorized)/event/data-table";
import eventColumnsDef from "./columns";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";

const pagePaginationURLSchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
});

type Pagination = z.infer<typeof pagePaginationURLSchema>;

type ParamsSerialized<T extends Record<string, unknown>> = {
  [K in keyof T]: string;
};

type PageProps = NextPageProps<
  ParamsSerialized<Pagination> & {
    id: string;
  }
>;

const Page = async ({ params: { id, ...paginationParams } }: PageProps) => {
  let page = 1;
  let limit = 10;
  const { userId } = auth();
  const groupId = Number(id);
  const validPagination = pagePaginationURLSchema.safeParse({
    page: paginationParams.page,
    limit: paginationParams.limit,
  });
  if (validPagination.success) {
    page = validPagination.data.page ?? 1;
    limit = validPagination.data.limit ?? 10;
  }

  if (!userId) {
    redirect("/");
  }

  const [groupInfo] = await db
    .select()
    .from(OrderGroups)
    .leftJoin(
      OrderGroupMembers,
      eq(OrderGroupMembers.orderGroupId, OrderGroups.id),
    )
    .where(
      and(
        eq(OrderGroups.id, groupId),
        or(
          eq(OrderGroupMembers.memberClerkId, userId),
          eq(OrderGroups.ownerClerkId, userId),
        ),
      ),
    )
    .all();

  if (!groupInfo) {
    redirect("/");
  }

  const isOwner = groupInfo.order_groups.ownerClerkId === userId;

  const activeEvent = await db.query.OrderEvents.findFirst({
    where: (table, { eq }) => eq(table.status, ORDER_EVENT_STATUS.ACTIVE),
  });

  const historyEvents = await db.query.OrderEvents.findMany({
    where: (table, { eq, or }) =>
      or(
        eq(table.status, ORDER_EVENT_STATUS.COMPLETED),
        eq(table.status, ORDER_EVENT_STATUS.CANCELLED),
        eq(table.status, ORDER_EVENT_STATUS.DRAFT),
      ),
    orderBy: (table) => desc(table.createdAt),
    limit,
    offset: (page - 1) * limit,
  });

  return (
    <div className={"flex flex-col gap-8"}>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-thin">Active Event</h1>
        {!activeEvent && (
          <small className="text-sm text-foreground">No active event</small>
        )}
        {isOwner && !activeEvent && (
          <div>
            <Link
              href={`/g/${id}/event/new`}
              className={`${buttonVariants()} gap-2`}
            >
              <Plus size={16} /> <span>Create a new event</span>
            </Link>
          </div>
        )}
        {activeEvent && <p>{activeEvent.name}</p>}
      </div>

      <hr />

      <div className={"flex flex-col gap-4"}>
        <h1 className={"text-2xl font-thin"}>History Events</h1>

        <div className="bg-background">
          <DataTable
            columns={eventColumnsDef as ColumnDef<OrderEvent>[]}
            data={historyEvents}
            onSelect={async (row) => {
              "use server";
              redirect(`/g/${id}/event/detail/${row.id}`);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
