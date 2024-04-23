import { type NextPageProps } from "@/lib/types/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import EditOrderEventInfoForm from "./(event-infomation)/info.form";
import EventStatusForm from "@/app/order/manage/[event_id]/(event-status)/status.form";
import OrderList from "@/app/order/manage/[event_id]/(order-list)/order-list";
import {
  ORDER_EVENT_STATUS,
  type OrderEventStatus,
} from "@/server/db/constant";

type PageProps = NextPageProps<{
  event_id: string;
}>;

const Page = async ({ params: { event_id } }: PageProps) => {
  const { userId } = auth();
  const eventId = parseInt(event_id);

  if (!userId) {
    redirect("/sign-in");
  }
  const eventInfo = await db.query.OrderEventTable.findFirst({
    where: (table, { eq, and }) =>
      and(eq(table.id, eventId), eq(table.clerkId, userId)),
  });

  if (!eventInfo) {
    redirect("/404");
  }

  const billableEvent = eventInfo.status >= ORDER_EVENT_STATUS.ACTIVE;

  return (
    <div className={"mx-auto flex w-full flex-col gap-8 md:max-w-[800px]"}>
      <Alert>
        <Info size={16} />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          Currently we are only allow edit the event name and status.
        </AlertDescription>
      </Alert>

      <EditOrderEventInfoForm
        orderEvent={{
          id: eventInfo.id,
          name: eventInfo.name,
          status: eventInfo.status as OrderEventStatus,
        }}
      />

      <EventStatusForm
        orderEvent={{
          id: eventInfo.id,
          status: eventInfo.status,
        }}
      />

      {billableEvent && (
        <OrderList
          eventId={eventId}
          eventStatus={eventInfo.status as OrderEventStatus}
          paymentStatus={eventInfo.paymentStatus}
          paymentAt={eventInfo.paymentAt}
          clerkId={userId}
        />
      )}
    </div>
  );
};

export default Page;
