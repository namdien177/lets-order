import EventPaidBtn from "./event-paid.btn";
import { type OrderEvent } from "@/server/db/schema";
import { formatAsMoney } from "@/lib/utils";
import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ORDER_PAYMENT_STATUS } from "@/server/db/constant";
import { format } from "date-fns";
import { type QueryUserCartReturn } from "@/app/order/show/[event_id]/query";

type Props = {
  event: OrderEvent;
  cart: QueryUserCartReturn;
};

const EventPaymentInfo = async ({ event, cart }: Props) => {
  const totalPrice = cart.items.reduce((acc, item) => acc + item.price, 0);

  return (
    <>
      <Alert>
        <Info size={16} />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          The owner of this event has locked the order. You cannot change your
          placed order. You can mark your payment of the order as completed.
        </AlertDescription>
      </Alert>

      <div
        className={
          "flex w-full flex-col gap-4 rounded border bg-background p-4"
        }
      >
        <h1 className={"text-xl font-bold capitalize"}>Your order</h1>
        <hr />

        <div className="flex flex-col gap-2">
          {cart.items.map((item) => (
            <div key={item.id} className={"flex items-baseline gap-4"}>
              <div className="flex flex-col gap-1">
                <p className={"text-lg"}>{item.name}</p>
                <small className="text-sm text-muted-foreground">
                  {item.description}
                </small>
              </div>
              <div className="flex flex-1 flex-col items-end">
                <p className={"text-lg"}>{formatAsMoney(item.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className={
          "sticky inset-x-0 bottom-4 flex w-full flex-col gap-4 rounded border bg-background p-4"
        }
      >
        <h1 className={"text-xl font-bold capitalize"}>Payment Status</h1>
        <hr />
        <div className="flex items-center gap-4 text-lg">
          <h1 className={"flex-1 font-bold"}>Total</h1>
          <p>{formatAsMoney(totalPrice)}</p>
        </div>

        {cart.paymentStatus === ORDER_PAYMENT_STATUS.PENDING ? (
          <EventPaidBtn cartId={cart.id} />
        ) : (
          <div
            className={
              "flex flex-col items-center justify-center gap-1 rounded border-2 border-green-600 p-4"
            }
          >
            <span className={"text-xl font-bold italic"}>Paid</span>
            {cart.paymentAt && (
              <small>
                at {format(cart.paymentAt, "yyyy/MM/dd - hh:mm:ss")}
              </small>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default EventPaymentInfo;
