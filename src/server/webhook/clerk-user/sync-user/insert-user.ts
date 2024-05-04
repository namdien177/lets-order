"use server";

import { type UserInsert, UserTable } from "@/server/db/schema";
import { db } from "@/server/db";

export type InsertPayload = Pick<
  UserInsert,
  "displayEmail" | "displayName" | "firstName" | "lastName" | "primaryEmail"
>;

export const insertNewClerkUser = async (
  clerkId: string,
  body: InsertPayload,
) => {
  const insertResult = await db.insert(UserTable).values({
    clerkId,
    displayEmail: body.displayEmail,
    displayName: body.displayName,
    firstName: body.firstName,
    lastName: body.lastName,
  });

  return insertResult.rowsAffected === 1;
};
