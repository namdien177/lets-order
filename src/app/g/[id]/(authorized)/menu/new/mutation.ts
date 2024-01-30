import getKy from "@/lib/http";
import useAuthKy from "@/lib/http/useAuthKy";
import { useMutation } from "@tanstack/react-query";
import { type ProductUpsert } from "./schema";

export const useUpsertItem = (groupId: number) => {
  const httpClient = useAuthKy(getKy());
  return useMutation({
    mutationKey: ["upsert-product"],
    mutationFn: async (data: ProductUpsert) => {
      const ky = await httpClient();
      return ky
        .post(`/api/g/${groupId}/menu`, {
          json: data,
        })
        .json<{ id: number }>();
    },
  });
};
