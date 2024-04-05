import { type NextPageProps } from "@/lib/types/nextjs";
import { db } from "@/server/db";
import { ORDER_EVENT_STATUS } from "@/server/db/schema";
import CreateEventForm from "@/app/g/[id]/(authorized)/event/new/form";

type PageProps = NextPageProps<{
  id: string;
}>;

const Page = async ({ params: { id } }: PageProps) => {
  const groupId = Number(id);

  const activeEvent = await db.query.OrderEvents.findFirst({
    where: (table, { and, eq }) =>
      and(
        eq(table.orderGroupId, groupId),
        eq(table.status, ORDER_EVENT_STATUS.ACTIVE),
      ),
  });

  if (activeEvent) {
    return (
      <div className={"flex flex-col items-center"}>
        <h1>There is already an active event!</h1>
        <p>{activeEvent.name}</p>
        <small>Currently we only support 1 active event</small>
      </div>
    );
  }

  return <CreateEventForm groupId={groupId} />;
};

export default Page;
