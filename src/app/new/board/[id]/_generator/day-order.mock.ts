import {
  type DayOrder,
  type Order,
  type OrderItem,
  type OrderUser,
  type Product,
} from "../type";
import { faker } from "@faker-js/faker";

const mockUser = (): OrderUser => {
  return {
    id: faker.database.mongodbObjectId(),
    name: faker.person.fullName(),
  };
};

const mockProduct = (): Product => {
  return {
    id: faker.number.int(),
    name: faker.commerce.productName(),
    price: Number(faker.commerce.price({ min: 100, max: 1000 })),
  };
};

const mockOrderItem = (): OrderItem => {
  return {
    product: mockProduct(),
    quantity: faker.number.int({ min: 1, max: 5 }),
  };
};

const mockOrder = (user: OrderUser): Order => {
  const isNull = faker.datatype.boolean();
  const randomCartItems = faker.number.int({ min: 1, max: 5 });

  return {
    id: faker.number.int(),
    user: user,
    payment: isNull
      ? {
          type: faker.finance.transactionType(),
          fulfilled_at: faker.date.recent().toISOString(),
          confirmed_at: faker.date.recent().toISOString(),
        }
      : null,
    cart: [...Array.from({ length: randomCartItems }, () => mockOrderItem())],
  };
};

type mockOpts = {
  orderCount?: number;
  usersCount?: number;
};

export const mockDayOrders = ({
  orderCount = 10,
  usersCount = 4,
}: mockOpts): Array<DayOrder> => {
  const users = Array.from({ length: usersCount }, () => mockUser());
  let trackingDate = faker.date.recent({
    days: 10,
  });

  return Array.from({ length: orderCount }, (_, index) => {
    const updateDate = faker.date
      .between({
        from: trackingDate,
        to: new Date(),
      })
      .toISOString();
    const amountOrderPerDay = faker.number.int({ min: 1, max: users.length });

    trackingDate = new Date(updateDate);
    return {
      id: index + 1,
      date: updateDate,
      orders: Array.from({ length: amountOrderPerDay }, (_, index) => {
        const user = users[index]!;
        return mockOrder(user);
      }),
    };
  });
};
