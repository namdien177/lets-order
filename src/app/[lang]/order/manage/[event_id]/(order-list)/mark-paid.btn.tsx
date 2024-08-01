"use client";

import { useMutation } from "@tanstack/react-query";
import { markEventPaid } from "@/app/order/manage/[event_id]/(order-list)/action";
import { Button, type ButtonProps } from "@/components/ui/button";
import { BaseResponseType } from "@/lib/types/response.type";
import { toast } from "sonner";

type Props = ButtonProps & {
  eventId: number;
};

const MarkPaidBtn = ({ eventId, children, disabled, ...props }: Props) => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: markEventPaid,
  });

  const handleClick = async () => {
    const result = await mutateAsync(eventId);

    if (result.type === BaseResponseType.success) {
      toast.success(result.message);
      return;
    }

    toast.error(result.error);
  };

  return (
    <Button {...props} disabled={!!disabled || isPending} onClick={handleClick}>
      {children}
    </Button>
  );
};

export default MarkPaidBtn;
