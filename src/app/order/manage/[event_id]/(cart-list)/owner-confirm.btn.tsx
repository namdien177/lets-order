"use client";

import { useMutation } from "@tanstack/react-query";
import { markUserCartCompletePayment } from "@/app/order/manage/[event_id]/(cart-list)/action";
import { Button } from "@/components/ui/button";
import { BaseResponseType } from "@/lib/types/response.type";
import { toast } from "sonner";

type Props = {
  cartId: number;
};

const OwnerConfirmBtn = ({ cartId }: Props) => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: markUserCartCompletePayment,
  });

  const markConfirm = async () => {
    const result = await mutateAsync({ cartId, force: true });
    if (result.type === BaseResponseType.success) {
      toast.success(result.message);
      return;
    }

    toast.error(result.error);
  };

  return (
    <Button disabled={isPending} onClick={() => markConfirm()} size={"sm"}>
      {isPending ? "Loading..." : "Confirm"}
    </Button>
  );
};

export default OwnerConfirmBtn;
