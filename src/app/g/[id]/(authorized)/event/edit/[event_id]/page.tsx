import { type NextPageProps } from "@/lib/types/nextjs";
import { z } from "zod";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import EventStatusSelect from "@/components/event-detail/form/event-status-select";
import EventBasicInfoForm from "@/components/event-detail/form/event-info-form";
import EventDeletionBtn from "@/components/event-detail/form/event-deletion-btn";
import { ORDER_EVENT_STATUS } from "@/server/db/schema";

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
    <div className={"relative flex flex-col gap-4 md:flex-row md:items-start"}>
      <EventBasicInfoForm
        className={"flex-1"}
        initialData={{
          event_id: eventId,
          id: groupId,
          name: eventInfo.name,
          endingAt: eventInfo.endingAt,
        }}
        eventStatus={eventInfo.status}
      />

      <div className="flex w-full flex-col gap-4 sm:max-w-[300px]">
        <div className="flex flex-col gap-1 rounded-lg bg-background p-4 shadow-md">
          <small className="text-sm text-gray-500">Event Status</small>
          <EventStatusSelect id={eventInfo.id} status={eventInfo.status} />
        </div>

        {eventInfo.status !== ORDER_EVENT_STATUS.ACTIVE && (
          <div className={"flex flex-col gap-1"}>
            <p className={"text-sm font-bold text-destructive"}>Danger</p>
            <small className={"text-gray-400"}>
              The below action cannot be reverted!
            </small>
            <EventDeletionBtn
              eventId={eventInfo.id}
              status={eventInfo.status}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
