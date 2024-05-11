"use server";
import { currentUser } from "@clerk/nextjs/server";
import {
  type AuthErrorResponse,
  BaseResponseType,
  type InvalidErrorResponse,
  type ServerErrorResponse,
  type SuccessResponseData,
} from "@/lib/types/response.type";
import { getClerkPublicData } from "@/lib/utils";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { insertNewClerkUser } from "@/server/webhook/clerk-user/sync-user/insert-user";

const syncClerkUser = async () => {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return {
      type: BaseResponseType.unAuthenticated,
      error: "User not authenticated",
    } as AuthErrorResponse;
  }

  const existingUser = await db.query.UserTable.findFirst({
    where: (table) => eq(table.clerkId, clerkUser.id),
  });

  if (existingUser) {
    revalidatePath("/user");
    // forbidden
    return {
      type: BaseResponseType.forbidden,
      error: "User already synced",
    } as InvalidErrorResponse;
  }

  const { clerkName, firstName, lastName, clerkEmail } =
    getClerkPublicData(clerkUser);

  const insertResult = await insertNewClerkUser(clerkUser.id, {
    displayEmail: clerkEmail ?? "N/A",
    displayName: clerkName ?? "N/A",
    firstName: firstName ?? "N/A",
    lastName: lastName ?? "N/A",
  });

  if (insertResult) {
    revalidatePath("/user");
    return {
      type: BaseResponseType.success,
      message: "User synced successfully",
    } as SuccessResponseData;
  }
  console.error(`Failed to sync user [${clerkUser.id}]`);
  return {
    type: BaseResponseType.serverError,
    error: "Failed to sync user",
  } as ServerErrorResponse;
};

export default syncClerkUser;
