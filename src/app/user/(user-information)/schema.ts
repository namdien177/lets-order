import { z } from "zod";

export const ALLOWED_MIME_TYPE = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_SIZE = 1024 * 1024 * 5; // 5MB

export const publicProfileSchema = z.object({
  avatar: z
    .custom<string | File | null>((value) => {
      if (value === null) return false;
      if (typeof value === "string") return true;
      return value instanceof File;
    })
    .superRefine((value, ctx) => {
      if (typeof value === "string") {
        const validateResult = z.string().url().safeParse(value);
        if (!validateResult.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid URL",
            path: ["avatar"],
          });
        }
      }

      if (value instanceof File) {
        if (!ALLOWED_MIME_TYPE.includes(value.type)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid file type",
            path: ["avatar"],
          });
        }
        if (value.size > ALLOWED_SIZE) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "File size too large",
            path: ["avatar"],
          });
        }
      }
      return false;
    }),
  firstName: z.string().min(3).max(64).nullable(),
  lastName: z.string().min(3).max(64).nullable(),
  displayName: z.string().min(3).max(64),
  isPublicEmail: z.boolean().nullable(),
  primaryEmail: z.string().email().nullable(),
});

export type PublicProfilePayload = z.infer<typeof publicProfileSchema>;
