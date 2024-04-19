import { type z } from "zod";

export type QueryParamsWithSearch = {
  page?: string;
  limit?: string;
  keyword?: string;
};

export type UnSafePaginationParams = {
  page?: number | string;
  limit?: number | string;
  keyword?: string;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
  keyword?: string;
};

export type QueryParamsWithSearchZodParse = z.SafeParseReturnType<
  QueryParamsWithSearch,
  QueryParamsWithSearch
>;
