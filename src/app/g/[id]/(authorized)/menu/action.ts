"use server";

// hide from the available ordering
import { db } from "@/server/db";
import { and, eq, isNull } from "drizzle-orm";
import { OrderProducts } from "@/server/db/schema";

export const deleteProduct = async (
  productId: number,
  groupId: number,
): Promise<{ success: true } | { success: false; message: string }> => {
  // check if there is any active event in the group
  const activeEvent = await db.query.OrderEvents.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.orderGroupId, groupId), isNull(table.endingAt)),
  }).execute();

  if (activeEvent) {
    return {
      success: false,
      message: "You can't delete a product from a group with an active event",
    };
  }

  // soft-delete the product
  const prod = await db
    .update(OrderProducts)
    .set({
      deletedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(OrderProducts.id, productId),
        eq(OrderProducts.orderGroupId, groupId),
      ),
    )
    .returning()
    .execute();

  if (prod.length === 0) {
    return {
      success: false,
      message: "Product not found",
    };
  }

  return {
    success: true,
  };
};
