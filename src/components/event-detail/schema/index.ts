import { z } from "zod";
import { addMinutes, isAfter } from "date-fns";
import { isNullish } from "@/lib/utils";

export const eventBasicInfoSchema = z.object({
  event_id: z.number(),
  id: z.number(),

  name: z.string().max(256).min(1),
  endingAt: z.coerce
    .date()
    .nullable()
    .optional()
    .refine((date) => {
      if (isNullish(date)) {
        return true;
      }

      const minimumStartDate = addMinutes(new Date(), 15);
      return isAfter(date, minimumStartDate);
    }, "Ending date should be at least 15 minutes after the current date"),
});

export type EventBasicInfoSchema = z.infer<typeof eventBasicInfoSchema>;
