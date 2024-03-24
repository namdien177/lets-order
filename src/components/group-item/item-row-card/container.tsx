import { type PropsWithChildren } from "react";
import { Provider } from "jotai";
import { type OrderProduct } from "@/server/db/schema";
import { useHydrateAtoms } from "jotai/utils";
import { productItemAtom } from "@/components/group-item/item-row-card/store";

type Props = {
  item: OrderProduct;
};

const ItemRowCardContainer = ({ children, item }: PropsWithChildren<Props>) => {
  useHydrateAtoms([[productItemAtom, item]]);
  return (
    <Provider store={productItemAtom}>
      <div className={"flex gap-4 rounded-lg bg-background p-4 shadow-md"}>
        {children}
      </div>
    </Provider>
  );
};

export default ItemRowCardContainer;
