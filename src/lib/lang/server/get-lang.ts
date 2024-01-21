import { type ConstType } from "@/lib/types/helper";

const SUPPORT_LANGS = {
  en: "en",
  vi: "vi",
} as const;

export type SupportLang = ConstType<typeof SUPPORT_LANGS>;
