import { type ObjectType } from "@/lib/types/helper";

const SUPPORT_LANGS = {
  en: "en",
  vi: "vi",
} as const;

export type SupportLang = ObjectType<typeof SUPPORT_LANGS>;
