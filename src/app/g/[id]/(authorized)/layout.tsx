import { type PropsWithChildren } from "react";
import { type NextPageProps } from "@/lib/types/nextjs";
import { db } from "@/server/db";
import { z } from "zod";
import { redirect } from "next/navigation";
import GroupBuyNavigationBar from "@/components/layout/navigation-bar-group-buy";
import { auth } from "@clerk/nextjs";

type Props = NextPageProps<{
  id: string;
}>;

const Layout = async ({
  children,
  params: { id },
}: PropsWithChildren<Props>) => {
  const { userId } = auth();
  const validId = z.coerce.number().safeParse(id);
  if (!validId.success || !userId) redirect("/404");

  const orderGroupId = Number(id);

  const groupData = await db.query.OrderGroups.findFirst({
    where: (group, { and, eq, or }) =>
      and(eq(group.id, orderGroupId), or(eq(group.ownerClerkId, userId))),
    with: {
      members: {
        where: (member, { eq, and }) =>
          and(eq(member.memberClerkId, userId), eq(member.status, "active")),
      },
    },
  });

  if (
    !groupData ||
    (groupData.members.length == 0 && groupData.ownerClerkId !== userId)
  )
    redirect("/404");

  return (
    <div className={"container relative mx-auto flex flex-col"}>
      <GroupBuyNavigationBar
        id={groupData.id}
        name={groupData.name}
        ownerClerkId={groupData.ownerClerkId}
        isTheOwner={groupData.ownerClerkId === userId}
      />
      {children}
    </div>
  );
};

export default Layout;
