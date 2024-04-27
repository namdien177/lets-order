import "server-only";
import { type User } from "@clerk/backend";
import { type UserInsert, UserTable } from "@/server/db/schema/user";
import { db } from "@/server/db";
import { Webhook } from "svix";
import { env } from "@/env";
import { verifyWebhook } from "@/server/webhook/helper";
import { eq } from "drizzle-orm";

export const POST = async (request: Request) => {
  // Create a new Svix instance with your secret.
  const wh = new Webhook(env.WEBHOOK_SECRET_CLERK_USER);
  const result = await verifyWebhook(request, wh);

  if (!result.ok) {
    return new Response(result.error, {
      status: 400,
    });
  }

  const eventInfo = result.event;
  if (eventInfo.type === "user.created" || eventInfo.type === "user.updated") {
    let userEmail: string | undefined;
    let displayName: string | undefined;
    const primaryEmail = eventInfo.data.email_addresses.find(
      (emailInfo) => emailInfo.id === eventInfo.data.primary_email_address_id,
    );
    if (primaryEmail) {
      userEmail = primaryEmail.email_address;
    }

    const { username, last_name, first_name } = eventInfo.data;
    if (last_name && first_name) {
      displayName = `${last_name} ${first_name}`;
    } else if (username) {
      displayName = username;
    } else if (userEmail) {
      displayName = userEmail.split("@")[0] ?? "N/A";
    } else {
      displayName = "N/A";
    }

    if (eventInfo.type === "user.created") {
      const insertResult = await insertNewClerkUser(eventInfo.data, {
        email: userEmail,
        display_name: displayName,
      });

      if (insertResult) {
        console.log(
          `[Webhook] New clerk user "${userEmail ?? displayName}" inserted`,
        );

        return new Response("OK", { status: 200 });
      }
      return new Response("Failed to insert new clerk user", { status: 500 });
    }

    if (eventInfo.type === "user.updated") {
      const updateResult = await updateClerkUser(eventInfo.data, {
        email: userEmail,
        display_name: displayName,
      });

      if (updateResult) {
        console.log(
          `[Webhook] Clerk user "${userEmail ?? displayName}" updated`,
        );

        return new Response("OK", { status: 200 });
      }
      return new Response("Failed to update clerk user", { status: 500 });
    }
  }
};

const insertNewClerkUser = async (
  clerkUser: Pick<User, "id">,
  body: Pick<UserInsert, "email" | "display_name">,
) => {
  const insertResult = await db.insert(UserTable).values({
    clerkId: clerkUser.id,
    email: body.email,
    display_name: body.display_name,
  });

  return insertResult.rowsAffected === 1;
};

const updateClerkUser = async (
  clerkUser: Pick<User, "id">,
  body: Pick<UserInsert, "email" | "display_name">,
) => {
  const updateResult = await db
    .update(UserTable)
    .set({
      email: body.email,
      display_name: body.display_name,
    })
    .where(eq(UserTable.clerkId, clerkUser.id))
    .run();

  return updateResult.rowsAffected === 1;
};
