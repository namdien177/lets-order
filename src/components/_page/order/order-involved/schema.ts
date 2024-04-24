import { z } from "zod";
import { ORDER_EVENT_STATUS, ORDER_PAYMENT_STATUS } from "@/server/db/constant";

export const eventStatusSchema = z.array(
  z
    .number()
    .int()
    .min(ORDER_EVENT_STATUS.CANCELLED)
    .max(ORDER_EVENT_STATUS.COMPLETED),
);

export const paymentStatusSchema = z.enum([
  ORDER_PAYMENT_STATUS.PAID,
  ORDER_PAYMENT_STATUS.PENDING,
]);

export const filteringSchema = z.object({
  eventStatus: eventStatusSchema,
  paymentStatus: paymentStatusSchema,
});
