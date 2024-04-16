import { z } from "zod";
import { type Nullable } from "@/lib/types/helper";
import { type OrderPaymentStatus } from "@/server/db/constant";

export const cartItemSchema = z.object({
  id: z.number(),
  eventProductId: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
});

export type CartItemPayload = z.infer<typeof cartItemSchema>;

export const createCartItemSchema = z.object({
  eventId: z.number().int().positive(),
  cartId: z.number().int().positive().nullish(),
  items: z.array(cartItemSchema),
});

export type CreateCartPayload = z.infer<typeof createCartItemSchema>;

export type ShowingCart = {
  id: number;
  confirmedAt: Nullable<Date>;
  paymentAt: Nullable<Date>;
  paymentStatus: OrderPaymentStatus;
  items: Array<CartItemPayload>;
};
