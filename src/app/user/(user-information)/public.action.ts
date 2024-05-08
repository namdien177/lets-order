"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import {
  type AuthErrorResponse,
  BaseResponseType,
  type NotFoundErrorResponse,
  type ServerErrorResponse,
  type SuccessResponseData,
} from "@/lib/types/response.type";
import { db } from "@/server/db";
import { UserTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getClerkPublicData } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export const publicProfileAction = async (formData: FormData) => {
  const user = await currentUser();
  if (!user) {
    return {
      type: BaseResponseType.unAuthenticated,
      error: "You must be signed in to update your profile",
    } as AuthErrorResponse;
  }

  // check if the user has local profile
  const localProfile = await db.query.UserTable.findFirst({
    where: eq(UserTable.clerkId, user.id),
  });

  if (!localProfile) {
    return {
      type: BaseResponseType.notFound,
      error: "User profile not found",
    } as NotFoundErrorResponse;
  }

  // public profile attributes
  const avatarRaw = formData.get("avatar");
  let avatarUrl: string | null = null;
  const firstNameRaw = formData.get("firstName");
  const lastNameRaw = formData.get("lastName");
  const displayNameRaw = formData.get("displayName");
  const isPublicEmailRaw = formData.get("isPublicEmail");

  // update the user profile
  if (avatarRaw && avatarRaw instanceof File) {
    // update via clerk API
    const result = await clerkClient.users.updateUserProfileImage(user.id, {
      file: avatarRaw,
    });
    avatarUrl = result.imageUrl;
  }

  const { clerkEmail } = getClerkPublicData(user);

  const firstName = typeof firstNameRaw === "string" ? firstNameRaw : null;
  const lastName = typeof lastNameRaw === "string" ? lastNameRaw : null;
  const displayName =
    typeof displayNameRaw === "string" ? displayNameRaw : undefined;
  const isPublicEmail =
    typeof isPublicEmailRaw === "string"
      ? isPublicEmailRaw === "true" || isPublicEmailRaw === "false"
        ? isPublicEmailRaw === "true"
        : false
      : null;

  try {
    // update the local profile
    const [result] = await db
      .update(UserTable)
      .set({
        clerkAvatar: avatarUrl ?? undefined,
        firstName,
        lastName,
        displayName,
        displayEmail: isPublicEmail ? clerkEmail ?? null : null,
      })
      .where(eq(UserTable.clerkId, user.id))
      .returning();

    if (result) {
      revalidatePath("/user");

      return {
        type: BaseResponseType.success,
        message: "Profile updated successfully",
        data: {
          firstName: result.firstName,
          lastName: result.lastName,
          displayName: result.displayName,
          displayEmail: result.displayEmail,
          primaryEmail: result.primaryEmail,
          clerkAvatar: result.clerkAvatar,
        },
      } as SuccessResponseData<
        Pick<
          typeof result,
          | "firstName"
          | "lastName"
          | "displayName"
          | "displayEmail"
          | "primaryEmail"
          | "clerkAvatar"
        >
      >;
    }
  } catch (error) {
    console.error(error);
  }

  return {
    type: BaseResponseType.serverError,
    error: "Failed to update profile",
  } as ServerErrorResponse;
};
