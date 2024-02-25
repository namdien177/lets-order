import { type NextPageProps } from "@/lib/types/nextjs";
import { db } from "@/server/db";
import { isNull } from "drizzle-orm";

type PageProps = NextPageProps<{
  id: string;
}>;

const Page = async ({ params: { id } }: PageProps) => {
  const groupId = Number(id);
  const activeEvent = await db.query.OrderEvents.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.orderGroupId, groupId), isNull(table.endingAt)),
  });

  if (!activeEvent) {
    return <div>There is no active event</div>;
  }

  return <></>;
};

export default Page;
