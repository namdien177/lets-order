"use server";

import { type CreateProductPayload } from "@/app/product/create/schema";
import { auth } from "@clerk/nextjs/server";
import {
  type AuthErrorResponse,
  BaseResponseType,
  type ServerErrorResponse,
  type SuccessResponseData,
} from "@/lib/types/response.type";
import { db } from "@/server/db";
import { type Product, ProductTable } from "@/server/db/schema";

export const createProductAction = async (payload: CreateProductPayload) => {
  const { userId } = auth();

  if (!userId) {
    return {
      type: BaseResponseType.unAuthenticated,
      error: "Unauthorized",
    } as AuthErrorResponse;
  }

  try {
    const [inserted] = await db
      .insert(ProductTable)
      .values({
        ...payload,
        clerkId: userId,
      })
      .returning();

    if (!inserted) {
      return {
        type: BaseResponseType.serverError,
        error: "unable to create product",
      } as ServerErrorResponse;
    }

    return {
      type: BaseResponseType.success,
      data: {
        id: inserted.id,
        name: inserted.name,
        description: inserted.description,
        price: inserted.price,
        createdAt: inserted.createdAt,
      },
      message: "Product created successfully",
    } as SuccessResponseData<
      Pick<Product, "id" | "name" | "description" | "price" | "createdAt">
    >;
  } catch (e) {
    return {
      type: BaseResponseType.serverError,
      error: "unable to create product",
    } as ServerErrorResponse;
  }
};
