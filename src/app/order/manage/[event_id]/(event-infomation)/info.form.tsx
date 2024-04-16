"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type EditEventInfoPayload,
  editEventInfoSchema,
} from "@/app/order/manage/[event_id]/(event-infomation)/info.schema";
import { useMutation } from "@tanstack/react-query";
import { updateOrderEventInfo } from "@/app/order/manage/[event_id]/(event-infomation)/info.action";
import { BaseResponseType } from "@/lib/types/response.type";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  ORDER_EVENT_STATUS,
  type OrderEventStatus,
} from "@/server/db/constant";

type Props = {
  orderEvent: {
    id: number;
    name: string;
    status: OrderEventStatus;
  };
};

const EditOrderEventInfoForm = ({ orderEvent }: Props) => {
  const formShouldDisabled =
    orderEvent.status === ORDER_EVENT_STATUS.COMPLETED ||
    orderEvent.status === ORDER_EVENT_STATUS.LOCKED ||
    orderEvent.status === ORDER_EVENT_STATUS.CANCELLED;

  const { mutateAsync, isPending } = useMutation({
    mutationFn: updateOrderEventInfo,
  });

  const {
    register,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = useForm<EditEventInfoPayload>({
    resolver: zodResolver(editEventInfoSchema),
    defaultValues: {
      id: orderEvent.id,
      name: orderEvent.name,
    },
  });

  const submitAction = async (data: EditEventInfoPayload) => {
    if (formShouldDisabled) {
      return;
    }

    const result = await mutateAsync(data);

    if (result.type === BaseResponseType.success) {
      toast.success(result.message);
      reset(result.data);
      return;
    }

    toast.error(result.error);
  };

  return (
    <form
      onSubmit={handleSubmit(submitAction)}
      className="flex flex-col gap-4 rounded-md border p-4"
    >
      <h1 className={"text-xl leading-tight"}>Event Information</h1>

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          placeholder={"Event name"}
          {...register("name")}
          disabled={isPending || formShouldDisabled}
          className="w-full"
        />
      </div>

      {isDirty ? (
        <div className="flex justify-end">
          <Button disabled={isPending}>
            {isPending ? <Loader2 className={"animate-spin"} /> : "Update"}
          </Button>
        </div>
      ) : null}
    </form>
  );
};

export default EditOrderEventInfoForm;
