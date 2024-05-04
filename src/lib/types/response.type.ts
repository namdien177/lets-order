import { type ObjectType } from "@/lib/types/helper";

export const BaseResponseType = {
  unAuthenticated: "UN_AUTHENTICATED",
  unAuthorized: "UN_AUTHORIZED",
  invalid: "INVALID",
  forbidden: "FORBIDDEN",
  conflict: "CONFLICT",
  notFound: "NOT_FOUND",
  success: "SUCCESS",
  serverError: "SERVER_ERROR",
} as const;

export type BaseResponseType = ObjectType<typeof BaseResponseType>;

export type SuccessResponseData<
  T = undefined,
  meta extends Record<string, unknown> | undefined = undefined,
> = {
  type: (typeof BaseResponseType)["success"];
  data: T;
  message: string;
  meta: meta;
};

export type ServerErrorResponse = {
  type: typeof BaseResponseType.serverError;
  error: string;
  meta?: Record<string, unknown>;
};

export type NotFoundErrorResponse = {
  type: typeof BaseResponseType.notFound;
  error: string;
  meta?: Record<string, unknown>;
};

export type AuthErrorResponse = {
  type:
    | typeof BaseResponseType.unAuthenticated
    | typeof BaseResponseType.unAuthorized;
  error: string;
};

export type InvalidErrorResponse<T = undefined> = {
  type: typeof BaseResponseType.invalid | typeof BaseResponseType.forbidden;
  error: string;
  meta: T;
};
