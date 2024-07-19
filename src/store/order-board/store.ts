import {
  type DayOrder,
  type OrderUser,
  type Product,
} from "@/app/new/board/[id]/type";
import { createStore } from "zustand";

export type OrderBoardState = {
  data: Array<DayOrder>;
  users: Array<OrderUser>;
  products: Array<Product>;
  hoveringOrder: OrderCellState | null;
  focusedOrder: OrderCellState | null;
  focusedDay: DayOrder | null;
  focusedUser: OrderUser | null;
  isLoading: boolean;
  isError: boolean;
};

export type OrderCellState = {
  user: OrderUser;
  date: Date;
};

export type OrderBoardAction = {
  fetchStatus: (status: { isLoading?: boolean; isError?: boolean }) => void;
  load: (data: Array<DayOrder>) => void;
  refresh?: () => void;
  hover: (order: OrderCellState | null) => void;
  focus: (order: OrderCellState | null) => void;
  focusDay: (day: DayOrder | null) => void;
  focusUser: (user: OrderUser | null) => void;
  addUser: (payload: { user: OrderUser }) => void;
};

export type OrderBoardStore = OrderBoardState & OrderBoardAction;

export const InitialState: OrderBoardState = {
  data: [],
  users: [],
  products: [],
  hoveringOrder: null,
  focusedOrder: null,
  focusedDay: null,
  focusedUser: null,
  isLoading: true,
  isError: false,
};

export const createOrderBoardStore = (
  initialState: OrderBoardState = InitialState,
) => {
  return createStore<OrderBoardStore>((set) => ({
    ...initialState,
    fetchStatus: (status) => {
      set((state) => ({
        ...state,
        isLoading: status.isLoading ?? state.isLoading,
        isError: status.isError ?? state.isError,
      }));
    },
    load: (dayOrders) => {
      const userSet = new Map<string, OrderUser>();
      const productSet = new Map<number, Product>();

      for (const dayOrder of dayOrders) {
        for (const order of dayOrder.orders) {
          userSet.set(order.user.id, order.user);
          for (const item of order.cart) {
            productSet.set(item.product.id, item.product);
          }
        }
      }
      set({
        data: dayOrders,
        users: Array.from(userSet.values()),
        products: Array.from(productSet.values()),
      });
    },
    hover: (hoveringOrder) => {
      set({ hoveringOrder });
    },
    focus: (focusedOrder) => {
      set({ focusedOrder });
    },
    focusDay: (focusedDay) => {
      set({ focusedDay });
    },
    focusUser: (focusedUser) => {
      set({ focusedUser });
    },
    addUser: ({ user }) => {
      set((state) => {
        const users = [...state.users, user];
        return { users };
      });
    },
  }));
};
