import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type PaginationQueryParamsZodParse } from "@/lib/types/pagination.types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function numberPadding(num: number, length = 2) {
  return num.toString().padStart(length, "0");
}

export type HrefMatchType = "exact" | "prefix";

export function isMatchingPath(
  current: string,
  href: string,
  matchType: HrefMatchType,
) {
  if (matchType === "exact") {
    return current === href;
  } else {
    return current.startsWith(href);
  }
}

export function extractPaginationParams(
  validatedParams: PaginationQueryParamsZodParse,
  opts?: {
    defaultPage?: number;
    defaultPerPage?: number;
  },
) {
  const defaultPage = opts?.defaultPage ?? 1;
  const defaultPerPage = opts?.defaultPerPage ?? 10;
  const queryPage = validatedParams.success
    ? validatedParams.data.page ?? defaultPage
    : defaultPage;
  const queryPerPage = validatedParams.success
    ? validatedParams.data.per_page ?? defaultPerPage
    : defaultPerPage;
  const queryKeyword = validatedParams.success
    ? validatedParams.data.keyword?.trim() ?? undefined
    : undefined;
  return { queryPage, queryPerPage, queryKeyword };
}
