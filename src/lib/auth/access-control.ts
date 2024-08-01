import "server-only";

import { type NextRequest } from "next/server";

import jwt from "jsonwebtoken";
import { env } from "@/env";

export const isRequestAuthenticated = (request: NextRequest) => {
  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) {
    return false;
  }

  try {
    const user = jwt.verify(accessToken, env.APP_SECRET);
    return !!user;
  } catch (e) {
    return false;
  }
};
