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
import { type CartItemPayload } from "@/app/order/show/[event_id]/schema";
import EventShareBtn from "@/app/order/show/[event_id]/event-share.btn";
import { env } from "@/env";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

type PageProps = NextPageProps<{
  event_id: string;
}>;

const Page = async ({ params: { event_id } }: PageProps) => {
  const clienthost = env.CLIENT_HOST;

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

  const userCart = orderEvent.carts.at(0);
  let cart: { id: number; items: Array<CartItemPayload> } | undefined;
  if (userCart) {
    cart = {
      id: userCart.id,
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
              copyContent={`${clienthost}/order/show/${orderEvent.id}`}
            >
              <Share2 size={16} />
              <span>Share</span>
            </EventShareBtn>
          </div>

          <Link
            href={`/order/edit/${orderEvent.id}`}
            className={buttonVariants({
              size: "icon",
              variant: "ghost",
            })}
          >
            <Settings size={16} />
          </Link>
        </div>

        <hr />

        <EventMenu clerkId={userId} eventId={orderEvent.id} cart={cart} />
      </div>
    </div>
  );
};

export default Page;
