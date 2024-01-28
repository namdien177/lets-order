import { Item } from "./item";
import { type OrderGroup, OrderProducts } from "@/server/db/schema";
import { Settings } from "lucide-react";
import { db } from "@/server/db";
import { count, eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";

type Props = Pick<OrderGroup, "id" | "ownerClerkId" | "name"> & {
  isTheOwner: boolean;
};

const GroupBuyNavigationBar = async ({ id, isTheOwner }: Props) => {
  const baseHref = `/g/${id}`;

  const [result] = await db
    .select({
      totalProducts: count(OrderProducts.id),
    })
    .from(OrderProducts)
    .where(eq(OrderProducts.orderGroupId, id))
    .groupBy(OrderProducts.orderGroupId);
  let totalProducts = 0;
  if (result) {
    totalProducts = result.totalProducts;
  }

  return (
    <div className={"sticky inset-x-0 top-0 flex items-center gap-4 py-2"}>
      <Item href={baseHref} exact={"exact"}>
        What&apos;s new
      </Item>
      <Item href={`${baseHref}/menu`} className={"items-center gap-2"}>
        <span>Menu</span>
        <Badge>{totalProducts}</Badge>
      </Item>
      <Item href={`${baseHref}/history`}>History</Item>

      <div className={"flex-1"} />

      <Item href={`${baseHref}/preference`}>Preference</Item>

      {isTheOwner && (
        <>
          <div className={"h-4 w-[2px] bg-gray-400"} />
          <Item href={`${baseHref}/setting`}>
            <Settings size={16} />
          </Item>
        </>
      )}
    </div>
  );
};

export default GroupBuyNavigationBar;
