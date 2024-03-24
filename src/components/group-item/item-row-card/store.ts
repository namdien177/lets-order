import { atom, createStore, useAtom } from "jotai";
import { type Nullable } from "@/lib/types/helper";
import { type OrderProduct } from "@/server/db/schema";

export const productItemAtom = atom<Nullable<OrderProduct>>(null);

export const productItemStore = createStore();

export const useProductItem = () => {
  const [productItem, setProductItem] = useAtom(productItemAtom);

  if (!productItem) {
    throw new Error("Product item is not provided");
  }

  return {
    data: productItem,
    setData: setProductItem,
  };
};
