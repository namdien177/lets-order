import { z } from "zod";
import { ORDER_EVENT_STATUS } from "@/server/db/constant";

export const eventStatusSchema = z.object({
  id: z.number().int().positive(),
  status: z
    .number()
    .int()
    .min(ORDER_EVENT_STATUS.CANCELLED, "Invalid status")
    .max(ORDER_EVENT_STATUS.COMPLETED, "Invalid status"),
});

export type EventStatusPayload = typeof eventStatusSchema._output;
