import { z } from "zod";

export const createCartItemSchema = z.object({
  cartId: z.number().int().positive().nullable(),
  eventId: z.number(),
  item: z
    .object({
      id: z.number(),
      eventProductId: z.number(),
      name: z.string(),
      description: z.string(),
      price: z.number(),
    })
    .nullable(),
});

export type CreateCartPayload = z.infer<typeof createCartItemSchema>;
