import { useMutation } from "@tanstack/react-query";
import { updateEventStatus } from "@/app/g/[id]/(authorized)/event/detail/[event_id]/action";
import { type OrderEventStatus } from "@/server/db/schema";

export const useOrderEventMutation = () => {
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderEventStatus }) =>
      updateEventStatus(id, status),
  });
};
