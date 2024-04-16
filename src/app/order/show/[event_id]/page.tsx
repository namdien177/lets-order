import { type NextPageProps } from "@/lib/types/nextjs";
import { db } from "@/server/db";
import { redirect } from "next/navigation";
import { Home, Settings, Share2 } from "lucide-react";
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
import { auth } from "@clerk/nextjs";
import { type ShowingCart } from "@/app/order/show/[event_id]/schema";
import EventShareBtn from "@/app/order/show/[event_id]/event-share.btn";
import { env } from "@/env";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ORDER_EVENT_STATUS } from "@/server/db/constant";
import EventPaymentInfo from "@/app/order/show/[event_id]/(completed)/event-payment";
import { type Optional } from "@/lib/types/helper";

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

  const orderEvent = await db.query.OrderEventTable.findFirst({
    where: (table, { eq }) => eq(table.id, eventId),
    with: {
      carts: {
        where: (table, { eq }) => eq(table.clerkId, userId),
        with: {
          itemsInCart: {
            with: {
              registeredProduct: {
                with: {
                  product: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!orderEvent) {
    redirect("/404");
  }

  const isOwner = orderEvent.clerkId === userId;
  const isOrderAble = orderEvent.eventStatus === ORDER_EVENT_STATUS.ACTIVE;
  const isInPaymentState =
    orderEvent.eventStatus === ORDER_EVENT_STATUS.COMPLETED ||
    orderEvent.eventStatus === ORDER_EVENT_STATUS.LOCKED;

  const userCart = orderEvent.carts.at(0);
  let cart: Optional<ShowingCart>;
  if (userCart) {
    cart = {
      id: userCart.id,
      confirmedAt: userCart.paymentConfirmationAt,
      paymentAt: userCart.paymentAt,
      paymentStatus: userCart.paymentStatus,
      items: userCart.itemsInCart.map((item) => ({
        id: item.registeredProduct.productId,
        eventProductId: item.orderEventProductId,
        name: item.registeredProduct.product.name,
        description: item.registeredProduct.product.description,
        price: item.registeredProduct.product.price,
      })),
    };
  }

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

      <div className="mx-auto flex w-full flex-col gap-8 py-8 md:max-w-[500px]">
        <div
          className={"flex flex-col items-center justify-center md:items-start"}
        >
          <small className="text-center text-lg font-thin leading-tight text-accent-foreground">
            Event
          </small>
          <h1 className={"text-4xl font-bold"}>{orderEvent.name}</h1>
        </div>

        <div className="flex items-center justify-center gap-4 md:justify-start">
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
          )}
        </div>

        <hr />

        {isOrderAble && (
          <EventMenu clerkId={userId} eventId={orderEvent.id} cart={cart} />
        )}

        {isInPaymentState && cart && (
          <EventPaymentInfo event={orderEvent} cart={cart} />
        )}
      </div>
    </div>
  );
};

export default Page;
