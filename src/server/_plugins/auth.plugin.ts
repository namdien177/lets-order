import Elysia from "elysia";
import bearer from "@elysiajs/bearer";
import jwt from "@elysiajs/jwt";
import { env } from "@/env";

export const AuthPlugin = () => {
  return new Elysia({ name: "plugin.auth" })
    .use(bearer())
    .use(jwt({ secret: env.APP_SECRET, name: "jwt" }))
    .derive({ as: "scoped" }, async ({ cookie: { access_token }, jwt }) => {
      const token = access_token?.value;
      if (!token) {
        return {
          user: null,
        };
      }
      const verifiedToken = await jwt.verify(token);
      if (!verifiedToken) {
        // invalid token
        access_token.remove();
        return {
          user: null,
        };
      }
      return {
        user: {
          id: verifiedToken.id as number,
          email: verifiedToken.email,
        },
      };
    });
};
