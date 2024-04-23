import { ORDER_PAYMENT_STATUS } from "@/server/db/constant";

export type OrderDirection = "asc" | "desc";

export const byPaymentStatus = {
  paid_first: ORDER_PAYMENT_STATUS.PAID,
  unpaid_first: ORDER_PAYMENT_STATUS.PENDING,
};

export const byPaymentConfirm = {
  confirmed_first: true,
  unconfirmed_first: false,
};

export const byName = {
  asc: "asc",
  desc: "desc",
};

export const byPrice = {
  asc: "asc",
  desc: "desc",
};

export const ORDERING_OPTIONS = {
  byName,
  byPrice,
  byPaymentStatus,
  byPaymentConfirm,
};

export const DEFAULT_ORDERING = {
  byName: undefined,
  byPrice: undefined,
  byPaymentStatus: ORDER_PAYMENT_STATUS.PENDING,
  byPaymentConfirm: undefined,
} as const;
