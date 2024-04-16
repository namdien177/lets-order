import { type ReactNode } from "react";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

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

  const ownerEventInfo = await db.query.OrderEventTable.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, eventId), eq(table.clerkId, userId)),
  });

  if (!ownerEventInfo) {
    redirect("/order");
  }

  return <>{children}</>;
};

export default LayoutManageOrder;
