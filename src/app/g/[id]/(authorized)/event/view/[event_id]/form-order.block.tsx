"use client";

import { type PageProps } from "@/app/g/[id]/(authorized)/event/view/[event_id]/typing";
import { type OrderProduct } from "@/server/db/schema";
import { type Nullable } from "@/lib/types/helper";
import { z } from "zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = PageProps & {
  items: Array<
    Omit<
      OrderProduct,
      "deletedAt" | "createdAt" | "orderGroupId" | "originalId" | "updatedAt"
    > & {
      orderedAmount: Nullable<number>;
    }
  >;
};

const schema = z.object({
  groupId: z.number(),
  eventId: z.number(),
  userId: z.string(),
  items: z.array(
    z.object({
      id: z.number(),
      amount: z.number().min(0),
    }),
  ),
});
type FormData = z.infer<typeof schema>;

const FormOrderBlock = ({
  items,
  userId,
  params,
  eventData,
  groupData,
}: Props) => {
  const itemsOrdered = items.map((item) => ({
    id: item.id,
    amount: item.orderedAmount ?? 0,
  }));

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      groupId: Number(params.id),
      eventId: Number(params.event_id),
      userId,
      items: itemsOrdered,
    },
  });

  const itemsWatched = useWatch({
    control,
    name: "items",
  });

  const accumulatedTotal = itemsWatched.reduce((acc, item, index) => {
    const itemAt = items[index];
    const priceOfItem = itemAt?.price ?? 0;
    const total = item.amount * priceOfItem;
    return acc + total;
  }, 0);

  const { fields } = useFieldArray({
    control, // control props come from useForm (optional: if you are using FormContext)
    name: "items", // unique name for your Field Array
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form
      className={"relative flex flex-1 flex-col gap-8"}
      onSubmit={handleSubmit(onSubmit)}
    >
      <h1 className={"text-2xl"}>Menu</h1>
      <div className="flex flex-col gap-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className={
              "flex items-center gap-4 rounded-lg bg-background p-4 shadow-md"
            }
          >
            <div className="flex flex-1 flex-col">
              <p className={"text-lg"}>{items[index]!.name}</p>
              <p className={"text-sm text-gray-500"}>
                {items[index]!.description}
              </p>
            </div>

            <Input
              type="number"
              {...register(`items.${index}.amount`, {
                valueAsNumber: true,
              })}
              className={"w-40"}
              min={0}
              max={10}
            />

            <div className="flex flex-col">
              <p className={"text-sm text-gray-500"}>Price</p>
              <p>
                {Intl.NumberFormat("vi", {
                  style: "currency",
                  currency: "vnd",
                }).format(items[index]!.price)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky inset-x-0 bottom-0 flex items-center rounded-md bg-background p-4">
        <p>Your order</p>

        <div className="flex flex-1 justify-end gap-4">
          <p>
            {Intl.NumberFormat("vi", {
              style: "currency",
              currency: "vnd",
            }).format(accumulatedTotal)}
          </p>

          {isDirty && (
            <Button type="submit" className="btn-primary">
              Save
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default FormOrderBlock;
