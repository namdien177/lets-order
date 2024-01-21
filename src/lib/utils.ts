import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
