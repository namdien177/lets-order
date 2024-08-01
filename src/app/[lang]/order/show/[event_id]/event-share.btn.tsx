"use client";

import { type PropsWithChildren } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { toast } from "sonner";

type Props = PropsWithChildren<
  {
    copyContent: string;
  } & ButtonProps
>;

const EventShareBtn = ({
  children,
  copyContent,
  className,
  ...props
}: Props) => {
  return (
    <Button
      className={className}
      {...props}
      onClick={() => {
        void navigator.clipboard.writeText(copyContent);
        toast.info("Copied to clipboard");
      }}
    >
      {children}
    </Button>
  );
};

export default EventShareBtn;
