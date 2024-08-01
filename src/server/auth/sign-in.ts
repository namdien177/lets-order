import db from "@/database";
import { and, eq, isNull } from "drizzle-orm";
import { users } from "@/database/schema/user";
import { compareHash } from "@/lib/encryption";

type SignInPayload = {
  email: string;
  password: string;
};

export const signInUser = async ({ email, password }: SignInPayload) => {
  const user = await db.query.users.findFirst({
    where: and(eq(users.email, email), isNull(users.deletedAt)),
  });

  if (!user) {
    return {
      user: null,
      message: "Email or Password is incorrect",
      log: "User not found",
    };
  }

  const isPasswordMatch = await compareHash(password, user.password);

  if (!isPasswordMatch) {
    return {
      user: null,
      message: "Email or Password is incorrect",
      log: "Incorrect password",
    };
  }

  return {
    user,
  };
};
