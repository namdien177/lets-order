import "server-only";
import { UserTable } from "@/server/db/schema";
import { db } from "@/server/db";
import { Webhook } from "svix";
import { env } from "@/env";
import { verifyWebhook } from "@/server/webhook/helper";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getClerkPublicData, isNullish } from "@/lib/utils";
import { insertNewClerkUser } from "@/server/webhook/clerk-user/sync-user/insert-user";
import { updateClerkUser } from "@/server/webhook/clerk-user/sync-user/update-user";

export const POST = async (request: Request) => {
  const whs = env.WEBHOOK_SECRET_CLERK_USER;

  if (!whs) {
    return new NextResponse("Webhook secret not set", {
      status: 500,
    });
  }

  // Create a new Svix instance with your secret.
  const wh = new Webhook(whs);
  const result = await verifyWebhook(request, wh);

  if (!result.ok) {
    return new NextResponse(result.error, {
      status: 400,
    });
  }

  const eventInfo = result.event;
  if (eventInfo.type === "user.created" || eventInfo.type === "user.updated") {
    const {
      firstName,
      lastName,
      clerkName: displayName,
      clerkEmail: primaryEmail,
    } = getClerkPublicData({
      username: eventInfo.data.username,
      emailAddresses: eventInfo.data.email_addresses.map((emailRecord) => ({
        id: emailRecord.id,
        emailAddress: emailRecord.email_address,
      })),
      primaryEmailAddressId: eventInfo.data.primary_email_address_id,
      firstName: eventInfo.data.first_name,
      lastName: eventInfo.data.last_name,
    });

    if (eventInfo.type === "user.created") {
      const insertResult = await insertNewClerkUser(eventInfo.data.id, {
        displayName: displayName ?? "N/A",
        firstName,
        lastName,
        primaryEmail,
      });

      if (insertResult) {
        console.log(
          `[Webhook] New clerk user "${displayName ?? eventInfo.data.id}" inserted`,
        );

        return new NextResponse("OK", { status: 200 });
      }
      return new NextResponse("Failed to insert new clerk user", {
        status: 500,
      });
    }

    if (eventInfo.type === "user.updated") {
      const foundUser = await findLocalUser(eventInfo.data.id);

      if (!foundUser) {
        // try to insert in case of the old user
        const insertResult = await insertNewClerkUser(eventInfo.data.id, {
          displayName: displayName ?? "N/A",
          firstName,
          lastName,
          primaryEmail,
        });
        if (insertResult) {
          console.log(
            `[Webhook] New clerk user "${displayName ?? eventInfo.data.id}" inserted`,
          );

          return new NextResponse("OK", { status: 200 });
        }
        return new NextResponse("Failed to insert new clerk user", {
          status: 500,
        });
      }

      const isUpdatedDisplayEmail = isNullish(foundUser.displayEmail)
        ? false // no need to update display email if it's null
        : foundUser.primaryEmail !== primaryEmail;

      const updateResult = await updateClerkUser(eventInfo.data, {
        displayEmail: isUpdatedDisplayEmail
          ? primaryEmail
          : foundUser.displayEmail,
        displayName: displayName ?? "N/A",
        firstName,
        lastName,
        primaryEmail,
      });

      if (updateResult) {
        console.log(
          `[Webhook] Clerk user "${displayName ?? eventInfo.data.id}" updated`,
        );

        return new NextResponse("OK", { status: 200 });
      }
      return new NextResponse("Failed to update clerk user", { status: 500 });
    }
  }
};

const findLocalUser = async (clerkId: string) => {
  return db.query.UserTable.findFirst({
    where: eq(UserTable.clerkId, clerkId),
  });
};
