import { type NextRequest, NextResponse } from "next/server";
import {
  isPathMatchConfig,
  type MiddlewareConfigRoute,
} from "@/lib/middleware/path.helper";
import {
  DEFAULT_LANG,
  SUPPORT_LANGS,
  type SupportLang,
} from "@/lib/lang/types";
import { isPathBeginsWithLang } from "@/lib/lang/path.helper";
import { getCookieForLang, setCookieForLang } from "@/lib/lang/cookie.server";
import { isRequestAuthenticated } from "@/lib/auth/access-control";

const publicRoutes: Array<MiddlewareConfigRoute> = [
  "/",
  "/sign-in",
  "/sign-up",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

export default function Middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const pathHasLang = isPathBeginsWithLang(
    pathname,
    Object.values(SUPPORT_LANGS),
  );

  if (!pathHasLang) {
    let defaultLang: SupportLang = DEFAULT_LANG;
    // redirect to default language
    const langFromRequest = getCookieForLang(request);
    if (langFromRequest) {
      defaultLang = langFromRequest;
    }
    const redirectURL = `/${defaultLang}${pathname}`;
    const response = NextResponse.redirect(redirectURL, 301);
    // ensure cookie is refreshed
    setCookieForLang(defaultLang, response);
    return response;
  }

  if (isRequestAuthenticated(request)) {
    return NextResponse.next();
  }

  if (isPathMatchConfig(pathname, publicRoutes)) {
    return NextResponse.next();
  }

  const currentLang = pathname.split("/")[1];
  const redirectParams = new URLSearchParams({
    redirect: pathname,
  });
  // redirect to 401 page
  return NextResponse.redirect(
    `/${currentLang}/401?${redirectParams.toString()}`,
    301,
  );
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
