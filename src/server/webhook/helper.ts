import "server-only";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { type Webhook } from "svix";
import { headers } from "next/headers";

type BodyWithWebhook = {
  evt: WebhookEvent;
};

export const verifyWebhook = async (
  request: Request,
  wh: Webhook,
): Promise<
  { ok: false; error: string } | { ok: true; event: WebhookEvent }
> => {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return {
      error: "Error occurred -- no svix headers",
      ok: false,
    };
  }

  const body = (await request.json()) as BodyWithWebhook;
  let webhookEvent: WebhookEvent;

  // Verify the payload with the headers
  try {
    webhookEvent = wh.verify(JSON.stringify(body), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return {
      error: "Error occurred -- could not verify webhook",
      ok: false,
    };
  }

  return {
    event: webhookEvent,
    ok: true,
  };
};
