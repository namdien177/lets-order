import { type Product } from "@/server/db/schema";

export type SelectProduct = Pick<
  Product,
  "id" | "name" | "description" | "price"
>;
