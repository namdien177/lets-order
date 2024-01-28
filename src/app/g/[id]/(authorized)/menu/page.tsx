import { type NextPageProps } from "@/lib/types/nextjs";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

type PageProps = NextPageProps<{
  id: string;
}>;

const Page = async ({ params: { id } }: PageProps) => {
  const user = auth();

  if (!user.userId) {
    return redirect("/");
  }

  const groupId = Number(id);
  const group = await db.query.OrderGroups.findFirst({
    where: (table, { and, eq }) => and(eq(table.id, groupId)),
    with: {
      products: {
        where: (table, { and, eq, isNull }) =>
          and(eq(table.orderGroupId, groupId), isNull(table.deletedAt)),
      },
    },
  });

  if (!group) {
    return redirect("/");
  }

  const isOwner = group.ownerClerkId === user.userId;

  return (
    <div className={"flex flex-col gap-4 py-4"}>
      <div className="flex w-full items-center">
        <h1 className={"text-2xl font-bold text-primary"}>
          Available products
        </h1>
        <div className={"flex-1"} />
        {isOwner && (
          <Link href={`/g/${groupId}/menu/new`} className={buttonVariants()}>
            Add product
          </Link>
        )}
      </div>
      {group.products.length === 0 && (
        <p className={"text-gray-400"}>There are no products available yet.</p>
      )}
      {group.products.map((product) => (
        <div
          key={product.id}
          className={
            "flex flex-col gap-2 rounded-md bg-background p-4 shadow-md"
          }
        >
          <h2 className={"text-lg font-bold text-primary"}>{product.name}</h2>
          <p className={"text-gray-400"}>{product.description}</p>
        </div>
      ))}
    </div>
  );
};

export default Page;
