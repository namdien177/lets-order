"use client";

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useRef,
} from "react";
import {
  createOrderBoardStore,
  type OrderBoardStore,
} from "@/store/order-board/store";
import { useStore } from "zustand";

export type OrderBoardAPI = ReturnType<typeof createOrderBoardStore>;

export const OrderBoardContext = createContext<OrderBoardAPI | undefined>(
  undefined,
);

export const OrderBoardStoreProvider = ({ children }: PropsWithChildren) => {
  const storeRef = useRef<OrderBoardAPI | null>(null);

  if (!storeRef.current) {
    storeRef.current = createOrderBoardStore();
  }

  return (
    <OrderBoardContext.Provider value={storeRef.current}>
      {children}
    </OrderBoardContext.Provider>
  );
};

export const useOrderBoard = <T,>(selector: (store: OrderBoardStore) => T) => {
  const store = useContext(OrderBoardContext);

  if (!store) {
    throw new Error("useOrderBoard must be used within a OrderBoardProvider");
  }

  return useStore(store, selector);
};
