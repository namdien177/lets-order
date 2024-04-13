"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const editEventInfoSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(3).max(60),
});

type EditEventInfoPayload = typeof editEventInfoSchema._output;

type Props = {
  orderEvent: {
    id: number;
    name: string;
  };
};

const EditOrderEventInfoForm = ({ orderEvent }: Props) => {
  const {
    register,
    formState: { isDirty },
  } = useForm<EditEventInfoPayload>({
    resolver: zodResolver(editEventInfoSchema),
    defaultValues: orderEvent,
  });

  return (
    <form className="flex flex-col gap-4 rounded-md border p-4">
      <h1 className={"text-xl leading-tight"}>Event Information</h1>

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          placeholder={"Event name"}
          {...register("name")}
          className="w-full"
        />
      </div>

      {isDirty ? (
        <div className="flex justify-end">
          <Button>Update</Button>
        </div>
      ) : null}
    </form>
  );
};

export default EditOrderEventInfoForm;
