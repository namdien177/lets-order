"use client";

import { useMutation } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormSchema,
  type FormSchemaType,
} from "@/app/g/[id]/(authorized)/event/new/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ErrorField from "@/components/form/error-field";
import DatePicker from "@/components/date-picker";
import { TimeCompoundPicker } from "@/components/timepicker";
import { isNullish } from "@/lib/utils";
import { createEvent } from "@/app/g/[id]/(authorized)/event/new/action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = {
  groupId: number;
};

const CreateEventForm = ({ groupId }: Props) => {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema()),
  });
  const endingTimeWatch = useWatch({
    control,
    name: "endingAt",
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: FormSchemaType) =>
      createEvent({ ...data, orderGroupId: groupId }),
  });

  const onSubmit = handleSubmit(async (data) => {
    const result = await mutateAsync(data);
    if (result.success) {
      // redirect to event page
      toast.success("Event created");
      return router.push(`/g/${groupId}/event`);
    }

    toast.error(result.message);
  });

  return (
    <form
      className={
        "mx-auto flex w-full flex-col gap-8 rounded bg-white p-8 shadow-lg md:w-[500px]"
      }
      onSubmit={onSubmit}
    >
      <h1>Create an event</h1>
      <hr />
      <div className={"flex flex-col gap-2"}>
        <Label>Event name</Label>
        <Input type="text" placeholder={"Event name"} {...register("name")} />
        <ErrorField errors={errors} name={"name"} />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Ending at</Label>

        <Controller
          control={control}
          name={"endingAt"}
          render={({ field }) => (
            <DatePicker
              clearable
              placeholder={"Select a date"}
              value={field.value ?? undefined}
              onSelected={(date) => field.onChange(date)}
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
      </div>

      <Button type="submit" disabled={isPending}>
        Create event
      </Button>
    </form>
  );
};

export default CreateEventForm;
