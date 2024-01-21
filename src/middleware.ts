import { authMiddleware } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
  publicRoutes: ["/", "/g"],
  // afterAuth: ({ isApiRoute, isPublicRoute, userId }, req) => {
  //   if (!userId && !isPublicRoute) {
  //     return redirectToSignIn({ returnBackUrl: req.url }) as void;
  //   }
  //
  //   if (isApiRoute) {
  //     // let the request handle itself
  //     return NextResponse.next();
  //   }
  //
  //   // check if have local user -> fw user back to initial
  // },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
