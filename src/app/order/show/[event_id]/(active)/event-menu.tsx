"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Trash } from "lucide-react";
import DebouncedInput from "@/components/form/debounce-input";
import { Button } from "@/components/ui/button";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn, formatAsMoney, isNullish } from "@/lib/utils";
import {
  type CartItemPayload,
  createCartItemSchema,
  type CreateCartPayload,
} from "@/app/order/show/[event_id]/schema";
import EventMenuStatus from "@/app/order/show/[event_id]/(active)/event-menu.status";
import {
  getAllProductsInEvent,
  PlacingOrderAction,
} from "@/app/order/show/[event_id]/(active)/event-menu.action";
import { BaseResponseType } from "@/lib/types/response.type";
import { toast } from "sonner";

type Props = {
  clerkId: string;
  eventId: number;
  cart?: {
    id: number;
    items: Array<CartItemPayload>;
  };
  onUpdated?: () => void;
};

const EventMenu = ({ eventId, cart, onUpdated }: Props) => {
  const [searchKey, setSearchKey] = useState("");
  const { data } = useQuery({
    queryKey: ["produc", searchKey, eventId],
    queryFn: async () => getAllProductsInEvent({ id: eventId }, searchKey),
    enabled: searchKey.trim().length >= 3 || searchKey.trim().length === 0,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: PlacingOrderAction,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateCartPayload>({
    resolver: zodResolver(createCartItemSchema),
    defaultValues: {
      eventId: eventId,
      cartId: cart?.id,
      items: cart?.items ?? [],
    },
  });

  const { append, remove, fields } = useFieldArray({
    control,
    name: "items",
    keyName: "_row_key",
  });

  const getItemIndex = (
    itemId: number,
    listOfItems: Array<CartItemPayload>,
  ) => {
    return listOfItems.findIndex((item) => item.id === itemId);
  };

  const calculateTotal = (items: Array<CartItemPayload>) => {
    return items.reduce((acc, item) => acc + item.price, 0);
  };

  const onPlacingOrder = async (data: CreateCartPayload) => {
    const result = await mutateAsync(data);
    if (result.type === BaseResponseType.success) {
      toast.success(result.message);
      onUpdated?.();
      location.reload();
      return;
    }

    toast.error(result.error);
  };

  const toggleSelectItem = (item: CartItemPayload, itemIndex: number) => {
    if (itemIndex > -1) {
      remove(itemIndex);
      return;
    }
    append({
      id: item.id,
      eventProductId: item.eventProductId,
      name: item.name,
      description: item.description,
      price: item.price,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onPlacingOrder)}
      className={"relative flex w-full flex-col gap-4"}
    >
      <h1 className={"text-xl font-bold uppercase"}>Menu</h1>

      <div className={"relative inset-x-0 top-0 bg-background py-2"}>
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

      <div className={"flex max-h-96 flex-col gap-4 overflow-y-auto"}>
        {data?.map((product) => {
          const itemIndex = getItemIndex(product.id, fields);
          const isSelected = itemIndex > -1;

          return (
            <div
              key={product.id}
              className={cn(
                "group flex cursor-pointer select-none items-center gap-4 rounded-md border-2 border-accent p-4 transition hover:border-accent-foreground",
                isSelected
                  ? "border-accent-foreground hover:border-accent-foreground/50"
                  : "border-accent",
              )}
              onClick={() => toggleSelectItem(product, itemIndex)}
            >
              <div className="flex flex-1 flex-col">
                <p className={"text-primary"}>{product.name}</p>
                <small className={"line-clamp-2 text-muted-foreground"}>
                  {product.description}
                </small>
              </div>
              <p className={"text-primary"}>{formatAsMoney(product.price)}</p>
              <EventMenuStatus isSelected={isSelected} />
            </div>
          );
        })}
      </div>

      <hr />

      <div className="sticky inset-x-0 bottom-4 flex w-full flex-col gap-4 rounded border bg-background p-4">
        <h1 className={"text-xl font-bold capitalize"}>Your cart</h1>
        <hr />
        {fields.length === 0 && (
          <small
            className={"select-none text-sm italic text-accent-foreground"}
          >
            Your cart is empty
          </small>
        )}
        <div className="flex max-h-32 flex-col gap-4 overflow-y-auto">
          {fields.map((item, index) => (
            <div
              key={item._row_key}
              className="flex w-full items-center border-l-2 pl-2"
            >
              <div className="flex flex-1 flex-col">
                <p className={"text-lg"}>{item.name}</p>
                <small className={"text-muted-foreground"}>
                  {item.description}
                </small>
              </div>

              <Button
                type={"button"}
                size={"icon"}
                variant={"ghost"}
                onClick={() => remove(index)}
              >
                <Trash size={16} />
              </Button>
            </div>
          ))}
        </div>

        <hr />

        <div className="flex gap-2">
          <h1 className={"flex-1 text-xl font-bold capitalize"}>Total</h1>
          <p className={"text-lg"}>{formatAsMoney(calculateTotal(fields))}</p>
        </div>
        <div className="flex gap-4">
          <Button type={"submit"} disabled={isPending} className={"flex-1"}>
            {isPending
              ? "loading..."
              : isNullish(cart?.id)
                ? "Place order"
                : "Update order"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default EventMenu;
