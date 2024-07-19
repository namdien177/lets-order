"use server";

import { type Order } from "@/app/new/board/[id]/type";
import { test } from "@/app/api/board/[id]/route";

export async function UpdateDayOrder(order: Order) {
  const findIndexDay = test.findIndex((day) =>
    day.orders.find((o) => o.id === order.id),
  );

  if (findIndexDay < -1) {
    return {
      success: false,
    };
  }

  const dayOrder = test[findIndexDay]!;
  const findIndexOrder = dayOrder.orders.findIndex((o) => o.id === order.id);
  if (dayOrder.orders[findIndexOrder]) {
    // @ts-ignore
    dayOrder.orders[findIndexOrder] = order;
  }
  return {
    success: true,
  };
}
