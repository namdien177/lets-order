import { type Product } from "@/database/db/schema";

export type SelectProduct = Pick<
  Product,
  "id" | "name" | "description" | "price"
>;
