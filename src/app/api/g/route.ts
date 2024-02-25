import { type NextRequest } from "next/server";
import { groupOrderCreateSchema } from "@/app/(authenticated)/create/group-order/mutate";
import { db } from "@/server/db";
import { OrderGroups } from "@/server/db/schema";
import { auth } from "@clerk/nextjs";
import { LogErrorAPI } from "@/lib/server/error-log/api.error-log";
import {
  ResponseAsJson,
  ResponseAsServerError,
  ResponseAsUnauthenticated,
  ResponseAsValidationError,
} from "@/lib/server/response";

/**
 * API endpoint for creating a group order
 */
export const POST = async (req: NextRequest) => {
  const validatePayload = groupOrderCreateSchema.safeParse(await req.json());
  const { userId } = auth();

  if (!userId) {
    return ResponseAsUnauthenticated();
  }

  if (!validatePayload.success) {
    return ResponseAsValidationError(validatePayload.error.flatten());
  }

  try {
    const [createInstance] = await db
      .insert(OrderGroups)
      .values({
        name: validatePayload.data.name,
        description: validatePayload.data.description,
        inviteCode: validatePayload.data.inviteCode,
        ownerClerkId: userId,
      })
      .returning();

    if (!createInstance) {
      throw new Error("Failed to create a group order");
    }

    return ResponseAsJson({
      id: Number(createInstance.id),
    });
  } catch (e) {
    LogErrorAPI(e, "POST /api/g");
    return ResponseAsServerError((e as Record<string, unknown>).message);
  }
};
