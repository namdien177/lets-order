import { type NextPageProps } from "@/lib/types/nextjs";
import { productUpsertSchema } from "@/app/g/[id]/(authorized)/menu/new/schema";
import { LogErrorAPI } from "@/lib/server/error-log/api.error-log";
import {
  ResponseAsJson,
  ResponseAsNotFound,
  ResponseAsUnauthenticated,
  ResponseAsValidationError,
} from "@/lib/server/response";
import { db } from "@/server/db";
import { OrderProducts } from "@/server/db/schema";
import { auth } from "@clerk/nextjs";
import { type NextRequest } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export const POST = async (
  req: NextRequest,
  { params: { id } }: NextPageProps<{ id: string }>,
) => {
  let groupId: number;
  try {
    groupId = z.coerce.number().min(1).parse(id);
  } catch (e) {
    return ResponseAsNotFound();
  }

  const { userId } = auth();

  if (!userId) {
    return ResponseAsUnauthenticated();
  }

  // check if the user is the owner of the group
  const groupInfo = await db.query.OrderGroups.findFirst({
    where: (table, { and, eq }) =>
      and(eq(table.id, groupId), eq(table.ownerClerkId, userId)),
  });

  if (!groupInfo) {
    return ResponseAsNotFound();
  }

  const validateProduct = productUpsertSchema.safeParse(await req.json());
  if (!validateProduct.success) {
    return ResponseAsValidationError(validateProduct.error.flatten());
  }

  const { data: product } = validateProduct;

  // create product
  try {
    const result = await db.insert(OrderProducts).values({
      name: product.name,
      description: product.description,
      price: product.price,
      originalId: product.originalId,
      orderGroupId: groupId,
    });

    revalidatePath(`/g/${groupId}/menu`);
    return ResponseAsJson({
      id: Number(result.insertId),
    });
  } catch (e) {
    LogErrorAPI(e, "POST /api/g/[id]/menu");
    throw new Response("Error creating product", { status: 500 });
  }
};
