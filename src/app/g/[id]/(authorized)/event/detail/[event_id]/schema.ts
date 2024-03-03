import { z } from "zod";
import { addMinutes } from "date-fns";

export const eventBasicInfoSchema = z.object({
  event_id: z.number(),
  id: z.number(),

  name: z.string().max(256).min(1),
  endingAt: z.coerce.date().min(addMinutes(new Date(), 15)).nullable(),
});

export type EventBasicInfoSchema = z.infer<typeof eventBasicInfoSchema>;
