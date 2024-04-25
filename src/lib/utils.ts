import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  PaginationParams,
  type SafePaginationParams,
  type UnSafePaginationParams,
} from "@/lib/types/pagination.types";
import { type Nullable, type Nullish, type Optional } from "@/lib/types/helper";
import { z } from "zod";
import { ORDER_EVENT_STATUS } from "@/server/db/constant";
import { type User } from "@clerk/backend";

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

export function getEventStatusVerbose(status: number) {
  switch (status) {
    case ORDER_EVENT_STATUS.CANCELLED:
      return "cancelled";
    case ORDER_EVENT_STATUS.DRAFT:
      return "drafting";
    case ORDER_EVENT_STATUS.ACTIVE:
      return "active";
    case ORDER_EVENT_STATUS.LOCKED:
      return "locked";
    case ORDER_EVENT_STATUS.COMPLETED:
      return "completed";
    default:
      return "unknown";
  }
}

export const getClerkPublicData = (clerkUser: User) => {
  let clerkName: Nullable<string> =
    `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();
  if (clerkName.length === 0) {
    clerkName = null;
    if (clerkUser.username) {
      clerkName = clerkUser.username;
    }
  }
  const clerkEmail: Nullable<string> =
    (clerkUser.primaryEmailAddressId
      ? clerkUser.emailAddresses.find(
          (e) => e.id === clerkUser.primaryEmailAddressId,
        )?.emailAddress
      : null) ?? null;

  return { clerkName, clerkEmail };
};

export function extractPaginationParams(
  raw?: UnSafePaginationParams,
  opts?: {
    defaultPage?: number;
    defaultPerPage?: number;
    minKeywordLength?: number;
  },
): SafePaginationParams {
  let page = opts?.defaultPage ?? 1;
  let limit = opts?.defaultPerPage ?? 10;
  const minKeywordLength = opts?.minKeywordLength ?? 3;
  let keyword: Optional<string> = undefined;

  try {
    page = isNullish(raw?.page) ? page : z.coerce.number().parse(raw.page);
    page = page < 1 ? 1 : page;
    limit = isNullish(raw?.limit) ? limit : z.coerce.number().parse(raw.limit);
    limit = limit < 1 ? 1 : limit;
    keyword = isNullish(raw?.keyword) ? undefined : raw.keyword.trim();
    keyword =
      !isNullish(keyword) && keyword.length < minKeywordLength
        ? undefined
        : keyword;
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
