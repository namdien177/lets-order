"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input, INPUT_CLASSNAME } from "@/components/ui/input";
import { type Nullish } from "@/lib/types/helper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { type ProductUpsert, productUpsertSchema } from "./schema";
import ErrorField from "@/components/form/error-field";
import { useUpsertItem } from "./mutation";
import { useRouter } from "next/navigation";
import { NumericFormat } from "react-number-format";

type Props = {
  groupId: number;
  original?: {
    id: number;
    name: string;
    description: Nullish<string>;
    price: number;
  };
  className?: string;
};

const GroupItemForm = ({
  groupId,
  original: originalProduct,
  className,
}: Props) => {
  const router = useRouter();
  const { mutateAsync: upsertProduct } = useUpsertItem(groupId);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductUpsert>({
    resolver: zodResolver(productUpsertSchema),
    defaultValues: {
      name: originalProduct?.name,
      description: originalProduct?.description ?? undefined,
      price: originalProduct?.price,
      originalId: originalProduct?.id,
    },
  });

  async function onSubmit(data: ProductUpsert) {
    console.log(data);
    try {
      const { id } = await upsertProduct(data);
      console.log("Created product with id", id);
      return router.push(`/g/${groupId}/menu`);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        "flex flex-col gap-4 rounded-md bg-background p-4 shadow-md",
        className,
      )}
    >
      <div className="flex flex-col gap-2">
        <Label className="text-lg font-bold text-primary" htmlFor="name">
          Name
        </Label>
        <Input id="name" type="text" placeholder="Name" {...register("name")} />
        <ErrorField errors={errors} name={"name"} />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-lg font-bold text-primary" htmlFor="description">
          Description
        </Label>
        <Input
          id="description"
          type="text"
          placeholder="Description"
          {...register("description")}
        />
        <ErrorField errors={errors} name={"description"} />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-lg font-bold text-primary" htmlFor="price">
          Price
        </Label>
        <Controller
          control={control}
          name="price"
          render={({ field: { onChange, ref, ...fields } }) => (
            <>
              <NumericFormat
                id="price"
                placeholder="Price"
                {...fields}
                getInputRef={ref}
                className={INPUT_CLASSNAME}
                thousandSeparator={","}
                onValueChange={(values) => {
                  onChange(values.floatValue ?? values.value);
                }}
              />
              {/*<Input*/}
              {/*  id="price"*/}
              {/*  type="number"*/}
              {/*  placeholder="Price"*/}
              {/*  {...fields}*/}
              {/*  value={numericFormatter(String(value), {*/}
              {/*    thousandSeparator: ",",*/}
              {/*  })}*/}
              {/*  onChange={(e) => {*/}
              {/*    onChange(*/}
              {/*      Number.isNaN(Number(e.target.value))*/}
              {/*        ? e.target.value*/}
              {/*        : Number(e.target.value),*/}
              {/*    );*/}
              {/*  }}*/}
              {/*/>*/}
            </>
          )}
        />
        <ErrorField errors={errors} name={"price"} />
      </div>

      <Button className={"self-end"}>{originalProduct ? "Edit" : "Add"}</Button>
    </form>
  );
};

export default GroupItemForm;
