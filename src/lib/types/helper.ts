import { isNullish } from "@/lib/utils";

export type ObjectType<T> = T[keyof T];
export type ArrayType<T> = T extends Array<infer U> ? U : never;

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Nullish<T> = Nullable<Optional<T>>;

export const assertAsType: <R>(
  value: unknown,
  validator?: (v: unknown) => never,
) => asserts value is R = (value, validator) => {
  if (validator) {
    return validator(value);
  }
};

/**
 * Silent the typescript when we know the variable is not nullish.
 * @param val
 * @param throwable
 */
export const assertAsNonNullish: <R>(
  val: R,
  throwable?: true,
) => asserts val is Exclude<R, null | undefined> = (val, throwable) => {
  if (throwable && isNullish(val)) {
    throw {
      error: "asset_non_nullish",
      value: val,
    };
  }
};
