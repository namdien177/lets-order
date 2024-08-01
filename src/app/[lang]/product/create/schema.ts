import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number().int().positive(),
  clerkId: z.string(),
});

export type CreateProductPayload = typeof CreateProductSchema._output;
