import { useMutation } from "@tanstack/react-query";
import type { OrderEventStatus } from "@/server/db/schema";
import { updateEventStatus } from "@/components/event-detail/action";

const useOrderEventStatusMutation = () => {
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderEventStatus }) =>
      updateEventStatus(id, status),
  });
};

export default useOrderEventStatusMutation;
