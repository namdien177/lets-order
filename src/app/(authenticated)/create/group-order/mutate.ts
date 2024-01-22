import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import getKy from "@/lib/http";
import useAuthKy from "@/lib/http/useAuthKy";

export const groupOrderCreateSchema = z.object({
  name: z.string().max(60).min(3),
  description: z.string().max(256).optional(),
  inviteCode: z.string().max(100).min(3),
});
export type GroupOrderCreate = z.infer<typeof groupOrderCreateSchema>;

const useCreateGroupOrder = () => {
  const authKy = useAuthKy(getKy());
  return useMutation({
    mutationKey: ["create-group-order"],
    mutationFn: async (payload: GroupOrderCreate) =>
      (await authKy()).post("/api/group-order", { json: payload }).json<{
        data: { id: number };
      }>(),
  });
};

export default useCreateGroupOrder;
