"use server";

import { type ProductUpsert } from "@/app/g/[id]/(authorized)/menu/new/schema";

const upsertAction = async (product: ProductUpsert) => {
  console.log(product);
};

export default upsertAction;
