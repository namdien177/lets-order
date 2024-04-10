import CreateForm from "@/app/order/create/form";
import { auth } from "@clerk/nextjs";
import { type OrderEventPayload } from "@/app/order/create/schema";
import { db } from "@/server/db";
import { OrderEventProductTable, OrderEventTable } from "@/server/db/schema";
import { redirect } from "next/navigation";
import { generateRandomString } from "@/lib/utils";

const Page = async () => {
  const { userId } = auth();

  if (!userId) {
    return <>Unauthorized</>;
  }

  const createOrderAction = async (payload: OrderEventPayload) => {
    "use server";
    const createdOrder = await db.transaction(async (tx) => {
      const [orderEvent] = await tx
        .insert(OrderEventTable)
        .values({
          code: generateRandomString(12),
          clerkId: payload.clerkId,
          name: payload.name,
          endingAt: payload.endingAt,
        })
        .returning();

      if (!orderEvent) {
        tx.rollback();
        console.log("[ROLLBACK] !orderEvent");
        return null;
      }

      const productsInEvent = await tx
        .insert(OrderEventProductTable)
        .values(
          payload.items.map((item) => ({
            eventId: orderEvent.id,
            productId: item.id,
          })),
        )
        .returning();

      if (productsInEvent.length !== payload.items.length) {
        tx.rollback();
        console.log(
          "[ROLLBACK] productsInEvent.length !== payload.items.length",
        );
        return null;
      }

      return orderEvent;
    });

    if (!createdOrder) {
      const params = new URLSearchParams();
      params.append("error", "Failed to create order");
      return redirect(`/order/create?${params.toString()}`);
    }

    return redirect(`/order`);
  };

  return <CreateForm clerkId={userId} onSubmit={createOrderAction} />;
};

export default Page;
