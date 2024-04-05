import { z } from "zod";

export const FormSchema = () =>
  z.object({
    name: z.string(),
    endingAt: z.date().min(new Date()).optional(),
  });

export type FormSchemaType = z.infer<ReturnType<typeof FormSchema>>;
