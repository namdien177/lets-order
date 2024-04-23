"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { markOrderAsPaid } from "@/app/order/show/[event_id]/(completed)/action";
import { toast } from "sonner";
import { BaseResponseType } from "@/lib/types/response.type";

type Props = Omit<ButtonProps, "onClick"> & {
  cartId: number;
};

const EventPaidBtn = ({ cartId, disabled, ...props }: Props) => {
  const { mutateAsync, isPending, data } = useMutation({
    mutationFn: markOrderAsPaid,
  });

  const onMarking = async () => {
    const result = await mutateAsync({ cartId });

    if (result.type === BaseResponseType.success) {
      toast.success("Order marked as paid");
      return;
    }

    toast.error("Failed to mark order as paid");
  };

  return (
    <Button
      {...props}
      onClick={() => onMarking()}
      disabled={
        !!disabled || isPending || data?.type === BaseResponseType.success
      }
    >
      {isPending ? "Marking..." : "Mark as Paid"}
    </Button>
  );
};

export default EventPaidBtn;
