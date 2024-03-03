"use server";

import { type z } from "zod";
import { auth } from "@clerk/nextjs";
import { db } from "@/server/db";
import {
  type ProductUpsert,
  productUpsertSchema,
} from "@/app/g/[id]/(authorized)/menu/new/schema";
import { type OrderProduct, OrderProducts } from "@/server/db/schema";
import { revalidatePath } from "next/cache";
import { LogErrorAPI } from "@/lib/server/error-log/api.error-log";

const actionSchema = productUpsertSchema;

type CreateItemActionResponse =
  | {
      success: true;
      data: Pick<OrderProduct, "id">;
    }
  | {
      success: false;
      message: string;
      meta?: z.typeToFlattenedError<ProductUpsert>;
    };

export const createItemAction = async (
  formData: ProductUpsert,
): Promise<CreateItemActionResponse> => {
  const { userId } = auth();

  if (!userId) {
    return {
      success: false,
      message: "Unauthenticated",
    };
  }

  const validatePayload = actionSchema.safeParse(formData);

  if (!validatePayload.success) {
    return {
      success: false,
      message: "Invalid payload",
      meta: validatePayload.error.flatten(),
    };
  }

  const { groupId, ...product } = validatePayload.data;

  // check if the user is the owner of the group
  const groupInfo = await db.query.OrderGroups.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, groupId), eq(table.ownerClerkId, userId)),
  });

  if (!groupInfo) {
    return {
      success: false,
      message: "Group not found",
    };
  }

  // create product
  try {
    const [result] = await db
      .insert(OrderProducts)
      .values({
        name: product.name,
        description: product.description,
        price: product.price,
        originalId: product.originalId,
        orderGroupId: groupId,
      })
      .returning();

    if (!result) {
      throw new Error("Failed to create product");
    }

    revalidatePath(`/g/${groupId}/menu`);

    return {
      success: true,
      data: {
        id: Number(result.id),
      },
    };
  } catch (e) {
    LogErrorAPI(e, "POST /api/g/[id]/menu");
    return {
      success: false,
      message: "Error creating product",
    };
  }
};
