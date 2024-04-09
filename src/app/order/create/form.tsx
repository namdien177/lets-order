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
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  OrderEventCreationSchema,
  type OrderEventPayload,
} from "@/app/order/create/schema";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { type Product } from "@/server/db/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CreateForm = ({ clerkId }: Pick<OrderEventPayload, "clerkId">) => {
  const [displaySelectItems, setDisplayItems] = useState<
    Pick<Product, "id" | "name" | "description" | "price">[]
  >([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<OrderEventPayload>({
    resolver: zodResolver(OrderEventCreationSchema),
    defaultValues: {
      clerkId,
    },
  });

  return (
    <form className={"container mx-auto flex flex-col gap-8 p-8"}>
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
                {displaySelectItems.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>
                      {product.price.toLocaleString("vi", {
                        style: "currency",
                        currency: "vnd",
                      })}
                    </TableCell>
                    <TableCell>
                      <Controller
                        control={control}
                        name={"items"}
                        render={({ field }) => (
                          <Button
                            type={"button"}
                            variant={"destructive"}
                            className={"w-full"}
                            onClick={() => {
                              setDisplayItems((current) =>
                                current.filter(
                                  (item) => item.id !== product.id,
                                ),
                              );
                              field.onChange(
                                (field.value ?? []).filter(
                                  (item) => item.id !== product.id,
                                ),
                              );
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <hr />

          <Controller
            control={control}
            name={"items"}
            render={({ field }) => (
              <SearchOwnedProductNoRedirectForm
                clerkId={clerkId}
                excludes={field.value?.map((product) => product.id)}
                onSelected={(product) => {
                  field.onChange([...(field.value ?? []), { id: product.id }]);
                  field.onBlur();
                  setDisplayItems((current) => [...current, product]);
                }}
              />
            )}
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
