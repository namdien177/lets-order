import { type Optional } from "@/lib/types/helper";
import { type z } from "zod";

export type PaginationQueryParams = {
  page?: Optional<number>;
  per_page?: Optional<number>;
  keyword?: Optional<string>;
};

export type PaginationQueryParamsZodParse = z.SafeParseReturnType<
  PaginationQueryParams,
  PaginationQueryParams
>;
