import { type Nullable } from "@/lib/types/helper";
import { type OrderPaymentStatus } from "@/server/db/constant";

export type ItemsFromCartsQuery = {
  "product.id": number;
  "product.name": string;
  "product.description": Nullable<string>;
  "product.price": number;
  clerkId: string;
  eventId: number;
  cartId: number;
  paymentAt: Nullable<Date>;
  paymentStatus: OrderPaymentStatus;
  amount: number;
};

export type ItemsFromCartsOutput = {
  id: number;
  name: string;
  description: Nullable<string>;
  price: number;
  carts: {
    clerkId: string;
    amount: number;
    paymentStatus: OrderPaymentStatus;
  }[];
  totalAmount: number;
};

export type ParticipantFromEventOutput = {
  clerkId: string;
  eventId: number;
  amount: number;
  cartId: number;
  paymentStatus: OrderPaymentStatus;
  name: string;
  email: string;
  items: Array<{
    id: number;
    name: string;
    description: Nullable<string>;
    price: number;
    amount: number;
  }>;
};
