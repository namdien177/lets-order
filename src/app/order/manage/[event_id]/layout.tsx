import { type PropsWithChildren } from "react";
import { type NextPageProps } from "@/lib/types/nextjs";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

type LayoutProps = NextPageProps<{
  event_id: string;
}>;

const LayoutManageOrder = async ({
  children,
  params,
}: PropsWithChildren<LayoutProps>) => {
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
