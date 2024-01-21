import { type PropsWithChildren } from "react";
import { type NextPageProps } from "@/lib/types/nextjs";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { OrderGroups } from "@/server/db/schema";
import { z } from "zod";
import { redirect } from "next/navigation";
import GroupBuyNavigationBar from "@/components/layout/navigation-bar-group-buy";

type Props = NextPageProps<{
  id: string;
}>;

const Layout = async ({
  children,
  params: { id },
}: PropsWithChildren<Props>) => {
  const validId = z.coerce.number().safeParse(id);
  if (!validId.success) redirect("/404");

  const groupData = await db.query.OrderGroups.findFirst({
    where: eq(OrderGroups.id, validId.data),
  });

  if (!groupData) redirect("/404");

  return (
    <div className={"container relative mx-auto flex flex-col"}>
      <GroupBuyNavigationBar
        id={groupData.id}
        name={groupData.name}
        ownerClerkId={groupData.ownerClerkId}
      />
      {children}
    </div>
  );
};

export default Layout;
