import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type QueryParamsWithSearch } from "@/lib/types/pagination.types";
import { type Nullish, type Optional } from "@/lib/types/helper";
import { z } from "zod";

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
  raw: QueryParamsWithSearch,
  opts?: {
    defaultPage?: number;
    defaultPerPage?: number;
  },
) {
  let page = opts?.defaultPage ?? 1;
  let limit = opts?.defaultPerPage ?? 10;
  let keyword: Optional<string> = undefined;

  try {
    page = isNullish(raw.page) ? page : z.coerce.number().parse(raw.page);
    limit = isNullish(raw.limit) ? limit : z.coerce.number().parse(raw.limit);
    keyword = isNullish(raw.keyword)
      ? keyword
      : z.coerce.string().parse(raw.keyword);
  } catch (err) {
    // ignore
  }
  return { page, limit, keyword };
}

// function to random a string with specified length
export const generateRandomString = (length: number) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const formatAsMoney = (value: Nullish<number>, onNullish = "") => {
  if (isNullish(value)) {
    return onNullish;
  }

  return Intl.NumberFormat("vi-VN", {
    currency: "VND",
  }).format(value);
};
