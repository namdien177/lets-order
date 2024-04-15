import { formatAsMoney } from "@/lib/utils";
import { X } from "lucide-react";
import {
  ORDER_EVENT_STATUS,
  ORDER_PAYMENT_STATUS,
  type OrderEventStatus,
  type OrderPaymentStatus,
} from "@/server/db/constant";
import MarkPaidBtn from "@/app/order/manage/[event_id]/(order-list)/mark-paid.btn";
import { queryItemsFromCarts } from "@/app/order/manage/[event_id]/query";
import { displayAsOrderedItems } from "@/app/order/manage/[event_id]/mapper";

type Props = {
  viewAs?: "by-product" | "by-user";
  eventId: number;
  eventStatus: OrderEventStatus;
  paymentStatus: OrderPaymentStatus;
  clerkId: string;
};

const OrderList = async ({ eventId, eventStatus, paymentStatus }: Props) => {
  const ableToCompletePayment =
    eventStatus === ORDER_EVENT_STATUS.COMPLETED &&
    paymentStatus === ORDER_PAYMENT_STATUS.PENDING;

  const itemWithAmount = await queryItemsFromCarts(eventId);
  const {
    data: listItems,
    totalAmount,
    totalPrice,
  } = displayAsOrderedItems(itemWithAmount);

  return (
    <div className={"flex flex-col gap-4 rounded border p-4"}>
      <h1 className={"text-xl"}>Current Order</h1>

      <hr />

      <div className="flex flex-col gap-4">
        {listItems.length === 0 && (
          <div className="text-center text-muted-foreground">
            No item ordered yet.
          </div>
        )}
        {listItems.map((product) => (
          <div
            key={product.id}
            className={"flex items-center gap-2 border-l-2 pl-4"}
          >
            <div className="flex flex-1 flex-col">
              <h2 className={"text-lg"}>{product.name}</h2>
              <small className={"text-xs text-muted-foreground"}>
                {product.description}
              </small>
            </div>
            <div className={"flex w-20 flex-col items-end"}>
              <small className={"text-xs leading-tight text-muted-foreground"}>
                Price
              </small>
              <span className={"text-lg tabular-nums"}>
                {formatAsMoney(product.price)}
              </span>
            </div>

            <X className={"size-4 md:size-6"} />

            <div className="flex w-8 flex-col items-start">
              <small className={"text-xs leading-tight text-muted-foreground"}>
                Total
              </small>
              <span className={"text-lg tabular-nums"}>
                {product.totalAmount}
              </span>
            </div>
          </div>
        ))}
      </div>

      <hr />

      <div className="flex gap-4">
        <div className="flex-1">
          <h1 className={"text-xl"}>Order Summary</h1>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex h-8 items-center text-sm text-muted-foreground">
            Total Amount:
          </div>
          <div className="flex h-8 items-center text-sm text-muted-foreground">
            Total Price:
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex h-8 items-center text-xl">{totalAmount}</div>
          <div className="flex h-8 items-center text-xl">
            {formatAsMoney(totalPrice)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        {!ableToCompletePayment && (
          <span
            className={
              "flex-1 select-none text-right text-sm text-muted-foreground"
            }
          >
            Please complete the payment to mark as paid.
          </span>
        )}
        <MarkPaidBtn eventId={eventId} disabled={!ableToCompletePayment}>
          Mark as Paid
        </MarkPaidBtn>
      </div>
    </div>
  );
};

export default OrderList;
