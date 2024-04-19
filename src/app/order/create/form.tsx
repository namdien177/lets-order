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
import ErrorField from "@/components/form/error-field";
import { formatAsMoney } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import SheetOwnedProduct from "@/app/order/create/(sheet-owned-product)";
import { useState } from "react";
import { createOrderEvent } from "@/app/order/create/action";
import { BaseResponseType } from "@/lib/types/response.type";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const ExtendedSchema = OrderEventCreationSchema.merge(
  z.object({
    items: z
      .array(
        z.object({
          id: z.number().int().positive(),
          name: z.string(),
          description: z.string().nullable(),
          price: z.number().int().positive(),
        }),
      )
      .min(1)
      .max(5),
  }),
);

type ExtendedPayload = typeof ExtendedSchema._output;

type Props = Pick<OrderEventPayload, "clerkId">;

const CreateForm = ({ clerkId }: Props) => {
  const router = useRouter();

  const [openSelectProduct, setOpenSelectProduct] = useState(false);
  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
      isLoading,
      isValidating,
      isSubmitSuccessful,
    },
    control,
    setValue,
  } = useForm<ExtendedPayload>({
    mode: "onBlur",
    resolver: zodResolver(ExtendedSchema),
    defaultValues: {
      clerkId,
    },
  });

  const formDisabled = isSubmitting || isLoading || isValidating;

  const { remove, fields } = useFieldArray({
    control,
    name: "items",
    keyName: "_key",
  });

  const submitAction = async (data: ExtendedPayload) => {
    const payload: OrderEventPayload = {
      clerkId: data.clerkId,
      name: data.name,
      items: data.items.map((item) => ({
        id: item.id,
      })),
    };

    const result = await createOrderEvent(payload);

    if (result.type === BaseResponseType.success) {
      toast.success(result.message);
      return router.push(`/order/show/${result.data.id}`);
    }

    return toast.error(result.error);
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
            <ErrorField errors={errors} name={"name"} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            <p>Select the product that will be available in this event.</p>
          </CardDescription>
        </CardHeader>
        <CardContent className={"flex flex-col gap-8"}>
          <ErrorField errors={errors} name={"items"} />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">No.</TableHead>
                <TableHead className="w-80">Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className={"w-40"}>Price</TableHead>
                <TableHead className={"w-32 text-center"}>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className={"text-center text-muted-foreground"}
                  >
                    No item selected
                  </TableCell>
                </TableRow>
              )}
              {fields.map((product, index) => (
                <TableRow key={product._key}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>{formatAsMoney(product.price)}</TableCell>
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

          <div className="flex gap-4">
            <Sheet open={openSelectProduct} onOpenChange={setOpenSelectProduct}>
              <SheetTrigger asChild>
                <Button>Select from Your List</Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>Your Products</SheetTitle>
                  <SheetDescription>
                    <SheetOwnedProduct
                      clerkId={clerkId}
                      onChange={(selectedProducts) => {
                        setOpenSelectProduct(false);
                        setValue("items", selectedProducts);
                      }}
                      selectedProduct={fields}
                    />
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button disabled={formDisabled || isSubmitSuccessful} type="submit">
          {formDisabled ? (
            <Loader2 size={16} className={"animate-spin"} />
          ) : (
            "Create new Order"
          )}
        </Button>
      </div>
    </form>
  );
};

export default CreateForm;
