"use client";

import {
  eventBasicInfoSchema,
  type EventBasicInfoSchema,
} from "@/components/event-detail/schema";
import { ORDER_EVENT_STATUS, type OrderEventStatus } from "@/server/db/schema";
import { Controller, useForm, useWatch } from "react-hook-form";
import { cn, isNullish } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { INPUT_CLASSNAME } from "@/components/ui/input";
import ErrorField from "@/components/form/error-field";
import DatePicker from "@/components/date-picker";
import { TimeCompoundPicker } from "@/components/timepicker";
import { Button } from "@/components/ui/button";
import ChangedLabel from "./changed-label";
import useOrderEventInfoMutation from "@/components/event-detail/mutations/useOrderEventInfo.mutation";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";

const EventBasicInfoForm = ({
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
    control,
    formState: { dirtyFields, errors, isDirty },
    handleSubmit,
    reset,
  } = useForm<EventBasicInfoSchema>({
    resolver: zodResolver(eventBasicInfoSchema),
    defaultValues: initialData,
  });

  const { mutateAsync } = useOrderEventInfoMutation();

  const endingTimeWatch = useWatch({
    control,
    name: "endingAt",
  });

  const onSubmit = async (data: EventBasicInfoSchema) => {
    const result = await mutateAsync(data);
    if (result.success) {
      reset(data);
      toast.success("Event info updated");
    }
  };

  return (
    <form
      className={cn(
        "relative flex flex-col gap-8 rounded-lg bg-background p-4 shadow-md",
        className,
      )}
      onSubmit={handleSubmit(onSubmit)}
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
              { "pl-4": dirtyFields.name },
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
              onSelected={field.onChange}
              onClearing={() => field.onChange(null)}
              disabled={field.disabled}
              closeOnSelect
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
                  className={"mt-2 pl-8"}
                  value={field.value ?? undefined}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={field.disabled}
                  labelClassName={"text-sm text-gray-500"}
                />
              )}
            />
          )
        }

        <small className={"pl-8 text-gray-500"}>
          You can skip this field if you don&apos;t want to set an ending time
        </small>

        <ErrorField errors={errors} name={"endingAt"} className={"pl-8"} />
      </fieldset>

      {
        // only show button if the event is in draft state
        eventStatus === ORDER_EVENT_STATUS.DRAFT &&
        // and if there are changes
        isDirty ? (
          <div className="sticky bottom-0 flex w-full justify-end">
            <Button type="submit">Save changes</Button>
          </div>
        ) : null
      }
    </form>
  );
};

export default EventBasicInfoForm;
