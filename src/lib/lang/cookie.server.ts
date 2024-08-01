import { SUPPORT_LANGS, type SupportLang } from "@/lib/lang/types";
import { type NextRequest, type NextResponse } from "next/server";

const COOKIE_KEY = "lang";

export const setCookieForLang = (lang: SupportLang, response: NextResponse) => {
  response.cookies.set(COOKIE_KEY, lang, {
    // 6 months
    maxAge: 60 * 60 * 24 * 30 * 6,
    httpOnly: false,
    sameSite: "strict",
  });
};

export const getCookieForLang = (request: NextRequest): SupportLang | null => {
  const langFromReq = request.cookies.get(COOKIE_KEY)?.value ?? null;

  if (!langFromReq) {
    return null;
  }

  // ensure the lang is supported
  const isSupportedLang = Object.values(SUPPORT_LANGS).includes(
    langFromReq as never,
  );
  if (!isSupportedLang) {
    return null;
  }

  return langFromReq as SupportLang;
};
