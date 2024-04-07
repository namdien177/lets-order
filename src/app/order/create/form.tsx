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
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  OrderEventCreationSchema,
  type OrderEventPayload,
} from "@/app/order/create/schema";

const CreateForm = ({ clerkId }: Pick<OrderEventPayload, "clerkId">) => {
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

  const excludedProductId = useWatch({
    control,
    name: "items",
    defaultValue: [],
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
        <CardContent>
          <SearchOwnedProductNoRedirectForm
            clerkId={clerkId}
            excludes={excludedProductId}
          />
        </CardContent>
      </Card>
    </form>
  );
};

export default CreateForm;
