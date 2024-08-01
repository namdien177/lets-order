import { type ObjectType } from "@/lib/types/helper";

export const SUPPORT_LANGS = {
  en: "en",
  vi: "vi",
} as const;

export const DEFAULT_LANG = SUPPORT_LANGS.vi;

export type SupportLang = ObjectType<typeof SUPPORT_LANGS>;
