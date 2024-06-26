import { add } from "date-fns";
import { z } from "zod";

export const OrderEventCreationSchema = z.object({
  name: z.string().min(3).max(60),
  endingAt: z
    .date()
    .min(add(new Date(), { minutes: 10 }))
    .nullish(),
  clerkId: z.string().trim().min(1),
  items: z.array(
    z.object({
      id: z.number().int().min(0),
    }),
  ),
});

export type OrderEventPayload = typeof OrderEventCreationSchema._output;
