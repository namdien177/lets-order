"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import SearchOwnedProductNoRedirectForm from "@/components/product/search-product/no-redirect.form";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  OrderEventCreationSchema,
  type OrderEventPayload,
} from "@/app/order/create/schema";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { z } from "zod";

const ExtendedSchema = OrderEventCreationSchema.merge(
  z.object({
    items: z.array(
      z.object({
        id: z.number().int().positive(),
        name: z.string(),
        description: z.string().nullish(),
        price: z.number().int().positive(),
      }),
    ),
  }),
);

type ExtendedPayload = typeof ExtendedSchema._output;

type Props = Pick<OrderEventPayload, "clerkId"> & {
  onSubmit?: (payload: OrderEventPayload) => void;
};

const CreateForm = ({ clerkId, onSubmit }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ExtendedPayload>({
    resolver: zodResolver(ExtendedSchema),
    defaultValues: {
      clerkId,
    },
  });

  console.log(errors);

  const { append, remove, fields } = useFieldArray({
    control,
    name: "items",
    keyName: "_key",
  });

  const submitAction = (data: ExtendedPayload) => {
    console.log(data);
    const payload: OrderEventPayload = {
      clerkId: data.clerkId,
      name: data.name,
      items: data.items.map((item) => ({
        id: item.id,
      })),
    };

    onSubmit?.(payload);
  };

  return (
    <form
      onSubmit={handleSubmit(submitAction)}
      className={"flex flex-col gap-8"}
    >
      <Card className={"w-full"}>
        <CardHeader>
          <CardTitle>Event Information</CardTitle>
          <CardDescription>
            People will see this information when they view the event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              {...register("name")}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Select the product that will be available in this event.
          </CardDescription>
        </CardHeader>
        <CardContent className={"flex flex-col gap-8"}>
          <div className="flex flex-col rounded-lg border p-6">
            <h2 className={"text-lg font-semibold leading-none tracking-tight"}>
              Selected Items
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-80">Description</TableHead>
                  <TableHead className={"w-40"}>Price</TableHead>
                  <TableHead className={"w-32 text-center"}>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((product, index) => (
                  <TableRow key={product._key}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>
                      {product.price.toLocaleString("vi", {
                        style: "currency",
                        currency: "vnd",
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        type={"button"}
                        variant={"destructive"}
                        className={"w-full"}
                        onClick={() => remove(index)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <hr />

          <SearchOwnedProductNoRedirectForm
            clerkId={clerkId}
            excludes={fields.map((product) => product.id)}
            onSelected={(product) => append(product)}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Create</Button>
      </div>
    </form>
  );
};

export default CreateForm;
