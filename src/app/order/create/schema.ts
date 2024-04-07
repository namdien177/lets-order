import { add } from "date-fns";
import { z } from "zod";

export const OrderEventCreationSchema = z.object({
  name: z.string().min(1).max(60),
  endingAt: z.date().min(add(new Date(), { minutes: 10 })),
  clerkId: z.string().uuid(),
  items: z.array(z.number().int().min(0)),
});

export type OrderEventPayload = typeof OrderEventCreationSchema._output;
