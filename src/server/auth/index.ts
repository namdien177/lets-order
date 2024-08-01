import Elysia, { error, t } from "elysia";
import { AuthPlugin } from "@/server/_plugins/auth.plugin";
import { signInUser } from "@/server/auth/sign-in";

export const AuthModule = new Elysia({ name: "module.auth", prefix: "/auth" })
  .use(AuthPlugin())
  .post(
    "/sign-in",
    async ({ body, jwt, cookie: { access_token } }) => {
      const { user, ...meta } = await signInUser(body);

      if (!user) {
        console.log(`sign-in failed for ${body.email}: ${meta.log}`);
        return error(401, meta.message);
      }

      if (user.verifiedAt === null) {
        return error(403, "Please verify your email address");
      }

      const signed = await jwt.sign({
        id: user.id,
        email: user.email,
      });

      access_token?.set({
        value: signed,
        httpOnly: true,
        maxAge: 7 * 60 * 60 * 24, // 7 days
        sameSite: "strict",
      });
    },
    {
      body: t.Object({
        email: t.String({
          minLength: 5,
          maxLength: 255,
        }),
        password: t.String({
          minLength: 3,
          maxLength: 255,
        }),
      }),
    },
  );
