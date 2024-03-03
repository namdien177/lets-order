import { type NextPageProps } from "@/lib/types/nextjs";
import { z } from "zod";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import {
  EventBasicInfo,
  EventStatusForm,
} from "@/app/g/[id]/(authorized)/event/detail/[event_id]/form";

type PageProps = NextPageProps<{
  event_id: string;
  id: string;
}>;

const pageSchema = z.object({
  event_id: z.coerce.number().int().min(1),
  id: z.coerce.number().int().min(1),
});

const Page = async ({ params: { event_id, id } }: PageProps) => {
  const { event_id: eventId, id: groupId } = pageSchema.parse({ event_id, id });
  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  const groupInfo = await db.query.OrderGroups.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, groupId), eq(table.ownerClerkId, userId)),
  });

  const eventInfo = await db.query.OrderEvents.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, eventId), eq(table.orderGroupId, groupId)),
  });

  if (!groupInfo || !eventInfo) {
    redirect("/404");
  }

  return (
    <div className={"flex flex-col-reverse gap-4 md:flex-row md:items-start"}>
      <EventBasicInfo
        className={"flex-1"}
        initialData={{
          event_id: eventId,
          id: groupId,
          name: eventInfo.name,
          endingAt: eventInfo.endingAt,
        }}
        eventStatus={eventInfo.status}
      />

      <div className="flex w-full flex-col rounded-lg bg-background p-4 shadow-md sm:max-w-[300px]">
        <div className="flex flex-col gap-1">
          <small className="text-sm text-gray-500">Event Status</small>
          <EventStatusForm id={eventInfo.id} status={eventInfo.status} />
        </div>
      </div>
    </div>
  );
};

export default Page;
