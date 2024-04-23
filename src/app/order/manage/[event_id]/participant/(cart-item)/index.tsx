import { type UserCartInEvent } from "@/app/order/manage/[event_id]/participant/query";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatAsMoney } from "@/lib/utils";
import { type Nullable } from "@/lib/types/helper";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  ORDER_PAYMENT_STATUS,
  type OrderPaymentStatus,
} from "@/server/db/constant";
import { useMutation } from "@tanstack/react-query";
import { markUserCartCompletePayment } from "./action";
import { Loader } from "lucide-react";
import { BaseResponseType } from "@/lib/types/response.type";
import { toast } from "sonner";

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

  const { mutateAsync, isPending } = useMutation({
    mutationFn: markUserCartCompletePayment,
  });

  const handleConfirmPayment = async (id: number) => {
    const result = await mutateAsync({ cartId: cart.id, force: true });

    if (result.type === BaseResponseType.success) {
      onUpdated && onUpdated();
      return toast.success(result.message);
    }
    toast.error(result.error);
  };

  return (
    <TableRow>
      <TableCell>{index}</TableCell>
      <TableCell>
        <div className="flex flex-col">
          <p>{cart.clerkName}</p>
          <small className={"text-muted-foreground"}>{cart.clerkEmail}</small>
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
            {cart.paymentAt && (
              <small className={"text-xs text-muted-foreground"}>
                {formatDate(cart.paymentConfirmationAt)}
              </small>
            )}
          </div>
        ) : (
          <Button
            disabled={isPending}
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
