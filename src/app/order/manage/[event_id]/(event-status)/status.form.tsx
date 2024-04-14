"use client";

import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ChevronsLeft,
  Info,
} from "lucide-react";
import {
  ORDER_EVENT_STATUS,
  type OrderEventStatus,
} from "@/server/db/constant";
import { type Optional } from "@/lib/types/helper";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type EventStatusPayload } from "@/app/order/manage/[event_id]/(event-status)/status.schema";
import { useMutation } from "@tanstack/react-query";
import { updateEventToStatus } from "@/app/order/manage/[event_id]/(event-status)/status.action";
import { BaseResponseType } from "@/lib/types/response.type";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const calculateStatusAction = (currentStatus: OrderEventStatus) => {
  let fullBackStatus: Optional<OrderEventStatus>;
  let previousStatus: Optional<OrderEventStatus>;
  let nextStatus: Optional<OrderEventStatus>;

  if (currentStatus === ORDER_EVENT_STATUS.DRAFT) {
    previousStatus = ORDER_EVENT_STATUS.CANCELLED;
    nextStatus = ORDER_EVENT_STATUS.ACTIVE;
  } else if (currentStatus === ORDER_EVENT_STATUS.ACTIVE) {
    fullBackStatus = ORDER_EVENT_STATUS.CANCELLED;
    previousStatus = ORDER_EVENT_STATUS.DRAFT;
    nextStatus = ORDER_EVENT_STATUS.COMPLETED;
  } else if (currentStatus === ORDER_EVENT_STATUS.COMPLETED) {
    // previousStatus = ORDER_EVENT_STATUS.ACTIVE;
  } else if (currentStatus === ORDER_EVENT_STATUS.CANCELLED) {
    nextStatus = ORDER_EVENT_STATUS.DRAFT;
  }

  return {
    fullBackStatus,
    previousStatus,
    currentStatus,
    nextStatus,
  };
};

type Props = {
  orderEvent: EventStatusPayload;
};

const EventStatusForm = ({ orderEvent }: Props) => {
  const { fullBackStatus, previousStatus, currentStatus, nextStatus } =
    calculateStatusAction(orderEvent.status);

  const warningClearOrder =
    (
      [
        ORDER_EVENT_STATUS.CANCELLED,
        ORDER_EVENT_STATUS.DRAFT,
      ] as Optional<OrderEventStatus>[]
    ).includes(fullBackStatus) ||
    (
      [
        ORDER_EVENT_STATUS.CANCELLED,
        ORDER_EVENT_STATUS.DRAFT,
      ] as Optional<OrderEventStatus>[]
    ).includes(previousStatus);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: updateEventToStatus,
  });

  const updateStatus = async (status: OrderEventStatus) => {
    const result = await mutateAsync({
      id: orderEvent.id,
      status,
    });

    if (result.type === BaseResponseType.success) {
      toast.success(result.message);
      return;
    }

    toast.error(result.error);
  };

  return (
    <div className={"flex flex-col gap-4 rounded-md border p-4"}>
      <h1 className={"text-xl leading-tight"}>Event Status</h1>

      <div className="flex items-center gap-2">
        {fullBackStatus && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => updateStatus(fullBackStatus)}
                  disabled={isPending}
                  size={"icon"}
                  variant={"outline"}
                  className={cn({
                    "flex-1": !previousStatus && !nextStatus,
                  })}
                >
                  <ChevronsLeft size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className={"cursor-pointer capitalize"}>
                  to {fullBackStatus.toLocaleLowerCase()}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {previousStatus && (
          <>
            <Button
              onClick={() => updateStatus(previousStatus)}
              disabled={isPending}
              className={cn("capitalize", {
                "flex-1": !nextStatus,
              })}
            >
              to {previousStatus.toLocaleLowerCase()}
            </Button>

            <ArrowLeft size={16} />
          </>
        )}

        <div className="flex flex-col items-center">
          <small
            className={
              "text-[10px] uppercase leading-tight text-muted-foreground"
            }
          >
            current
          </small>
          <span className={"font-bold capitalize leading-tight"}>
            {currentStatus.toLocaleLowerCase()}
          </span>
        </div>

        {nextStatus && (
          <>
            <ArrowRight size={16} />

            <div className="flex flex-1">
              <Button
                onClick={() => updateStatus(nextStatus)}
                disabled={isPending}
                className={"w-full capitalize"}
              >
                to {nextStatus.toLocaleLowerCase()}
              </Button>
            </div>
          </>
        )}
      </div>

      {orderEvent.status === ORDER_EVENT_STATUS.ACTIVE && (
        <div
          className={
            "flex select-none items-center gap-2 text-muted-foreground"
          }
        >
          <Info size={16} />

          <span>
            Once being marked as <b className={"underline"}>Completed</b>, you
            cannot change the event status anymore.
          </span>
        </div>
      )}

      {warningClearOrder && (
        <div className={"flex select-none items-center gap-2 text-destructive"}>
          <AlertTriangle size={16} />

          <span>
            Once being marked as <b className={"underline"}>Draft</b> or{" "}
            <b className={"underline"}>Cancelled</b>, all existing order will be
            cleared.
          </span>
        </div>
      )}
    </div>
  );
};

export default EventStatusForm;
