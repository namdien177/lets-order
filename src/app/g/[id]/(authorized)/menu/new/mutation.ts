import { useMutation } from "@tanstack/react-query";
import { type ProductUpsert } from "./schema";
import { createItemAction } from "@/app/g/[id]/(authorized)/menu/new/action";

export const useUpsertItem = () =>
  useMutation({
    mutationKey: ["upsert-product"],
    mutationFn: async (data: ProductUpsert) => createItemAction(data),
  });
