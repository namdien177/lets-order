import { type NextPageProps } from "@/lib/types/nextjs";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import EditOrderEventInfoForm from "./(event-infomation)/info.form";
import EventStatusForm from "@/app/order/manage/[event_id]/(event-status)/status.form";
import OrderList from "@/app/order/manage/[event_id]/(order-list)/order-list";
import { ORDER_EVENT_STATUS } from "@/server/db/constant";
import CartList from "@/app/order/manage/[event_id]/(cart-list)/cart-list";

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

  const billableEvent =
    eventInfo.eventStatus === ORDER_EVENT_STATUS.ACTIVE ||
    eventInfo.eventStatus === ORDER_EVENT_STATUS.LOCKED ||
    eventInfo.eventStatus === ORDER_EVENT_STATUS.COMPLETED;

  return (
    <div className={"container mx-auto flex flex-col gap-8 p-4 md:p-8"}>
      <Breadcrumb className={"w-full"}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <Home size={16} />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={"/order"}>Order</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className={"flex items-center gap-2"}>
              <Badge>Manage</Badge> <span>{eventInfo.name}</span>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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
            status: eventInfo.eventStatus,
          }}
        />

        <EventStatusForm
          orderEvent={{
            id: eventInfo.id,
            status: eventInfo.eventStatus,
          }}
        />

        {billableEvent && (
          <OrderList
            eventId={eventId}
            eventStatus={eventInfo.eventStatus}
            paymentStatus={eventInfo.paymentStatus}
            paymentAt={eventInfo.paymentAt}
            clerkId={userId}
          />
        )}

        {billableEvent && (
          <CartList eventId={eventId} eventStatus={eventInfo.eventStatus} />
        )}
      </div>
    </div>
  );
};

export default Page;
