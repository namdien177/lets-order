import { type UserCartInEvent } from "@/app/order/manage/[event_id]/participant/query";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn, formatAsMoney } from "@/lib/utils";
import { type Nullable } from "@/lib/types/helper";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  ORDER_PAYMENT_STATUS,
  type OrderPaymentStatus,
} from "@/server/db/constant";
import { useMutation } from "@tanstack/react-query";
import { markUserCartCompletePayment } from "./action";
import { Loader, X } from "lucide-react";
import { BaseResponseType } from "@/lib/types/response.type";
import { toast } from "sonner";
import { useState } from "react";

type Props = {
  index: number;
  cart: UserCartInEvent;
  onUpdated?: () => void;
};

const CartItem = ({ cart, index, onUpdated }: Props) => {
  const cartPrice = cart.item.reduce(
    (acc, item) => acc + item.price * item.amount,
    0,
  );
  const formatDate = (date: Nullable<Date>) =>
    date ? format(date, "yyyy/MM/dd hh:mm:ss") : "N/A";

  const paymentStatusVerbose = (status: OrderPaymentStatus) => {
    switch (status) {
      case ORDER_PAYMENT_STATUS.PAID:
        return "Paid";
      case ORDER_PAYMENT_STATUS.PENDING:
        return "Pending";
      default:
        return "N/A";
    }
  };

  const [isViewingDetail, setIsViewingDetail] = useState(false);

  const { mutateAsync, isPending, data } = useMutation({
    mutationFn: markUserCartCompletePayment,
  });

  const handleConfirmPayment = async (cartId: number) => {
    const result = await mutateAsync({ cartId, force: true });

    if (result.type === BaseResponseType.success) {
      onUpdated && onUpdated();
      return toast.success(result.message);
    }
    toast.error(result.error);
  };

  return (
    <TableRow>
      <TableCell className={"align-baseline"}>{index}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <div className="flex flex-col">
            <p>{cart.clerkName}</p>
            <small className={"text-muted-foreground"}>{cart.clerkEmail}</small>
          </div>
          <div className="flex flex-col gap-1 pl-4 text-sm">
            <div className={"flex items-center gap-1 text-muted-foreground"}>
              <span>Ordered: {cart.item.length} item(s)</span>
              <small
                onClick={() => setIsViewingDetail((s) => !s)}
                className={
                  "cursor-pointer select-none rounded border px-2 py-1"
                }
              >
                {isViewingDetail ? "Hide" : "View"} detail
              </small>
            </div>
            <div
              className={cn(
                "flex flex-col gap-1 divide-y overflow-hidden rounded-lg border transition-[max-height] ease-in-out",
                isViewingDetail ? "max-h-[999px]" : "max-h-0",
              )}
            >
              {cart.item.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-row items-center gap-1 p-2 text-sm"
                >
                  <p className={"flex-1"}>{item.name}</p>
                  <p className={"text-muted-foreground"}>
                    {formatAsMoney(item.price)}
                  </p>
                  <X size={16} />
                  <p className={"text-muted-foreground"}>{item.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className={"text-right"}>{formatAsMoney(cartPrice)}</TableCell>
      <TableCell className={"text-center"}>
        <div className="flex flex-col gap-1">
          <p>{paymentStatusVerbose(cart.paymentStatus)}</p>
          {cart.paymentAt && (
            <small className={"text-xs text-muted-foreground"}>
              {formatDate(cart.paymentAt)}
            </small>
          )}
        </div>
      </TableCell>
      <TableCell className={"text-center"}>
        {cart.paymentConfirmationAt ? (
          <div className="flex flex-col gap-1">
            <p>Confirmed</p>
            <small className={"text-xs text-muted-foreground"}>
              {formatDate(cart.paymentConfirmationAt)}
            </small>
          </div>
        ) : (
          <Button
            disabled={isPending || data?.type === BaseResponseType.success}
            variant={"outline"}
            size={"sm"}
            onClick={() => handleConfirmPayment(cart.id)}
          >
            {isPending ? (
              <Loader size={16} className={"animate-spin"} />
            ) : (
              "Confirm"
            )}
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default CartItem;
