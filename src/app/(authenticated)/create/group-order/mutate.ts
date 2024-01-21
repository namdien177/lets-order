import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import getKy from "@/lib/http";

export const groupOrderCreateSchema = z.object({
  name: z.string().max(60).min(3),
  description: z.string().max(256).optional(),
  inviteCode: z.string().max(100).min(3),
});
export type GroupOrderCreate = z.infer<typeof groupOrderCreateSchema>;

const useCreateGroupOrder = () => {
  return useMutation({
    mutationKey: ["create-group-order"],
    mutationFn: (payload: GroupOrderCreate) =>
      getKy().post("/api/group-order", { json: payload }).json<{
        data: { id: number };
      }>(),
  });
};

export default useCreateGroupOrder;
