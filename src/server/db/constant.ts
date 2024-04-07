import type { ObjectType } from "@/lib/types/helper";

export const ORDER_EVENT_STATUS = {
  CANCELLED: "CANCELLED",
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
} as const;

export type OrderEventStatus = ObjectType<typeof ORDER_EVENT_STATUS>;

export const ORDER_PAYMENT_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
} as const;

export type OrderPaymentStatus = ObjectType<typeof ORDER_PAYMENT_STATUS>;
