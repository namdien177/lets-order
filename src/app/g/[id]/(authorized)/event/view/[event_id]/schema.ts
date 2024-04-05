import { z } from "zod";

export const schema = z.object({
  groupId: z.number(),
  eventId: z.number(),
  userId: z.string(),
  items: z.array(
    z.object({
      id: z.number(),
      amount: z.number().min(0),
    }),
  ),
});
export type FormOrderEvent = z.infer<typeof schema>;
