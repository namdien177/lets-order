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
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Loader2, Trash } from "lucide-react";
import { cn, isNullish } from "@/lib/utils";
import { type EventBasicInfoSchema } from "@/app/g/[id]/(authorized)/event/detail/[event_id]/schema";
import { Label } from "@/components/ui/label";
import { INPUT_CLASSNAME } from "@/components/ui/input";
import DatePicker from "@/components/date-picker";
import { TimeCompoundPicker } from "@/components/timepicker";
import ErrorField from "@/components/form/error-field";
import { useOrderEventMutation } from "@/app/g/[id]/(authorized)/event/detail/[event_id]/mutation";

export const EventStatusForm = ({
  status: initialStatus,
  id,
  className,
}: Pick<OrderEvent, "status" | "id"> & {
  className?: string;
  placeholder?: string;
}) => {
  const { mutateAsync, data, isPending } = useOrderEventMutation();

  const status = data?.data?.status ?? initialStatus;

  const ableToDraft = status === ORDER_EVENT_STATUS.CANCELLED;
  const ableToActive =
    status === ORDER_EVENT_STATUS.DRAFT ||
    status === ORDER_EVENT_STATUS.CANCELLED;
  const ableToComplete = status === ORDER_EVENT_STATUS.ACTIVE;
  const ableToCancel =
    status === ORDER_EVENT_STATUS.ACTIVE || status === ORDER_EVENT_STATUS.DRAFT;

  const ableToDelete =
    status === ORDER_EVENT_STATUS.DRAFT ||
    status === ORDER_EVENT_STATUS.CANCELLED;

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

      {ableToDelete && (
        <Button variant={"destructive"} className={"aspect-square p-0"}>
          <Trash size={16} />
        </Button>
      )}
    </div>
  );
};

const ChangedLabel = () => {
  return (
    <div
      className={
        "absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 transform rounded-lg bg-yellow-500"
      }
    ></div>
  );
};

export const EventBasicInfo = ({
  initialData,
  className,
  eventStatus,
}: {
  initialData: EventBasicInfoSchema;
  eventStatus: OrderEventStatus;
  className?: string;
}) => {
  const {
    register,
    formState: { dirtyFields, errors },
    control,
  } = useForm<EventBasicInfoSchema>({
    defaultValues: initialData,
  });

  const endingTimeWatch = useWatch({
    control,
    name: "endingAt",
  });

  console.log(dirtyFields);

  return (
    <form
      className={cn(
        "flex flex-col gap-8 rounded-lg bg-background p-4 shadow-md",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <Label className="text-sm text-gray-500">Event Title</Label>
        <fieldset
          disabled={eventStatus !== ORDER_EVENT_STATUS.DRAFT}
          className="relative w-full"
        >
          {dirtyFields.name && <ChangedLabel />}
          <input
            className={cn(
              INPUT_CLASSNAME,
              "w-full border-none pl-0 text-2xl font-bold",
              {
                "pl-4": dirtyFields.name,
              },
            )}
            {...register("name")}
          />
        </fieldset>

        <ErrorField errors={errors} name={"name"} />
      </div>

      <fieldset
        disabled={eventStatus !== ORDER_EVENT_STATUS.DRAFT}
        className="flex flex-col gap-1"
      >
        <Label className={"text-sm text-gray-500"}>Ending at</Label>

        <Controller
          control={control}
          name={"endingAt"}
          render={({ field }) => (
            <DatePicker
              clearable
              placeholder={"Select a date"}
              value={field.value ?? undefined}
              onSelected={(date) => field.onChange(date)}
              disabled={field.disabled}
            />
          )}
        />

        {
          // must have date selected first to have time select appear
          isNullish(endingTimeWatch) ? null : (
            <Controller
              control={control}
              name={"endingAt"}
              render={({ field }) => (
                <TimeCompoundPicker
                  className={"mt-2"}
                  value={field.value ?? undefined}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={field.disabled}
                />
              )}
            />
          )
        }

        <small className={"text-gray-500"}>
          You can skip this field if you don&apos;t want to set an ending time
        </small>

        <ErrorField errors={errors} name={"endingAt"} />
      </fieldset>

      {
        // only show button if event is in draft state
        eventStatus === ORDER_EVENT_STATUS.DRAFT &&
        // and if there are changes
        Object.keys(dirtyFields).length > 0 ? (
          <div className="flex justify-end">
            <Button type="submit">Save changes</Button>
          </div>
        ) : null
      }
    </form>
  );
};
