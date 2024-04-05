import { type NextPageProps } from "@/lib/types/nextjs";
import { db } from "@/server/db";
import { z } from "zod";
import GroupItemForm from "./form";

type PageProps = NextPageProps<
  {
    id: string;
  },
  {
    item_id?: string;
  }
>;

const Page = async ({
  params: { id },
  searchParams: { item_id },
}: PageProps) => {
  const validOriginalId = z.coerce.number().safeParse(item_id);
  const groupId = Number(id);

  const originalProduct = validOriginalId.success
    ? await db.query.OrderProducts.findFirst({
        where: (table, { and, eq }) =>
          and(
            eq(table.id, Number(item_id)),
            eq(table.orderGroupId, Number(validOriginalId.data)),
          ),
      })
    : undefined;

  return (
    <div className="container mx-auto flex flex-col gap-4 py-4">
      <div className="flex w-full items-center">
        <h1 className="text-2xl font-bold text-primary">
          {originalProduct ? "Edit" : "Add"} product
        </h1>
        <div className="flex-1" />
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <GroupItemForm
          className={"flex-1"}
          groupId={groupId}
          original={originalProduct}
        />
        <div className="flex flex-1 flex-col">
          <h2>Notes</h2>
          <p>TBD</p>
        </div>
      </div>
    </div>
  );
};

export default Page;
