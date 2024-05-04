"use server";
import type { User } from "@clerk/backend";
import { type UserInsert, UserTable } from "@/server/db/schema";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";

export const updateClerkUser = async (
  clerkUser: Pick<User, "id">,
  body: Pick<
    UserInsert,
    "displayEmail" | "displayName" | "firstName" | "lastName" | "primaryEmail"
  >,
) => {
  const updateResult = await db
    .update(UserTable)
    .set({
      displayEmail: body.displayEmail,
      displayName: body.displayName,
      firstName: body.firstName,
      lastName: body.lastName,
    })
    .where(eq(UserTable.clerkId, clerkUser.id))
    .run();

  return updateResult.rowsAffected === 1;
};
