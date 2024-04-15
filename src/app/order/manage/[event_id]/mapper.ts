import {
  type ItemsFromCartsOutput,
  type ItemsFromCartsQuery,
  type ParticipantFromEventOutput,
} from "@/app/order/manage/[event_id]/type";
import { type User } from "@clerk/backend";

export const displayAsOrderedItems = (
  rawValue: ItemsFromCartsQuery[],
): {
  totalAmount: number;
  totalPrice: number;
  data: ItemsFromCartsOutput[];
} => {
  const displayData = new Map<string, ItemsFromCartsOutput>();
  let totalOrderedAmount = 0;
  let totalOrderedPrice = 0;

  rawValue.forEach((cartItem) => {
    const itemIndex = `key-${cartItem["product.id"]}`;
    const recordedProduct = displayData.get(itemIndex);

    if (!recordedProduct) {
      displayData.set(itemIndex, {
        id: cartItem["product.id"],
        name: cartItem["product.name"],
        description: cartItem["product.description"],
        price: cartItem["product.price"],
        carts: [
          {
            clerkId: cartItem.clerkId,
            amount: cartItem.amount,
            paymentStatus: cartItem.paymentStatus,
          },
        ],
        totalAmount: cartItem.amount,
      });
    } else {
      recordedProduct.carts.push({
        clerkId: cartItem.clerkId,
        amount: cartItem.amount,
        paymentStatus: cartItem.paymentStatus,
      });
      recordedProduct.totalAmount =
        recordedProduct.totalAmount + cartItem.amount;
    }
    totalOrderedAmount += cartItem.amount;
    totalOrderedPrice += cartItem.amount * cartItem["product.price"];
  });

  const listItems = Array.from(displayData.values());

  return {
    data: listItems,
    totalAmount: totalOrderedAmount,
    totalPrice: totalOrderedPrice,
  };
};

export const displayAsParticipantItems = (
  rawValue: ItemsFromCartsQuery[],
  users: User[],
): {
  totalPrice: number;
  totalAmount: number;
  data: ParticipantFromEventOutput[];
} => {
  const displayData = new Map<string, ParticipantFromEventOutput>();
  let totalPrice = 0;
  let totalAmount = 0;

  rawValue.forEach((cartItem) => {
    const itemIndex = cartItem.clerkId;
    const recordedParticipant = displayData.get(itemIndex);

    if (recordedParticipant) {
      recordedParticipant.items.push({
        id: cartItem["product.id"],
        name: cartItem["product.name"],
        description: cartItem["product.description"],
        price: cartItem["product.price"],
        amount: cartItem.amount,
      });
      recordedParticipant.amount += cartItem.amount;
      totalAmount += cartItem.amount;
      totalPrice += cartItem.amount * cartItem["product.price"];
    } else {
      const [splicedUser] = users.splice(
        users.findIndex((user) => user.id === cartItem.clerkId),
        1,
      );
      let defaultUserInfo = {
        name: "N/A",
        email: "N/A",
      };
      if (splicedUser) {
        defaultUserInfo = {
          name: `${splicedUser.firstName} ${splicedUser.lastName}`,
          email:
            splicedUser.emailAddresses.find(
              (email) => email.id === splicedUser.primaryEmailAddressId,
            )?.emailAddress ?? "N/A",
        };
      }

      displayData.set(itemIndex, {
        eventId: cartItem.eventId,
        amount: cartItem.amount,
        cartId: cartItem.cartId,
        paymentStatus: cartItem.paymentStatus,
        clerkId: cartItem.clerkId,
        ...defaultUserInfo,
        items: [
          {
            id: cartItem["product.id"],
            name: cartItem["product.name"],
            description: cartItem["product.description"],
            price: cartItem["product.price"],
            amount: cartItem.amount,
          },
        ],
      });
      totalAmount += cartItem.amount;
      totalPrice += cartItem.amount * cartItem["product.price"];
    }
  });

  return {
    data: Array.from(displayData.values()),
    totalPrice,
    totalAmount,
  };
};
