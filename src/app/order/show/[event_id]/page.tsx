import { type NextPageProps } from "@/lib/types/nextjs";
import { redirect } from "next/navigation";
import { Home, Info, Settings, Share2 } from "lucide-react";
import EventBadgeStatus from "@/app/order/show/[event_id]/event-badge-status";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import EventMenu from "@/app/order/show/[event_id]/(active)/event-menu";
import { auth } from "@clerk/nextjs/server";
import EventShareBtn from "@/app/order/show/[event_id]/event-share.btn";
import { env } from "@/env";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ORDER_EVENT_STATUS } from "@/server/db/constant";
import EventPaymentInfo from "@/app/order/show/[event_id]/(completed)/event-payment";
import {
  queryEventWithProducts,
  queryUserCart,
} from "@/app/order/show/[event_id]/query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type PageProps = NextPageProps<{
  event_id: string;
}>;

const Page = async ({ params: { event_id } }: PageProps) => {
  const clientHost = env.CLIENT_HOST;

  const { userId } = auth();
  const eventId = parseInt(event_id);

  if (!userId) {
    redirect("/sign-in");
  }

  const orderEvent = await queryEventWithProducts(eventId, userId);

  if (!orderEvent) {
    redirect("/404");
  }

  const isOwner = orderEvent.clerkId === userId;
  const isOrderAble = orderEvent.status === ORDER_EVENT_STATUS.ACTIVE;
  const isInPaymentState = orderEvent.status >= ORDER_EVENT_STATUS.LOCKED;

  const userCart = await queryUserCart(eventId, userId);

  return (
    <div className={"container mx-auto p-4 md:p-8"}>
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
            <BreadcrumbPage>{orderEvent.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mx-auto flex w-full flex-col gap-8 py-8 md:max-w-[800px]">
        <div
          className={"flex flex-col items-center justify-center md:items-start"}
        >
          <small className="text-center text-lg font-thin leading-tight text-accent-foreground">
            Event
          </small>
          <h1 className={"text-4xl font-bold"}>{orderEvent.name}</h1>
        </div>

        <div className="flex items-center justify-center gap-4 overflow-x-auto md:justify-start">
          <div className={"flex flex-1 items-center gap-4"}>
            <EventBadgeStatus data={orderEvent} className={"h-9 px-4"} />

            <EventShareBtn
              size={"sm"}
              className={"gap-2"}
              variant={"outline"}
              copyContent={new URL(
                `/order/show/${orderEvent.id}`,
                clientHost,
              ).toString()}
            >
              <Share2 size={16} />
              <span>Share</span>
            </EventShareBtn>
          </div>

          {isOwner && (
            <>
              <hr className={"h-6 border"} />
              <Link
                href={`/order/manage/${orderEvent.id}`}
                className={buttonVariants({
                  variant: "outline",
                  className: "gap-2",
                  size: "sm",
                })}
              >
                <Settings size={16} />
                <span>Manage</span>
              </Link>
            </>
          )}
        </div>

        <hr />

        {orderEvent.status === ORDER_EVENT_STATUS.DRAFT && (
          <Alert>
            <Info size={16} />
            <AlertTitle>Your event is in drafting stage</AlertTitle>
            <AlertDescription>
              Events in drafting stage won&apos;t be displayed to public. Go to{" "}
              <Link
                className={"inline text-primary underline"}
                href={`/order/manage/${orderEvent.id}`}
              >
                manage page
              </Link>{" "}
              to publish your event.
            </AlertDescription>
          </Alert>
        )}

        {isOrderAble && (
          <EventMenu clerkId={userId} eventId={orderEvent.id} cart={userCart} />
        )}

        {isInPaymentState && userCart && (
          <EventPaymentInfo event={orderEvent} cart={userCart} />
        )}
      </div>
    </div>
  );
};

export default Page;
