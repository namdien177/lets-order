export type Product = {
  id: number;
  name: string;
  price: number;
};

export type OrderPayment = {
  type: string;
  fulfilled_at: string;
  confirmed_at: string | null;
};

export type OrderUser = {
  id: string;
  name: string;
};

export type OrderItem = {
  product: Product;
  quantity: number;
};

export type Order = {
  id: number;
  user: OrderUser;
  payment: OrderPayment | null;
  cart: OrderItem[];
};

export type DayOrder = {
  id: number;
  date: string;
  orders: Array<Order>;
};
