"use server";

import { type UnSafePaginationParams } from "@/lib/types/pagination.types";
import { type Product } from "@/server/db/schema";
import { auth } from "@clerk/nextjs";
import {
  type AuthErrorResponse,
  BaseResponseType,
  type SuccessResponseData,
} from "@/lib/types/response.type";
import { searchOwnProduct } from "@/server/queries/product.query";

type QueryUserProductOptions = {
  queryOptions?: UnSafePaginationParams;
  withDeleted?: boolean;
  fromUser?: string;
};

export const queryUserProducts = async ({
  queryOptions,
  withDeleted,
  fromUser,
}: QueryUserProductOptions) => {
  const { userId } = auth();
  if (!userId) {
    return {
      type: BaseResponseType.unAuthenticated,
      error: "Unauthorized",
    } as AuthErrorResponse;
  }

  const productOwnerId = fromUser ?? userId;

  const { data, total } = await searchOwnProduct({
    ...queryOptions,
    clerkId: productOwnerId,
    withDelete: withDeleted,
  });

  return {
    type: BaseResponseType.success,
    data: {
      data,
      total,
    },
  } as SuccessResponseData<{ data: Product[]; total: number }>;
};
