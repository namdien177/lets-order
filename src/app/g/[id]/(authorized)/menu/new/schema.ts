import { z } from "zod";

export const productUpsertSchema = z.object({
  name: z.string().max(60).min(1),
  description: z.string().max(255).optional(),
  price: z.number().min(0).int(),
  originalId: z.number().int().optional(),
  orderGroupId: z.number().int(),
});

export type ProductUpsert = z.infer<typeof productUpsertSchema>;
