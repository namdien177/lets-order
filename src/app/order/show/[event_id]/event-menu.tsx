"use client";

import { type OrderCart, type OrderEvent } from "@/server/db/schema";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getAllProductsInEvent } from "@/app/order/show/[event_id]/event-menu.action";
import { Search } from "lucide-react";
import DebouncedInput from "@/components/form/debounce-input";
import { Button } from "@/components/ui/button";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatAsMoney } from "@/lib/utils";
import {
  createCartItemSchema,
  type CreateCartPayload,
} from "@/app/order/show/[event_id]/schema";

type Props = {
  event: OrderEvent;
  cart?: Pick<OrderCart, "id">;
};

const EventMenu = ({ event, cart }: Props) => {
  const [searchKey, setSearchKey] = useState("");
  const { data } = useQuery({
    queryKey: ["produc", searchKey, event.id],
    queryFn: async () => getAllProductsInEvent({ id: event.id }, searchKey),
    enabled: searchKey.trim().length >= 3 || searchKey.trim().length === 0,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateCartPayload>({
    resolver: zodResolver(createCartItemSchema),
    defaultValues: {
      cartId: cart?.id,
      eventId: event.id,
    },
  });

  const itemWatch = useWatch({
    control,
    name: "item",
  });

  return (
    <div className={"relative flex w-full flex-col gap-4"}>
      <div className={"sticky inset-x-0 top-0 bg-background py-2"}>
        <Search
          size={16}
          className={
            "absolute left-2 top-1/2 -translate-y-1/2 transform text-accent-foreground"
          }
        />
        <DebouncedInput
          className={"pl-8"}
          placeholder={"Search for products"}
          onDebouncedChange={setSearchKey}
        />
      </div>

      <div className={"flex flex-col gap-4"}>
        <h1 className={"text-xl font-bold uppercase"}>Menu</h1>
        <Controller
          control={control}
          name={"item"}
          render={({ field }) => (
            <>
              {data?.map((product) => (
                <div
                  key={product.id}
                  className={
                    "flex select-none items-center gap-4 rounded-md border border-accent p-4 hover:border-accent-foreground"
                  }
                >
                  <div className="flex flex-1 flex-col">
                    <p className={"text-primary"}>{product.name}</p>
                    <small className={"line-clamp-2 text-accent-foreground"}>
                      {product.description}
                    </small>
                  </div>
                  <p className={"text-primary"}>
                    {formatAsMoney(product.price)}
                  </p>
                  <Button
                    disabled={field.disabled}
                    onClick={() => {
                      if (field.value?.id === product.id) {
                        field.onChange(null);
                        field.onBlur();
                        return;
                      }
                      field.onChange(product);
                      field.onBlur();
                    }}
                    variant={
                      field.value?.id === product.id ? "destructive" : "outline"
                    }
                    className={"w-20"}
                  >
                    {field.value?.id === product.id ? "Remove" : "Select"}
                  </Button>
                </div>
              ))}
            </>
          )}
        />
      </div>

      {itemWatch ? (
        <>
          <hr />
          <div className="sticky inset-x-0 bottom-0 flex w-full flex-col gap-4 rounded border bg-background p-4">
            <h1 className={"text-xl font-bold capitalize"}>Your cart</h1>
            <hr />
            <div className="flex flex-1 flex-col border-l-2 pl-2">
              <p className={"text-lg"}>{itemWatch.name}</p>
              <small className={"text-muted-foreground"}>
                {itemWatch.description}
              </small>
            </div>

            <hr />

            <div className="flex gap-2">
              <h1 className={"flex-1 text-xl font-bold capitalize"}>Total</h1>
              <p className={"text-lg"}>{formatAsMoney(itemWatch.price)}</p>
            </div>
            <Button>Place order</Button>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default EventMenu;
