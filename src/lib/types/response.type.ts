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
  T,
  meta extends Record<string, unknown> | undefined = undefined,
> = {
  type: (typeof BaseResponseType)["success"];
  data: T;
  meta: meta;
};

export type ServerErrorResponse = {
  type: typeof BaseResponseType.serverError;
  error: string;
  meta?: Record<string, unknown>;
};

export type AuthErrorResponse = {
  type:
    | typeof BaseResponseType.unAuthenticated
    | typeof BaseResponseType.unAuthorized;
  error: string;
};

export type InvalidResponse<T> = {
  type: typeof BaseResponseType.invalid;
  error: string;
  meta: T;
};
