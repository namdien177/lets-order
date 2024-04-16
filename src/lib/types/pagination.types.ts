import { type Optional } from "@/lib/types/helper";
import { type z } from "zod";

export type QueryParamsWithSearch = {
  page?: Optional<string>;
  limit?: Optional<string>;
  keyword?: Optional<string>;
};

export type PaginationParams = {
  page: Optional<number>;
  limit: Optional<number>;
  keyword?: Optional<string>;
};

export type QueryParamsWithSearchZodParse = z.SafeParseReturnType<
  QueryParamsWithSearch,
  QueryParamsWithSearch
>;
