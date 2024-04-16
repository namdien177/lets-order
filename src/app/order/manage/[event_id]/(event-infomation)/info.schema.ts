import { z } from "zod";

export const editEventInfoSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(3).max(60),
});

export type EditEventInfoPayload = typeof editEventInfoSchema._output;
