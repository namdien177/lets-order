"use client";

import {
  ORDER_EVENT_STATUS,
  type OrderEvent,
  type OrderEventStatus,
} from "@/server/db/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { isNullish } from "@/lib/utils";
import useOrderEventStatusMutation from "@/components/event-detail/mutations/useOrderEventStatus.mutation";

const EventStatusForm = ({
  status: initialStatus,
  id,
  className,
}: Pick<OrderEvent, "status" | "id"> & {
  className?: string;
  placeholder?: string;
}) => {
  const { mutateAsync, data, isPending } = useOrderEventStatusMutation();

  const status = data?.data?.status ?? initialStatus;

  const ableToDraft = status === ORDER_EVENT_STATUS.CANCELLED;
  const ableToActive =
    status === ORDER_EVENT_STATUS.DRAFT ||
    status === ORDER_EVENT_STATUS.CANCELLED;
  const ableToComplete = status === ORDER_EVENT_STATUS.ACTIVE;
  const ableToCancel =
    status === ORDER_EVENT_STATUS.ACTIVE || status === ORDER_EVENT_STATUS.DRAFT;

  return (
    <div className={"flex items-center gap-4"}>
      <Select
        disabled={isPending}
        value={status}
        onValueChange={(value) =>
          mutateAsync({ id, status: value as OrderEventStatus })
        }
      >
        <SelectTrigger className={className}>
          {isNullish(status) ? (
            <SelectValue placeholder={"change status"} />
          ) : (
            <div className={"flex gap-2"}>
              {isPending && <Loader2 size={16} className={"animate-spin"} />}
              <span className={"font-semibold"}>
                {
                  {
                    [ORDER_EVENT_STATUS.DRAFT]: "Drafting",
                    [ORDER_EVENT_STATUS.ACTIVE]: "Active",
                    [ORDER_EVENT_STATUS.COMPLETED]: "Completed",
                    [ORDER_EVENT_STATUS.CANCELLED]: "Cancelled",
                  }[status]
                }
              </span>
            </div>
          )}
        </SelectTrigger>
        <SelectContent>
          {ableToDraft && (
            <SelectItem value={ORDER_EVENT_STATUS.DRAFT}>
              to Drafting state
            </SelectItem>
          )}
          {ableToActive && (
            <SelectItem value={ORDER_EVENT_STATUS.ACTIVE}>
              Activate Event
            </SelectItem>
          )}
          {ableToComplete && (
            <SelectItem value={ORDER_EVENT_STATUS.COMPLETED}>
              Complete Event
            </SelectItem>
          )}
          {ableToCancel && (
            <SelectItem value={ORDER_EVENT_STATUS.CANCELLED}>
              Cancel Event
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default EventStatusForm;
