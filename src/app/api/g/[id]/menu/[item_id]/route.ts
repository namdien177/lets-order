import { LogErrorAPI } from "@/lib/server/error-log/api.error-log";
import {
  ResponseAsJson,
  ResponseAsNotFound,
  ResponseAsUnauthenticated,
  ResponseAsUnauthorized,
  ResponseAsValidationError,
} from "@/lib/server/response";
import { type NextPageProps } from "@/lib/types/nextjs";
import { db } from "@/server/db";
import { OrderProducts } from "@/server/db/schema";
import { auth } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type NextRequest } from "next/server";
import { z } from "zod";

const pathParamSchema = z.object({
  id: z.coerce.number().min(1),
  item_id: z.coerce.number().min(1),
});

export const DELETE = async (
  req: NextRequest,
  { params }: NextPageProps<{ item_id: string; id: string }>,
) => {
  const { userId } = auth();
  const schemaResult = pathParamSchema.safeParse(params);

  if (!schemaResult.success) {
    return ResponseAsValidationError(schemaResult.error.flatten());
  }

  if (!userId) {
    return ResponseAsUnauthenticated();
  }

  const { id, item_id } = schemaResult.data;
  // check if the user is the owner of the group
  const groupInfo = await db.query.OrderGroups.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, id), eq(table.ownerClerkId, userId)),
  });

  if (!groupInfo) {
    return ResponseAsUnauthorized({
      message: "You are not the owner of this group",
    });
  }

  // check if the product exists
  const productInfo = await db.query.OrderProducts.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, item_id), eq(table.orderGroupId, id)),
  });

  if (!productInfo) {
    return ResponseAsNotFound();
  }

  // soft-delete the product
  try {
    await db
      .update(OrderProducts)
      .set({
        deletedAt: new Date(),
      })
      .where(
        and(eq(OrderProducts.id, item_id), eq(OrderProducts.orderGroupId, id)),
      );

    revalidatePath(`/g/${id}/menu`);
    return ResponseAsJson({});
  } catch (e) {
    LogErrorAPI(e, "DELETE /api/g/[id]/menu/[item_id]");
    return ResponseAsValidationError((e as Record<string, unknown>).message);
  }
};
