import { type ReactNode } from "react";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import ManageNavigationBar from "@/app/order/manage/[event_id]/(layout)/navigation-bar";

type LayoutProps = {
  children?: ReactNode;
  params: {
    event_id: string;
  };
};

const LayoutManageOrder = async ({ children, params }: LayoutProps) => {
  const { userId } = auth();
  const eventId = Number(params.event_id);

  if (!userId) {
    redirect("/sign-in");
  }

  const ownerEvent = await db.query.EventTable.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, eventId), eq(table.clerkId, userId)),
  });

  if (!ownerEvent) {
    redirect("/order");
  }

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
            <BreadcrumbLink href={`/order/show/${ownerEvent.id}`}>
              {ownerEvent.name}
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className={"flex items-center gap-2"}>
              Manage
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ManageNavigationBar event={ownerEvent} />

      {children}
    </div>
  );
};

export default LayoutManageOrder;
