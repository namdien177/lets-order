import { type NextPageProps } from "@/lib/types/nextjs";
import { db } from "@/server/db";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, Share2 } from "lucide-react";
import EventBadgeStatus from "@/app/order/show/[event_id]/event-badge-status";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type PageProps = NextPageProps<{
  event_id: string;
}>;

const Page = async ({ params: { event_id } }: PageProps) => {
  const eventId = parseInt(event_id);

  const orderEvent = await db.query.OrderEventTable.findFirst({
    where: (table, { eq }) => eq(table.id, eventId),
  });

  if (!orderEvent) {
    redirect("/404");
  }

  return (
    <div className={"container mx-auto p-8"}>
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
          <EventBadgeStatus data={orderEvent} className={"h-9 px-4"} />

          <Button size={"sm"} className={"gap-2"} variant={"outline"}>
            <Share2 size={16} />
            <span>Copy URL</span>
          </Button>
        </div>

        <hr />
      </div>
    </div>
  );
};

export default Page;
