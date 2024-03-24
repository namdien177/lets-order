import { db } from "@/server/db";
import { OrderEventProducts, OrderProducts } from "@/server/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { type EventPageProps } from "@/components/event-detail/types";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import InformationBlock from "@/app/g/[id]/(authorized)/event/view/[event_id]/information.block";
import FormOrderBlock from "@/app/g/[id]/(authorized)/event/view/[event_id]/form-order.block";

type PageProps = EventPageProps;

const Page = async ({ params, searchParams }: PageProps) => {
  const { event_id: rawGroupEventId, id: rawGroupId } = params;
  const { userId } = auth();

  if (!userId) {
    redirect("/");
  }

  const eventId = Number(rawGroupEventId);
  const groupId = Number(rawGroupId);

  const eventInformation = await db.query.OrderEvents.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, eventId), eq(table.orderGroupId, groupId)),
    with: {
      orderGroup: true,
    },
  });

  if (!eventInformation) {
    redirect("/404");
  }

  const { orderGroup: groupData, ...eventData } = eventInformation;

  const availableProducts = await db
    .select({
      id: OrderProducts.id,
      orderGroupId: OrderProducts.orderGroupId,
      name: OrderProducts.name,
      description: OrderProducts.description,
      price: OrderProducts.price,
      __order_amount: OrderEventProducts.amount,
    })
    .from(OrderProducts)
    .leftJoin(
      OrderEventProducts,
      and(
        eq(OrderProducts.id, OrderEventProducts.orderProductId),
        eq(OrderEventProducts.orderEventId, eventId),
        eq(OrderEventProducts.clerkId, userId),
      ),
    )
    .where(
      and(
        eq(OrderProducts.orderGroupId, groupId),
        isNull(OrderProducts.deletedAt),
      ),
    );

  const productsWithOrderedAmount = availableProducts.map((product) => ({
    id: product.id,
    orderGroupId: product.orderGroupId,
    name: product.name,
    description: product.description,
    price: product.price,
    orderedAmount: product.__order_amount,
  }));

  return (
    <div className={"flex flex-col gap-8 md:flex-row"}>
      <InformationBlock
        eventData={eventData}
        groupData={groupData}
        params={params}
        searchParams={searchParams}
        userId={userId}
      />

      <FormOrderBlock
        items={productsWithOrderedAmount}
        eventData={eventData}
        groupData={groupData}
        userId={userId}
        params={params}
        searchParams={searchParams}
      />
    </div>
  );
};

export default Page;
