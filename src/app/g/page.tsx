import { type NextPageProps } from "@/lib/types/nextjs";
import { db } from "@/server/db";
import { OrderGroups } from "@/server/db/schema";
import { auth } from "@clerk/nextjs";
import { and, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";

type Props = NextPageProps<{
  page?: string;
  per_page?: string;
  keyword?: string;
}>;

const searchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  keyword: z.string().trim().optional(),
});

const Page = async ({ params }: Props) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const validatedParams = searchParamsSchema.safeParse(params);

  const queryPage = validatedParams.success ? validatedParams.data.page : 1;
  const queryPerPage = validatedParams.success
    ? validatedParams.data.per_page
    : 10;
  const queryKeyword = validatedParams.success
    ? validatedParams.data.keyword?.trim() ?? undefined
    : undefined;

  const ownedGroupOrders = await db.query.OrderGroups.findMany({
    where: and(
      eq(OrderGroups.ownerClerkId, userId),
      queryKeyword ? eq(OrderGroups.name, queryKeyword) : undefined,
    ),
    limit: queryPerPage,
    offset: (queryPage - 1) * queryPerPage,
    orderBy: desc(OrderGroups.updatedAt),
  });

  return (
    <div className="flex flex-col gap-4 container mx-auto p-4">
      <h1>Owned groups</h1>

      <hr />

      <div className="flex flex-wrap gap-4">
        {ownedGroupOrders.map((groupOrder) => (
          <Link
            key={groupOrder.id}
            href={`/g/${groupOrder.id}`}
            className="block rounded-md bg-background p-4 shadow-md"
          >
            <h2 className="text-lg font-bold text-primary">{groupOrder.name}</h2>
            <p>{groupOrder.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Page;
