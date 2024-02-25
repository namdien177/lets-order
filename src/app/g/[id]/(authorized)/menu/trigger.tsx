"use client";
import { type PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { deleteProduct } from "@/app/g/[id]/(authorized)/menu/action";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  id: number;
  groupId: number;
};

const DeleteProductButton = ({
  id,
  groupId,
  children,
}: PropsWithChildren<Props>) => {
  const router = useRouter();
  const { mutateAsync } = useMutation({
    mutationFn: ({ id, groupId }: Props) => deleteProduct(id, groupId),
  });

  const onDelete = async (id: number, groupId: number) => {
    const result = await mutateAsync({ id, groupId });
    if (result) {
      toast.success("Product deleted", {
        duration: 5000,
      });
      return router.refresh();
    }

    toast.error("Product not deleted", {
      duration: 5000,
    });
  };

  return (
    <Button variant={"ghost"} onClick={() => onDelete(id, groupId)}>
      {children}
    </Button>
  );
};

export default DeleteProductButton;
