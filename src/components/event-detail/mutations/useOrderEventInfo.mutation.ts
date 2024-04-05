import { useMutation } from "@tanstack/react-query";
import { type EventBasicInfoSchema } from "@/components/event-detail/schema";
import { updateEventInfo } from "@/components/event-detail/action";

const useOrderEventInfoMutation = () => {
  return useMutation({
    mutationFn: (orderEventInfo: EventBasicInfoSchema) =>
      updateEventInfo(orderEventInfo),
  });
};

export default useOrderEventInfoMutation;
