import { z } from "zod";
import { ORDER_EVENT_STATUS } from "@/server/db/constant";

export const eventStatusSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum([
    ORDER_EVENT_STATUS.CANCELLED,
    ORDER_EVENT_STATUS.DRAFT,
    ORDER_EVENT_STATUS.ACTIVE,
    ORDER_EVENT_STATUS.LOCKED,
    ORDER_EVENT_STATUS.COMPLETED,
  ]),
});

export type EventStatusPayload = typeof eventStatusSchema._output;
