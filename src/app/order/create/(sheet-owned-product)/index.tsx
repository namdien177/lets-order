"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryUserProducts } from "@/server/queries/product.action";
import { type SelectProduct } from "@/app/order/create/type";
import { BaseResponseType } from "@/lib/types/response.type";
import DebouncedInput from "@/components/form/debounce-input";
import { cn, formatAsMoney } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { type Product } from "@/server/db/schema";

type SheetOwnedProductProps = {
  clerkId: string;
  selectedProduct?: SelectProduct[];
  onChange?: (products: SelectProduct[]) => void;
};

const LIMIT_PER_EVENT = 5;

const SheetOwnedProduct = ({
  clerkId,
  onChange,
  selectedProduct = [],
}: SheetOwnedProductProps) => {
  const [newSelectProducts, setSelectedProduct] =
    useState<SelectProduct[]>(selectedProduct);

  const [keyword, setKeyword] = useState<string | undefined>();

  const { data, isFetching } = useQuery({
    queryKey: ["query-owned-product", clerkId, keyword],
    queryFn: () =>
      queryUserProducts({
        fromUser: clerkId,
        queryOptions: {
          limit: 10,
          keyword,
        },
      }),
    enabled: keyword ? keyword.length >= 3 && keyword.length <= 60 : true,
  });

  let products: Product[] = [];

  if (data?.type === BaseResponseType.success) {
    products = data.data.data;
  }

  const onSelectProduct = (product: SelectProduct) => {
    setSelectedProduct((exist) => {
      if (exist.length >= LIMIT_PER_EVENT) {
        return exist;
      }

      return [...exist, product];
    });
  };

  const onRemoveProduct = (product: SelectProduct) => {
    setSelectedProduct((exist) => exist.filter((p) => p.id !== product.id));
  };

  return (
    <div className={"flex flex-col gap-4"}>
      <DebouncedInput
        placeholder={"Search product"}
        onDebouncedChange={setKeyword}
      />

      <small className="text-left text-muted-foreground">
        {newSelectProducts.length} / {LIMIT_PER_EVENT} products selected
      </small>

      <div className={"flex flex-1 flex-col gap-4 overflow-y-hidden"}>
        {isFetching && <div>Loading...</div>}
        {!isFetching &&
          products.map((product) => {
            const isSelected = newSelectProducts.some(
              (p) => p.id === product.id,
            );

            const onClickProduct = (product: SelectProduct) => {
              if (isFetching) {
                return;
              }

              const modifyProduct: SelectProduct = {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
              };
              if (isSelected) {
                return onRemoveProduct(modifyProduct);
              }

              onSelectProduct(modifyProduct);
            };

            return (
              <div
                key={product.id}
                className={cn(
                  "flex cursor-pointer select-none items-center gap-4 rounded border-2 p-2 hover:bg-accent",
                  isSelected ? "border-primary" : "border-accent/80",
                )}
                onClick={() => onClickProduct(product)}
              >
                <div className={"flex flex-1 flex-col gap-0"}>
                  <p className={"text-left"}>{product.name}</p>
                  <small className={"text-left text-xs text-muted-foreground"}>
                    {product.description}
                  </small>
                </div>
                <small className="text-muted-foreground">
                  {formatAsMoney(product.price)}
                </small>
              </div>
            );
          })}
      </div>

      <div className={"flex gap-4"}>
        {newSelectProducts.length === 0 && (
          <Button
            variant={"outline"}
            disabled={isFetching}
            onClick={() => onChange?.([])}
          >
            Clear
          </Button>
        )}
        <Button
          className={"flex-1"}
          disabled={newSelectProducts.length === 0 || isFetching}
          onClick={
            newSelectProducts.length > 0
              ? () => onChange?.(newSelectProducts)
              : undefined
          }
        >
          Select {newSelectProducts.length} products
        </Button>
      </div>
    </div>
  );
};

export default SheetOwnedProduct;
