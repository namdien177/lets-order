"use client";

import {
  type CreateProductPayload,
  CreateProductSchema,
} from "@/app/product/create/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input, INPUT_CLASSNAME } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NumericFormat } from "react-number-format";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, Loader2 } from "lucide-react";
import ErrorField from "@/components/form/error-field";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { createProductAction } from "@/app/product/create/action";
import { BaseResponseType } from "@/lib/types/response.type";

type Props = Pick<CreateProductPayload, "clerkId"> & {
  onSubmit?: (data: CreateProductPayload & { id: number }) => void;
};

const CreateProductForm = ({ clerkId, onSubmit }: Props) => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: createProductAction,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProductPayload>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      clerkId,
    },
  });

  const onHandleSubmit = async (data: CreateProductPayload) => {
    const result = await mutateAsync(data);
    if (result.type === BaseResponseType.success) {
      onSubmit?.({
        ...result.data,
        description: data.description,
        clerkId,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onHandleSubmit)}
      className={"container mx-auto flex flex-col gap-8 p-8"}
    >
      <Breadcrumb className={"sm:flex-1"}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <Home size={16} />
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={"/product"}>Products</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className={"mx-auto w-full sm:max-w-[500px]"}>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            Your newly created product will be available for your created
            events.
          </CardDescription>
        </CardHeader>
        <CardContent className={"flex flex-col gap-4"}>
          <div className="flex flex-col gap-3">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder={"Product name"}
              {...register("name")}
              className="w-full"
            />
            <ErrorField errors={errors} name={"name"} />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="name">Description</Label>
            <Input
              id="description"
              type="text"
              placeholder={"Product description"}
              {...register("description")}
              className="w-full"
            />
            <ErrorField errors={errors} name={"description"} />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="price">Price</Label>
            <Controller
              control={control}
              name="price"
              render={({ field: { onChange, ref, ...fields } }) => (
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
              )}
            />
            <ErrorField errors={errors} name={"price"} />
          </div>
        </CardContent>

        <CardFooter className={"justify-end"}>
          <Button>
            {isPending ? (
              <Loader2 size={16} className={"animate-spin"} />
            ) : (
              "Create"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default CreateProductForm;
