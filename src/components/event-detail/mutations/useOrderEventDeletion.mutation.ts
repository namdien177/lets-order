import { useMutation } from "@tanstack/react-query";
import { deleteEvent } from "@/components/event-detail/action";

const useOrderEventDeletionMutation = () => {
  return useMutation({
    mutationFn: (id: number) => deleteEvent(id),
  });
};

export default useOrderEventDeletionMutation;
